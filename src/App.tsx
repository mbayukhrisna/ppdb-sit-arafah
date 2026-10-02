/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import {
  Cloud,
  LogOut,
  FileSpreadsheet,
  Search,
  Shield,
  Compass,
  ArrowLeft,
} from 'lucide-react';
import {
  auth,
  db,
  signInWithGoogleAccount,
  signOutFirebaseAccount,
  handleFirestoreError,
  OperationType,
} from './firebase';
import { SPMBRegistrationRecord, StaffReferenceRecord, EducationUnit } from './types/spmb';
import {
  INITIAL_REGISTRATIONS,
  INITIAL_STAFF_REFERENCES,
  unpackRegistrationFromFirestore,
  unpackStaffFromFirestore,
  saveRegistrationToFirestore,
  removeRegistrationFromFirestore,
  saveStaffReferenceToFirestore,
  removeStaffReferenceFromFirestore,
} from './services/spmbDataService';
import { RegistrationFormPortal } from './components/RegistrationFormPortal';
import { StatusCheckPortal } from './components/StatusCheckPortal';
import { AdminPortal } from './components/AdminPortal';
import { PlanningBlueprintView } from './components/PlanningBlueprintView';
import heroCampusImg from './assets/images/hero_sit_arafah_campus_1790920239839.jpg';

type StudentPortalTab = 'FORM' | 'STATUS';
type AdminRouteTab = 'ADMIN' | 'PLANNING';

const LOCAL_REG_KEY = 'spmb_sit_arafah_registrations_v1';
const LOCAL_STAFF_KEY = 'spmb_sit_arafah_staff_v2';

function extractRefCodeFromUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    const rawRef = params.get('ref');
    if (rawRef) {
      return rawRef.replace(/\/+$/, '').trim();
    }
    const matchHash = window.location.hash.match(/[?&]ref=([^&#/]+)/i);
    if (matchHash && matchHash[1]) {
      return decodeURIComponent(matchHash[1]).replace(/\/+$/, '').trim();
    }
  } catch {
    // ignore URL parse errors
  }
  return '';
}

function checkIsAdminUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path.endsWith('/admin') ||
    hash === '#/admin' ||
    hash.startsWith('#/admin/') ||
    search.includes('admin=1') ||
    search.includes('portal=admin')
  );
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => checkIsAdminUrl());
  const [studentTab, setStudentTab] = useState<StudentPortalTab>('FORM');
  const [adminTab, setAdminTab] = useState<AdminRouteTab>('ADMIN');
  const [activeRefCode, setActiveRefCode] = useState<string>(() => extractRefCodeFromUrl());

  const [statusCheckNumber, setStatusCheckNumber] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  // Track raw Firestore createdAt timestamps so updates preserve immutable createdAt
  const [rawRegCreatedAtMap, setRawRegCreatedAtMap] = useState<Record<string, unknown>>({});
  const [rawStaffCreatedAtMap, setRawStaffCreatedAtMap] = useState<Record<string, unknown>>({});

  const [registrations, setRegistrations] = useState<SPMBRegistrationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_REG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore local storage read errors
    }
    return INITIAL_REGISTRATIONS;
  });

  const [staffList, setStaffList] = useState<StaffReferenceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STAFF_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore local storage read errors
    }
    return INITIAL_STAFF_REFERENCES;
  });

  // Listen to URL changes (popstate & hashchange) for /admin route and ?ref= query
  useEffect(() => {
    const syncRouteFromLocation = () => {
      setIsAdminRoute(checkIsAdminUrl());
      setActiveRefCode(extractRefCodeFromUrl());
    };
    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
    };
  }, []);

  const navigateToAdminRoute = (initialAdminTab: AdminRouteTab = 'ADMIN') => {
    try {
      window.history.pushState({}, '', '/admin');
    } catch {
      window.location.hash = '#/admin';
    }
    setIsAdminRoute(true);
    setAdminTab(initialAdminTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStudentRoute = (
    initialStudentTab: StudentPortalTab = 'FORM',
    refCodeOverride?: string
  ) => {
    const targetRef = refCodeOverride !== undefined ? refCodeOverride : activeRefCode;
    const targetUrl = targetRef ? `/?ref=${encodeURIComponent(targetRef)}` : '/';
    try {
      window.history.pushState({}, '', targetUrl);
    } catch {
      window.location.hash = targetRef ? `#/?ref=${encodeURIComponent(targetRef)}` : '';
    }
    if (refCodeOverride !== undefined) {
      setActiveRefCode(refCodeOverride);
    }
    setIsAdminRoute(false);
    setStudentTab(initialStudentTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync local storage as backup cache
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_REG_KEY, JSON.stringify(registrations));
    } catch {
      // ignore
    }
  }, [registrations]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(staffList));
    } catch {
      // ignore
    }
  }, [staffList]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Attach Firestore real-time listeners when authenticated
  useEffect(() => {
    if (!authReady || !currentUser) return;

    const isBootstrappedAdmin =
      currentUser.email === 'mbayukhrisnamurthi@gmail.com' && currentUser.emailVerified;

    const regQuery = isBootstrappedAdmin
      ? collection(db, 'registrations')
      : query(collection(db, 'registrations'), where('ownerId', '==', currentUser.uid));

    const unsubReg = onSnapshot(
      regQuery,
      (snapshot) => {
        if (snapshot.empty) {
          INITIAL_REGISTRATIONS.forEach((seedRec) => {
            saveRegistrationToFirestore({ ...seedRec, ownerId: currentUser.uid }).catch(() => {});
          });
          return;
        }
        const rawMap: Record<string, unknown> = {};
        const loaded: SPMBRegistrationRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          rawMap[docSnap.id] = data.createdAt;
          loaded.push(unpackRegistrationFromFirestore(docSnap.id, data));
        });
        setRawRegCreatedAtMap(rawMap);
        setRegistrations(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'registrations');
      }
    );

    const staffQuery = isBootstrappedAdmin
      ? collection(db, 'referrals_staff')
      : query(collection(db, 'referrals_staff'), where('active', '==', true));

    const unsubStaff = onSnapshot(
      staffQuery,
      (snapshot) => {
        if (snapshot.empty) {
          INITIAL_STAFF_REFERENCES.forEach((seedStaff) => {
            saveStaffReferenceToFirestore({ ...seedStaff, ownerId: currentUser.uid }).catch(
              () => {}
            );
          });
          return;
        }
        const rawMap: Record<string, unknown> = {};
        const loaded: StaffReferenceRecord[] = [];
        let idx = 1;
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          rawMap[docSnap.id] = data.createdAt;
          loaded.push(unpackStaffFromFirestore(docSnap.id, data, idx));
          idx += 1;
        });
        loaded.sort((a, b) => a.refCode.localeCompare(b.refCode));
        setRawStaffCreatedAtMap(rawMap);
        setStaffList(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'referrals_staff');
      }
    );

    return () => {
      unsubReg();
      unsubStaff();
    };
  }, [authReady, currentUser]);

  // Handlers for Registration CRUD
  const handleAddRegistration = async (newRecord: SPMBRegistrationRecord) => {
    setRegistrations((prev) => [newRecord, ...prev]);
    if (currentUser) {
      await saveRegistrationToFirestore({
        ...newRecord,
        ownerId: currentUser.uid,
      });
    }
  };

  const handleUpdateRegistration = async (updatedRecord: SPMBRegistrationRecord) => {
    setRegistrations((prev) =>
      prev.map((item) => (item.id === updatedRecord.id ? updatedRecord : item))
    );
    if (currentUser) {
      const rawCreatedAt = rawRegCreatedAtMap[updatedRecord.id];
      await saveRegistrationToFirestore(updatedRecord, rawCreatedAt);
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    setRegistrations((prev) => prev.filter((item) => item.id !== id));
    if (currentUser) {
      await removeRegistrationFromFirestore(id);
    }
  };

  // Handlers for Staff Reference CRUD
  const handleSaveStaff = async (staff: StaffReferenceRecord, isEdit: boolean) => {
    if (isEdit) {
      setStaffList((prev) => prev.map((s) => (s.id === staff.id ? staff : s)));
    } else {
      setStaffList((prev) => [...prev, staff]);
    }
    if (currentUser) {
      const rawCreatedAt = isEdit ? rawStaffCreatedAtMap[staff.id] : undefined;
      await saveStaffReferenceToFirestore(staff, rawCreatedAt);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    if (currentUser) {
      await removeStaffReferenceFromFirestore(id);
    }
  };

  const handleNavigateToStatusCheck = (regNumber: string) => {
    setStatusCheckNumber(regNumber);
    setIsAdminRoute(false);
    setStudentTab('STATUS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================================================
  // RENDER MODE 1: RUTE KHUSUS `/admin` (PORTAL ADMIN 4 JENJANG & BLUEPRINT)
  // ==========================================================================
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#0F1E19]">
        {/* Top Bar Khusus Rute /admin */}
        <header className="sticky top-0 z-40 bg-[#0F1E19] text-white border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between no-print">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              setAdminTab('ADMIN');
            }}
            className="text-lg sm:text-xl font-bold tracking-tight text-white font-display whitespace-nowrap"
          >
            ADMIN SPMB ARAFAH
          </a>

          {/* Zone 2: Nav Links internal /admin */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => setAdminTab('ADMIN')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
                adminTab === 'ADMIN'
                  ? 'text-white border-emerald-400 font-semibold'
                  : 'border-transparent hover:text-white'
              }`}
            >
              Portal 4 Admin Jenjang (AIS / TK / SD / SMP)
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('PLANNING')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
                adminTab === 'PLANNING'
                  ? 'text-white border-emerald-400 font-semibold'
                  : 'border-transparent hover:text-white'
              }`}
            >
              Blueprint &amp; Planning Sistem
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <button
                type="button"
                onClick={() => signOutFirebaseAccount()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-100 bg-white/10 rounded-lg hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cloud Aktif</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogleAccount().catch(() => {})}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F5338] rounded-lg hover:bg-[#146B48] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Sinkronisasi Cloud</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigateToStudentRoute('FORM')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0F1E19] bg-white rounded-lg hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ke Portal Siswa</span>
            </button>
          </div>
        </header>

        {/* Mobile Switcher inside /admin */}
        <div className="md:hidden bg-white border-b border-[#E2E8E5] px-4 py-2 flex items-center gap-2 overflow-x-auto no-print">
          <button
            type="button"
            onClick={() => setAdminTab('ADMIN')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
              adminTab === 'ADMIN' ? 'bg-[#0F5338] text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Portal 4 Admin Jenjang
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('PLANNING')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
              adminTab === 'PLANNING' ? 'bg-[#0F5338] text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Blueprint &amp; Planning
          </button>
        </div>

        <main className="flex-1">
          {adminTab === 'ADMIN' ? (
            <AdminPortal
              registrations={registrations}
              staffList={staffList}
              onUpdateRegistration={handleUpdateRegistration}
              onDeleteRegistration={handleDeleteRegistration}
              onSaveStaff={handleSaveStaff}
              onDeleteStaff={handleDeleteStaff}
              onTestReferralLink={(refCode) => navigateToStudentRoute('FORM', refCode)}
            />
          ) : (
            <PlanningBlueprintView
              onNavigateToStudentPortal={(tab) => navigateToStudentRoute(tab)}
              onNavigateToAdminDashboard={() => setAdminTab('ADMIN')}
            />
          )}
        </main>

        <footer className="bg-white border-t border-[#E2E8E5] py-5 px-4 sm:px-8 text-xs text-slate-500 no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <strong className="text-[#0F1E19]">Portal Internal Panitia SPMB SIT ARAFAH</strong> ·
              Endpoint Rute: <code className="font-mono-tabular text-[#0F5338]">/admin</code>
            </div>
            <button
              type="button"
              onClick={() => navigateToStudentRoute('FORM')}
              className="text-[#0F5338] font-medium hover:underline cursor-pointer"
            >
              ← Kembali ke Website Portal Siswa &amp; Orang Tua (/)
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // RENDER MODE 2: WEBSITE PORTAL SISWA & ORANG TUA (`/`)
  // Tanpa menu Admin atau Blueprint di navigasi utama
  // ==========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#0F1E19]">
      {/* Top Bar Contract (3 Zones: Brand Wordmark — Clean Student/Parent Nav — Action) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-[#E2E8E5] px-4 sm:px-8 py-3.5 flex items-center justify-between no-print">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setStudentTab('FORM');
          }}
          className="text-lg sm:text-xl font-bold tracking-tight text-[#0F1E19] font-display whitespace-nowrap"
        >
          SPMB SIT ARAFAH
        </a>

        {/* Zone 2: Clean Student/Parent Navigation Links ONLY */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setStudentTab('FORM')}
            className={`py-1 transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              studentTab === 'FORM'
                ? 'text-[#0F5338] border-[#0F5338] font-semibold'
                : 'border-transparent hover:text-[#0F1E19]'
            }`}
          >
            Formulir Pendaftaran
          </button>
          <button
            type="button"
            onClick={() => setStudentTab('STATUS')}
            className={`py-1 transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              studentTab === 'STATUS'
                ? 'text-[#0F5338] border-[#0F5338] font-semibold'
                : 'border-transparent hover:text-[#0F1E19]'
            }`}
          >
            Cek Status Seleksi
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <button
              type="button"
              onClick={() => signOutFirebaseAccount()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              title={`Tersinkronisasi dengan ${currentUser.email}`}
            >
              <LogOut className="w-3.5 h-3.5 text-[#0F5338]" />
              <span>Cloud Aktif</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogleAccount().catch(() => {})}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F5338] rounded-lg hover:bg-[#0B3E29] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Sinkronisasi Cloud</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Navigation Bar (Only Student/Parent Menus) */}
      <div className="md:hidden bg-white border-b border-[#E2E8E5] px-4 py-2 flex items-center gap-2 overflow-x-auto no-print">
        <button
          type="button"
          onClick={() => setStudentTab('FORM')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
            studentTab === 'FORM' ? 'bg-[#0F5338] text-white' : 'text-slate-600 bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Formulir Pendaftaran
        </button>
        <button
          type="button"
          onClick={() => setStudentTab('STATUS')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
            studentTab === 'STATUS' ? 'bg-[#0F5338] text-white' : 'text-slate-600 bg-slate-100'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Cek Status Seleksi
        </button>
      </div>

      {/* Hero Institutional Banner (Student & Parent Portal) */}
      <section className="relative overflow-hidden bg-[#0F291E] text-white border-b border-[#E2E8E5] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-200/90 font-medium">
              <span>SISTEM PENERIMAAN MURID BARU TERPADU</span>
              <span aria-hidden="true">·</span>
              <span>TAHUN PELAJARAN 2026/2027</span>
              <span aria-hidden="true">·</span>
              <span>UNIT AIS / TK / SD / SMP</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight max-w-2xl">
              Portal Resmi Pendaftaran &amp; Seleksi Calon Peserta Didik SIT ARAFAH
            </h2>

            <p className="text-sm text-emerald-100/85 leading-relaxed max-w-2xl">
              Selamat datang di Portal Orang Tua &amp; Calon Peserta Didik Baru SIT ARAFAH. Silakan
              isi formulir pendaftaran secara daring dan simpan Nomor Pendaftaran (
              <span className="font-mono-tabular text-white">SPMB-XXXXXXXX</span>) Anda untuk
              mengecek pengumuman hasil seleksi.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-white/15 aspect-video bg-gradient-to-br from-[#133A2B] to-[#091C14]">
              {!heroImgFailed ? (
                <img
                  src={heroCampusImg}
                  alt="Kampus Terpadu Sekolah Islam Terpadu (SIT) Arafah"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-6 text-center">
                  <div>
                    <p className="font-display text-lg font-bold text-white">
                      Kampus Terpadu SIT ARAFAH
                    </p>
                    <p className="text-xs text-emerald-200 mt-1">
                      Pendidikan Islam Terpadu Jenjang AIS · TK · SD · SMP
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-4">
                <div className="text-xs text-white/95">
                  <p className="font-semibold">Kampus Pendidikan SIT ARAFAH</p>
                  <p className="text-white/75">
                    Pendaftaran Terbuka untuk Jenjang AIS, TK IT, SD IT, dan SMP IT
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Student & Parent Workspace */}
      <main className="flex-1">
        {studentTab === 'FORM' ? (
          <RegistrationFormPortal
            activeStaffList={staffList}
            referralCodeFromUrl={activeRefCode}
            onSubmitRegistration={handleAddRegistration}
            onNavigateToStatusCheck={handleNavigateToStatusCheck}
          />
        ) : (
          <StatusCheckPortal
            registrations={registrations}
            initialSearchNumber={statusCheckNumber}
          />
        )}
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="bg-white border-t border-[#E2E8E5] py-6 px-4 sm:px-8 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-[#0F1E19]">Panitia SPMB SIT ARAFAH</strong> · Sistem Penerimaan
            Murid Baru Terpadu (AIS, TK, SD, SMP)
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setStudentTab('FORM')}
              className="hover:text-[#0F5338] cursor-pointer"
            >
              Formulir Pendaftaran
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setStudentTab('STATUS')}
              className="hover:text-[#0F5338] cursor-pointer"
            >
              Cek Status Seleksi
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                navigateToAdminRoute('ADMIN');
              }}
              className="font-mono-tabular text-slate-400 hover:text-[#0F5338] transition-colors"
              title="Buka halaman khusus /admin"
            >
              /admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

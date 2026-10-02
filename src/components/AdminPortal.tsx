import React, { useState } from 'react';
import {
  Lock,
  LogOut,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Users,
  UserPlus,
  AlertCircle,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  AdminUnitAccount,
  EducationLevel,
  EducationUnit,
  ReferralCategory,
  SelectionStatus,
  SPMBRegistrationRecord,
  StaffReferenceRecord,
} from '../types/spmb';
import { ADMIN_UNIT_ACCOUNTS } from '../services/spmbDataService';

interface AdminPortalProps {
  registrations: SPMBRegistrationRecord[];
  staffList: StaffReferenceRecord[];
  onUpdateRegistration: (updated: SPMBRegistrationRecord) => Promise<void>;
  onDeleteRegistration: (id: string) => Promise<void>;
  onSaveStaff: (staff: StaffReferenceRecord, isEdit: boolean) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  onTestReferralLink?: (refCode: string) => void;
}

const EDUCATION_LEVELS: EducationLevel[] = [
  'SD',
  'SMP',
  'SMA/SMK',
  'D1',
  'D2',
  'D3',
  'S1',
  'S2',
  'S3',
  'Lainnya',
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  registrations,
  staffList,
  onUpdateRegistration,
  onDeleteRegistration,
  onSaveStaff,
  onDeleteStaff,
  onTestReferralLink,
}) => {
  const [loggedInAdmin, setLoggedInAdmin] = useState<AdminUnitAccount | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active workspace tab inside Admin Dashboard
  const [activeTab, setActiveTab] = useState<'APPLICANTS' | 'STAFF_REF'>('APPLICANTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SelectionStatus>('ALL');

  // Modals for Viewing, Editing, and Deleting Applicant
  const [viewingApplicant, setViewingApplicant] = useState<SPMBRegistrationRecord | null>(null);
  const [editingApplicant, setEditingApplicant] = useState<SPMBRegistrationRecord | null>(null);
  const [deletingApplicant, setDeletingApplicant] = useState<SPMBRegistrationRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Staff Management state
  const [newStaffCode, setNewStaffCode] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffCategory, setNewStaffCategory] = useState<ReferralCategory>('Guru dan Staff');
  const [newStaffUnit, setNewStaffUnit] = useState<EducationUnit | 'YAYASAN'>('SMP');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editingStaffCode, setEditingStaffCode] = useState('');
  const [editingStaffName, setEditingStaffName] = useState('');
  const [editingStaffCategory, setEditingStaffCategory] =
    useState<ReferralCategory>('Guru dan Staff');
  const [referralCategoryFilter, setReferralCategoryFilter] = useState<'ALL' | ReferralCategory>(
    'ALL'
  );
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const matched = ADMIN_UNIT_ACCOUNTS.find(
      (acc) =>
        acc.username.toLowerCase() === usernameInput.trim().toLowerCase() &&
        acc.password === passwordInput.trim()
    );
    if (!matched) {
      setLoginError(
        'Username atau Password Admin tidak sesuai. Pilih salah satu dari 4 akun jenjang (AIS, TK, SD, SMP).'
      );
      return;
    }
    setLoggedInAdmin(matched);
    setNewStaffUnit(matched.unit);
  };

  const handleQuickLogin = (account: AdminUnitAccount) => {
    setUsernameInput(account.username);
    setPasswordInput(account.password);
    setLoggedInAdmin(account);
    setNewStaffUnit(account.unit);
    setLoginError(null);
  };

  const handleSaveEditedApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApplicant) return;
    setIsProcessing(true);
    try {
      await onUpdateRegistration({
        ...editingApplicant,
        updatedAtIso: new Date().toISOString(),
      });
      setEditingApplicant(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickStatusChange = async (
    record: SPMBRegistrationRecord,
    newStatus: SelectionStatus,
    defaultNote: string
  ) => {
    setIsProcessing(true);
    try {
      await onUpdateRegistration({
        ...record,
        status: newStatus,
        statusNotes: record.statusNotes || defaultNote,
        updatedAtIso: new Date().toISOString(),
      });
      if (viewingApplicant && viewingApplicant.id === record.id) {
        setViewingApplicant({
          ...record,
          status: newStatus,
          statusNotes: record.statusNotes || defaultNote,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingApplicant) return;
    setIsProcessing(true);
    try {
      await onDeleteRegistration(deletingApplicant.id);
      setDeletingApplicant(null);
      if (viewingApplicant?.id === deletingApplicant.id) {
        setViewingApplicant(null);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    const nextDefaultCode = String(staffList.length + 1).padStart(3, '0');
    const finalCode = newStaffCode.trim() || nextDefaultCode;
    const now = new Date().toISOString();
    const newRecord: StaffReferenceRecord = {
      id: `staff-${Date.now()}`,
      ownerId: 'admin-portal',
      refCode: finalCode,
      name: newStaffName.trim(),
      category: newStaffCategory,
      roleUnit: newStaffUnit,
      active: true,
      createdAtIso: now,
      updatedAtIso: now,
    };
    await onSaveStaff(newRecord, false);
    setNewStaffCode('');
    setNewStaffName('');
  };

  const handleToggleStaffActive = async (staff: StaffReferenceRecord) => {
    await onSaveStaff(
      {
        ...staff,
        active: !staff.active,
        updatedAtIso: new Date().toISOString(),
      },
      true
    );
  };

  const handleSaveStaffEdit = async (staff: StaffReferenceRecord) => {
    if (!editingStaffName.trim() || !editingStaffCode.trim()) return;
    await onSaveStaff(
      {
        ...staff,
        refCode: editingStaffCode.trim(),
        name: editingStaffName.trim(),
        category: editingStaffCategory,
        updatedAtIso: new Date().toISOString(),
      },
      true
    );
    setEditingStaffId(null);
    setEditingStaffCode('');
    setEditingStaffName('');
  };

  const handleCopyReferralUrl = (staff: StaffReferenceRecord) => {
    const shareUrl = `https://ppdb-sit-arafah.vercel.app/?ref=${staff.refCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopiedStaffId(staff.id);
    setTimeout(() => {
      setCopiedStaffId((prev) => (prev === staff.id ? null : prev));
    }, 2000);
  };

  // ============================================================================
  // VIEW 1: 4-JENJANG ADMIN LOGIN SCREEN (AIS, TK, SD, SMP)
  // ============================================================================
  if (!loggedInAdmin) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Login Admin */}
          <div className="lg:col-span-5 bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8">
            <div className="border-b border-[#E2E8E5] pb-4 mb-6">
              <p className="text-xs font-medium text-[#0F5338]">OTENTIKASI PANITIA JENJANG</p>
              <h1 className="text-2xl font-bold text-[#0F1E19] mt-1">Login Portal Admin SPMB</h1>
              <p className="text-xs text-slate-600 mt-1">
                Masukkan username dan password sesuai jenjang unit pendidikan (AIS, TK, SD, atau
                SMP).
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username Admin Jenjang
                </label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Contoh: admin_sd"
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password jenjang"
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F5338] rounded-lg hover:bg-[#0B3E29] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Lock className="w-4 h-4" />
                Masuk ke Portal Jenjang
              </button>
            </form>
          </div>

          {/* Daftar 4 Portal Login Admin Jenjang */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8">
            <div className="border-b border-[#E2E8E5] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0F5338]" />
                <h2 className="text-lg font-bold text-[#0F1E19]">
                  4 Akses Login Admin Per Jenjang Pendidikan
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Setiap akun admin hanya dapat mengakses, melihat, mengubah, dan menghapus data calon
                peserta didik pada unit peminatannya masing-masing. Klik salah satu kartu di bawah
                untuk masuk langsung:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ADMIN_UNIT_ACCOUNTS.map((acc) => {
                const countInUnit = registrations.filter((r) => r.unit === acc.unit).length;
                return (
                  <div
                    key={acc.unit}
                    className="border border-[#E2E8E5] rounded-lg p-4 flex flex-col justify-between hover:border-[#0F5338] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-[#0F1E19]">
                          Admin {acc.unit}
                        </span>
                        <span className="text-xs font-mono-tabular text-slate-500">
                          {countInUnit} Pendaftar
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{acc.unitSubtitle}</p>
                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 font-mono-tabular text-slate-700">
                        <div>
                          User: <strong className="text-[#0F1E19]">{acc.username}</strong>
                        </div>
                        <div>
                          Pass: <strong className="text-[#0F1E19]">{acc.password}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className="mt-4 w-full px-3 py-2 text-xs font-semibold text-[#0F5338] bg-[#EBF3EF] rounded-md hover:bg-[#DCECE4] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Masuk sebagai Admin {acc.unit} →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: WORKSPACE DASHBOARD ADMIN JENJANG (AIS / TK / SD / SMP)
  // ============================================================================
  const unitRegistrations = registrations.filter((r) => r.unit === loggedInAdmin.unit);
  const filteredRegistrations = unitRegistrations.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      r.fullName.toLowerCase().includes(q) ||
      r.registrationNumber.toLowerCase().includes(q) ||
      r.nisn.toLowerCase().includes(q) ||
      r.originSchoolName.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const countTotal = unitRegistrations.length;
  const countWaiting = unitRegistrations.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;
  const countAccepted = unitRegistrations.filter((r) => r.status === 'DITERIMA').length;
  const countRejected = unitRegistrations.filter((r) => r.status === 'TIDAK_DITERIMA').length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Workspace Jenjang */}
      <div className="bg-white border border-[#E2E8E5] rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8E5] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#0F5338] font-semibold">
              <span>PORTAL ADMIN JENJANG {loggedInAdmin.unit}</span>
              <span aria-hidden="true">·</span>
              <span>Koordinator: {loggedInAdmin.coordinatorName}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F1E19] mt-1">{loggedInAdmin.unitTitle}</h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Menampilkan khusus data calon peserta didik dengan pilihan peminatan{' '}
              <strong>Unit {loggedInAdmin.unit}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Switch Unit Cepat untuk Demo */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {ADMIN_UNIT_ACCOUNTS.map((acc) => (
                <button
                  key={acc.unit}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    loggedInAdmin.unit === acc.unit
                      ? 'bg-[#0F5338] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {acc.unit}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setLoggedInAdmin(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar ({loggedInAdmin.username})
            </button>
          </div>
        </div>

        {/* Stat Strip (Tabular Numerals) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-5">
          <div>
            <span className="text-xs text-slate-500 block">
              Total Pendaftar Unit {loggedInAdmin.unit}
            </span>
            <span className="text-2xl font-bold font-mono-tabular text-[#0F1E19] mt-0.5 block">
              {countTotal}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Menunggu Verifikasi</span>
            <span className="text-2xl font-bold font-mono-tabular text-[#D97706] mt-0.5 block">
              {countWaiting}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Diterima (Lulus Seleksi)</span>
            <span className="text-2xl font-bold font-mono-tabular text-[#16A34A] mt-0.5 block">
              {countAccepted}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Tidak Diterima</span>
            <span className="text-2xl font-bold font-mono-tabular text-[#DC2626] mt-0.5 block">
              {countRejected}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs inside Admin */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('APPLICANTS')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'APPLICANTS'
                ? 'bg-white text-[#0F1E19] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Data Calon Peserta Didik Unit {loggedInAdmin.unit} ({unitRegistrations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STAFF_REF')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'STAFF_REF'
                ? 'bg-white text-[#0F1E19] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Kelola Link ?ref= Guru/Staff &amp; Orang Tua Siswa ({staffList.length})
          </button>
        </div>
      </div>

      {activeTab === 'APPLICANTS' ? (
        <div className="bg-white border border-[#E2E8E5] rounded-xl overflow-hidden">
          {/* Filter & Search Bar */}
          <div className="p-4 sm:p-5 border-b border-[#E2E8E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari nama calon siswa, No. SPMB, atau NISN di Unit ${loggedInAdmin.unit}...`}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
              {(
                [
                  { id: 'ALL', label: 'Semua Status' },
                  { id: 'MENUNGGU_VERIFIKASI', label: 'Menunggu' },
                  { id: 'TERVERIFIKASI', label: 'Terverifikasi' },
                  { id: 'DITERIMA', label: 'Diterima' },
                  { id: 'TIDAK_DITERIMA', label: 'Tidak Diterima' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === st.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Grid */}
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-semibold text-slate-800">
                Belum ada data calon peserta didik pada filter Unit {loggedInAdmin.unit} ini.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Data pendaftar baru yang memilih peminatan {loggedInAdmin.unit} pada Portal Orang
                Tua akan otomatis muncul di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8E5] bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-4">No. Pendaftaran</th>
                    <th className="py-3 px-4">Nama Calon Siswa &amp; NISN</th>
                    <th className="py-3 px-4">Sekolah Asal</th>
                    <th className="py-3 px-4">Data Orang Tua / Wali</th>
                    <th className="py-3 px-4">Referensi</th>
                    <th className="py-3 px-4">Status Seleksi</th>
                    <th className="py-3 px-4 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E5] text-xs">
                  {filteredRegistrations.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono-tabular font-semibold text-[#0F5338] whitespace-nowrap">
                        {row.registrationNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{row.fullName}</div>
                        <div className="text-slate-500 font-mono-tabular mt-0.5">
                          NISN: {row.nisn} · {row.gender}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{row.originSchoolName}</div>
                        <div className="text-slate-500 mt-0.5">
                          {row.originSchoolCity} · Lulus {row.graduationYear}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {row.fatherName && row.motherName
                            ? `Ayah: ${row.fatherName}`
                            : row.fatherName
                              ? `Ayah: ${row.fatherName}`
                              : `Ibu: ${row.motherName}`}
                        </div>
                        <div className="text-slate-500 font-mono-tabular mt-0.5">
                          WA: {row.whatsapp}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{row.referenceSource}</div>
                        <div className="text-slate-500 truncate max-w-[180px]">
                          {row.referenceDetailPrimary}
                        </div>
                        {row.referenceDetailSecondary &&
                          row.referenceDetailSecondary !== row.referenceDetailPrimary && (
                            <div className="text-[#0F5338] text-[11px] font-medium truncate max-w-[180px] mt-0.5">
                              Ortu Siswa: {row.referenceDetailSecondary}
                            </div>
                          )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {row.status === 'DITERIMA' && (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-[#16A34A]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Diterima
                          </span>
                        )}
                        {row.status === 'TIDAK_DITERIMA' && (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-[#DC2626]">
                            <XCircle className="w-3.5 h-3.5" />
                            Tidak Diterima
                          </span>
                        )}
                        {row.status === 'TERVERIFIKASI' && (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-[#2563EB]">
                            <Clock className="w-3.5 h-3.5" />
                            Terverifikasi
                          </span>
                        )}
                        {row.status === 'MENUNGGU_VERIFIKASI' && (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-[#D97706]">
                            <Clock className="w-3.5 h-3.5" />
                            Menunggu Verifikasi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingApplicant(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Lihat
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingApplicant({ ...row })}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#0F5338] bg-[#EBF3EF] rounded-md hover:bg-[#DCECE4] transition-colors cursor-pointer"
                            title="Ubah Data Calon Siswa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingApplicant(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
                            title="Hapus Data Calon Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: KELOLA DAFTAR GURU/STAFF & ORANG TUA SISWA UNTUK LINK REFERRAL ?ref= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white border border-[#E2E8E5] rounded-xl p-6">
            <h3 className="text-base font-bold text-[#0F1E19]">
              Tambah Link Referral (<code className="font-mono-tabular">?ref=</code>)
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-5">
              Buat kode <code className="font-mono-tabular">?ref=</code> untuk Sumber Referensi{' '}
              <strong>Guru dan Staff</strong> maupun <strong>Orang Tua Siswa</strong>. Saat link
              dibuka, bagian 06 otomatis terkunci sesuai kategori &amp; nama pemberi referensi.
            </p>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Referral (contoh: 001, 002, 006)
                </label>
                <input
                  type="text"
                  value={newStaffCode}
                  onChange={(e) => setNewStaffCode(e.target.value)}
                  placeholder={`Contoh: ${String(staffList.length + 1).padStart(3, '0')}`}
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Sumber Referensi
                </label>
                <select
                  value={newStaffCategory}
                  onChange={(e) => setNewStaffCategory(e.target.value as ReferralCategory)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                >
                  <option value="Guru dan Staff">Guru dan Staff</option>
                  <option value="Orang Tua Siswa">Orang Tua Siswa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama {newStaffCategory === 'Orang Tua Siswa' ? 'Orang Tua Siswa' : 'Guru / Staff'} &amp; Jenjang
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder={
                    newStaffCategory === 'Orang Tua Siswa'
                      ? 'Contoh: Bunda Aisyah - SD'
                      : 'Contoh: Mr Bayu - SMP'
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Tugas Default
                </label>
                <select
                  value={newStaffUnit}
                  onChange={(e) => setNewStaffUnit(e.target.value as EducationUnit | 'YAYASAN')}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                >
                  <option value="SMP">Unit SMP</option>
                  <option value="SD">Unit SD</option>
                  <option value="TK">Unit TK</option>
                  <option value="AIS">Unit AIS</option>
                  <option value="YAYASAN">Yayasan / Umum</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0F5338] rounded-lg hover:bg-[#0B3E29] transition-colors cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                Tambahkan Kode &amp; Nama Referral
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white border border-[#E2E8E5] rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-[#E2E8E5]">
              <div>
                <h3 className="text-base font-bold text-[#0F1E19]">
                  Daftar Link Referral Guru/Staff &amp; Orang Tua Siswa ({staffList.length})
                </h3>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Format Link:{' '}
                  <code className="font-mono-tabular">
                    https://ppdb-sit-arafah.vercel.app/?ref=KODE
                  </code>
                </span>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {(
                  [
                    { id: 'ALL', label: `Semua (${staffList.length})` },
                    {
                      id: 'Guru dan Staff',
                      label: `Guru & Staff (${
                        staffList.filter((s) => (s.category || 'Guru dan Staff') === 'Guru dan Staff')
                          .length
                      })`,
                    },
                    {
                      id: 'Orang Tua Siswa',
                      label: `Orang Tua Siswa (${
                        staffList.filter((s) => s.category === 'Orang Tua Siswa').length
                      })`,
                    },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setReferralCategoryFilter(tab.id)}
                    className={`px-2.5 py-1.5 font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      referralCategoryFilter === tab.id
                        ? 'bg-white text-[#0F1E19] shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-[#E2E8E5] text-xs">
              {staffList
                .filter((st) =>
                  referralCategoryFilter === 'ALL'
                    ? true
                    : (st.category || 'Guru dan Staff') === referralCategoryFilter
                )
                .map((st) => {
                  const referralCount = registrations.filter(
                    (r) =>
                      r.referenceDetailPrimary.toLowerCase() === st.name.toLowerCase() ||
                      r.referenceDetailSecondary.toLowerCase() === `?ref=${st.refCode.toLowerCase()}`
                  ).length;

                return (
                  <div
                    key={st.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {editingStaffId === st.id ? (
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingStaffCode}
                          onChange={(e) => setEditingStaffCode(e.target.value)}
                          placeholder="Kode (001)"
                          className="w-20 px-2.5 py-1.5 text-xs font-mono-tabular border border-slate-300 rounded-md"
                        />
                        <select
                          value={editingStaffCategory}
                          onChange={(e) =>
                            setEditingStaffCategory(e.target.value as ReferralCategory)
                          }
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                        >
                          <option value="Guru dan Staff">Guru dan Staff</option>
                          <option value="Orang Tua Siswa">Orang Tua Siswa</option>
                        </select>
                        <input
                          type="text"
                          value={editingStaffName}
                          onChange={(e) => setEditingStaffName(e.target.value)}
                          placeholder="Nama Referensi - Unit"
                          className="flex-1 min-w-[160px] px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveStaffEdit(st)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0F5338] rounded-md cursor-pointer"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStaffId(null)}
                          className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-tabular font-bold text-[#0F5338] bg-[#EBF3EF] px-2 py-0.5 rounded">
                            ?ref={st.refCode}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              st.active ? 'text-slate-900' : 'text-slate-400 line-through'
                            }`}
                          >
                            {st.name}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono-tabular text-slate-600">
                            {referralCount} Pendaftar
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-slate-500 font-mono-tabular text-[11px]">
                          <span>https://ppdb-sit-arafah.vercel.app/?ref={st.refCode}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans font-medium text-slate-700">
                            Kategori: {st.category || 'Guru dan Staff'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans">
                            {st.active ? 'Aktif' : 'Nonaktif'} (Unit {st.roleUnit})
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyReferralUrl(st)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#0F5338] bg-[#EBF3EF] rounded-md hover:bg-[#DCECE4] cursor-pointer"
                      >
                        {copiedStaffId === st.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Salin Link
                          </>
                        )}
                      </button>

                      {onTestReferralLink && (
                        <button
                          type="button"
                          onClick={() => onTestReferralLink(st.refCode)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 cursor-pointer"
                          title={`Uji buka formulir dengan ?ref=${st.refCode}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Uji Link
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setEditingStaffId(st.id);
                          setEditingStaffCode(st.refCode);
                          setEditingStaffName(st.name);
                          setEditingStaffCategory(st.category || 'Guru dan Staff');
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 cursor-pointer"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStaffActive(st)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                          st.active
                            ? 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                            : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {st.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteStaff(st.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          MODAL 1: LIHAT DETAIL CALON PESERTA DIDIK & KEPUTUSAN KELULUSAN CEPAT
         ======================================================================== */}
      {viewingApplicant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8E5] rounded-xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8E5] pb-4 mb-5">
              <div>
                <p className="text-xs font-semibold text-[#0F5338] font-mono-tabular">
                  {viewingApplicant.registrationNumber} · UNIT {viewingApplicant.unit}
                </p>
                <h3 className="text-xl font-bold text-[#0F1E19] mt-0.5">
                  {viewingApplicant.fullName} ({viewingApplicant.nickname})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingApplicant(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* Panel Keputusan Kelulusan Cepat */}
            <div className="bg-[#F3F7F5] border border-[#C6DDD3] rounded-lg p-4 mb-6">
              <p className="text-xs font-bold text-[#0F1E19] mb-2">
                Keputusan Seleksi Panitia Unit {loggedInAdmin.unit} (Langsung tampil saat Orang Tua
                cek Nomor Pendaftaran):
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    handleQuickStatusChange(
                      viewingApplicant,
                      'DITERIMA',
                      `Selamat! Ananda ${viewingApplicant.fullName} dinyatakan DITERIMA di Unit ${viewingApplicant.unit} SIT ARAFAH.`
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    viewingApplicant.status === 'DITERIMA'
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-white text-[#16A34A] border border-[#16A34A]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Terima Calon Siswa
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    handleQuickStatusChange(
                      viewingApplicant,
                      'TERVERIFIKASI',
                      `Berkas pendaftaran Ananda ${viewingApplicant.fullName} telah TERVERIFIKASI oleh Panitia Unit ${viewingApplicant.unit}.`
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    viewingApplicant.status === 'TERVERIFIKASI'
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-white text-[#2563EB] border border-[#2563EB]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Tandai Terverifikasi
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    handleQuickStatusChange(
                      viewingApplicant,
                      'TIDAK_DITERIMA',
                      `Mohon maaf, berdasarkan hasil seleksi dan kuota Unit ${viewingApplicant.unit}, Ananda belum dapat diterima pada periode ini.`
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    viewingApplicant.status === 'TIDAK_DITERIMA'
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-white text-[#DC2626] border border-[#DC2626]'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Tidak Diterima
                </button>
              </div>
            </div>

            {/* Rincian Data Lengkap */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                  DATA CALON PESERTA DIDIK
                </h4>
                <p>
                  <span className="text-slate-500">NISN:</span>{' '}
                  <strong className="font-mono-tabular">{viewingApplicant.nisn}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Tempat, Tgl Lahir:</span>{' '}
                  <strong>
                    {viewingApplicant.birthPlace}, {viewingApplicant.birthDate}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">Jenis Kelamin:</span>{' '}
                  <strong>{viewingApplicant.gender}</strong>
                </p>
                <p>
                  <span className="text-slate-500">WhatsApp Pendaftar:</span>{' '}
                  <strong className="font-mono-tabular">{viewingApplicant.whatsapp}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Email Akun:</span>{' '}
                  <strong>{viewingApplicant.accountEmail}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Alamat Lengkap:</span>{' '}
                  <strong>
                    {viewingApplicant.addressStreet}, RT {viewingApplicant.rt}/RW{' '}
                    {viewingApplicant.rw}, Kel. {viewingApplicant.village}, Kec.{' '}
                    {viewingApplicant.district}, {viewingApplicant.city},{' '}
                    {viewingApplicant.province} {viewingApplicant.postalCode}
                  </strong>
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                  SEKOLAH ASAL &amp; ORANG TUA
                </h4>
                <p>
                  <span className="text-slate-500">Sekolah Asal:</span>{' '}
                  <strong>
                    {viewingApplicant.originSchoolName} ({viewingApplicant.originSchoolCity},{' '}
                    {viewingApplicant.originSchoolProvince}) — Lulus{' '}
                    {viewingApplicant.graduationYear}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">Data Ayah:</span>{' '}
                  <strong>
                    {viewingApplicant.fatherName
                      ? `${viewingApplicant.fatherName} | NIK: ${viewingApplicant.fatherNik} | Pend: ${viewingApplicant.fatherEducation} | ${viewingApplicant.fatherOccupation} (${viewingApplicant.fatherInstitution})`
                      : '— (Tidak diisi)'}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">Data Ibu:</span>{' '}
                  <strong>
                    {viewingApplicant.motherName
                      ? `${viewingApplicant.motherName} | NIK: ${viewingApplicant.motherNik} | Pend: ${viewingApplicant.motherEducation} | ${viewingApplicant.motherOccupation} (${viewingApplicant.motherInstitution})`
                      : '— (Tidak diisi)'}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">Referensi:</span>{' '}
                  <strong>
                    {viewingApplicant.referenceSource} — {viewingApplicant.referenceDetailPrimary}{' '}
                    {viewingApplicant.referenceDetailSecondary
                      ? `(${viewingApplicant.referenceDetailSecondary})`
                      : ''}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">Info Tambahan:</span>{' '}
                  <strong>
                    Mengetahui dari {viewingApplicant.howDidYouKnow} · Catatan:{' '}
                    {viewingApplicant.additionalNotes || '-'}
                  </strong>
                </p>
              </div>

              <div className="sm:col-span-2 pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">
                  BUKTI TRANSFER PEMBAYARAN FORMULIR &amp; TES
                </h4>
                {viewingApplicant.paymentProofDataUrl || viewingApplicant.paymentProofFileName ? (
                  <div className="p-3.5 bg-[#F3F7F5] border border-[#C6DDD3] rounded-lg flex flex-col sm:flex-row sm:items-center gap-4">
                    {viewingApplicant.paymentProofDataUrl && (
                      <img
                        src={viewingApplicant.paymentProofDataUrl}
                        alt="Bukti Transfer Calon Siswa"
                        className="w-36 h-36 object-contain rounded-lg border border-slate-300 bg-white shrink-0"
                      />
                    )}
                    <div className="space-y-1">
                      <p className="font-semibold text-[#0F5338]">
                        {viewingApplicant.paymentProofFileName || 'Bukti Transfer Terlampir'}
                      </p>
                      {viewingApplicant.paymentProofFileSize ? (
                        <p className="text-slate-600 font-mono-tabular">
                          Ukuran File:{' '}
                          {viewingApplicant.paymentProofFileSize >= 1024 * 1024
                            ? `${(viewingApplicant.paymentProofFileSize / (1024 * 1024)).toFixed(
                                2
                              )} MB`
                            : `${Math.max(
                                1,
                                Math.round(viewingApplicant.paymentProofFileSize / 1024)
                              )} KB`}
                        </p>
                      ) : null}
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Bukti Transfer Telah Diunggah Orang Tua
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    Belum ada foto bukti transfer yang dilampirkan pada data ini.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E8E5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const target = viewingApplicant;
                  setViewingApplicant(null);
                  setEditingApplicant({ ...target });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0F5338] bg-[#EBF3EF] rounded-lg hover:bg-[#DCECE4] cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Ubah Data Siswa Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          MODAL 2: UBAH / EDIT DATA CALON PESERTA DIDIK OLEH ADMIN
         ======================================================================== */}
      {editingApplicant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8E5] rounded-xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8E5] pb-4 mb-5">
              <div>
                <p className="text-xs font-semibold text-[#0F5338]">
                  MODE EDIT DATA CALON PESERTA DIDIK · ADMIN UNIT {loggedInAdmin.unit}
                </p>
                <h3 className="text-xl font-bold text-[#0F1E19] mt-0.5">
                  Ubah Data: {editingApplicant.fullName} ({editingApplicant.registrationNumber})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingApplicant(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleSaveEditedApplicant} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F3F7F5] p-4 rounded-lg border border-[#C6DDD3]">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Status Kelulusan / Seleksi
                  </label>
                  <select
                    value={editingApplicant.status}
                    onChange={(e) =>
                      setEditingApplicant({
                        ...editingApplicant,
                        status: e.target.value as SelectionStatus,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold"
                  >
                    <option value="MENUNGGU_VERIFIKASI">MENUNGGU VERIFIKASI</option>
                    <option value="TERVERIFIKASI">TERVERIFIKASI (JADWAL TES)</option>
                    <option value="DITERIMA">DITERIMA (LULUS SELEKSI)</option>
                    <option value="TIDAK_DITERIMA">TIDAK DITERIMA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Unit Peminatan Pendidikan
                  </label>
                  <select
                    value={editingApplicant.unit}
                    onChange={(e) =>
                      setEditingApplicant({
                        ...editingApplicant,
                        unit: e.target.value as EducationUnit,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold"
                  >
                    <option value="AIS">AIS</option>
                    <option value="TK">TK</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-800 mb-1">
                    Catatan Pengumuman untuk Orang Tua
                  </label>
                  <textarea
                    rows={2}
                    value={editingApplicant.statusNotes}
                    onChange={(e) =>
                      setEditingApplicant({ ...editingApplicant, statusNotes: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              {/* Identitas Siswa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={editingApplicant.fullName}
                    onChange={(e) =>
                      setEditingApplicant({ ...editingApplicant, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    required
                    value={editingApplicant.nisn}
                    onChange={(e) =>
                      setEditingApplicant({ ...editingApplicant, nisn: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    required
                    value={editingApplicant.birthPlace}
                    onChange={(e) =>
                      setEditingApplicant({ ...editingApplicant, birthPlace: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={editingApplicant.birthDate}
                    onChange={(e) =>
                      setEditingApplicant({ ...editingApplicant, birthDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={editingApplicant.whatsapp}
                    onChange={(e) =>
                      setEditingApplicant({ ...editingApplicant, whatsapp: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asal Sekolah</label>
                  <input
                    type="text"
                    required
                    value={editingApplicant.originSchoolName}
                    onChange={(e) =>
                      setEditingApplicant({
                        ...editingApplicant,
                        originSchoolName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Ayah (Opsional jika Ibu diisi)
                  </label>
                  <input
                    type="text"
                    value={editingApplicant.fatherName}
                    onChange={(e) =>
                      setEditingApplicant({ ...editingApplicant, fatherName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pendidikan Ayah
                  </label>
                  <select
                    value={editingApplicant.fatherEducation}
                    onChange={(e) =>
                      setEditingApplicant({
                        ...editingApplicant,
                        fatherEducation: e.target.value as EducationLevel,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="">-- Pilih --</option>
                    {EDUCATION_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Ibu Kandung (Opsional jika Ayah diisi)
                  </label>
                  <input
                    type="text"
                    value={editingApplicant.motherName}
                    onChange={(e) =>
                      setEditingApplicant({ ...editingApplicant, motherName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pendidikan Ibu</label>
                  <select
                    value={editingApplicant.motherEducation}
                    onChange={(e) =>
                      setEditingApplicant({
                        ...editingApplicant,
                        motherEducation: e.target.value as EducationLevel,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="">-- Pilih --</option>
                    {EDUCATION_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8E5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingApplicant(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#0F5338] rounded-lg hover:bg-[#0B3E29] cursor-pointer"
                >
                  {isProcessing ? 'Menyimpan...' : 'Simpan Perubahan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================
          MODAL 3: KONFIRMASI HAPUS DATA CALON SISWA
         ======================================================================== */}
      {deletingApplicant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8E5] rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-[#0F1E19]">Hapus Data Calon Siswa?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data calon peserta didik{' '}
              <strong>{deletingApplicant.fullName}</strong> (
              <span className="font-mono-tabular">{deletingApplicant.registrationNumber}</span>)
              dari Unit {loggedInAdmin.unit}? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingApplicant(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
              >
                {isProcessing ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

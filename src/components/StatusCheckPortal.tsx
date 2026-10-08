import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { unpackRegistrationFromFirestore } from '../services/spmbDataService';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Printer,
  KeyRound,
  AlertCircle,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { SPMBRegistrationRecord } from '../types/spmb';
import { getEffectiveStatusNote } from '../utils/statusUtils';

export const ADMIN_WHATSAPP_CONTACTS = [
  {
    unit: 'TK',
    fullName: 'TK IT Arafah',
    phone: '0878-8773-0314',
    cleanNumber: '6287887730314',
  },
  {
    unit: 'SD Gedung A',
    fullName: 'SD IT Arafah (Gedung A)',
    phone: '0815-4961-5571',
    cleanNumber: '6281549615571',
  },
  {
    unit: 'SD Gedung B',
    fullName: 'SD IT Arafah (Gedung B)',
    phone: '0821-2241-7335',
    cleanNumber: '6282122417335',
  },
  {
    unit: 'AIS',
    fullName: 'Arafah Islamic School (AIS)',
    phone: '0822-5800-0330',
    cleanNumber: '6282258000330',
  },
  {
    unit: 'SMP',
    fullName: 'SMP IT Arafah',
    phone: '0821-1314-6800',
    cleanNumber: '6282113146800',
  },
];

interface StatusCheckPortalProps {
  registrations: SPMBRegistrationRecord[];
  initialSearchNumber?: string;
}

export const StatusCheckPortal: React.FC<StatusCheckPortalProps> = ({
  registrations,
  initialSearchNumber = '',
}) => {
  const [lookupMode, setLookupMode] = useState<'REG_NUMBER' | 'ACCOUNT_LOGIN'>('REG_NUMBER');
  const [regNumberQuery, setRegNumberQuery] = useState(initialSearchNumber);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [foundRecord, setFoundRecord] = useState<SPMBRegistrationRecord | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSearchNumber) {
      setRegNumberQuery(initialSearchNumber);
      const match = registrations.find(
        (r) => r.registrationNumber.toUpperCase() === initialSearchNumber.trim().toUpperCase()
      );
      if (match) {
        setFoundRecord(match);
        setSearchError(null);
      }
    }
  }, [initialSearchNumber, registrations]);

  // Keep foundRecord synced if admin updates status live
  useEffect(() => {
    if (foundRecord) {
      const updated = registrations.find((r) => r.id === foundRecord.id);
      if (updated) {
        setFoundRecord(updated);
      }
    }
  }, [registrations, foundRecord]);

  const handleSearchByNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const cleaned = regNumberQuery.trim().toUpperCase();
    if (!cleaned) {
      setSearchError('Masukkan Nomor Pendaftaran (contoh: SPMB-20260101).');
      return;
    }
    const match = registrations.find((r) => r.registrationNumber.toUpperCase() === cleaned);
    if (!match) {
      try {
        const q = query(
          collection(db, 'registrations'),
          where('registrationNumber', '==', cleaned)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const loaded = unpackRegistrationFromFirestore(docSnap.id, docSnap.data());
          setFoundRecord(loaded);
          setSearchError(null);
          return;
        }
      } catch {
        // fallback to standard message
      }
      setFoundRecord(null);
      setSearchError(
        `Data dengan Nomor Pendaftaran "${cleaned}" tidak ditemukan. Pastikan format sesuai bukti pendaftaran.`
      );
      return;
    }
    setFoundRecord(match);
  };

  const handleSearchByAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const match = registrations.find(
      (r) =>
        r.accountEmail.toLowerCase() === loginEmail.trim().toLowerCase() &&
        r.accountPin === loginPin.trim()
    );
    if (!match) {
      setFoundRecord(null);
      setSearchError(
        'Email Aktif atau PIN / Password tidak sesuai. Silakan gunakan Nomor Pendaftaran atau periksa kembali kredensial Anda.'
      );
      return;
    }
    setFoundRecord(match);
  };

  const renderStatusBanner = (record: SPMBRegistrationRecord) => {
    const effectiveNote = getEffectiveStatusNote(record.status, record.statusNotes);

    if (record.status === 'DITERIMA') {
      return (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#15803D] tracking-wide">
                STATUS PENDAFTARAN · UNIT {record.unit}
              </p>
              <h3 className="text-xl font-bold text-[#14532D] mt-1">
                Diterima
              </h3>
              <p className="text-sm text-[#166534] mt-2 leading-relaxed">
                {effectiveNote}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (record.status === 'TIDAK_DITERIMA') {
      return (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <XCircle className="w-8 h-8 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#B91C1C] tracking-wide">
                STATUS PENDAFTARAN · UNIT {record.unit}
              </p>
              <h3 className="text-xl font-bold text-[#7F1D1D] mt-1">
                Ditolak
              </h3>
              <p className="text-sm text-[#991B1B] mt-2 leading-relaxed">
                {effectiveNote}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (record.status === 'TERVERIFIKASI') {
      return (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <FileCheck className="w-8 h-8 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1D4ED8] tracking-wide">
                STATUS PENDAFTARAN · UNIT {record.unit}
              </p>
              <h3 className="text-xl font-bold text-[#1E3A8A] mt-1">
                Sudah Diverifikasi
              </h3>
              <p className="text-sm text-[#1E40AF] mt-2 leading-relaxed">
                {effectiveNote}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <Clock className="w-8 h-8 text-[#D97706] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#B45309] tracking-wide">
              STATUS PENDAFTARAN · UNIT {record.unit}
            </p>
            <h3 className="text-xl font-bold text-[#78350F] mt-1">
              Menunggu verifikasi
            </h3>
            <p className="text-sm text-[#92400E] mt-2 leading-relaxed">
              {effectiveNote}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8 mb-6 no-print">
        <div className="border-b border-[#E2E8E5] pb-5 mb-6">
          <p className="text-xs font-medium text-[#0F5338]">
            PORTAL CEK PENGUMUMAN &amp; STATUS SELEKSI ORANG TUA
          </p>
          <h1 className="text-2xl font-bold text-[#0F1E19] mt-1">
            Cek Status Pendaftaran SPMB SIT ARAFAH
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Masukkan Nomor Pendaftaran (<span className="font-mono-tabular">SPMB-XXXXXXXX</span>)
            Anda untuk melihat status verifikasi dan pengumuman seleksi.
          </p>
        </div>

        <form onSubmit={handleSearchByNumber} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={regNumberQuery}
                onChange={(e) => setRegNumberQuery(e.target.value)}
                placeholder="Masukkan Nomor Pendaftaran, misal: SPMB-20260101"
                className="w-full px-4 py-2.5 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0F5338] rounded-lg hover:bg-[#0B3E29] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              Cek Status Kelulusan
            </button>
          </div>

          {/* Quick demo buttons for instant testing */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
            <span>Contoh Nomor Pendaftaran Aktif:</span>
            {registrations.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setRegNumberQuery(item.registrationNumber);
                  setFoundRecord(item);
                  setSearchError(null);
                }}
                className="px-2.5 py-1 font-mono-tabular text-xs font-medium text-[#0F5338] bg-[#F3F7F5] hover:bg-[#E2EFE9] rounded-md transition-colors cursor-pointer"
              >
                {item.registrationNumber} ({item.unit})
              </button>
            ))}
          </div>
        </form>

        {searchError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* HASIL PENCARIAN STATUS PENDAFTARAN */}
      {foundRecord && (
        <div className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E2E8E5] pb-5 mb-6">
            <div>
              <p className="text-xs font-medium text-slate-500">
                SURAT KETERANGAN STATUS SELEKSI · SPMB SIT ARAFAH
              </p>
              <h2 className="text-2xl font-bold text-[#0F1E19] mt-0.5">{foundRecord.fullName}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                <span className="font-mono-tabular font-semibold text-[#0F5338]">
                  {foundRecord.registrationNumber}
                </span>
                <span aria-hidden="true">·</span>
                <span>Peminatan: Unit {foundRecord.unit}</span>
                <span aria-hidden="true">·</span>
                <span>NISN: {foundRecord.nisn}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0F5338] bg-[#EBF3EF] rounded-lg hover:bg-[#DCECE4] transition-colors no-print cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Cetak Bukti &amp; Status
            </button>
          </div>

          {renderStatusBanner(foundRecord)}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm pt-2">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 tracking-wide">
                IDENTITAS CALON PESERTA DIDIK
              </h4>
              <div>
                <span className="text-xs text-slate-500 block">Nama Lengkap (Panggilan)</span>
                <span className="font-medium text-slate-900">
                  {foundRecord.fullName} ({foundRecord.nickname})
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Tempat, Tanggal Lahir</span>
                <span className="font-medium text-slate-900">
                  {foundRecord.birthPlace}, {foundRecord.birthDate}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Jenis Kelamin</span>
                <span className="font-medium text-slate-900">{foundRecord.gender}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Alamat Tempat Tinggal</span>
                <span className="font-medium text-slate-900">
                  {foundRecord.addressStreet}, RT {foundRecord.rt}/RW {foundRecord.rw}, Kel.{' '}
                  {foundRecord.village}, Kec. {foundRecord.district}, {foundRecord.city},{' '}
                  {foundRecord.province} {foundRecord.postalCode}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 tracking-wide">
                SEKOLAH ASAL &amp; DATA ORANG TUA
              </h4>
              <div>
                <span className="text-xs text-slate-500 block">Sekolah Asal &amp; Tahun Lulus</span>
                <span className="font-medium text-slate-900">
                  {foundRecord.originSchoolName} — {foundRecord.originSchoolCity} (
                  {foundRecord.graduationYear})
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Data Ayah / Bunda / Wali</span>
                <span className="font-medium text-slate-900">
                  {foundRecord.parentGuardianName ||
                    foundRecord.fatherName ||
                    foundRecord.motherName ||
                    '—'}
                  {(foundRecord.parentGuardianWhatsapp ||
                    foundRecord.fatherWhatsapp ||
                    foundRecord.motherWhatsapp) && (
                    <span className="font-mono-tabular text-slate-600 ml-1">
                      · WA:{' '}
                      {foundRecord.parentGuardianWhatsapp ||
                        foundRecord.fatherWhatsapp ||
                        foundRecord.motherWhatsapp}
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Sumber Referensi Pendaftaran</span>
                <span className="font-medium text-slate-900">
                  {foundRecord.referenceSource}: {foundRecord.referenceDetailPrimary}
                  {foundRecord.referenceDetailSecondary
                    ? ` (${foundRecord.referenceDetailSecondary})`
                    : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER INFORMASI & KONTAK WHATSAPP ADMIN SIT ARAFAH */}
      <div className="mt-8 pt-6 border-t border-[#E2E8E5] no-print">
        <div className="bg-white border border-[#E2E8E5] rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#E2E8E5]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0F5338] shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#0F1E19]">
                  No Admin SIT ARAFAH
                </h3>
                <p className="text-xs text-slate-500">
                  Untuk informasi pendaftaran, verifikasi data, atau hasil seleksi, hubungi Admin via WhatsApp:
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Layanan Panitia SPMB</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ADMIN_WHATSAPP_CONTACTS.map((item) => {
              const isMatchedUnit =
                foundRecord &&
                (foundRecord.unit === item.unit ||
                  (foundRecord.unit === 'SD' && item.unit.startsWith('SD')));

              return (
                <a
                  key={item.unit}
                  href={`https://wa.me/${item.cleanNumber}?text=${encodeURIComponent(
                    `Assalamu'alaikum Admin SIT ARAFAH (${item.unit}), saya ingin menanyakan informasi pendaftaran/status seleksi siswa.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3.5 rounded-lg border transition-all group cursor-pointer ${
                    isMatchedUnit
                      ? 'border-[#0F5338] bg-[#F3F7F5] ring-1 ring-[#0F5338]/30 shadow-xs'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-emerald-50/60 hover:border-emerald-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#0F5338] transition-colors">
                        {item.unit}
                      </span>
                      {isMatchedUnit && (
                        <span className="text-[10px] font-semibold text-[#0F5338] bg-emerald-100 px-1.5 py-0.5 rounded">
                          Unit Terpilih
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono-tabular font-semibold text-[#0F5338] block mt-0.5">
                      {item.phone}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {item.fullName}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F5338] bg-white px-2.5 py-1.5 rounded-md border border-emerald-200 shadow-xs group-hover:bg-[#0F5338] group-hover:text-white transition-colors shrink-0">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WA</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

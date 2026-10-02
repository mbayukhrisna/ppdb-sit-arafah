import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Printer,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { SPMBRegistrationRecord } from '../types/spmb';

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

  const handleSearchByNumber = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const cleaned = regNumberQuery.trim().toUpperCase();
    if (!cleaned) {
      setSearchError('Masukkan Nomor Pendaftaran (contoh: SPMB-20260101).');
      return;
    }
    const match = registrations.find((r) => r.registrationNumber.toUpperCase() === cleaned);
    if (!match) {
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
    if (record.status === 'DITERIMA') {
      return (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#15803D] tracking-wide">
                PENGUMUMAN KELULUSAN SELEKSI · UNIT {record.unit}
              </p>
              <h3 className="text-xl font-bold text-[#14532D] mt-1">
                DITERIMA SEBAGAI CALON PESERTA DIDIK BARU SIT ARAFAH
              </h3>
              <p className="text-sm text-[#166534] mt-2 leading-relaxed">
                {record.statusNotes ||
                  'Selamat! Calon peserta didik dinyatakan DITERIMA pada SIT ARAFAH. Silakan melanjutkan proses daftar ulang sesuai jadwal panitia.'}
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
                HASIL SELEKSI · UNIT {record.unit}
              </p>
              <h3 className="text-xl font-bold text-[#7F1D1D] mt-1">
                BELUM DAPAT DITERIMA PADA PERIODE INI
              </h3>
              <p className="text-sm text-[#991B1B] mt-2 leading-relaxed">
                {record.statusNotes ||
                  'Terima kasih atas partisipasi Anda dalam seleksi SPMB SIT ARAFAH. Berdasarkan kuota dan hasil seleksi, ananda belum dapat diterima pada gelombang ini.'}
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
                STATUS SELEKSI · UNIT {record.unit}
              </p>
              <h3 className="text-xl font-bold text-[#1E3A8A] mt-1">
                BERKAS TERVERIFIKASI — TAHAP OBSERVASI / TES SELEKSI
              </h3>
              <p className="text-sm text-[#1E40AF] mt-2 leading-relaxed">
                {record.statusNotes ||
                  'Berkas pendaftaran telah diverifikasi oleh Panitia Unit. Silakan mengikuti tahapan observasi sesuai jadwal.'}
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
              MENUNGGU VERIFIKASI PANITIA JENJANG {record.unit}
            </h3>
            <p className="text-sm text-[#92400E] mt-2 leading-relaxed">
              {record.statusNotes ||
                'Data pendaftaran Anda telah masuk ke dalam sistem dan sedang diverifikasi oleh Admin Unit.'}
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
                <span className="text-xs text-slate-500 block">Biodata Ayah</span>
                <span className="font-medium text-slate-900">
                  {foundRecord.fatherName
                    ? `${foundRecord.fatherName} · WA: ${foundRecord.fatherWhatsapp}`
                    : '— (Diwakili oleh Biodata Ibu)'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Biodata Ibu Kandung</span>
                <span className="font-medium text-slate-900">
                  {foundRecord.motherName
                    ? `${foundRecord.motherName} · WA: ${foundRecord.motherWhatsapp}`
                    : '— (Diwakili oleh Biodata Ayah)'}
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
    </div>
  );
};

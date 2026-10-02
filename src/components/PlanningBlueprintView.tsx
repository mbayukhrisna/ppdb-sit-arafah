import React from 'react';
import {
  FileText,
  Layers,
  ShieldCheck,
  Database,
  ArrowRight,
  Printer,
  CheckCircle2,
} from 'lucide-react';

interface PlanningBlueprintViewProps {
  onNavigateToStudentPortal: (tab: 'FORM' | 'STATUS') => void;
  onNavigateToAdminDashboard: () => void;
}

export const PlanningBlueprintView: React.FC<PlanningBlueprintViewProps> = ({
  onNavigateToStudentPortal,
  onNavigateToAdminDashboard,
}) => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-10">
        {/* Header Dokumen Planning */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E2E8E5] pb-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#0F5338] tracking-wide">
              DOKUMEN PERENCANAAN SISTEM &amp; SPESIFIKASI TEKNIS
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1E19] mt-1">
              Blueprint Website Pendaftaran SPMB SIT ARAFAH
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Rancangan arsitektur sistem terpadu 2 Portal (Portal Orang Tua &amp; Portal 4 Admin
              Jenjang AIS, TK, SD, SMP), alur kerja formulir dinamis, dan manajemen kelulusan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0F5338] bg-[#EBF3EF] rounded-lg hover:bg-[#DCECE4] transition-colors no-print cursor-pointer whitespace-nowrap self-start"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen Planning
          </button>
        </div>

        {/* 1. ARSITEKTUR 2 PORTAL UTAMA */}
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <Layers className="w-5 h-5 text-[#0F5338]" />
            <h2 className="text-lg font-bold text-[#0F1E19]">
              01. Arsitektur 2 Portal &amp; Pembagian Hak Akses (RBAC)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#E2E8E5] rounded-xl p-5 bg-[#F8FAF9]">
              <h3 className="text-base font-bold text-[#0F1E19]">
                A. Portal Orang Tua / Wali Murid
              </h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                Dapat diakses secara publik oleh orang tua/wali calon peserta didik tanpa hambatan
                teknis.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5338] shrink-0 mt-0.5" />
                  <span>
                    <strong>Pembuatan Akun Pendaftaran:</strong> Menggunakan Email Aktif &amp;
                    PIN/Password 6 digit untuk keamanan akses bukti pendaftaran.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5338] shrink-0 mt-0.5" />
                  <span>
                    <strong>Fleksibilitas Biodata Orang Tua (Single-Parent Rule):</strong> Validasi
                    cerdas yang tidak mewajibkan kedua orang tua diisi bersamaan — cukup mengisi
                    biodata Ayah saja, Ibu saja, atau keduanya.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5338] shrink-0 mt-0.5" />
                  <span>
                    <strong>Tahap Ringkasan Konfirmasi:</strong> Menampilkan halaman review sebelum
                    data dikirim permanen untuk meminimalisir salah input.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5338] shrink-0 mt-0.5" />
                  <span>
                    <strong>Notifikasi Nomor Pendaftaran &amp; Cek Kelulusan:</strong> Menerbitkan
                    kode unik <code className="font-mono-tabular font-semibold">SPMB-XXXXXXXX</code>{' '}
                    yang dapat dicek kapan saja untuk memantau status diterima/tidak diterima.
                  </span>
                </li>
              </ul>

              <div className="mt-5 pt-4 border-t border-[#E2E8E5] flex items-center gap-3 no-print">
                <button
                  type="button"
                  onClick={() => onNavigateToStudentPortal('FORM')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5338] hover:underline cursor-pointer"
                >
                  Buka Formulir Pendaftaran (/) <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => onNavigateToStudentPortal('STATUS')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5338] hover:underline cursor-pointer"
                >
                  Buka Cek Status (/) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="border border-[#E2E8E5] rounded-xl p-5 bg-[#F8FAF9]">
              <h3 className="text-base font-bold text-[#0F1E19]">
                B. Portal Admin 4 Jenjang — Rute Khusus <code className="font-mono-tabular text-[#0F5338]">/admin</code>
              </h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                Terpisah dari tampilan publik Portal Siswa/Orang Tua dan hanya diakses melalui URL{' '}
                <code className="font-mono-tabular font-semibold">/admin</code>.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5338] shrink-0 mt-0.5" />
                  <span>
                    <strong>4 Login Kredensial Jenjang:</strong>{' '}
                    <code className="font-mono-tabular">admin_ais</code> (Unit AIS),{' '}
                    <code className="font-mono-tabular">admin_tk</code> (Unit TK),{' '}
                    <code className="font-mono-tabular">admin_sd</code> (Unit SD), dan{' '}
                    <code className="font-mono-tabular">admin_smp</code> (Unit SMP).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5338] shrink-0 mt-0.5" />
                  <span>
                    <strong>Isolasi Data Per Unit:</strong> Saat Admin login, dashboard otomatis
                    memfilter data calon peserta didik sesuai unit jenjangnya masing-masing.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5338] shrink-0 mt-0.5" />
                  <span>
                    <strong>Operasi CRUD Penuh:</strong> Admin dapat melihat detail lengkap (Read),
                    mengubah biodata &amp; status kelulusan (Update), serta menghapus data calon
                    siswa (Delete).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5338] shrink-0 mt-0.5" />
                  <span>
                    <strong>Manajemen Master Guru/Staff:</strong> Menambah, mengubah, atau
                    menonaktifkan daftar nama Guru/Staff untuk field referensi tanpa menyentuh kode
                    program.
                  </span>
                </li>
              </ul>

              <div className="mt-5 pt-4 border-t border-[#E2E8E5] no-print">
                <button
                  type="button"
                  onClick={onNavigateToAdminDashboard}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5338] hover:underline cursor-pointer"
                >
                  Buka Portal Admin 4 Jenjang (/admin) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. LOGIKA KONDISIONAL FORMULIR & VALIDASI */}
        <section className="mb-10 pt-8 border-t border-[#E2E8E5]">
          <div className="flex items-center gap-2.5 mb-4">
            <FileText className="w-5 h-5 text-[#0F5338]" />
            <h2 className="text-lg font-bold text-[#0F1E19]">
              02. Spesifikasi Logika Formulir &amp; Field Kondisional
            </h2>
          </div>

          <div className="overflow-x-auto border border-[#E2E8E5] rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8E5] text-slate-600 font-semibold">
                  <th className="py-3 px-4">Modul / Bagian Formulir</th>
                  <th className="py-3 px-4">Komponen Input</th>
                  <th className="py-3 px-4">Aturan Bisnis &amp; Validasi Sistem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E5]">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">1. Pilihan Peminatan</td>
                  <td className="py-3 px-4">Radio Button: AIS, TK, SD, SMP</td>
                  <td className="py-3 px-4 text-slate-600">
                    Ditempatkan paling atas untuk menentukan jalur/unit pendidikan dan mengarahkan
                    data siswa ke salah satu dari 4 Portal Admin Jenjang.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">2. Akun Pendaftaran</td>
                  <td className="py-3 px-4">Email Aktif, PIN/Password, Konfirmasi PIN</td>
                  <td className="py-3 px-4 text-slate-600">
                    Validasi format email &amp; pencocokan dua kolom PIN sebelum lanjut ke
                    ringkasan.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    3. Data Calon Peserta Didik
                  </td>
                  <td className="py-3 px-4">
                    NISN, Nama Lengkap, Panggilan, TTL, JK, No. WA, Alamat (RT/RW, Desa, Kec, Kota,
                    Prov, Kode Pos)
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Seluruh kolom wajib diisi sesuai dokumen resmi (Akta/KK).
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">4. Data Sekolah Asal</td>
                  <td className="py-3 px-4">
                    Nama Sekolah, Alamat, Kab/Kota, Provinsi, Tahun Lulus
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Mendukung pendaftar pindahan/jenjang lanjut maupun pendaftar usia dini (AIS/TK).
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    5. Data Orang Tua (Ayah / Ibu)
                  </td>
                  <td className="py-3 px-4">
                    Nama, NIK, No. WA, Pendidikan (SD–S3/Lainnya), Pekerjaan, Instansi
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <strong>Logika OR (Salah Satu Cukup):</strong> Valid apabila{' '}
                    <code className="font-mono-tabular">
                      isFatherComplete || isMotherComplete
                    </code>
                    . Orang tua tidak wajib mengisi keduanya jika hanya salah satu yang tersedia.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    6. Data Referensi Dinamis
                  </td>
                  <td className="py-3 px-4">
                    7 Opsi Sumber Referensi dengan pemicu sub-field otomatis
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    • <strong>Guru dan Staff:</strong> Dropdown dinamis dari koleksi{' '}
                    <code className="font-mono-tabular">referrals_staff</code>
                    <br />• <strong>Orang Tua/Wali:</strong> Input Nama Orang Tua/Wali
                    <br />• <strong>Alumni:</strong> Input Nama Alumni + Tahun Lulus
                    <br />• <strong>Teman/Kerabat:</strong> Input Nama Pemberi Referensi + Hubungan
                    <br />• <strong>Media Sosial:</strong> Dropdown (IG, FB, TikTok, YouTube,
                    Lainnya)
                    <br />• <strong>Website / Lainnya:</strong> Input Keterangan / Sumber Lainnya
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    7. Pernyataan &amp; Ringkasan
                  </td>
                  <td className="py-3 px-4">
                    4 Checkbox Pernyataan + Halaman Konfirmasi Sebelum Kirim
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Menampilkan ringkasan utuh dengan tombol{' '}
                    <strong>[ ← Kembali &amp; Edit ]</strong> dan{' '}
                    <strong>[ ✓ Data Sudah Benar ]</strong>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. SKEMA DATABASE & ALUR DATA */}
        <section className="pt-8 border-t border-[#E2E8E5]">
          <div className="flex items-center gap-2.5 mb-4">
            <Database className="w-5 h-5 text-[#0F5338]" />
            <h2 className="text-lg font-bold text-[#0F1E19]">
              03. Skema Database Cloud &amp; Alur Pengumuman Kelulusan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-4 border border-[#E2E8E5] rounded-lg">
              <p className="font-mono-tabular font-bold text-[#0F5338]">
                /registrations/&#123;registrationId&#125;
              </p>
              <p className="text-slate-600 mt-1.5 leading-relaxed">
                Menyimpan dokumen pendaftaran lengkap, Nomor Pendaftaran unik (
                <code className="font-mono-tabular">SPMB-XXXXXXXX</code>), unit peminatan (
                <code className="font-mono-tabular">AIS | TK | SD | SMP</code>), serta status
                kelulusan (<code className="font-mono-tabular">MENUNGGU_VERIFIKASI</code>,{' '}
                <code className="font-mono-tabular">TERVERIFIKASI</code>,{' '}
                <code className="font-mono-tabular">DITERIMA</code>,{' '}
                <code className="font-mono-tabular">TIDAK_DITERIMA</code>).
              </p>
            </div>

            <div className="p-4 border border-[#E2E8E5] rounded-lg">
              <p className="font-mono-tabular font-bold text-[#0F5338]">
                /referrals_staff/&#123;staffId&#125;
              </p>
              <p className="text-slate-600 mt-1.5 leading-relaxed">
                Menyimpan daftar nama Guru &amp; Staff SIT ARAFAH beserta flag{' '}
                <code className="font-mono-tabular">active: boolean</code>. Ketika Admin menonaktifkan
                atau menambah nama baru, dropdown pada Formulir Pendaftaran Orang Tua otomatis
                diperbarui secara real-time.
              </p>
            </div>

            <div className="p-4 border border-[#E2E8E5] rounded-lg">
              <div className="flex items-center gap-1.5 font-bold text-[#0F5338]">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Trust Security Rules</span>
              </div>
              <p className="text-slate-600 mt-1.5 leading-relaxed">
                Dilengkapi validasi skema ketat di level database (<code className="font-mono-tabular">firestore.rules</code>
                ) yang memverifikasi keabsahan unit pendidikan, format nomor SPMB, dan kepastian
                minimal salah satu profil orang tua terisi.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

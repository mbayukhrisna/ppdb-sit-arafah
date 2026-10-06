import * as XLSX from 'xlsx';
import {
  SPMBRegistrationRecord,
  StaffReferenceRecord,
} from '../types/spmb';
import { getStatusLabel, getEffectiveStatusNote } from './statusUtils';

function formatDateIndo(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

function formatTimeIndo(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

export function exportRegistrationsToExcel(
  records: SPMBRegistrationRecord[],
  scopeLabel = 'Semua_Unit'
) {
  if (!records || records.length === 0) {
    return;
  }

  const exportRows = records.map((record, index) => {
    return {
      'No.': index + 1,
      'No. Pendaftaran': record.registrationNumber || '-',
      'Unit Peminatan': record.unit || '-',
      'Status Seleksi': getStatusLabel(record.status),
      'Catatan Status': getEffectiveStatusNote(record.status, record.statusNotes),
      'Nama Lengkap Siswa': record.fullName || '-',
      'Nama Panggilan': record.nickname || '-',
      NISN: record.nisn || '-',
      'Tempat Lahir': record.birthPlace || '-',
      'Tanggal Lahir': record.birthDate || '-',
      'Jenis Kelamin': record.gender || '-',
      'No. WhatsApp Siswa/Wali': record.whatsapp || '-',
      'Alamat Rumah (Jalan/No)': record.addressStreet || '-',
      RT: record.rt || '-',
      RW: record.rw || '-',
      'Kelurahan / Desa': record.village || '-',
      Kecamatan: record.district || '-',
      'Kota / Kabupaten': record.city || '-',
      Provinsi: record.province || '-',
      'Kode Pos': record.postalCode || '-',
      'Nama Sekolah Asal': record.originSchoolName || '-',
      'Alamat Sekolah Asal': record.originSchoolAddress || '-',
      'Kota Sekolah Asal': record.originSchoolCity || '-',
      'Provinsi Sekolah Asal': record.originSchoolProvince || '-',
      'Tahun Kelulusan': record.graduationYear || '-',
      'Nama Ayah': record.fatherName || '-',
      'NIK Ayah': record.fatherNik ? `'${record.fatherNik}` : '-',
      'No. WA Ayah': record.fatherWhatsapp || '-',
      'Pendidikan Ayah': record.fatherEducation || '-',
      'Pekerjaan Ayah': record.fatherOccupation || '-',
      'Instansi / Tempat Kerja Ayah': record.fatherInstitution || '-',
      'Nama Ibu': record.motherName || '-',
      'NIK Ibu': record.motherNik ? `'${record.motherNik}` : '-',
      'No. WA Ibu': record.motherWhatsapp || '-',
      'Pendidikan Ibu': record.motherEducation || '-',
      'Pekerjaan Ibu': record.motherOccupation || '-',
      'Instansi / Tempat Kerja Ibu': record.motherInstitution || '-',
      'Sumber Referensi': record.referenceSource || '-',
      'Detail Pemberi Referensi': record.referenceDetailPrimary || '-',
      'Kode Link Referensi': record.referenceDetailSecondary || '-',
      'Mengetahui Dari': record.howDidYouKnow || '-',
      'Catatan Tambahan': record.additionalNotes || '-',
      'Bukti Transfer Terlampir': record.paymentProofFileName ? 'Ya' : 'Belum Ada',
      'Nama File Bukti Transfer': record.paymentProofFileName || '-',
      'Tanggal Daftar': formatDateIndo(record.createdAtIso),
      'Waktu Daftar': formatTimeIndo(record.createdAtIso),
      'Tanggal Terakhir Update': formatDateIndo(record.updatedAtIso),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);

  // Set intelligent column widths for professional spreadsheet appearance
  const colWidths = [
    { wch: 6 }, // No
    { wch: 18 }, // No Pendaftaran
    { wch: 14 }, // Unit
    { wch: 24 }, // Status Seleksi
    { wch: 30 }, // Catatan Status
    { wch: 30 }, // Nama Lengkap Siswa
    { wch: 16 }, // Nama Panggilan
    { wch: 16 }, // NISN
    { wch: 18 }, // Tempat Lahir
    { wch: 14 }, // Tanggal Lahir
    { wch: 14 }, // Jenis Kelamin
    { wch: 18 }, // No WA Siswa/Wali
    { wch: 35 }, // Alamat
    { wch: 8 }, // RT
    { wch: 8 }, // RW
    { wch: 20 }, // Kelurahan
    { wch: 20 }, // Kecamatan
    { wch: 20 }, // Kota
    { wch: 18 }, // Provinsi
    { wch: 10 }, // Kode Pos
    { wch: 30 }, // Nama Sekolah Asal
    { wch: 30 }, // Alamat Sekolah Asal
    { wch: 20 }, // Kota Sekolah Asal
    { wch: 20 }, // Provinsi Sekolah Asal
    { wch: 16 }, // Tahun Lulus
    { wch: 26 }, // Nama Ayah
    { wch: 20 }, // NIK Ayah
    { wch: 18 }, // No WA Ayah
    { wch: 14 }, // Pend Ayah
    { wch: 22 }, // Pekerjaan Ayah
    { wch: 26 }, // Instansi Ayah
    { wch: 26 }, // Nama Ibu
    { wch: 20 }, // NIK Ibu
    { wch: 18 }, // No WA Ibu
    { wch: 14 }, // Pend Ibu
    { wch: 22 }, // Pekerjaan Ibu
    { wch: 26 }, // Instansi Ibu
    { wch: 22 }, // Sumber Referensi
    { wch: 30 }, // Detail Pemberi Referensi
    { wch: 20 }, // Kode Link Referensi
    { wch: 20 }, // Mengetahui Dari
    { wch: 30 }, // Catatan Tambahan
    { wch: 22 }, // Bukti Transfer Terlampir
    { wch: 28 }, // Nama File Bukti Transfer
    { wch: 16 }, // Tanggal Daftar
    { wch: 14 }, // Waktu Daftar
    { wch: 20 }, // Tanggal Terakhir Update
  ];

  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  const sheetName = `SPMB_${scopeLabel.slice(0, 20)}`;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const cleanScope = scopeLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
    2,
    '0'
  )}`;
  const filename = `Data_Pendaftar_SPMB_SIT_Arafah_${cleanScope}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

export function exportStaffReferralsToExcel(
  staffList: StaffReferenceRecord[],
  registrations: SPMBRegistrationRecord[],
  unitLabel = 'Semua_Unit'
) {
  if (!staffList || staffList.length === 0) {
    return;
  }

  const rows = staffList.map((staff, idx) => {
    const matchedCount = registrations.filter(
      (r) =>
        r.referenceDetailSecondary?.includes(`?ref=${staff.refCode}`) ||
        r.referenceDetailSecondary === staff.refCode ||
        r.referenceDetailPrimary?.toLowerCase().includes(staff.name.toLowerCase())
    ).length;

    return {
      'No.': idx + 1,
      'Kode Referral': staff.refCode,
      'Nama Pemilik Link': staff.name,
      Kategori: staff.category || 'Guru dan Staff',
      'Unit Penugasan': staff.roleUnit,
      'Total Pendaftar Terbawa': matchedCount,
      Status: staff.active ? 'Aktif' : 'Nonaktif',
      'Tautan URL Pendaftaran': `https://ppdb-sit-arafah.vercel.app/?ref=${staff.refCode}`,
      'Tanggal Dibuat': formatDateIndo(staff.createdAtIso),
      'Terakhir Update': formatDateIndo(staff.updatedAtIso),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 30 },
    { wch: 20 },
    { wch: 16 },
    { wch: 24 },
    { wch: 12 },
    { wch: 45 },
    { wch: 16 },
    { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Referral_SIT_Arafah');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const cleanUnit = unitLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Data_Referral_${cleanUnit}_SIT_Arafah_${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
}


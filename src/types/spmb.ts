export type EducationUnit = 'AIS' | 'TK' | 'SD' | 'SMP';

export type SelectionStatus =
  | 'MENUNGGU_VERIFIKASI'
  | 'TERVERIFIKASI'
  | 'DITERIMA'
  | 'TIDAK_DITERIMA';

export type EducationLevel =
  | 'SD'
  | 'SMP'
  | 'SMA/SMK'
  | 'D1'
  | 'D2'
  | 'D3'
  | 'S1'
  | 'S2'
  | 'S3'
  | 'Lainnya'
  | '';

export type ReferenceSource =
  | 'Guru dan Staff'
  | 'Orang Tua/Wali Murid'
  | 'Alumni'
  | 'Teman/Kerabat'
  | 'Media Sosial'
  | 'Website'
  | 'Lainnya';

export type SocialMediaPlatform =
  | 'Instagram'
  | 'Facebook'
  | 'TikTok'
  | 'YouTube'
  | 'Lainnya';

export type HowDidYouKnowOption =
  | 'Guru/Staff'
  | 'Orang Tua/Wali Murid'
  | 'Alumni'
  | 'Teman/Kerabat'
  | 'Instagram'
  | 'Facebook'
  | 'TikTok'
  | 'YouTube'
  | 'Website'
  | 'Kegiatan/Sosialisasi Sekolah'
  | 'Lainnya';

export interface SPMBRegistrationRecord {
  id: string;
  ownerId: string;
  registrationNumber: string;
  unit: EducationUnit;
  status: SelectionStatus;
  statusNotes: string;

  // AKUN PENDAFTARAN
  accountEmail: string;
  accountPin: string;

  // DATA CALON PESERTA DIDIK
  nisn: string;
  fullName: string;
  nickname: string;
  birthPlace: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  whatsapp: string;
  addressStreet: string;
  rt: string;
  rw: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;

  // DATA SEKOLAH ASAL
  originSchoolName: string;
  originSchoolAddress: string;
  originSchoolCity: string;
  originSchoolProvince: string;
  graduationYear: string;

  // DATA AYAH (Opsional apabila Data Ibu sudah diisi lengkap)
  fatherName: string;
  fatherNik: string;
  fatherWhatsapp: string;
  fatherEducation: EducationLevel;
  fatherOccupation: string;
  fatherInstitution: string;

  // DATA IBU (Opsional apabila Data Ayah sudah diisi lengkap)
  motherName: string;
  motherNik: string;
  motherWhatsapp: string;
  motherEducation: EducationLevel;
  motherOccupation: string;
  motherInstitution: string;

  // DATA REFERENSI
  referenceSource: ReferenceSource;
  referenceDetailPrimary: string; // Nama Guru/Staff, Nama Ortu, Nama Alumni, Nama Pemberi Referensi, Platform Medsos, Ket Website, Sumber Lainnya
  referenceDetailSecondary: string; // Tahun Lulus (Alumni) atau Hubungan (Teman/Kerabat)

  // INFORMASI TAMBAHAN
  howDidYouKnow: HowDidYouKnowOption;
  additionalNotes: string;

  // PERNYATAAN PENDAFTAR
  agreedToTerms: boolean;

  createdAtIso: string;
  updatedAtIso: string;
}

export interface StaffReferenceRecord {
  id: string;
  ownerId: string;
  name: string;
  roleUnit: EducationUnit | 'YAYASAN';
  active: boolean;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface AdminUnitAccount {
  unit: EducationUnit;
  unitTitle: string;
  unitSubtitle: string;
  username: string;
  password: string;
  coordinatorName: string;
}

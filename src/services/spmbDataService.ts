import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  SPMBRegistrationRecord,
  StaffReferenceRecord,
  AdminUnitAccount,
  EducationLevel,
  HowDidYouKnowOption,
  ReferenceSource,
  EducationUnit,
  SelectionStatus,
  ReferralCategory,
} from '../types/spmb';

const DELIM = ' || ';

function cleanPart(val: string, maxLen: number): string {
  return (val || '').replace(/\|\|/g, '-').trim().slice(0, maxLen);
}

export function packRegistrationForFirestore(
  record: SPMBRegistrationRecord,
  uid: string,
  preserveCreatedAt?: unknown
) {
  const addressPacked = [
    cleanPart(record.addressStreet, 160),
    cleanPart(record.rt, 10),
    cleanPart(record.rw, 10),
    cleanPart(record.village, 60),
    cleanPart(record.district, 60),
    cleanPart(record.city, 60),
    cleanPart(record.province, 60),
    cleanPart(record.postalCode, 15),
  ]
    .join(DELIM)
    .slice(0, 600);

  const originSchoolPacked = [
    cleanPart(record.originSchoolName, 120),
    cleanPart(record.originSchoolAddress, 200),
    cleanPart(record.originSchoolCity, 80),
    cleanPart(record.originSchoolProvince, 80),
    cleanPart(record.graduationYear, 20),
  ]
    .join(DELIM)
    .slice(0, 600);

  const effectiveParentName = (record.parentGuardianName || record.fatherName || '').trim();
  const effectiveParentWhatsapp = (
    record.parentGuardianWhatsapp ||
    record.fatherWhatsapp ||
    ''
  ).trim();
  const hasFather = effectiveParentName.length > 0;
  const fatherProfilePacked = hasFather
    ? [
        cleanPart(effectiveParentName, 100),
        cleanPart(record.fatherNik || '', 30),
        cleanPart(effectiveParentWhatsapp, 30),
        cleanPart(record.fatherEducation || '', 20),
        cleanPart(record.fatherOccupation || '', 80),
        cleanPart(record.fatherInstitution || '', 100),
      ]
        .join(DELIM)
        .slice(0, 600)
    : '';

  const hasMother = (record.motherName || '').trim().length > 0;
  const motherProfilePacked = hasMother
    ? [
        cleanPart(record.motherName || '', 100),
        cleanPart(record.motherNik || '', 30),
        cleanPart(record.motherWhatsapp || '', 30),
        cleanPart(record.motherEducation || '', 20),
        cleanPart(record.motherOccupation || '', 80),
        cleanPart(record.motherInstitution || '', 100),
      ]
        .join(DELIM)
        .slice(0, 600)
    : '';

  const referenceDetailPacked = [
    cleanPart(record.referenceDetailPrimary || '-', 140),
    cleanPart(record.referenceDetailSecondary, 100),
    cleanPart(record.howDidYouKnow, 40),
    cleanPart(record.additionalNotes, 250),
    cleanPart(record.paymentProofFileName || '', 120),
    cleanPart(record.paymentProofFileSize ? String(record.paymentProofFileSize) : '', 20),
    cleanPart(record.paymentProofDataUrl || '', 140000),
  ]
    .join(DELIM)
    .slice(0, 149000);

  return {
    ownerId: uid,
    registrationNumber: record.registrationNumber.slice(0, 32),
    unit: record.unit,
    status: record.status,
    statusNotes: (record.statusNotes || '').slice(0, 500),
    accountEmail: record.accountEmail.trim().slice(0, 120),
    accountPin: record.accountPin.trim().slice(0, 64),
    nisn: record.nisn.trim().slice(0, 30),
    fullName: record.fullName.trim().slice(0, 120),
    nickname: record.nickname.trim().slice(0, 60),
    birthPlace: record.birthPlace.trim().slice(0, 80),
    birthDate: record.birthDate.trim().slice(0, 20),
    gender: record.gender,
    whatsapp: record.whatsapp.trim().slice(0, 30),
    address: addressPacked || '-',
    originSchool: originSchoolPacked || '-',
    fatherProfile: fatherProfilePacked,
    motherProfile: motherProfilePacked,
    referenceSource: record.referenceSource,
    referenceDetail: referenceDetailPacked || '-',
    agreedToTerms: true,
    createdAt: preserveCreatedAt !== undefined ? preserveCreatedAt : serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function unpackRegistrationFromFirestore(
  id: string,
  data: Record<string, unknown>
): SPMBRegistrationRecord {
  const addressParts = String(data.address || '').split(DELIM);
  const schoolParts = String(data.originSchool || '').split(DELIM);
  const fatherParts = String(data.fatherProfile || '').split(DELIM);
  const motherParts = String(data.motherProfile || '').split(DELIM);
  const refParts = String(data.referenceDetail || '').split(DELIM);

  const createdAtTs = data.createdAt as Timestamp | undefined;
  const updatedAtTs = data.updatedAt as Timestamp | undefined;

  return {
    id,
    ownerId: String(data.ownerId || ''),
    registrationNumber: String(data.registrationNumber || 'SPMB-00000000'),
    unit: (data.unit as EducationUnit) || 'SD',
    status: (data.status as SelectionStatus) || 'MENUNGGU_VERIFIKASI',
    statusNotes: String(data.statusNotes || ''),
    accountEmail: String(data.accountEmail || ''),
    accountPin: String(data.accountPin || ''),
    nisn: String(data.nisn || ''),
    fullName: String(data.fullName || ''),
    nickname: String(data.nickname || ''),
    birthPlace: String(data.birthPlace || ''),
    birthDate: String(data.birthDate || ''),
    gender: (data.gender as 'Laki-laki' | 'Perempuan') || 'Laki-laki',
    whatsapp: String(data.whatsapp || ''),
    addressStreet: addressParts[0] || '',
    rt: addressParts[1] || '001',
    rw: addressParts[2] || '001',
    village: addressParts[3] || '',
    district: addressParts[4] || '',
    city: addressParts[5] || '',
    province: addressParts[6] || '',
    postalCode: addressParts[7] || '',
    originSchoolName: schoolParts[0] || '',
    originSchoolAddress: schoolParts[1] || '',
    originSchoolCity: schoolParts[2] || '',
    originSchoolProvince: schoolParts[3] || '',
    graduationYear: schoolParts[4] || '2026',
    parentGuardianName: fatherParts[0] || motherParts[0] || '',
    parentGuardianWhatsapp: fatherParts[2] || motherParts[2] || '',
    fatherName: fatherParts[0] || '',
    fatherNik: fatherParts[1] || '',
    fatherWhatsapp: fatherParts[2] || '',
    fatherEducation: (fatherParts[3] as EducationLevel) || '',
    fatherOccupation: fatherParts[4] || '',
    fatherInstitution: fatherParts[5] || '',
    motherName: motherParts[0] || '',
    motherNik: motherParts[1] || '',
    motherWhatsapp: motherParts[2] || '',
    motherEducation: (motherParts[3] as EducationLevel) || '',
    motherOccupation: motherParts[4] || '',
    motherInstitution: motherParts[5] || '',
    referenceSource: (data.referenceSource as ReferenceSource) || 'Website',
    referenceDetailPrimary: refParts[0] || '',
    referenceDetailSecondary: refParts[1] || '',
    howDidYouKnow: (refParts[2] as HowDidYouKnowOption) || 'Website',
    additionalNotes: refParts[3] || '',
    paymentProofFileName: refParts[4] || '',
    paymentProofFileSize: refParts[5] ? Number(refParts[5]) || 0 : 0,
    paymentProofDataUrl: refParts[6] || '',
    agreedToTerms: Boolean(data.agreedToTerms),
    createdAtIso:
      createdAtTs && typeof createdAtTs.toDate === 'function'
        ? createdAtTs.toDate().toISOString()
        : new Date().toISOString(),
    updatedAtIso:
      updatedAtTs && typeof updatedAtTs.toDate === 'function'
        ? updatedAtTs.toDate().toISOString()
        : new Date().toISOString(),
  };
}

export async function saveRegistrationToFirestore(
  record: SPMBRegistrationRecord,
  existingRawCreatedAt?: unknown
) {
  const currentUser = auth.currentUser;
  const effectiveOwnerId =
    currentUser?.uid ||
    (record.ownerId && record.ownerId.trim().length > 0 ? record.ownerId : 'local-parent');
  const path = `registrations/${record.id}`;

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const payload = packRegistrationForFirestore(
        record,
        existingRawCreatedAt ? record.ownerId || effectiveOwnerId : effectiveOwnerId,
        existingRawCreatedAt
      );
      await setDoc(doc(collection(db, 'registrations'), record.id), payload);
      return true;
    } catch (error) {
      lastError = error;
      console.warn(`Firestore save registration attempt ${attempt} warning:`, error);
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }
  }

  console.error('Firestore save registration error:', lastError);
  handleFirestoreError(
    lastError,
    existingRawCreatedAt ? OperationType.UPDATE : OperationType.CREATE,
    path
  );
}

export async function removeRegistrationFromFirestore(id: string) {
  const path = `registrations/${id}`;
  try {
    await deleteDoc(doc(db, 'registrations', id));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function unpackStaffFromFirestore(
  id: string,
  data: Record<string, unknown>,
  fallbackIndex = 1
): StaffReferenceRecord {
  const rawName = String(data.name || '');
  const parts = rawName.split(DELIM);
  const hasCodePrefix = parts.length >= 2 && parts[0].trim().length > 0;
  const refCode = hasCodePrefix
    ? parts[0].trim()
    : String(fallbackIndex).padStart(3, '0');
  const displayName = hasCodePrefix ? parts[1].trim() : rawName;
  const category: ReferralCategory =
    parts.length >= 3 && parts[2].trim() === 'Orang Tua Siswa'
      ? 'Orang Tua Siswa'
      : 'Guru dan Staff';

  const createdTs = data.createdAt as Timestamp | undefined;
  const updatedTs = data.updatedAt as Timestamp | undefined;

  return {
    id,
    ownerId: String(data.ownerId || ''),
    refCode,
    name: displayName,
    category,
    roleUnit: (data.roleUnit as EducationUnit | 'YAYASAN') || 'YAYASAN',
    active: Boolean(data.active),
    createdAtIso:
      createdTs && typeof createdTs.toDate === 'function'
        ? createdTs.toDate().toISOString()
        : new Date().toISOString(),
    updatedAtIso:
      updatedTs && typeof updatedTs.toDate === 'function'
        ? updatedTs.toDate().toISOString()
        : new Date().toISOString(),
  };
}

export async function saveStaffReferenceToFirestore(
  staff: StaffReferenceRecord,
  existingRawCreatedAt?: unknown
) {
  const currentUser = auth.currentUser;
  const path = `referrals_staff/${staff.id}`;
  const cleanCode = cleanPart(staff.refCode || '001', 12);
  const cleanName = cleanPart(staff.name, 75);
  const cleanCat = staff.category === 'Orang Tua Siswa' ? 'Orang Tua Siswa' : 'Guru dan Staff';
  const packedName = `${cleanCode}${DELIM}${cleanName}${DELIM}${cleanCat}`.slice(0, 120);
  const effectiveOwnerId = currentUser?.uid || staff.ownerId || 'admin-system';
  try {
    await setDoc(doc(db, 'referrals_staff', staff.id), {
      ownerId: existingRawCreatedAt ? staff.ownerId || effectiveOwnerId : effectiveOwnerId,
      name: packedName,
      roleUnit: staff.roleUnit,
      active: staff.active,
      createdAt: existingRawCreatedAt !== undefined ? existingRawCreatedAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(
      error,
      existingRawCreatedAt ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function removeStaffReferenceFromFirestore(id: string) {
  const path = `referrals_staff/${id}`;
  try {
    await deleteDoc(doc(db, 'referrals_staff', id));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export const ADMIN_UNIT_ACCOUNTS: AdminUnitAccount[] = [
  {
    unit: 'ALL',
    unitTitle: 'Pusat / Yayasan (Semua Jenjang)',
    unitSubtitle: 'Rekapitulasi & Monitoring Seluruh Calon Peserta Didik (AIS, TK, SD, SMP)',
    username: 'admin_pusat',
    password: 'spmb-pusat2026',
    coordinatorName: 'Sekretariat SPMB SIT Arafah',
  },
  {
    unit: 'AIS',
    unitTitle: 'Unit AIS (Arafah Islamic School)',
    unitSubtitle: 'Program Internasional & Tahfidz Usia Dini',
    username: 'admin_ais',
    password: 'spmb-ais2026',
    coordinatorName: 'Sekretariat AIS Arafah',
  },
  {
    unit: 'TK',
    unitTitle: 'Unit TK IT Arafah',
    unitSubtitle: 'Taman Kanak-Kanak Islam Terpadu (Kelompok A & B)',
    username: 'admin_tk',
    password: 'spmb-tk2026',
    coordinatorName: 'Sekretariat TK Arafah',
  },
  {
    unit: 'SD',
    unitTitle: 'Unit SD IT Arafah',
    unitSubtitle: 'Sekolah Dasar Islam Terpadu Terakreditasi A',
    username: 'admin_sd',
    password: 'spmb-sd2026',
    coordinatorName: 'Sekretariat SD Arafah',
  },
  {
    unit: 'SMP',
    unitTitle: 'Unit SMP IT Arafah',
    unitSubtitle: 'Sekolah Menengah Pertama Islam Terpadu Boarding & Full Day',
    username: 'admin_smp',
    password: 'spmb-smp2026',
    coordinatorName: 'Sekretariat SMP Arafah',
  },
];

export const INITIAL_STAFF_REFERENCES: StaffReferenceRecord[] = [
  {
    id: 'staff-ref-001',
    ownerId: 'system-seed',
    refCode: '001',
    name: 'Mr Bayu - SMP',
    category: 'Guru dan Staff',
    roleUnit: 'SMP',
    active: true,
    createdAtIso: '2026-09-01T08:00:00.000Z',
    updatedAtIso: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'staff-ref-002',
    ownerId: 'system-seed',
    refCode: '002',
    name: 'MS Diah - SMP',
    category: 'Guru dan Staff',
    roleUnit: 'SMP',
    active: true,
    createdAtIso: '2026-09-01T08:00:00.000Z',
    updatedAtIso: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'staff-ref-003',
    ownerId: 'system-seed',
    refCode: '003',
    name: 'Ustadz H. Fauzan Hakim - SD',
    category: 'Guru dan Staff',
    roleUnit: 'SD',
    active: true,
    createdAtIso: '2026-09-01T08:00:00.000Z',
    updatedAtIso: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'staff-ref-004',
    ownerId: 'system-seed',
    refCode: '004',
    name: 'Ustadzah Siti Aminah - TK',
    category: 'Guru dan Staff',
    roleUnit: 'TK',
    active: true,
    createdAtIso: '2026-09-01T08:00:00.000Z',
    updatedAtIso: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'staff-ref-005',
    ownerId: 'system-seed',
    refCode: '005',
    name: 'Ustadzah Hj. Nabila Rahmah - AIS',
    category: 'Guru dan Staff',
    roleUnit: 'AIS',
    active: true,
    createdAtIso: '2026-09-01T08:00:00.000Z',
    updatedAtIso: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'staff-ref-006',
    ownerId: 'system-seed',
    refCode: '006',
    name: 'Bunda Aisyah Humaira - AIS',
    category: 'Orang Tua Siswa',
    roleUnit: 'AIS',
    active: true,
    createdAtIso: '2026-09-01T08:00:00.000Z',
    updatedAtIso: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'staff-ref-007',
    ownerId: 'system-seed',
    refCode: '007',
    name: 'Ayah Zaidan Pratama - SD',
    category: 'Orang Tua Siswa',
    roleUnit: 'SD',
    active: true,
    createdAtIso: '2026-09-01T08:00:00.000Z',
    updatedAtIso: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'staff-ref-008',
    ownerId: 'system-seed',
    refCode: '008',
    name: 'Bunda Raline Kusuma - TK',
    category: 'Orang Tua Siswa',
    roleUnit: 'TK',
    active: true,
    createdAtIso: '2026-09-01T08:00:00.000Z',
    updatedAtIso: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'staff-ref-009',
    ownerId: 'system-seed',
    refCode: '009',
    name: 'Ayah Taufik Hidayat - SMP',
    category: 'Orang Tua Siswa',
    roleUnit: 'SMP',
    active: true,
    createdAtIso: '2026-09-01T08:00:00.000Z',
    updatedAtIso: '2026-09-01T08:00:00.000Z',
  },
];

export const INITIAL_REGISTRATIONS: SPMBRegistrationRecord[] = [
  {
    id: 'reg-seed-ais-01',
    ownerId: 'system-seed',
    registrationNumber: 'SPMB-20260101',
    unit: 'AIS',
    status: 'DITERIMA',
    statusNotes:
      'Selamat! Ananda dinyatakan LULUS observasi kesiapan belajar Unit AIS. Silakan melakukan daftar ulang sebelum 20 Oktober 2026.',
    accountEmail: 'farhan.akbar@keluarga.id',
    accountPin: '123456',
    nisn: '0148291001',
    fullName: 'Aisyah Humaira Zahra',
    nickname: 'Aisyah',
    birthPlace: 'Depok',
    birthDate: '2021-04-12',
    gender: 'Perempuan',
    whatsapp: '081288990011',
    addressStreet: 'Jl. Bukit Cinere Indah No. 14',
    rt: '004',
    rw: '008',
    village: 'Gandul',
    district: 'Cinere',
    city: 'Kota Depok',
    province: 'Jawa Barat',
    postalCode: '16512',
    originSchoolName: 'KB Permata Bunda',
    originSchoolAddress: 'Jl. Meruyung Raya No. 8',
    originSchoolCity: 'Kota Depok',
    originSchoolProvince: 'Jawa Barat',
    graduationYear: '2026',
    parentGuardianName: 'Ir. Farhan Akbar, M.T.',
    parentGuardianWhatsapp: '081288990011',
    fatherName: 'Ir. Farhan Akbar, M.T.',
    fatherNik: '3276011205880003',
    fatherWhatsapp: '081288990011',
    fatherEducation: 'S2',
    fatherOccupation: 'Arsitek Senior',
    fatherInstitution: 'PT Bina Karya Nusantara',
    motherName: 'dr. Nadia Safitri',
    motherNik: '3276015408900001',
    motherWhatsapp: '081288990012',
    motherEducation: 'S1',
    motherOccupation: 'Dokter Umum',
    motherInstitution: 'RS Puri Cinere',
    referenceSource: 'Guru dan Staff',
    referenceDetailPrimary: 'Ustadzah Hj. Nabila Rahmah, M.Pd. (Koordinator AIS)',
    referenceDetailSecondary: '',
    howDidYouKnow: 'Guru/Staff',
    additionalNotes: 'Ananda sudah hafal surat-surat pendek Juz 30.',
    agreedToTerms: true,
    createdAtIso: '2026-09-25T03:15:00.000Z',
    updatedAtIso: '2026-09-28T09:30:00.000Z',
  },
  {
    id: 'reg-seed-tk-02',
    ownerId: 'system-seed',
    registrationNumber: 'SPMB-20260102',
    unit: 'TK',
    status: 'MENUNGGU_VERIFIKASI',
    statusNotes:
      'Berkas pendaftaran telah diterima oleh Panitia Unit TK IT. Jadwal pengamatan tumbuh kembang akan dikirimkan via WhatsApp.',
    accountEmail: 'bunda.raline@gmail.com',
    accountPin: '654321',
    nisn: '0159201124',
    fullName: 'Muhammad Rayyan Alfatih',
    nickname: 'Rayyan',
    birthPlace: 'Jakarta Selatan',
    birthDate: '2020-08-19',
    gender: 'Laki-laki',
    whatsapp: '081377665544',
    addressStreet: 'Perumahan Griya Asri Blok C2 No. 9',
    rt: '002',
    rw: '011',
    village: 'Sawangan Baru',
    district: 'Sawangan',
    city: 'Kota Depok',
    province: 'Jawa Barat',
    postalCode: '16511',
    originSchoolName: 'Belum Sekolah (Dari Rumah)',
    originSchoolAddress: 'Sawangan, Depok',
    originSchoolCity: 'Kota Depok',
    originSchoolProvince: 'Jawa Barat',
    graduationYear: '2026',
    parentGuardianName: 'Hj. Raline Kusumawardhani, S.E.',
    parentGuardianWhatsapp: '081377665544',
    // Contoh kasus hanya mengisi biodata Ibu saja (sesuai aturan logika salah satu ortu)
    fatherName: '',
    fatherNik: '',
    fatherWhatsapp: '',
    fatherEducation: '',
    fatherOccupation: '',
    fatherInstitution: '',
    motherName: 'Hj. Raline Kusumawardhani, S.E.',
    motherNik: '3174045903910004',
    motherWhatsapp: '081377665544',
    motherEducation: 'S1',
    motherOccupation: 'Wirausaha Kuliner',
    motherInstitution: 'Dapur Berkah Mandiri',
    referenceSource: 'Orang Tua/Wali Murid',
    referenceDetailPrimary: 'Bunda Khadijah (Wali Murid Kelas TK B)',
    referenceDetailSecondary: '',
    howDidYouKnow: 'Orang Tua/Wali Murid',
    additionalNotes: 'Data orang tua diisi oleh Ibu kandung selaku wali utama.',
    agreedToTerms: true,
    createdAtIso: '2026-09-29T06:40:00.000Z',
    updatedAtIso: '2026-09-29T06:40:00.000Z',
  },
  {
    id: 'reg-seed-sd-03',
    ownerId: 'system-seed',
    registrationNumber: 'SPMB-20260103',
    unit: 'SD',
    status: 'DITERIMA',
    statusNotes:
      'Selamat! Ananda dinyatakan DITERIMA pada Unit SD IT Arafah Tahun Ajaran Baru. Mohon hadir pada pertemuan orang tua tanggal 18 Oktober 2026.',
    accountEmail: 'hendrawan.pratama@yahoo.com',
    accountPin: '112233',
    nisn: '0134455667',
    fullName: 'Zaidan Ibrahim Pratama',
    nickname: 'Zaidan',
    birthPlace: 'Bogor',
    birthDate: '2019-11-03',
    gender: 'Laki-laki',
    whatsapp: '085711223344',
    addressStreet: 'Jl. Raya Muchtar No. 45',
    rt: '001',
    rw: '003',
    village: 'Bojongsari Lama',
    district: 'Bojongsari',
    city: 'Kota Depok',
    province: 'Jawa Barat',
    postalCode: '16516',
    originSchoolName: 'TK IT Arafah',
    originSchoolAddress: 'Jl. Pendidikan Islam No. 1, Depok',
    originSchoolCity: 'Kota Depok',
    originSchoolProvince: 'Jawa Barat',
    graduationYear: '2026',
    parentGuardianName: 'Hendrawan Pratama, S.T.',
    parentGuardianWhatsapp: '085711223344',
    fatherName: 'Hendrawan Pratama, S.T.',
    fatherNik: '3201050311860002',
    fatherWhatsapp: '085711223344',
    fatherEducation: 'S1',
    fatherOccupation: 'Insinyur Sipil',
    fatherInstitution: 'Kementerian PUPR',
    motherName: 'Laila Nurjannah, S.Pd.',
    motherNik: '3201054907890005',
    motherWhatsapp: '085711223355',
    motherEducation: 'S1',
    motherOccupation: 'Guru',
    motherInstitution: 'SMAN 5 Depok',
    referenceSource: 'Alumni',
    referenceDetailPrimary: 'Kakak Фатих Pratama',
    referenceDetailSecondary: '2024',
    howDidYouKnow: 'Alumni',
    additionalNotes: 'Adik kandung dari alumni SD IT Arafah angkatan 2024.',
    agreedToTerms: true,
    createdAtIso: '2026-09-26T10:15:00.000Z',
    updatedAtIso: '2026-09-30T14:20:00.000Z',
  },
  {
    id: 'reg-seed-smp-04',
    ownerId: 'system-seed',
    registrationNumber: 'SPMB-20260104',
    unit: 'SMP',
    status: 'TERVERIFIKASI',
    statusNotes:
      'Berkas lengkap & terverifikasi. Ananda dijadwalkan mengikuti Tes Akademik & Tahfidz SMP IT pada Sabtu, 10 Oktober 2026 pukul 08.00 WIB.',
    accountEmail: 'taufik.hidayat@korporat.co.id',
    accountPin: '998877',
    nisn: '0118877665',
    fullName: 'Naufal Dzaki Ramadhan',
    nickname: 'Naufal',
    birthPlace: 'Bandung',
    birthDate: '2014-06-21',
    gender: 'Laki-laki',
    whatsapp: '081199887766',
    addressStreet: 'Cluster Emerald Bintaro Blok A4 No. 12',
    rt: '007',
    rw: '009',
    village: 'Pondok Jaya',
    district: 'Pondok Aren',
    city: 'Kota Tangerang Selatan',
    province: 'Banten',
    postalCode: '15220',
    originSchoolName: 'SD Islam Al-Azhar BSD',
    originSchoolAddress: 'Jl. Puspita Raya No. 2, BSD',
    originSchoolCity: 'Kota Tangerang Selatan',
    originSchoolProvince: 'Banten',
    graduationYear: '2026',
    parentGuardianName: 'H. Taufik Hidayatullah, M.M.',
    parentGuardianWhatsapp: '081199887766',
    fatherName: 'H. Taufik Hidayatullah, M.M.',
    fatherNik: '3674032106820001',
    fatherWhatsapp: '081199887766',
    fatherEducation: 'S2',
    fatherOccupation: 'Manajer Operasional',
    fatherInstitution: 'PT Telkom Indonesia',
    motherName: '',
    motherNik: '',
    motherWhatsapp: '',
    motherEducation: '',
    motherOccupation: '',
    motherInstitution: '',
    referenceSource: 'Media Sosial',
    referenceDetailPrimary: 'Instagram',
    referenceDetailSecondary: '',
    howDidYouKnow: 'Instagram',
    additionalNotes: 'Memilih program Full Day & Tahfidz Intensif SMP IT Arafah.',
    agreedToTerms: true,
    createdAtIso: '2026-09-27T11:00:00.000Z',
    updatedAtIso: '2026-09-29T16:00:00.000Z',
  },
];

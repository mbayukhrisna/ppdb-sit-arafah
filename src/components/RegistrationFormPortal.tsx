import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowLeft,
  Printer,
  AlertCircle,
  Search,
  Sparkles,
  FileCheck2,
  UserCheck,
  Link2,
} from 'lucide-react';
import {
  EducationLevel,
  EducationUnit,
  HowDidYouKnowOption,
  ReferenceSource,
  SocialMediaPlatform,
  SPMBRegistrationRecord,
  StaffReferenceRecord,
} from '../types/spmb';

interface RegistrationFormPortalProps {
  activeStaffList: StaffReferenceRecord[];
  referralCodeFromUrl?: string;
  onSubmitRegistration: (newRecord: SPMBRegistrationRecord) => Promise<void>;
  onNavigateToStatusCheck: (regNumber: string) => void;
}

const EDUCATION_OPTIONS: EducationLevel[] = [
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

const REFERENCE_SOURCES: ReferenceSource[] = [
  'Guru dan Staff',
  'Orang Tua/Wali Murid',
  'Alumni',
  'Teman/Kerabat',
  'Media Sosial',
  'Website',
  'Lainnya',
];

const SOCIAL_MEDIA_OPTIONS: SocialMediaPlatform[] = [
  'Instagram',
  'Facebook',
  'TikTok',
  'YouTube',
  'Lainnya',
];

const HOW_DID_YOU_KNOW_OPTIONS: HowDidYouKnowOption[] = [
  'Guru/Staff',
  'Orang Tua/Wali Murid',
  'Alumni',
  'Teman/Kerabat',
  'Instagram',
  'Facebook',
  'TikTok',
  'YouTube',
  'Website',
  'Kegiatan/Sosialisasi Sekolah',
  'Lainnya',
];

type FormStage = 'FORM' | 'SUMMARY' | 'SUCCESS';
type ParentFillMode = 'BOTH' | 'FATHER_ONLY' | 'MOTHER_ONLY';

export const RegistrationFormPortal: React.FC<RegistrationFormPortalProps> = ({
  activeStaffList,
  referralCodeFromUrl = '',
  onSubmitRegistration,
  onNavigateToStatusCheck,
}) => {
  const [stage, setStage] = useState<FormStage>('FORM');
  const [parentMode, setParentMode] = useState<ParentFillMode>('BOTH');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Account fields
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPin, setAccountPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Student fields
  const [nisn, setNisn] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [whatsapp, setWhatsapp] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [rt, setRt] = useState('');
  const [rw, setRw] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Origin School fields
  const [originSchoolName, setOriginSchoolName] = useState('');
  const [originSchoolAddress, setOriginSchoolAddress] = useState('');
  const [originSchoolCity, setOriginSchoolCity] = useState('');
  const [originSchoolProvince, setOriginSchoolProvince] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');

  // Unit choice
  const [unit, setUnit] = useState<EducationUnit>('SD');

  // Father fields
  const [fatherName, setFatherName] = useState('');
  const [fatherNik, setFatherNik] = useState('');
  const [fatherWhatsapp, setFatherWhatsapp] = useState('');
  const [fatherEducation, setFatherEducation] = useState<EducationLevel>('S1');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [fatherInstitution, setFatherInstitution] = useState('');

  // Mother fields
  const [motherName, setMotherName] = useState('');
  const [motherNik, setMotherNik] = useState('');
  const [motherWhatsapp, setMotherWhatsapp] = useState('');
  const [motherEducation, setMotherEducation] = useState<EducationLevel>('S1');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [motherInstitution, setMotherInstitution] = useState('');

  // Reference fields
  const [referenceSource, setReferenceSource] = useState<ReferenceSource>('Guru dan Staff');
  const [referenceDetailPrimary, setReferenceDetailPrimary] = useState(
    activeStaffList[0]?.name || ''
  );
  const [referenceDetailSecondary, setReferenceDetailSecondary] = useState('');

  // Additional Info
  const [howDidYouKnow, setHowDidYouKnow] = useState<HowDidYouKnowOption>('Guru/Staff');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Statements (4 checkboxes + master approval)
  const [statement1, setStatement1] = useState(false);
  const [statement2, setStatement2] = useState(false);
  const [statement3, setStatement3] = useState(false);
  const [statement4, setStatement4] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Generated record after submission
  const [submittedRecord, setSubmittedRecord] = useState<SPMBRegistrationRecord | null>(null);

  // Resolve matched staff from URL query ?ref=001
  const matchedReferralStaff = referralCodeFromUrl
    ? activeStaffList.find(
        (s) => s.active && s.refCode.toLowerCase() === referralCodeFromUrl.trim().toLowerCase()
      ) || null
    : null;

  useEffect(() => {
    if (matchedReferralStaff) {
      const isParentRef = matchedReferralStaff.category === 'Orang Tua Siswa';
      setReferenceSource(isParentRef ? 'Orang Tua/Wali Murid' : 'Guru dan Staff');
      setReferenceDetailPrimary(matchedReferralStaff.name);
      setReferenceDetailSecondary(isParentRef ? 'Orang Tua Siswa' : 'Guru dan Staff');
      setHowDidYouKnow(isParentRef ? 'Orang Tua/Wali Murid' : 'Guru/Staff');
      if (
        matchedReferralStaff.roleUnit === 'AIS' ||
        matchedReferralStaff.roleUnit === 'TK' ||
        matchedReferralStaff.roleUnit === 'SD' ||
        matchedReferralStaff.roleUnit === 'SMP'
      ) {
        setUnit(matchedReferralStaff.roleUnit);
      }
    } else {
      setReferenceSource('Guru dan Staff');
      setReferenceDetailPrimary('- (Tanpa Link Referral)');
      setReferenceDetailSecondary('');
      setHowDidYouKnow('Website');
    }
  }, [matchedReferralStaff]);

  const handleReferenceSourceChange = (newSource: ReferenceSource) => {
    setReferenceSource(newSource);
    setReferenceDetailSecondary('');
    if (newSource === 'Guru dan Staff') {
      setReferenceDetailPrimary(activeStaffList[0]?.name || '');
    } else if (newSource === 'Media Sosial') {
      setReferenceDetailPrimary('Instagram');
    } else {
      setReferenceDetailPrimary('');
    }
  };

  const handleFillSampleData = () => {
    setAccountEmail('wali.calonsiswa@keluarga.id');
    setAccountPin('202699');
    setConfirmPin('202699');
    setNisn('0139876543');
    setFullName('Keenan Athallah Syahputra');
    setNickname('Keenan');
    setBirthPlace('Kota Depok');
    setBirthDate('2019-05-14');
    setGender('Laki-laki');
    setWhatsapp('081290008877');
    setAddressStreet('Jl. Taman Melati Indah Blok B2 No. 17');
    setRt('003');
    setRw('007');
    setVillage('Mampang');
    setDistrict('Pancoran Mas');
    setCity('Kota Depok');
    setProvince('Jawa Barat');
    setPostalCode('16433');
    setOriginSchoolName('TK Islam Terpadu Al-Qalam');
    setOriginSchoolAddress('Jl. Pramuka Raya No. 21');
    setOriginSchoolCity('Kota Depok');
    setOriginSchoolProvince('Jawa Barat');
    setGraduationYear('2026');
    setUnit(
      matchedReferralStaff &&
        (matchedReferralStaff.roleUnit === 'AIS' ||
          matchedReferralStaff.roleUnit === 'TK' ||
          matchedReferralStaff.roleUnit === 'SD' ||
          matchedReferralStaff.roleUnit === 'SMP')
        ? matchedReferralStaff.roleUnit
        : 'SD'
    );
    setParentMode('MOTHER_ONLY');
    setFatherName('');
    setFatherNik('');
    setFatherWhatsapp('');
    setFatherOccupation('');
    setFatherInstitution('');
    setMotherName('Hj. Annisa Rahmawati, S.Psi.');
    setMotherNik('3276015405910002');
    setMotherWhatsapp('081290008877');
    setMotherEducation('S1');
    setMotherOccupation('Psikolog Pendidikan');
    setMotherInstitution('Klinik Tumbuh Kembang Amanah');
    const isParentRef = matchedReferralStaff?.category === 'Orang Tua Siswa';
    setReferenceSource(isParentRef ? 'Orang Tua/Wali Murid' : 'Guru dan Staff');
    setReferenceDetailPrimary(
      matchedReferralStaff ? matchedReferralStaff.name : '- (Tanpa Link Referral)'
    );
    setReferenceDetailSecondary(
      matchedReferralStaff ? (isParentRef ? 'Orang Tua Siswa' : 'Guru dan Staff') : ''
    );
    setHowDidYouKnow(
      matchedReferralStaff ? (isParentRef ? 'Orang Tua/Wali Murid' : 'Guru/Staff') : 'Website'
    );
    setAdditionalNotes('');
    setStatement1(true);
    setStatement2(true);
    setStatement3(true);
    setStatement4(true);
    setAgreedToTerms(true);
    setErrorMessage(null);
  };

  const handleApproveAllStatements = () => {
    const nextState = !agreedToTerms;
    setAgreedToTerms(nextState);
    if (nextState) {
      setStatement1(true);
      setStatement2(true);
      setStatement3(true);
      setStatement4(true);
    }
  };

  const validateFormBeforeSummary = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!accountEmail.includes('@')) {
      setErrorMessage('Mohon masukkan Email Aktif yang valid pada bagian Akun Pendaftaran.');
      return;
    }
    if (accountPin.trim().length < 4) {
      setErrorMessage('PIN / Password minimal terdiri dari 4 karakter.');
      return;
    }
    if (accountPin !== confirmPin) {
      setErrorMessage('Konfirmasi PIN / Password tidak cocok dengan PIN / Password yang dibuat.');
      return;
    }
    if (
      !nisn.trim() ||
      !fullName.trim() ||
      !nickname.trim() ||
      !birthPlace.trim() ||
      !birthDate.trim() ||
      !whatsapp.trim()
    ) {
      setErrorMessage('Mohon lengkapi seluruh Data Calon Peserta Didik (NISN, Nama, TTL, No WA).');
      return;
    }
    if (
      !addressStreet.trim() ||
      !rt.trim() ||
      !rw.trim() ||
      !village.trim() ||
      !district.trim() ||
      !city.trim() ||
      !province.trim() ||
      !postalCode.trim()
    ) {
      setErrorMessage('Mohon lengkapi seluruh detail Alamat Lengkap hingga Kode Pos.');
      return;
    }
    if (
      !originSchoolName.trim() ||
      !originSchoolAddress.trim() ||
      !originSchoolCity.trim() ||
      !originSchoolProvince.trim() ||
      !graduationYear.trim()
    ) {
      setErrorMessage('Mohon lengkapi seluruh bagian Data Sekolah Asal.');
      return;
    }

    // Validasi Logika Orang Tua: Cukup salah satu saja (Ayah ATAU Ibu) yang diisi lengkap
    const isFatherComplete =
      fatherName.trim().length > 0 &&
      fatherNik.trim().length > 0 &&
      fatherWhatsapp.trim().length > 0 &&
      fatherEducation !== '' &&
      fatherOccupation.trim().length > 0 &&
      fatherInstitution.trim().length > 0;

    const isMotherComplete =
      motherName.trim().length > 0 &&
      motherNik.trim().length > 0 &&
      motherWhatsapp.trim().length > 0 &&
      motherEducation !== '' &&
      motherOccupation.trim().length > 0 &&
      motherInstitution.trim().length > 0;

    if (!isFatherComplete && !isMotherComplete) {
      setErrorMessage(
        'Data Orang Tua wajib diisi minimal SALAH SATU secara lengkap (Data Ayah saja, Data Ibu saja, atau keduanya).'
      );
      return;
    }

    if (!statement1 || !statement2 || !statement3 || !statement4 || !agreedToTerms) {
      setErrorMessage(
        'Mohon centang keempat poin Pernyataan Pendaftar dan klik tombol "Saya menyetujui pernyataan di atas".'
      );
      return;
    }

    setStage('SUMMARY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
      const regNum = `SPMB-${randomDigits}`;
      const nowIso = new Date().toISOString();

      const cleanFather = parentMode === 'MOTHER_ONLY' ? '' : fatherName.trim();
      const cleanMother = parentMode === 'FATHER_ONLY' ? '' : motherName.trim();

      const isParentRef = matchedReferralStaff?.category === 'Orang Tua Siswa';
      const effectiveReferenceSource: ReferenceSource = isParentRef
        ? 'Orang Tua/Wali Murid'
        : 'Guru dan Staff';

      const effectivePrimaryDetail = matchedReferralStaff
        ? matchedReferralStaff.name
        : '- (Tanpa Link Referral)';

      const newRecord: SPMBRegistrationRecord = {
        id: `reg-${Date.now()}`,
        ownerId: 'local-parent',
        registrationNumber: regNum,
        unit,
        status: 'MENUNGGU_VERIFIKASI',
        statusNotes:
          'Pendaftaran telah diterima sistem SPMB SIT ARAFAH dan sedang dalam antrean verifikasi panitia unit.',
        accountEmail: accountEmail.trim(),
        accountPin: accountPin.trim(),
        nisn: nisn.trim(),
        fullName: fullName.trim(),
        nickname: nickname.trim(),
        birthPlace: birthPlace.trim(),
        birthDate: birthDate.trim(),
        gender,
        whatsapp: whatsapp.trim(),
        addressStreet: addressStreet.trim(),
        rt: rt.trim(),
        rw: rw.trim(),
        village: village.trim(),
        district: district.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        originSchoolName: originSchoolName.trim(),
        originSchoolAddress: originSchoolAddress.trim(),
        originSchoolCity: originSchoolCity.trim(),
        originSchoolProvince: originSchoolProvince.trim(),
        graduationYear: graduationYear.trim(),
        fatherName: cleanFather,
        fatherNik: cleanFather ? fatherNik.trim() : '',
        fatherWhatsapp: cleanFather ? fatherWhatsapp.trim() : '',
        fatherEducation: cleanFather ? fatherEducation : '',
        fatherOccupation: cleanFather ? fatherOccupation.trim() : '',
        fatherInstitution: cleanFather ? fatherInstitution.trim() : '',
        motherName: cleanMother,
        motherNik: cleanMother ? motherNik.trim() : '',
        motherWhatsapp: cleanMother ? motherWhatsapp.trim() : '',
        motherEducation: cleanMother ? motherEducation : '',
        motherOccupation: cleanMother ? motherOccupation.trim() : '',
        motherInstitution: cleanMother ? motherInstitution.trim() : '',
        referenceSource: effectiveReferenceSource,
        referenceDetailPrimary: effectivePrimaryDetail,
        referenceDetailSecondary: matchedReferralStaff ? `?ref=${matchedReferralStaff.refCode}` : '',
        howDidYouKnow: matchedReferralStaff
          ? isParentRef
            ? 'Orang Tua/Wali Murid'
            : 'Guru/Staff'
          : 'Website',
        additionalNotes: additionalNotes.trim(),
        agreedToTerms: true,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
      };

      await onSubmitRegistration(newRecord);
      setSubmittedRecord(newRecord);
      setStage('SUCCESS');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan pendaftaran.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // STAGE 3: PENDAFTARAN BERHASIL (SUCCESS VIEW & PRINTABLE CERTIFICATE)
  // ============================================================================
  if (stage === 'SUCCESS' && submittedRecord) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-10 shadow-xs">
          <div className="flex items-start justify-between border-b border-[#E2E8E5] pb-6 mb-6">
            <div>
              <p className="text-xs font-medium text-[#0F5338] tracking-wide">
                BUKTI PENDAFTARAN RESMI · SIT ARAFAH
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F1E19] mt-1">
                Pendaftaran Berhasil
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Terima kasih, pendaftaran SPMB SIT ARAFAH telah berhasil disimpan.
              </p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-[#0F5338] shrink-0" />
          </div>

          {/* Nomor Pendaftaran Box */}
          <div className="bg-[#F3F7F5] border border-[#C6DDD3] rounded-lg p-6 text-center mb-6">
            <p className="text-xs text-slate-600 font-medium">Nomor Pendaftaran Anda:</p>
            <p className="text-3xl sm:text-4xl font-bold font-mono-tabular text-[#0F5338] tracking-wider mt-2 select-all">
              {submittedRecord.registrationNumber}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 mt-3">
              <span>Unit Peminatan: {submittedRecord.unit}</span>
              <span aria-hidden="true">·</span>
              <span>Status Awal: Menunggu Verifikasi Panitia</span>
              <span aria-hidden="true">·</span>
              <span>Email Akun: {submittedRecord.accountEmail}</span>
            </div>
          </div>

          {/* Notifikasi Pengumuman */}
          <div className="border-l-4 border-[#0F5338] bg-slate-50 p-4 rounded-r-lg mb-8 text-sm text-slate-700 leading-relaxed">
            <p className="font-semibold text-[#0F1E19]">
              Notifikasi Nomor Pendaftaran & Cara Cek Kelulusan:
            </p>
            <p className="mt-1">
              Informasi selanjutnya akan disampaikan melalui nomor WhatsApp (
              <span className="font-mono-tabular font-medium">{submittedRecord.whatsapp}</span>) dan
              email (<span className="font-medium">{submittedRecord.accountEmail}</span>) yang telah
              didaftarkan. Orang tua dapat mengecek status kelulusan sewaktu-waktu pada menu{' '}
              <strong>Cek Status Seleksi</strong> menggunakan Nomor Pendaftaran di atas.
            </p>
          </div>

          {/* Ringkasan Cetak */}
          <div className="space-y-4 text-sm border-t border-[#E2E8E5] pt-6 mb-8">
            <h3 className="font-semibold text-[#0F1E19]">Ringkasan Data Bukti Pendaftaran</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              <div>
                <span className="text-xs text-slate-500 block">Nama Calon Peserta Didik</span>
                <span className="font-medium text-slate-900">{submittedRecord.fullName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">NISN</span>
                <span className="font-mono-tabular font-medium text-slate-900">
                  {submittedRecord.nisn}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Tempat, Tanggal Lahir</span>
                <span className="font-medium text-slate-900">
                  {submittedRecord.birthPlace}, {submittedRecord.birthDate}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Asal Sekolah & Tahun Lulus</span>
                <span className="font-medium text-slate-900">
                  {submittedRecord.originSchoolName} ({submittedRecord.graduationYear})
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Data Orang Tua / Wali</span>
                <span className="font-medium text-slate-900">
                  {submittedRecord.fatherName && submittedRecord.motherName
                    ? `Ayah: ${submittedRecord.fatherName} · Ibu: ${submittedRecord.motherName}`
                    : submittedRecord.fatherName
                      ? `Ayah: ${submittedRecord.fatherName}`
                      : `Ibu: ${submittedRecord.motherName}`}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Referensi Pendaftaran</span>
                <span className="font-medium text-slate-900">
                  {submittedRecord.referenceSource} — {submittedRecord.referenceDetailPrimary}
                  {submittedRecord.referenceDetailSecondary &&
                  submittedRecord.referenceDetailSecondary !== submittedRecord.referenceDetailPrimary
                    ? ` · Orang Tua Siswa: ${submittedRecord.referenceDetailSecondary}`
                    : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 no-print pt-4 border-t border-[#E2E8E5]">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F5338] rounded-lg hover:bg-[#0B3E29] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan Bukti Pendaftaran
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateToStatusCheck(submittedRecord.registrationNumber)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F5338] bg-[#EBF3EF] rounded-lg hover:bg-[#DCECE4] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Cek Status Nomor Ini
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage('FORM');
                  setSubmittedRecord(null);
                }}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                Buat Pendaftaran Baru
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // STAGE 2: RINGKASAN SEBELUM DIKIRIM (CONFIRMATION SUMMARY VIEW)
  // ============================================================================
  if (stage === 'SUMMARY') {
    const fullAddressPreview = `${addressStreet}, RT ${rt}/RW ${rw}, Kel. ${village}, Kec. ${district}, ${city}, ${province} ${postalCode}`;
    const activeParentPhone =
      parentMode === 'FATHER_ONLY'
        ? fatherWhatsapp
        : parentMode === 'MOTHER_ONLY'
          ? motherWhatsapp
          : fatherWhatsapp || motherWhatsapp;

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-10">
          <div className="border-b border-[#E2E8E5] pb-5 mb-6">
            <p className="text-xs font-medium text-[#0F5338]">TAHAP KONFIRMASI AKHIR</p>
            <h2 className="text-2xl font-bold text-[#0F1E19] mt-1">Ringkasan Sebelum Dikirim</h2>
            <p className="text-sm text-slate-600 mt-1">
              Mohon periksa kembali kesesuaian seluruh data sebelum disimpan secara permanen.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-sm text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-8 divide-y divide-[#E2E8E5]">
            {/* 1. Pilihan Peminatan */}
            <section className="pt-2">
              <h3 className="text-sm font-semibold text-[#0F5338] mb-3">01. Pilihan Peminatan</h3>
              <div className="p-4 bg-[#F3F7F5] border border-[#C6DDD3] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-600">Jalur / Unit Pendidikan yang Dipilih:</p>
                  <p className="text-xl font-bold text-[#0F5338] mt-0.5">Unit {unit}</p>
                </div>
                <span className="text-xs text-slate-600">
                  Terhubung ke Portal Panitia Unit {unit}
                </span>
              </div>
            </section>

            {/* 2. Data Calon Peserta Didik */}
            <section className="pt-6">
              <h3 className="text-sm font-semibold text-[#0F5338] mb-3">
                02. Data Calon Peserta Didik
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Nama Lengkap (Panggilan)</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">
                    {fullName} ({nickname})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">NISN</dt>
                  <dd className="font-mono-tabular font-medium text-slate-900 mt-0.5">{nisn}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Tempat / Tanggal Lahir</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">
                    {birthPlace}, {birthDate}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Jenis Kelamin</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{gender}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Nomor WhatsApp Aktif</dt>
                  <dd className="font-mono-tabular font-medium text-slate-900 mt-0.5">
                    {whatsapp}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Email Akun Pendaftaran</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{accountEmail}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">Alamat Lengkap</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{fullAddressPreview}</dd>
                </div>
              </dl>
            </section>

            {/* 3. Data Sekolah Asal */}
            <section className="pt-6">
              <h3 className="text-sm font-semibold text-[#0F5338] mb-3">03. Data Sekolah Asal</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Asal Sekolah</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">
                    {originSchoolName} ({originSchoolCity}, {originSchoolProvince})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Tahun Lulus / Tahun Pelajaran</dt>
                  <dd className="font-mono-tabular font-medium text-slate-900 mt-0.5">
                    {graduationYear}
                  </dd>
                </div>
              </dl>
            </section>

            {/* 4. Data Orang Tua */}
            <section className="pt-6">
              <h3 className="text-sm font-semibold text-[#0F5338] mb-3">04. Data Orang Tua</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Nama Ayah</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">
                    {parentMode !== 'MOTHER_ONLY' && fatherName.trim()
                      ? `${fatherName} (${fatherOccupation})`
                      : '— (Tidak diisi / Diwakili Ibu)'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Nama Ibu Kandung</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">
                    {parentMode !== 'FATHER_ONLY' && motherName.trim()
                      ? `${motherName} (${motherOccupation})`
                      : '— (Tidak diisi / Diwakili Ayah)'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Nomor WhatsApp Orang Tua</dt>
                  <dd className="font-mono-tabular font-medium text-slate-900 mt-0.5">
                    {activeParentPhone}
                  </dd>
                </div>
              </dl>
            </section>

            {/* 5. Referensi */}
            <section className="pt-6">
              <h3 className="text-sm font-semibold text-[#0F5338] mb-3">
                05. Data Referensi &amp; Informasi Tambahan
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Sumber Referensi (Otomatis ?ref=)</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">
                    {matchedReferralStaff
                      ? matchedReferralStaff.category === 'Orang Tua Siswa'
                        ? 'Orang Tua Siswa'
                        : 'Guru dan Staff'
                      : 'Guru dan Staff / Orang Tua Siswa (Tanpa Link ?ref=)'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">
                    {matchedReferralStaff?.category === 'Orang Tua Siswa'
                      ? 'Nama Orang Tua Siswa (Otomatis ?ref=)'
                      : 'Nama Guru / Staff / Orang Tua Siswa (Otomatis ?ref=)'}
                  </dt>
                  <dd className="font-medium text-slate-900 mt-0.5">
                    {matchedReferralStaff
                      ? `[?ref=${matchedReferralStaff.refCode}] ${matchedReferralStaff.name}`
                      : '- (Tanpa Link Referral)'}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 pt-6 border-t border-[#E2E8E5] flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStage('FORM')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali & Edit
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0F5338] rounded-lg hover:bg-[#0B3E29] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan Data...' : 'Data Sudah Benar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // STAGE 1: FORMULIR PENDAFTARAN SPMB SIT ARAFAH (MAIN FORM)
  // ============================================================================
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner Formulir */}
      <div className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8E5] pb-5">
          <div>
            <p className="text-xs font-medium text-[#0F5338] tracking-wide">
              PORTAL ORANG TUA / WALI CALON PESERTA DIDIK
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1E19] mt-1">
              Formulir Pendaftaran SPMB SIT ARAFAH
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Lengkapi data pendaftaran di bawah ini. Untuk biodata Orang Tua, Anda cukup mengisi{' '}
              <strong className="text-[#0F1E19]">salah satu saja (Ayah atau Ibu)</strong> maupun
              keduanya.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFillSampleData}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#0F5338] bg-[#EBF3EF] rounded-lg hover:bg-[#DCECE4] transition-colors shrink-0 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Isi Contoh Data Cepat
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-4">
          <span>Unit Tersedia: AIS · TK · SD · SMP</span>
          <span aria-hidden="true">/</span>
          <span>Nomor Bukti Otomatis (SPMB-XXXXXXXX)</span>
          <span aria-hidden="true">/</span>
          <span>Terhubung Langsung ke Portal 4 Admin Jenjang</span>
        </div>

        {matchedReferralStaff && (
          <div className="mt-4 p-3.5 bg-[#F3F7F5] border border-[#C6DDD3] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#0F5338]">
              <Link2 className="w-4 h-4 shrink-0" />
              <span>
                Tautan Referral{' '}
                <strong>
                  {matchedReferralStaff.category === 'Orang Tua Siswa'
                    ? 'Orang Tua Siswa'
                    : 'Guru dan Staff'}
                </strong>{' '}
                Aktif (
                <strong className="font-mono-tabular">?ref={matchedReferralStaff.refCode}</strong>):
                Direferensikan oleh <strong>{matchedReferralStaff.name}</strong>
              </span>
            </div>
            <span className="text-slate-600">
              Sumber Referensi ({matchedReferralStaff.category || 'Guru dan Staff'}) terisi otomatis
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Mohon Periksa Kembali Isian Formulir:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={validateFormBeforeSummary} className="space-y-6">
        {/* BAGIAN 1: PILIHAN PEMINATAN (PALING ATAS) */}
        <section className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8">
          <div className="border-b border-[#E2E8E5] pb-4 mb-6">
            <h2 className="text-lg font-bold text-[#0F1E19]">01. Pilihan Peminatan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih salah satu jalur/unit pendidikan yang dituju pada proses pendaftaran SPMB SIT
              ARAFAH.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {(
              [
                { code: 'AIS', label: 'AIS', desc: 'Arafah Islamic School' },
                { code: 'TK', label: 'TK', desc: 'Taman Kanak-Kanak IT' },
                { code: 'SD', label: 'SD', desc: 'Sekolah Dasar IT' },
                { code: 'SMP', label: 'SMP', desc: 'Sekolah Menengah Pertama IT' },
              ] as const
            ).map((item) => {
              const selected = unit === item.code;
              return (
                <label
                  key={item.code}
                  className={`flex flex-col justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    selected
                      ? 'border-[#0F5338] bg-[#F3F7F5]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#0F1E19]">{item.label}</span>
                    <input
                      type="radio"
                      name="unit"
                      value={item.code}
                      checked={selected}
                      onChange={() => setUnit(item.code)}
                      className="w-4 h-4 accent-[#0F5338]"
                    />
                  </div>
                  <span className="text-xs text-slate-600 mt-2">{item.desc}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* BAGIAN 2: AKUN PENDAFTARAN */}
        <section className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8">
          <div className="border-b border-[#E2E8E5] pb-4 mb-6">
            <h2 className="text-lg font-bold text-[#0F1E19]">02. Akun Pendaftaran</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Masukkan email yang aktif dan buat PIN/password untuk masuk ke akun pendaftaran serta
              menerima informasi seleksi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Aktif <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Digunakan untuk menerima informasi pendaftaran.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                PIN / Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                value={accountPin}
                onChange={(e) => setAccountPin(e.target.value)}
                placeholder="Buat PIN / Password"
                className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Minimal 4 karakter angka/huruf.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Konfirmasi PIN / Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Masukkan kembali PIN"
                className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>
          </div>
        </section>

        {/* BAGIAN 3: DATA CALON PESERTA DIDIK */}
        <section className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8">
          <div className="border-b border-[#E2E8E5] pb-4 mb-6">
            <h2 className="text-lg font-bold text-[#0F1E19]">03. Data Calon Peserta Didik</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tuliskan identitas lengkap calon peserta didik sesuai Akta Kelahiran atau Kartu
              Keluarga.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NISN <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="Nomor Induk Siswa Nasional (atau - jika belum ada)"
                className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Panggilan <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Nama panggilan sehari-hari"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Lengkap <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tuliskan nama lengkap sesuai dokumen resmi"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tempat Lahir <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="Kota/Kabupaten tempat lahir"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Lahir <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Jenis Kelamin <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === 'Laki-laki'}
                    onChange={() => setGender('Laki-laki')}
                    className="w-4 h-4 accent-[#0F5338]"
                  />
                  <span>Laki-laki</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === 'Perempuan'}
                    onChange={() => setGender('Perempuan')}
                    className="w-4 h-4 accent-[#0F5338]"
                  />
                  <span>Perempuan</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor WhatsApp Aktif <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            {/* Alamat Lengkap */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Lengkap <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                placeholder="Nama Jalan, Perumahan, Blok, Nomor Rumah"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  RT <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rt}
                  onChange={(e) => setRt(e.target.value)}
                  placeholder="001"
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  RW <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rw}
                  onChange={(e) => setRw(e.target.value)}
                  placeholder="002"
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kelurahan / Desa <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Nama Kelurahan atau Desa"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kecamatan <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Nama Kecamatan"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kabupaten / Kota <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Kota Depok"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Provinsi <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Contoh: Jawa Barat"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kode Pos <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="164xx"
                className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>
          </div>
        </section>

        {/* BAGIAN 4: DATA SEKOLAH ASAL */}
        <section className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8">
          <div className="border-b border-[#E2E8E5] pb-4 mb-6">
            <h2 className="text-lg font-bold text-[#0F1E19]">04. Data Sekolah Asal</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Informasi sekolah atau lembaga pendidikan sebelumnya (isi &quot;Belum Sekolah / Dari
              Rumah&quot; jika mendaftar AIS/TK dari rumah).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Asal Sekolah (Nama Sekolah) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={originSchoolName}
                onChange={(e) => setOriginSchoolName(e.target.value)}
                placeholder="Nama sekolah asal"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tahun Lulus / Tahun Pelajaran <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="Contoh: 2026 atau 2025/2026"
                className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Sekolah <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={originSchoolAddress}
                onChange={(e) => setOriginSchoolAddress(e.target.value)}
                placeholder="Alamat lengkap sekolah asal"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kabupaten / Kota Sekolah <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={originSchoolCity}
                onChange={(e) => setOriginSchoolCity(e.target.value)}
                placeholder="Kabupaten / Kota sekolah asal"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Provinsi Sekolah <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={originSchoolProvince}
                onChange={(e) => setOriginSchoolProvince(e.target.value)}
                placeholder="Provinsi sekolah asal"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
              />
            </div>
          </div>
        </section>

        {/* BAGIAN 5: DATA ORANG TUA (DATA AYAH / DATA IBU — FLEKSIBEL SALAH SATU) */}
        <section className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8E5] pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#0F1E19]">
                05. Data Orang Tua (Ayah &amp; Ibu)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Sesuai ketentuan SPMB SIT ARAFAH, orang tua{' '}
                <strong className="text-[#0F5338]">
                  cukup mengisi salah satu saja (Data Ayah saja atau Data Ibu saja)
                </strong>{' '}
                maupun keduanya.
              </p>
            </div>

            {/* Interactive Mode Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setParentMode('BOTH')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  parentMode === 'BOTH'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ayah &amp; Ibu
              </button>
              <button
                type="button"
                onClick={() => setParentMode('FATHER_ONLY')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  parentMode === 'FATHER_ONLY'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hanya Ayah
              </button>
              <button
                type="button"
                onClick={() => setParentMode('MOTHER_ONLY')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  parentMode === 'MOTHER_ONLY'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hanya Ibu
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Sub-bagian DATA AYAH */}
            {parentMode !== 'MOTHER_ONLY' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="w-4 h-4 text-[#0F5338]" />
                  <h3 className="text-sm font-bold text-[#0F1E19]">DATA AYAH</h3>
                  <span className="text-xs text-slate-500">
                    ·{' '}
                    {parentMode === 'FATHER_ONLY'
                      ? 'Wajib dilengkapi'
                      : 'Opsional apabila Data Ibu sudah diisi lengkap'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Lengkap Ayah
                    </label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Nama lengkap Ayah sesuai KTP/KK"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      NIK Ayah
                    </label>
                    <input
                      type="text"
                      value={fatherNik}
                      onChange={(e) => setFatherNik(e.target.value)}
                      placeholder="16 digit NIK Ayah"
                      className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp Ayah
                    </label>
                    <input
                      type="tel"
                      value={fatherWhatsapp}
                      onChange={(e) => setFatherWhatsapp(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pendidikan Terakhir Ayah
                    </label>
                    <select
                      value={fatherEducation}
                      onChange={(e) => setFatherEducation(e.target.value as EducationLevel)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    >
                      <option value="">-- Pilih Pendidikan --</option>
                      {EDUCATION_OPTIONS.map((edu) => (
                        <option key={edu} value={edu}>
                          {edu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pekerjaan Ayah
                    </label>
                    <input
                      type="text"
                      value={fatherOccupation}
                      onChange={(e) => setFatherOccupation(e.target.value)}
                      placeholder="Pekerjaan utama"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Instansi / Tempat Bekerja Ayah
                    </label>
                    <input
                      type="text"
                      value={fatherInstitution}
                      onChange={(e) => setFatherInstitution(e.target.value)}
                      placeholder="Nama perusahaan / instansi"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sub-bagian DATA IBU */}
            {parentMode !== 'FATHER_ONLY' && (
              <div className={parentMode === 'BOTH' ? 'pt-6 border-t border-[#E2E8E5]' : ''}>
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="w-4 h-4 text-[#0F5338]" />
                  <h3 className="text-sm font-bold text-[#0F1E19]">DATA IBU</h3>
                  <span className="text-xs text-slate-500">
                    ·{' '}
                    {parentMode === 'MOTHER_ONLY'
                      ? 'Wajib dilengkapi'
                      : 'Opsional apabila Data Ayah sudah diisi lengkap'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Ibu Kandung
                    </label>
                    <input
                      type="text"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="Nama lengkap Ibu sesuai KTP/KK"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      NIK Ibu
                    </label>
                    <input
                      type="text"
                      value={motherNik}
                      onChange={(e) => setMotherNik(e.target.value)}
                      placeholder="16 digit NIK Ibu"
                      className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp Ibu
                    </label>
                    <input
                      type="tel"
                      value={motherWhatsapp}
                      onChange={(e) => setMotherWhatsapp(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pendidikan Terakhir Ibu
                    </label>
                    <select
                      value={motherEducation}
                      onChange={(e) => setMotherEducation(e.target.value as EducationLevel)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    >
                      <option value="">-- Pilih Pendidikan --</option>
                      {EDUCATION_OPTIONS.map((edu) => (
                        <option key={edu} value={edu}>
                          {edu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pekerjaan Ibu
                    </label>
                    <input
                      type="text"
                      value={motherOccupation}
                      onChange={(e) => setMotherOccupation(e.target.value)}
                      placeholder="Pekerjaan Ibu"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Instansi / Tempat Bekerja Ibu
                    </label>
                    <input
                      type="text"
                      value={motherInstitution}
                      onChange={(e) => setMotherInstitution(e.target.value)}
                      placeholder="Nama perusahaan / instansi / rumah tangga"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F5338]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* BAGIAN 6: DATA REFERENSI & INFORMASI TAMBAHAN (OTOMATIS DARI LINK ?ref= GURU/STAFF ATAU ORANG TUA SISWA) */}
        <section className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8">
          <div className="border-b border-[#E2E8E5] pb-4 mb-6">
            <h2 className="text-lg font-bold text-[#0F1E19]">
              06. Data Referensi &amp; Informasi Tambahan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bagian ini otomatis menampilkan <strong>Sumber Referensi</strong> (
              <strong>Guru dan Staff</strong> atau <strong>Orang Tua Siswa</strong>) beserta nama
              pemberi referensi sesuai kode <code className="font-mono-tabular">?ref=</code> pada
              link pendaftaran (hanya dapat dilihat, tidak dapat diubah).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sumber Referensi (Otomatis <code className="font-mono-tabular">?ref=</code>)
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={
                  matchedReferralStaff
                    ? matchedReferralStaff.category === 'Orang Tua Siswa'
                      ? 'Orang Tua Siswa'
                      : 'Guru dan Staff'
                    : 'Guru dan Staff / Orang Tua Siswa'
                }
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed select-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Otomatis terisi <strong>Guru dan Staff</strong> atau{' '}
                <strong>Orang Tua Siswa</strong> tergantung kode{' '}
                <code className="font-mono-tabular">?ref=</code> (Terkunci).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {matchedReferralStaff?.category === 'Orang Tua Siswa' ? (
                  <>
                    Nama Orang Tua Siswa (Otomatis <code className="font-mono-tabular">?ref=</code>)
                  </>
                ) : matchedReferralStaff ? (
                  <>
                    Nama Guru / Staff (Otomatis <code className="font-mono-tabular">?ref=</code>)
                  </>
                ) : (
                  <>
                    Nama Guru / Staff / Orang Tua Siswa (Otomatis{' '}
                    <code className="font-mono-tabular">?ref=</code>)
                  </>
                )}
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={
                  matchedReferralStaff
                    ? `[${matchedReferralStaff.refCode}] ${matchedReferralStaff.name}`
                    : '- (Tanpa Link Referral ?ref=)'
                }
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-[#0F5338] bg-[#F3F7F5] border border-[#C6DDD3] rounded-lg cursor-not-allowed select-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Otomatis menampilkan nama Guru/Staff atau Orang Tua Siswa sesuai link{' '}
                <code className="font-mono-tabular">?ref=</code> (Tidak dapat diubah).
              </span>
            </div>
          </div>
        </section>

        {/* BAGIAN 7: PERNYATAAN PENDAFTAR */}
        <section className="bg-white border border-[#E2E8E5] rounded-xl p-6 sm:p-8">
          <div className="border-b border-[#E2E8E5] pb-4 mb-5">
            <h2 className="text-lg font-bold text-[#0F1E19]">07. Pernyataan Pendaftar</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Saya menyatakan dengan sesungguhnya bahwa:
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-700">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={statement1}
                onChange={(e) => setStatement1(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#0F5338]"
              />
              <span>
                Data yang saya masukkan dalam formulir pendaftaran ini adalah benar dan sesuai
                dengan keadaan sebenarnya.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={statement2}
                onChange={(e) => setStatement2(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#0F5338]"
              />
              <span>Saya bersedia mengikuti ketentuan dan tahapan SPMB SIT ARAFAH.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={statement3}
                onChange={(e) => setStatement3(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#0F5338]"
              />
              <span>
                Saya bersedia memberikan data yang diperlukan untuk keperluan proses pendaftaran.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={statement4}
                onChange={(e) => setStatement4(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#0F5338]"
              />
              <span>
                Saya memahami bahwa data yang tidak benar dapat memengaruhi proses pendaftaran.
              </span>
            </label>
          </div>

          <div className="mt-6 pt-5 border-t border-[#E2E8E5] flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleApproveAllStatements}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                agreedToTerms
                  ? 'bg-[#F3F7F5] border-[#0F5338] text-[#0F5338]'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Saya menyetujui pernyataan di atas
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0F5338] rounded-lg hover:bg-[#0B3E29] transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4" />
              Lihat Ringkasan Sebelum Dikirim
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};

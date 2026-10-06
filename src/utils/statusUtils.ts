import { SelectionStatus } from '../types/spmb';

export const STATUS_LABELS: Record<SelectionStatus, string> = {
  MENUNGGU_VERIFIKASI: 'Menunggu verifikasi',
  TERVERIFIKASI: 'Sudah Diverifikasi',
  DITERIMA: 'Diterima',
  TIDAK_DITERIMA: 'Ditolak',
};

export const STATUS_DEFAULT_NOTES: Record<SelectionStatus, string> = {
  MENUNGGU_VERIFIKASI:
    'Pendaftaran sedang dalam proses verifikasi. Data dan dokumen calon murid sedang diperiksa oleh Admin SPMB SIT Arafah. Mohon menunggu informasi mengenai hasil verifikasi selanjutnya.',
  TERVERIFIKASI:
    'Pendaftaran telah diverifikasi. Data dan dokumen calon murid telah diperiksa oleh Admin SPMB SIT Arafah. Silakan menunggu informasi selanjutnya mengenai proses penerimaan.',
  TIDAK_DITERIMA:
    'Pendaftaran belum dapat diterima. Setelah dilakukan proses verifikasi, pendaftaran calon murid belum memenuhi ketentuan yang ditetapkan oleh SPMB SIT Arafah. Silakan menghubungi Admin SPMB SIT Arafah untuk informasi lebih lanjut.',
  DITERIMA:
    'Pendaftaran telah diterima. Tahap selanjutnya, calon murid akan diinformasikan oleh Admin SPMB SIT Arafah untuk melaksanakan proses selanjutnya sesuai dengan jenjang yang didaftarkan.',
};

export function getStatusLabel(status: SelectionStatus): string {
  return STATUS_LABELS[status] || status;
}

export function getStatusDefaultNote(status: SelectionStatus): string {
  return STATUS_DEFAULT_NOTES[status] || '';
}

/**
 * Returns the formatted official message for a status.
 * Replaces old placeholder phrases with the standard SPMB text.
 */
export function getEffectiveStatusNote(
  status: SelectionStatus,
  customNote?: string | null
): string {
  if (!customNote || customNote.trim().length === 0) {
    return STATUS_DEFAULT_NOTES[status] || '';
  }

  const trimmed = customNote.trim();
  // Check if it's the old legacy or placeholder text
  if (
    trimmed.includes('antrean verifikasi') ||
    trimmed.includes('Data pendaftaran Anda telah masuk ke dalam sistem dan sedang diverifikasi') ||
    trimmed.includes('Pendaftaran telah diterima sistem SPMB SIT ARAFAH')
  ) {
    return STATUS_DEFAULT_NOTES[status] || trimmed;
  }

  return trimmed;
}

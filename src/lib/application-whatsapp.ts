import { BillingCycle, TenantApplication } from '@/types/database';
import { formatPhoneNumber } from './whatsapp';
import { formatDateIndonesian, getCycleLabel } from './formatters';

export interface ApplicantConfirmationParams {
  application: TenantApplication;
  propertyName: string;
  ownerName: string;
  ownerPhone: string;
}

export function generateApplicantConfirmationUrl(params: ApplicantConfirmationParams): string {
  const { application, propertyName, ownerName, ownerPhone } = params;
  const cycleText = getCycleLabel(application.preferred_cycle);
  const formattedDate = formatDateIndonesian(application.move_in_date);

  const message =
    `Halo Pak/Bu *${ownerName}*,\n\n` +
    `Saya *${application.full_name}* baru saja mengisi formulir minat sewa untuk *${propertyName}*.\n\n` +
    `*Rincian Rencana Sewa:*\n` +
    `• Siklus Sewa: ${cycleText}\n` +
    `• Rencana Masuk: ${formattedDate}\n` +
    `• Jumlah Penghuni: ${application.family_members || 1} orang\n` +
    (application.vehicles ? `• Kendaraan: ${application.vehicles}\n` : '') +
    (application.occupation ? `• Pekerjaan: ${application.occupation}\n` : '') +
    (application.notes ? `• Catatan: ${application.notes}\n` : '') +
    `\nMohon informasi ketersediaan dan jadwal survei lokasi ya Pak/Bu. Terima kasih banyak! 🙏`;

  const phone = formatPhoneNumber(ownerPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateOwnerReplyUrl(params: {
  applicantName: string;
  applicantPhone: string;
  propertyName: string;
  ownerName: string;
}): string {
  const { applicantName, applicantPhone, propertyName, ownerName } = params;

  const message =
    `Halo Pak/Bu *${applicantName}*,\n\n` +
    `Saya *${ownerName}* pemilik *${propertyName}*. Terima kasih telah mengisi formulir minat sewa kontrakan kami.\n\n` +
    `Kira-kira kapan Pak/Bu ada waktu luang untuk melihat langsung unit dan survei lokasi? Terima kasih! 🙏`;

  const phone = formatPhoneNumber(applicantPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateCatalogInquiryUrl(params: {
  propertyName: string;
  ownerName: string;
  ownerPhone: string;
}): string {
  const { propertyName, ownerName, ownerPhone } = params;

  const message =
    `Halo Pak/Bu *${ownerName}*,\n\n` +
    `Saya tertarik dengan unit kontrakan *${propertyName}* yang ada di katalog. Apakah unit ini masih tersedia untuk disewa? Terima kasih! 🙏`;

  const phone = formatPhoneNumber(ownerPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

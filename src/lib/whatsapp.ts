import { AppSettings, BillingCycle, Lease, Property } from '@/types/database';
import { formatDateIndonesian, formatRupiah, getCycleLabel } from './formatters';

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Convert leading 08 to 628
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}

export interface BillingMessageData {
  tenantName: string;
  tenantPhone: string;
  propertyName: string;
  billingCycle: BillingCycle;
  rateAmount: number;
  depositAmount?: number | null;
  nextDueDate: string;
  settings: AppSettings;
}

export function buildBillingMessageText(data: BillingMessageData): string {
  const {
    tenantName,
    propertyName,
    billingCycle,
    rateAmount,
    depositAmount,
    nextDueDate,
    settings,
  } = data;

  const cycleText = getCycleLabel(billingCycle);
  const formattedDueDate = formatDateIndonesian(nextDueDate);
  const formattedRate = formatRupiah(rateAmount);

  let depositSection = '';
  if (depositAmount && depositAmount > 0) {
    depositSection = `• Uang Jaminan / Deposit: ${formatRupiah(depositAmount)}\n`;
  }

  const customTemplate = settings.custom_wa_template;
  if (customTemplate && customTemplate.trim().length > 0) {
    return customTemplate
      .replace(/{{tenantName}}/g, tenantName)
      .replace(/{{propertyName}}/g, propertyName)
      .replace(/{{billingCycle}}/g, cycleText)
      .replace(/{{nextDueDate}}/g, formattedDueDate)
      .replace(/{{rateAmount}}/g, formattedRate)
      .replace(/{{depositSection}}/g, depositSection)
      .replace(/{{bankName}}/g, settings.bank_name)
      .replace(/{{accountNumber}}/g, settings.account_number)
      .replace(/{{accountHolder}}/g, settings.account_holder);
  }

  return (
    `Halo Pak/Bu ${tenantName},\n\n` +
    `Mengingatkan untuk pembayaran sewa kontrakan *${propertyName}* untuk periode *${cycleText}* akan jatuh tempo pada tanggal *${formattedDueDate}*.\n\n` +
    `*Rincian Tagihan:*\n` +
    `• Biaya Sewa (${cycleText}): ${formattedRate}\n` +
    depositSection +
    `• Status: Menunggu Pembayaran\n\n` +
    `Pembayaran dapat ditransfer melalui:\n` +
    `• Bank: *${settings.bank_name}*\n` +
    `• No. Rekening: *${settings.account_number}*\n` +
    `• Atas Nama: *${settings.account_holder}*\n\n` +
    `Mohon konfirmasi dan kirimkan bukti transfer jika pembayaran sudah dilakukan ya. Terima kasih banyak! 🙏`
  );
}

export function generateWhatsAppBillingUrl(data: BillingMessageData): string {
  const phone = formatPhoneNumber(data.tenantPhone);
  const text = buildBillingMessageText(data);
  const encodedText = encodeURIComponent(text);

  return `https://wa.me/${phone}?text=${encodedText}`;
}

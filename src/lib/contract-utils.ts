import { ContractClause } from '@/types/database';
import { formatPhoneNumber } from './whatsapp';

export const DEFAULT_CONTRACT_CLAUSES: ContractClause[] = [
  {
    title: 'Pasal 1: Objek Sewa & Peruntukan',
    content:
      'Pihak Pertama menyewakan kepada Pihak Kedua sebuah unit rumah kontrakan yang hanya diperuntukkan sebagai tempat tinggal. Pihak Kedua dilarang keras mempergunakan objek sewa untuk kegiatan usaha terlarang, perjudian, asusila, menyimpan barang berbahaya/melanggar hukum, atau perbuatan yang mengganggu ketertiban umum.',
  },
  {
    title: 'Pasal 2: Jangka Waktu & Perpanjangan Sewa',
    content:
      'Perjanjian sewa menyewa ini berlaku sesuai jangka waktu yang tercantum pada surat ini. Apabila Pihak Kedua berencana untuk memperpanjang masa sewa, Pihak Kedua wajib memberitahukan kepada Pihak Pertama selambat-lambatnya 14 (empat belas) hari kalender sebelum masa sewa berakhir.',
  },
  {
    title: 'Pasal 3: Biaya Sewa & Uang Jaminan (Deposit)',
    content:
      'Biaya sewa dibayarkan lunas di muka sesuai kesepakatan siklus pembayaran. Uang jaminan (deposit) dipegang oleh Pihak Pertama sebagai jaminan pelunasan tagihan utilitas dan perbaikan kerusakan di luar batas pemakaian wajar, dan akan dikembalikan secara utuh kepada Pihak Kedua setelah masa sewa berakhir serta serah terima kunci dilakukan dengan baik.',
  },
  {
    title: 'Pasal 4: Biaya Pemakaian Utilitas & Iuran',
    content:
      'Selama masa sewa berlangsung, seluruh biaya pemakaian listrik (token PLN), air bersih (PDAM), dan iuran kebersihan/lingkungan setempat menjadi tanggung jawab penuh Pihak Kedua.',
  },
  {
    title: 'Pasal 5: Pemeliharaan Rumah & Larangan Alih Sewa',
    content:
      'Pihak Kedua wajib merawat kebersihan, ketertiban, dan keutuhan fisik unit kontrakan. Pihak Kedua dilarang merombak/mengubah struktur fisik bangunan tanpa persetujuan tertulis dari Pihak Pertama, serta dilarang memindahtangankan atau menyewakan kembali objek sewa kepada pihak ketiga.',
  },
  {
    title: 'Pasal 6: Pengakhiran Perjanjian & Penyelesaian Perselisihan',
    content:
      'Apabila Pihak Kedua melanggar ketentuan yang diatur dalam perjanjian ini, Pihak Pertama berhak mengakhiri sewa dan meminta Pihak Kedua mengosongkan unit. Segala perselisihan yang timbul akan diselesaikan secara kekeluargaan melalui musyawarah mufakat.',
  },
];

const ROMAN_MONTHS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

export function generateContractNumber(
  propertyName: string,
  dateString?: string,
  seq = 1
): string {
  const d = dateString ? new Date(dateString) : new Date();
  const year = d.getFullYear();
  const monthRoman = ROMAN_MONTHS[d.getMonth()] || 'I';
  const cleanCode = propertyName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 4)
    .toUpperCase() || 'UNIT';
  const seqStr = String(seq).padStart(2, '0');

  return `SPSM/${year}/${monthRoman}/${cleanCode}-${seqStr}`;
}

export function generateContractWhatsAppUrl(params: {
  contractId: string;
  tenantName: string;
  tenantPhone: string;
  propertyName: string;
  contractNumber: string;
  origin?: string;
}): string {
  const { contractId, tenantName, tenantPhone, propertyName, contractNumber, origin } = params;
  const baseUrl = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const contractLink = `${baseUrl}/kontrak/${contractId}`;

  const message =
    `Halo Pak/Bu *${tenantName}*,\n\n` +
    `Berikut adalah Surat Perjanjian Sewa Menyewa (SPSM) resmi untuk unit kontrakan *${propertyName}* (No: ${contractNumber}).\n\n` +
    `Mohon membuka tautan berikut untuk membaca pasal perjanjian dan membubuhkan tanda tangan secara online langsung di layar ponsel:\n` +
    `👉 ${contractLink}\n\n` +
    `Setelah ditandatangani, salinan dokumen resmi yang telah sah dapat langsung diunduh / dicetak oleh Bapak/Ibu. Terima kasih! 🙏`;

  const phone = formatPhoneNumber(tenantPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateTenantSignedNotificationUrl(params: {
  ownerPhone: string;
  ownerName: string;
  tenantName: string;
  propertyName: string;
  contractNumber: string;
  origin?: string;
  contractId: string;
}): string {
  const { ownerPhone, ownerName, tenantName, propertyName, contractNumber, origin, contractId } =
    params;
  const baseUrl = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const contractLink = `${baseUrl}/kontrak/${contractId}`;

  const message =
    `Halo Pak/Bu *${ownerName}*,\n\n` +
    `Saya *${tenantName}* telah membaca dan menandatangani Surat Perjanjian Sewa Menyewa (SPSM) untuk unit *${propertyName}* (No: ${contractNumber}).\n\n` +
    `Dokumen kontrak kini telah resmi dan dapat dilihat di:\n` +
    `👉 ${contractLink}\n\n` +
    `Terima kasih banyak atas kerjasamanya! 🙏`;

  const phone = formatPhoneNumber(ownerPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

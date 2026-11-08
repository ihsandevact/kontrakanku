import {
  AppSettings,
  Lease,
  Property,
  TenantApplication,
  Transaction,
} from '@/types/database';

export const INITIAL_SETTINGS: AppSettings = {
  id: 'default',
  bank_name: 'BCA',
  account_number: '',
  account_holder: '',
  reminder_days_before: 7,
  default_cycle: 'semi_annual',
  custom_wa_template: null,
  contact_phone: '',
  owner_pin: '123456',
  updated_at: new Date().toISOString(),
};

export const INITIAL_PROPERTIES: Property[] = [];
export const INITIAL_LEASES: Lease[] = [];
export const INITIAL_APPLICATIONS: TenantApplication[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// ==========================================
// DATA DEMO / CONTOH (Hanya digunakan jika pengguna menekan "Reset ke Demo Mock Data")
// ==========================================
export const DEMO_SETTINGS: AppSettings = {
  id: 'default',
  bank_name: 'BCA',
  account_number: '8001234567',
  account_holder: 'Ahmad Fauzi',
  reminder_days_before: 7,
  default_cycle: 'semi_annual',
  custom_wa_template: null,
  contact_phone: '081234567890',
  owner_pin: '123456',
  updated_at: new Date().toISOString(),
};

export const DEMO_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Kontrakan Melati No. 1',
    address: 'Jl. Melati Indah No. 12, RT 03/RW 05',
    electricity_id: '531234567890',
    water_id: 'PDAM-021987654',
    description: 'Rumah kontrakan 2 kamar tidur, ruang tamu luas, dapur pribadi, kamar mandi dalam dengan shower, teras berpagar, lingkungan tenang dan aman.',
    facilities: ['2 Kamar Tidur', 'Listrik Token 1300 VA', 'Air PDAM Bersih', 'Parkir Motor Luas', 'Dapur & Wastafel', 'Bebas Banjir'],
    monthly_rate: 1500000,
    is_public_listed: true,
    photo_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
  },
  {
    id: 'prop-2',
    name: 'Kontrakan Melati No. 2',
    address: 'Jl. Melati Indah No. 14, RT 03/RW 05',
    electricity_id: '531234567891',
    water_id: 'PDAM-021987655',
    description: 'Kontrakan siap huni dengan ventilasi silang yang sejuk, 1 kamar tidur utama, ruang keluarga fleksibel, dan halaman depan.',
    facilities: ['1 Kamar Tidur', 'Listrik Token 900 VA', 'Air PDAM', 'Parkir Motor', 'Dapur Pribadi'],
    monthly_rate: 1400000,
    is_public_listed: true,
    photo_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString(),
  },
  {
    id: 'prop-3',
    name: 'Rumah Kontrakan Mawar A',
    address: 'Jl. Mawar Asri Blok B No. 5',
    electricity_id: '539876543210',
    water_id: 'PDAM-021555432',
    description: 'Unit paviliun minimalis strategis dekat jalan raya, cocok untuk karyawan atau keluarga muda. Akses mudah ke minimarket & transportasi.',
    facilities: ['2 Kamar Tidur', 'Ruang Tamu', 'Listrik 1300 VA', 'PDAM 24 Jam', 'Akses Mobil'],
    monthly_rate: 1750000,
    is_public_listed: true,
    photo_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
  },
  {
    id: 'prop-4',
    name: 'Paviliun Cempaka Unit 2',
    address: 'Jl. Cempaka Putih Timur No. 8',
    electricity_id: '534433221100',
    water_id: 'PDAM-021888999',
    description: 'Unit baru dicat ulang, sangat bersih dan siap huni segera! Lokasi sangat asri dengan gerbang keamanan lingkungan RT/RW.',
    facilities: ['Siap Huni Langsung', '1 Kamar Tidur', 'Kamar Mandi Keramik', 'Listrik Token', 'Air PDAM Deras', 'Parkir Motor Tertutup'],
    monthly_rate: 1450000,
    is_public_listed: true,
    photo_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];

// Helper for dynamic relative dates
const now = new Date();

function getRelativeDateStr(offsetDays: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const DEMO_LEASES: Lease[] = [
  {
    id: 'lease-1',
    property_id: 'prop-1',
    tenant_name: 'Budi Santoso',
    tenant_phone: '081288991122',
    tenant_nik: '3201123456780001',
    billing_cycle: 'semi_annual',
    rate_amount: 9000000,
    deposit_amount: 500000,
    start_date: getRelativeDateStr(-175),
    next_due_date: getRelativeDateStr(5), // 5 days from now -> due_soon!
    status: 'due_soon',
    notes: 'Keluarga 3 orang, motor 2 unit.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 175).toISOString(),
  },
  {
    id: 'lease-2',
    property_id: 'prop-2',
    tenant_name: 'Siti Rahmawati',
    tenant_phone: '081399887766',
    tenant_nik: '3201123456780002',
    billing_cycle: 'semi_annual',
    rate_amount: 8500000,
    deposit_amount: 0,
    start_date: getRelativeDateStr(-120),
    next_due_date: getRelativeDateStr(60), // 60 days from now -> active
    status: 'active',
    notes: 'Pembayaran via transfer BCA selalu tepat waktu.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
  },
  {
    id: 'lease-3',
    property_id: 'prop-3',
    tenant_name: 'Hendra Wijaya',
    tenant_phone: '085711223344',
    tenant_nik: '3201123456780003',
    billing_cycle: 'monthly',
    rate_amount: 1750000,
    deposit_amount: null,
    start_date: getRelativeDateStr(-33),
    next_due_date: getRelativeDateStr(-3), // 3 days ago -> overdue!
    status: 'overdue',
    notes: 'Sudah diinfokan jatuh tempo lewat WhatsApp.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 33).toISOString(),
  },
];

export const DEMO_APPLICATIONS: TenantApplication[] = [
  {
    id: 'app-1',
    property_id: 'prop-4',
    full_name: 'Rian Hidayat',
    phone: '081299554433',
    nik: '3201199988880005',
    occupation: 'Karyawan Swasta (IT Support)',
    family_members: 2,
    vehicles: '1 Motor Vario',
    preferred_cycle: 'semi_annual',
    move_in_date: getRelativeDateStr(7),
    notes: 'Sudah lihat foto di katalog, cocok lokasinya dekat kantor. Mau survei hari Sabtu besok.',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'app-2',
    property_id: 'prop-1',
    full_name: 'Dimas Prasetyo',
    phone: '085677889900',
    nik: null,
    occupation: 'Wiraswasta (Kuliner)',
    family_members: 3,
    vehicles: '1 Motor Beat, 1 Mobil Calya',
    preferred_cycle: 'monthly',
    move_in_date: getRelativeDateStr(14),
    notes: 'Mencari kontrakan untuk jangka panjang minimal 1 tahun.',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-current-rent',
    property_id: 'prop-2',
    lease_id: 'lease-2',
    category: 'income_rent',
    amount: 8500000,
    transaction_date: getRelativeDateStr(-4),
    description: 'Pelunasan Sewa Kontrakan 6 Bulan (Siti Rahmawati)',
    receipt_file_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'tx-current-maintenance',
    property_id: 'prop-1',
    lease_id: null,
    category: 'expense_maintenance',
    amount: 350000,
    transaction_date: getRelativeDateStr(-2),
    description: 'Servis pompa air Jet Pump dan ganti kapasitor',
    receipt_file_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'tx-current-community',
    property_id: 'prop-3',
    lease_id: null,
    category: 'expense_other',
    amount: 60000,
    transaction_date: getRelativeDateStr(-1),
    description: 'Iuran kebersihan & keamanan RT/RW',
    receipt_file_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'tx-past-1',
    property_id: 'prop-1',
    lease_id: 'lease-1',
    category: 'income_rent',
    amount: 9000000,
    transaction_date: getRelativeDateStr(-175),
    description: 'Pelunasan Sewa Kontrakan 6 Bulan (Budi Santoso)',
    receipt_file_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 175).toISOString(),
  },
  {
    id: 'tx-past-2',
    property_id: 'prop-1',
    lease_id: 'lease-1',
    category: 'income_deposit',
    amount: 500000,
    transaction_date: getRelativeDateStr(-175),
    description: 'Uang Jaminan Kerusakan / Deposit awal masuk',
    receipt_file_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 175).toISOString(),
  },
  {
    id: 'tx-past-3',
    property_id: 'prop-2',
    lease_id: null,
    category: 'expense_maintenance',
    amount: 150000,
    transaction_date: getRelativeDateStr(-40),
    description: 'Ganti kran cuci piring & pipa pembuangan wastafel',
    receipt_file_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
  },
];

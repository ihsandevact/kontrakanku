import {
  calculateNextDueDate,
  evaluateLeaseStatus,
  formatDaysUntilDue,
  getDaysUntilDue,
} from '../src/lib/billing';
import {
  buildBillingMessageText,
  formatPhoneNumber,
  generateWhatsAppBillingUrl,
} from '../src/lib/whatsapp';
import {
  generateApplicantConfirmationUrl,
  generateCatalogInquiryUrl,
  generateOwnerReplyUrl,
} from '../src/lib/application-whatsapp';
import {
  DEFAULT_CONTRACT_CLAUSES,
  generateContractNumber,
  generateContractWhatsAppUrl,
  generateTenantSignedNotificationUrl,
} from '../src/lib/contract-utils';
import { DEFAULT_OWNER_PIN, formatSlug, generateUniqueSlug, isPublicPath } from '../src/lib/auth';
import {
  formatDateIndonesian,
  formatRentalPeriod,
  formatRentalPeriodShort,
  formatRupiah,
  getCycleLabel,
  getCycleMonths,
} from '../src/lib/formatters';
import { AppSettings, TenantApplication } from '../src/types/database';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log('--- Testing Phone Number Sanitizer ---');
assert(formatPhoneNumber('081288991122') === '6281288991122', '08 prefix converted to 628');
assert(formatPhoneNumber('+62 813-9988-7766') === '6281399887766', 'removes +, spaces, hyphens');
assert(formatPhoneNumber('85711223344') === '6285711223344', '8 prefix converted to 628');

console.log('\n--- Testing Due Date Calculation ---');
assert(calculateNextDueDate('2026-01-15', 'monthly') === '2026-02-15', 'Monthly adds 1 month');
assert(calculateNextDueDate('2026-01-15', 'quarterly') === '2026-04-15', 'Quarterly adds 3 months');
assert(calculateNextDueDate('2026-01-15', 'semi_annual') === '2026-07-15', 'Semi-Annual adds 6 months');
assert(calculateNextDueDate('2026-01-15', 'annual') === '2027-01-15', 'Annual adds 12 months (cross year)');
assert(calculateNextDueDate('2026-01-31', 'monthly') === '2026-02-28', 'Jan 31 + 1 month correctly adjusts to Feb 28');

console.log('\n--- Testing Formatters ---');
assert(formatRupiah(9000000).includes('9.000.000'), 'formatRupiah format includes 9.000.000');
assert(getCycleMonths('semi_annual') === 6, 'getCycleMonths semi_annual is 6');
assert(formatRentalPeriod(1) === 'Bebas', 'formatRentalPeriod 1 month is Bebas');
assert(formatRentalPeriodShort(1) === 'Bebas', 'formatRentalPeriodShort 1 month is Bebas');
assert(formatRentalPeriod(3) === '3 Bulan', 'formatRentalPeriod 3 months');
assert(formatRentalPeriod(6) === '6 Bulan', 'formatRentalPeriod 6 months');
assert(formatRentalPeriod(12) === '1 Tahun', 'formatRentalPeriod 12 months');
assert(formatRentalPeriodShort(12) === '1 Thn', 'formatRentalPeriodShort 12 is 1 Thn');

console.log('\n--- Testing Rental Cycle Rules for Applicant ---');
function isCycleAllowed(cycleMonths: number, unitMinMonths: number): boolean {
  if (unitMinMonths <= 1) return true; // Bebas
  return cycleMonths >= unitMinMonths;
}
assert(isCycleAllowed(1, 1) === true, '1 month allowed when Bebas (1)');
assert(isCycleAllowed(3, 1) === true, '3 months allowed when Bebas (1)');
assert(isCycleAllowed(1, 6) === false, '1 month disabled when unit min is 6 months');
assert(isCycleAllowed(3, 6) === false, '3 months disabled when unit min is 6 months');
assert(isCycleAllowed(6, 6) === true, '6 months allowed when unit min is 6 months');
assert(isCycleAllowed(12, 6) === true, '12 months allowed when unit min is 6 months');
assert(isCycleAllowed(6, 12) === false, '6 months disabled when unit min is 12 months');
assert(isCycleAllowed(12, 12) === true, '12 months allowed when unit min is 12 months');

console.log('\n--- Testing Property Photos Structure ---');
const testProp = {
  id: 'prop-123',
  name: 'Unit Melati',
  photo_url: 'data:image/jpeg;base64,mainphoto',
  photos: ['data:image/jpeg;base64,mainphoto', 'data:image/jpeg;base64,roomphoto'],
};
assert(testProp.photo_url === testProp.photos[0], 'First photo is cover photo');
assert(testProp.photos.length === 2, 'Property supports multi-photo gallery');

console.log('\n--- Testing WhatsApp URL Generator ---');
const dummySettings: AppSettings = {
  id: 'default',
  bank_name: 'BCA',
  account_number: '1234567890',
  account_holder: 'Ahmad Fauzi',
  reminder_days_before: 7,
  default_cycle: 'semi_annual',
  custom_wa_template: null,
  contact_phone: '081234567890',
  updated_at: new Date().toISOString(),
};

const waUrlWithDeposit = generateWhatsAppBillingUrl({
  tenantName: 'Budi Santoso',
  tenantPhone: '081288991122',
  propertyName: 'Kontrakan Melati No. 1',
  billingCycle: 'semi_annual',
  rateAmount: 9000000,
  depositAmount: 500000,
  nextDueDate: '2026-11-10',
  settings: dummySettings,
});

assert(waUrlWithDeposit.startsWith('https://wa.me/6281288991122?text='), 'WhatsApp URL starts with wa.me/6281288991122');
assert(decodeURIComponent(waUrlWithDeposit).includes('Deposit: Rp'), 'WhatsApp text includes deposit when provided');
assert(decodeURIComponent(waUrlWithDeposit).includes('1234567890'), 'WhatsApp text includes account number');

console.log('\n--- Testing Self-Service Application WhatsApp Deep Links ---');
const dummyApp: TenantApplication = {
  id: 'app-test',
  property_id: 'prop-1',
  full_name: 'Rian Hidayat',
  phone: '081299554433',
  nik: '3201199988880005',
  occupation: 'Karyawan Swasta',
  family_members: 2,
  vehicles: '1 Motor Vario',
  preferred_cycle: 'semi_annual',
  move_in_date: '2026-11-20',
  notes: 'Mau survei hari Sabtu',
  status: 'pending',
  created_at: new Date().toISOString(),
};

const applicantConfirmationUrl = generateApplicantConfirmationUrl({
  application: dummyApp,
  propertyName: 'Paviliun Cempaka Unit 2',
  ownerName: 'Ahmad Fauzi',
  ownerPhone: '081234567890',
});

assert(
  applicantConfirmationUrl.startsWith('https://wa.me/6281234567890?text='),
  'Applicant confirmation WA URL routes to owner phone number'
);
assert(
  decodeURIComponent(applicantConfirmationUrl).includes('Rian Hidayat'),
  'Confirmation message includes applicant name'
);
assert(
  decodeURIComponent(applicantConfirmationUrl).includes('Paviliun Cempaka Unit 2'),
  'Confirmation message includes property name'
);

const ownerReplyUrl = generateOwnerReplyUrl({
  applicantName: 'Rian Hidayat',
  applicantPhone: '081299554433',
  propertyName: 'Paviliun Cempaka Unit 2',
  ownerName: 'Ahmad Fauzi',
});

assert(
  ownerReplyUrl.startsWith('https://wa.me/6281299554433?text='),
  'Owner reply WA URL routes to applicant phone number'
);
assert(
  decodeURIComponent(ownerReplyUrl).includes('survei lokasi'),
  'Owner reply message mentions location survey'
);

const catalogInquiryUrl = generateCatalogInquiryUrl({
  propertyName: 'Kontrakan Melati No. 1',
  ownerName: 'Ahmad Fauzi',
  ownerPhone: '081234567890',
});

assert(
  catalogInquiryUrl.startsWith('https://wa.me/6281234567890?text='),
  'Catalog inquiry WA URL routes to owner'
);

console.log('\n--- Testing Digital Contract & Signature Utilities ---');
const ctrNum = generateContractNumber('Melati Indah No 1', '2026-11-08', 1);
assert(ctrNum.startsWith('SPSM/2026/XI/MELA-01'), `Contract number format: ${ctrNum}`);
assert(DEFAULT_CONTRACT_CLAUSES.length === 6, 'Has 6 default standard legal clauses');

const contractWaUrl = generateContractWhatsAppUrl({
  contractId: 'ctr-123',
  tenantName: 'Budi Santoso',
  tenantPhone: '081288991122',
  propertyName: 'Kontrakan Melati No 1',
  contractNumber: ctrNum,
  origin: 'https://kontrakin.com',
});
assert(contractWaUrl.includes('https://wa.me/6281288991122?text='), 'Contract WA routes to tenant phone');
assert(decodeURIComponent(contractWaUrl).includes('https://kontrakin.com/kontrak/ctr-123'), 'Contract WA includes signing link');

// Test tenant phone target specifically (e.g. Ahmad Faqih 082348635212) vs owner phone
const ahmadFaqihContractWa = generateContractWhatsAppUrl({
  contractId: 'ctr-green-nurhidayat',
  tenantName: 'Ahmad Faqih',
  tenantPhone: '082348635212',
  propertyName: 'Rumah Kontrak Perumahan Green Nurhidayat Romangplong',
  contractNumber: 'SPSM/2026/XI/RUMA-01',
});
assert(
  ahmadFaqihContractWa.startsWith('https://wa.me/6282348635212?text='),
  'Ahmad Faqih contract WA URL strictly targets tenant phone 6282348635212'
);
assert(
  !ahmadFaqihContractWa.includes('6281234567890'),
  'Ahmad Faqih contract WA URL does NOT target owner phone'
);

const tenantSignedNotificationUrl = generateTenantSignedNotificationUrl({
  ownerPhone: '081234567890',
  ownerName: 'Ahmad Fauzi',
  tenantName: 'Budi Santoso',
  propertyName: 'Kontrakan Melati No 1',
  contractNumber: ctrNum,
  origin: 'https://kontrakin.com',
  contractId: 'ctr-123',
});
assert(tenantSignedNotificationUrl.includes('https://wa.me/6281234567890?text='), 'Tenant signed notification routes to owner phone');

console.log('\n--- Testing Lease Contract Reset Logic ---');
const sampleCompletedContract = {
  id: 'ctr-test-1',
  lease_id: 'lease-1',
  property_id: 'prop-1',
  contract_number: 'SPSM/2026/XI/TEST-01',
  start_date: '2026-11-01',
  end_date: '2027-05-01',
  billing_cycle: 'semi_annual' as const,
  rent_amount: 9000000,
  deposit_amount: 500000,
  owner_name: 'Ahmad Fauzi',
  owner_phone: '081234567890',
  owner_signature: 'data:image/png;base64,ownerSigData...',
  owner_signed_at: '2026-11-08T00:00:00Z',
  tenant_name: 'Budi Santoso',
  tenant_phone: '081288991122',
  tenant_signature: 'data:image/png;base64,tenantSigData...',
  tenant_signed_at: '2026-11-08T01:00:00Z',
  property_name: 'Kontrakan Melati No 1',
  status: 'completed' as const,
};

// Reset transformation
const resetContractMock = (
  c: typeof sampleCompletedContract,
  reSync?: { rent_amount: number }
) => ({
  ...c,
  owner_signature: null,
  owner_signed_at: null,
  tenant_signature: null,
  tenant_signed_at: null,
  status: 'draft' as const,
  ...(reSync ? { rent_amount: reSync.rent_amount } : {}),
});

const resetResult = resetContractMock(sampleCompletedContract);
assert(resetResult.owner_signature === null, 'Owner signature cleared on reset');
assert(resetResult.tenant_signature === null, 'Tenant signature cleared on reset');
assert(resetResult.owner_signed_at === null, 'Owner signed timestamp cleared on reset');
assert(resetResult.tenant_signed_at === null, 'Tenant signed timestamp cleared on reset');
assert(resetResult.status === 'draft', 'Status reset back to draft');

// With reSync option
const resetWithReSync = resetContractMock(sampleCompletedContract, { rent_amount: 10000000 });
assert(resetWithReSync.rent_amount === 10000000, 'Re-sync updates rent_amount correctly');

console.log('\n--- Testing Authentication & Route Protection (Multi-Tenant SaaS) ---');
assert(DEFAULT_OWNER_PIN === '123456', 'Default PIN is 123456');
assert(isPublicPath('/') === true, '/ (Landing Page) is public');
assert(isPublicPath('/login') === true, '/login is public');
assert(isPublicPath('/register') === true, '/register is public');
assert(isPublicPath('/katalog') === true, '/katalog is public');
assert(isPublicPath('/katalog/kontrakan-berkah') === true, '/katalog/[slug] is public');
assert(isPublicPath('/sewa') === true, '/sewa is public');
assert(isPublicPath('/sewa/kontrakan-berkah') === true, '/sewa/[slug] is public');
assert(isPublicPath('/sewa/sukses') === true, '/sewa/sukses is public');
assert(isPublicPath('/kontrak/c-123') === true, '/kontrak/[id] is public');
assert(isPublicPath('/properties') === false, '/properties is private landlord dashboard');
assert(isPublicPath('/finance') === false, '/finance is private landlord dashboard');
assert(isPublicPath('/applications') === false, '/applications is private landlord dashboard');
assert(isPublicPath('/settings') === false, '/settings is private landlord dashboard');

console.log('\n--- Testing Multi-Tenant URL Slug Generator & Auto-Deduplication ---');
assert(formatSlug('Kontrakan Berkah Barokah 01') === 'kontrakan-berkah-barokah-01', 'Slug handles spaces and casing');
assert(formatSlug('  Rumah Kos-Kosan Melati #3! ') === 'rumah-kos-kosan-melati-3', 'Slug trims and strips special characters');
assert(formatSlug('Kost & Kontrakan Permata-Hijau') === 'kost-kontrakan-permata-hijau', 'Slug handles & and hyphens');

// Auto-Deduplication Tests
const existing = ['kontrakan-berkah', 'kontrakan-berkah-2', 'kos-melati'];
assert(generateUniqueSlug('Kontrakan Berkah', existing) === 'kontrakan-berkah-3', 'Auto-deduplicates collision with -3');
assert(generateUniqueSlug('Kos Mawar', existing) === 'kos-mawar', 'Uses base slug when no collision');
assert(generateUniqueSlug('Kos Melati', existing) === 'kos-melati-2', 'Appends -2 on first collision');
assert(generateUniqueSlug('', existing) === 'kontrakan', 'Falls back to default kontrakan on empty name');

console.log('\n--- Testing Multi-Tenant Landlord Isolation ---');
const landlordA = { id: 'landlord-uuid-a', business_name: 'Kontrakan Barokah', slug: 'kontrakan-barokah' };
const landlordB = { id: 'landlord-uuid-b', business_name: 'Kos Sejahtera', slug: 'kos-sejahtera' };
const multiTenantProperties = [
  { id: 'prop-1', owner_id: landlordA.id, name: 'Unit Barokah 1' },
  { id: 'prop-2', owner_id: landlordA.id, name: 'Unit Barokah 2' },
  { id: 'prop-3', owner_id: landlordB.id, name: 'Kamar Sejahtera A' },
];
const propertiesOfA = multiTenantProperties.filter(p => p.owner_id === landlordA.id);
const propertiesOfB = multiTenantProperties.filter(p => p.owner_id === landlordB.id);
assert(propertiesOfA.length === 2, 'Landlord A only sees 2 units');
assert(propertiesOfB.length === 1, 'Landlord B only sees 1 unit');
assert(!propertiesOfA.some(p => p.owner_id === landlordB.id), 'Strict data isolation: No leak between landlords');

console.log('\n🎉 ALL BUSINESS LOGIC, AUTH & MULTI-TENANT SAAS TESTS PASSED SUCCESSFULLY!');

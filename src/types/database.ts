export type BillingCycle = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

export type LeaseStatus = 'active' | 'due_soon' | 'overdue' | 'vacant';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type TransactionCategory =
  | 'income_rent'
  | 'income_deposit'
  | 'expense_maintenance'
  | 'expense_tax'
  | 'expense_other';

export interface LandlordProfile {
  id: string; // Supabase Auth User ID
  slug: string; // Unique URL handle (misal: "kontrakan-berkah")
  business_name: string; // Nama usaha / komplek kontrakan
  owner_name: string; // Nama lengkap pemilik
  phone: string; // Nomor WhatsApp aktif pemilik
  bank_name: string;
  account_number: string;
  account_holder: string;
  reminder_days_before: number;
  default_cycle: BillingCycle;
  custom_wa_template?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  owner_id?: string | null;
  name: string;
  address?: string | null;
  electricity_id?: string | null;
  water_id?: string | null;
  description?: string | null;
  facilities?: string[] | null;
  monthly_rate?: number | null;
  min_rental_months?: number | null;
  is_public_listed?: boolean;
  photo_url?: string | null;
  photos?: string[] | null;
  created_at: string;
}

export interface Lease {
  id: string;
  owner_id?: string | null;
  property_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_nik?: string | null;
  billing_cycle: BillingCycle;
  rate_amount: number;
  deposit_amount?: number | null;
  start_date: string;
  next_due_date: string;
  status: LeaseStatus;
  notes?: string | null;
  created_at: string;
  property?: Property;
}

export interface TenantApplication {
  id: string;
  owner_id?: string | null;
  property_id?: string | null;
  full_name: string;
  phone: string;
  nik?: string | null;
  occupation?: string | null;
  family_members?: number | null;
  vehicles?: string | null;
  preferred_cycle: BillingCycle;
  move_in_date: string;
  notes?: string | null;
  status: ApplicationStatus;
  created_at: string;
  property?: Property;
}

export interface Transaction {
  id: string;
  owner_id?: string | null;
  property_id: string;
  lease_id?: string | null;
  category: TransactionCategory;
  amount: number;
  transaction_date: string;
  description: string;
  receipt_file_url?: string | null;
  created_at: string;
  property?: Property;
  lease?: Lease;
}

export interface AppSettings {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  reminder_days_before: number;
  default_cycle: BillingCycle;
  custom_wa_template?: string | null;
  contact_phone?: string | null;
  owner_pin?: string | null;
  owner_password?: string | null;
  updated_at: string;
}

export interface DashboardMetrics {
  totalProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
  dueSoonCount: number;
  overdueCount: number;
  pendingApplicationsCount: number;
  totalIncomeCurrentMonth: number;
  totalExpenseCurrentMonth: number;
  netProfitCurrentMonth: number;
}

export type ContractStatus = 'draft' | 'pending_tenant' | 'pending_owner' | 'completed';

export interface ContractClause {
  title: string;
  content: string;
}

export interface LeaseContract {
  id: string;
  owner_id?: string | null;
  lease_id: string;
  property_id: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  billing_cycle: BillingCycle;
  rent_amount: number;
  deposit_amount: number;

  // Pihak Pertama (Pemilik)
  owner_name: string;
  owner_phone: string;
  owner_signature?: string | null;
  owner_signed_at?: string | null;

  // Pihak Kedua (Penyewa)
  tenant_name: string;
  tenant_phone: string;
  tenant_nik?: string | null;
  tenant_signature?: string | null;
  tenant_signed_at?: string | null;

  // Objek Sewa
  property_name: string;
  property_address?: string | null;
  facilities?: string[] | null;
  electricity_id?: string | null;
  water_id?: string | null;

  custom_clauses?: ContractClause[] | null;
  status: ContractStatus;
  created_at: string;
  updated_at: string;

  property?: Property;
  lease?: Lease;
}

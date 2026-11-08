-- ==============================================================================
-- SewaPribadi - Master Database Schema & Initial Data Seed for Supabase
-- Jalankan seluruh script SQL ini di: Supabase Dashboard > SQL Editor > Run
-- ==============================================================================

-- 1. Extension UUID
create extension if not exists "uuid-ossp";

-- 2. Master Properti
create table if not exists properties (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  address text,
  electricity_id text, -- ID meteran PLN
  water_id text,       -- ID meteran PDAM
  description text,
  facilities text[],
  monthly_rate numeric,
  min_rental_months integer default 6,
  is_public_listed boolean default true,
  photo_url text,
  photos text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Kontrak Sewa (Lease)
create table if not exists leases (
  id text primary key default gen_random_uuid()::text,
  property_id text references properties(id) on delete cascade not null,
  tenant_name text not null,
  tenant_phone text not null, -- format 628xxxx
  tenant_nik text,
  billing_cycle text not null check (billing_cycle in ('monthly', 'quarterly', 'semi_annual', 'annual')),
  rate_amount numeric not null,
  deposit_amount numeric default 0,
  start_date date not null,
  next_due_date date not null,
  status text not null default 'active' check (status in ('active', 'due_soon', 'overdue', 'vacant')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Transaksi Pemasukan & Pengeluaran
create table if not exists transactions (
  id text primary key default gen_random_uuid()::text,
  property_id text references properties(id) on delete cascade not null,
  lease_id text references leases(id) on delete set null,
  category text not null check (category in ('income_rent', 'income_deposit', 'expense_maintenance', 'expense_tax', 'expense_other')),
  amount numeric not null,
  transaction_date date default current_date not null,
  description text not null,
  receipt_file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Pengaturan Pemilik (Bank, Notifikasi & Template WA)
create table if not exists app_settings (
  id text primary key default 'default',
  bank_name text default 'BCA',
  account_number text default '8001234567',
  account_holder text default 'Ahmad Fauzi',
  contact_phone text default '081234567890',
  reminder_days_before integer default 7,
  default_cycle text default 'semi_annual',
  custom_wa_template text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabel Permohonan Calon Penyewa Mandiri (Self-Service Onboarding)
create table if not exists tenant_applications (
  id text primary key default gen_random_uuid()::text,
  property_id text references properties(id) on delete set null,
  full_name text not null,
  phone text not null,
  nik text,
  occupation text,
  family_members integer default 1,
  vehicles text,
  preferred_cycle text not null check (preferred_cycle in ('monthly', 'quarterly', 'semi_annual', 'annual')),
  move_in_date date not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Kontrak Sewa & Tanda Tangan Online (SPSM)
create table if not exists contracts (
  id text primary key default gen_random_uuid()::text,
  lease_id text references leases(id) on delete cascade not null,
  property_id text references properties(id) on delete cascade not null,
  contract_number text not null,
  start_date date not null,
  end_date date not null,
  billing_cycle text not null,
  rent_amount numeric not null,
  deposit_amount numeric default 0,
  owner_name text not null,
  owner_phone text not null,
  owner_signature text,
  owner_signed_at timestamp with time zone,
  tenant_name text not null,
  tenant_phone text not null,
  tenant_nik text,
  tenant_signature text,
  tenant_signed_at timestamp with time zone,
  property_name text not null,
  property_address text,
  facilities text[],
  electricity_id text,
  water_id text,
  custom_clauses jsonb,
  status text not null default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Aplikasi ini adalah aplikasi pengelolaan personal pemilik kontrakan.
-- Policy di bawah mengizinkan operasi penuh untuk klien anon Next.js.
-- ==============================================================================
alter table properties enable row level security;
alter table leases enable row level security;
alter table transactions enable row level security;
alter table app_settings enable row level security;
alter table tenant_applications enable row level security;
alter table contracts enable row level security;

-- Policy Properties
drop policy if exists "Allow all operations on properties" on properties;
create policy "Allow all operations on properties" on properties for all using (true) with check (true);

-- Policy Leases
drop policy if exists "Allow all operations on leases" on leases;
create policy "Allow all operations on leases" on leases for all using (true) with check (true);

-- Policy Transactions
drop policy if exists "Allow all operations on transactions" on transactions;
create policy "Allow all operations on transactions" on transactions for all using (true) with check (true);

-- Policy Settings
drop policy if exists "Allow all operations on app_settings" on app_settings;
create policy "Allow all operations on app_settings" on app_settings for all using (true) with check (true);

-- Policy Tenant Applications
drop policy if exists "Allow all operations on tenant_applications" on tenant_applications;
create policy "Allow all operations on tenant_applications" on tenant_applications for all using (true) with check (true);

-- Policy Contracts
drop policy if exists "Allow all operations on contracts" on contracts;
create policy "Allow all operations on contracts" on contracts for all using (true) with check (true);

-- ==============================================================================
-- INITIAL DEFAULT SETTINGS (Bersih & Siap Diisi Data Riil Anda)
-- ==============================================================================
insert into app_settings (id, bank_name, account_number, account_holder, contact_phone, reminder_days_before, default_cycle)
values ('default', 'BCA', '', '', '', 7, 'semi_annual')
on conflict (id) do nothing;

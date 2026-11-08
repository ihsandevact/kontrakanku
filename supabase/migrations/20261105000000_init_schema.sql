-- 1. UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Master Properti
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  electricity_id text, -- ID meteran PLN
  water_id text,       -- ID meteran PDAM
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Kontrak Sewa (Lease)
create table if not exists leases (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade not null,
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
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade not null,
  lease_id uuid references leases(id) on delete set null,
  category text not null check (category in ('income_rent', 'income_deposit', 'expense_maintenance', 'expense_tax', 'expense_other')),
  amount numeric not null,
  transaction_date date default current_date not null,
  description text not null,
  receipt_file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Pengaturan Pemilik (Bank & Template WA)
create table if not exists app_settings (
  id text primary key default 'default',
  bank_name text default 'BCA',
  account_number text default '1234567890',
  account_holder text default 'Nama Pemilik Kontrakan',
  reminder_days_before integer default 7,
  default_cycle text default 'semi_annual',
  custom_wa_template text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) - Permissive for Single Personal User
alter table properties enable row level security;
alter table leases enable row level security;
alter table transactions enable row level security;
alter table app_settings enable row level security;

create policy "Allow all operations on properties" on properties for all using (true) with check (true);
create policy "Allow all operations on leases" on leases for all using (true) with check (true);
create policy "Allow all operations on transactions" on transactions for all using (true) with check (true);
create policy "Allow all operations on app_settings" on app_settings for all using (true) with check (true);

-- Seed Initial Default Settings
insert into app_settings (id, bank_name, account_number, account_holder, reminder_days_before, default_cycle)
values ('default', 'BCA', '1234567890', 'Pemilik Kontrakan', 7, 'semi_annual')
on conflict (id) do nothing;

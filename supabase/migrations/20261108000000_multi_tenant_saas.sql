-- ==============================================================================
-- SewaPribadi - Multi-Tenant Public SaaS Platform Migration
-- Jalankan skrip ini di: Supabase Dashboard > SQL Editor > Run
-- ==============================================================================

-- 1. Pastikan ekstensi UUID aktif
create extension if not exists "uuid-ossp";

-- 2. Buat tabel Profil Pemilik Kontrakan (Public Landlord Profiles)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  slug text unique not null,
  business_name text not null,
  owner_name text not null,
  phone text not null,
  bank_name text default 'BCA',
  account_number text default '',
  account_holder text default '',
  reminder_days_before integer default 7,
  default_cycle text default 'semi_annual',
  custom_wa_template text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indeks unik untuk pencarian cepat berdasarkan slug katalog publik
create index if not exists idx_profiles_slug on public.profiles(slug);

-- 3. Fungsi & Trigger Otomatis: Buat Profil saat User Baru Mendaftar di Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_slug text;
  final_slug text;
  slug_count int;
begin
  -- Ambil slug dari metadata atau buat default dari nama usaha/ID
  raw_slug := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'slug', new.raw_user_meta_data->>'business_name', 'owner-' || substr(new.id::text, 1, 8)),
    '[^a-zA-Z0-9]+', '-', 'g'
  ));
  raw_slug := trim(both '-' from raw_slug);
  if length(raw_slug) = 0 then
    raw_slug := 'owner-' || substr(new.id::text, 1, 8);
  end if;

  -- Pastikan slug unik
  final_slug := raw_slug;
  select count(*) into slug_count from public.profiles where slug = final_slug;
  if slug_count > 0 then
    final_slug := raw_slug || '-' || substr(new.id::text, 1, 4);
  end if;

  insert into public.profiles (
    id,
    slug,
    business_name,
    owner_name,
    phone,
    bank_name,
    account_number,
    account_holder,
    reminder_days_before,
    default_cycle
  ) values (
    new.id,
    final_slug,
    coalesce(new.raw_user_meta_data->>'business_name', 'Kontrakan Saya'),
    coalesce(new.raw_user_meta_data->>'owner_name', 'Pemilik Kontrakan'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'bank_name', 'BCA'),
    coalesce(new.raw_user_meta_data->>'account_number', ''),
    coalesce(new.raw_user_meta_data->>'account_holder', coalesce(new.raw_user_meta_data->>'owner_name', '')),
    7,
    'semi_annual'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Pasang trigger ke auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Tambahkan kolom owner_id pada seluruh tabel entitas
alter table properties add column if not exists owner_id uuid references public.profiles(id) on delete cascade;
alter table leases add column if not exists owner_id uuid references public.profiles(id) on delete cascade;
alter table transactions add column if not exists owner_id uuid references public.profiles(id) on delete cascade;
alter table tenant_applications add column if not exists owner_id uuid references public.profiles(id) on delete cascade;
alter table contracts add column if not exists owner_id uuid references public.profiles(id) on delete cascade;

-- Tambahkan indeks untuk query per pemilik
create index if not exists idx_properties_owner on properties(owner_id);
create index if not exists idx_leases_owner on leases(owner_id);
create index if not exists idx_transactions_owner on transactions(owner_id);
create index if not exists idx_applications_owner on tenant_applications(owner_id);
create index if not exists idx_contracts_owner on contracts(owner_id);

-- 5. Konfigurasi ROW LEVEL SECURITY (RLS) Penuh
-- A. PROFILES
alter table profiles enable row level security;
drop policy if exists "Public can view landlord profiles" on profiles;
create policy "Public can view landlord profiles" on profiles for select using (true);

drop policy if exists "Owners can update own profile" on profiles;
create policy "Owners can update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "Owners can insert own profile" on profiles;
create policy "Owners can insert own profile" on profiles for insert with check (auth.uid() = id);

-- B. PROPERTIES
alter table properties enable row level security;
drop policy if exists "Public can view listed properties" on properties;
drop policy if exists "Owners can do everything on own properties" on properties;
drop policy if exists "Allow all operations on properties" on properties;

create policy "Public can view listed properties" on properties
  for select using (is_public_listed = true or auth.uid() = owner_id);

create policy "Owners can insert own properties" on properties
  for insert with check (auth.uid() = owner_id);

create policy "Owners can update own properties" on properties
  for update using (auth.uid() = owner_id);

create policy "Owners can delete own properties" on properties
  for delete using (auth.uid() = owner_id);

-- C. LEASES
alter table leases enable row level security;
drop policy if exists "Owners manage own leases" on leases;
drop policy if exists "Allow all operations on leases" on leases;

create policy "Owners manage own leases" on leases
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- D. TRANSACTIONS
alter table transactions enable row level security;
drop policy if exists "Owners manage own transactions" on transactions;
drop policy if exists "Allow all operations on transactions" on transactions;

create policy "Owners manage own transactions" on transactions
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- E. TENANT APPLICATIONS (Calon Penyewa)
alter table tenant_applications enable row level security;
drop policy if exists "Public can submit application" on tenant_applications;
drop policy if exists "Owners can view and manage received applications" on tenant_applications;
drop policy if exists "Allow all operations on tenant_applications" on tenant_applications;

create policy "Public can submit application" on tenant_applications
  for insert with check (true);

create policy "Owners can view and manage received applications" on tenant_applications
  for select using (auth.uid() = owner_id);

create policy "Owners can update received applications" on tenant_applications
  for update using (auth.uid() = owner_id);

create policy "Owners can delete received applications" on tenant_applications
  for delete using (auth.uid() = owner_id);

-- F. CONTRACTS (SPSM)
alter table contracts enable row level security;
drop policy if exists "Public can view and sign contract by id" on contracts;
drop policy if exists "Public can update signature" on contracts;
drop policy if exists "Owners manage own contracts" on contracts;
drop policy if exists "Allow all operations on contracts" on contracts;

create policy "Public and Owner can view contract" on contracts
  for select using (true);

create policy "Public and Owner can update contract" on contracts
  for update using (true);

create policy "Owners can insert contract" on contracts
  for insert with check (auth.uid() = owner_id);

create policy "Owners can delete contract" on contracts
  for delete using (auth.uid() = owner_id);

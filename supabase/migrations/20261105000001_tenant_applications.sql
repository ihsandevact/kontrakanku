-- 1. Tambah field promosi & katalog pada properties
alter table properties add column if not exists description text;
alter table properties add column if not exists facilities text[];
alter table properties add column if not exists monthly_rate numeric;
alter table properties add column if not exists is_public_listed boolean default true;
alter table properties add column if not exists photo_url text;

-- 2. Tambah kolom nomor HP kontak pemilik pada app_settings
alter table app_settings add column if not exists contact_phone text default '628123456789';

-- 3. Tabel Permohonan Calon Penyewa Mandiri
create table if not exists tenant_applications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete set null,
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

-- RLS Policies
alter table tenant_applications enable row level security;
create policy "Allow public insert tenant_applications" on tenant_applications for insert with check (true);
create policy "Allow all read tenant_applications" on tenant_applications for select using (true);
create policy "Allow all update tenant_applications" on tenant_applications for update using (true);
create policy "Allow all delete tenant_applications" on tenant_applications for delete using (true);

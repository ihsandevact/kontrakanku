-- ==============================================================================
-- Script Hapus / Bersihkan Seluruh Data Dummy di Supabase
-- Jalankan di: Supabase Dashboard > SQL Editor > Run
-- ==============================================================================

-- 1. Kosongkan semua data transaksi, kontrak sewa, permohonan, dan properti
truncate table transactions cascade;
truncate table leases cascade;
truncate table tenant_applications cascade;
truncate table properties cascade;

-- 2. Bersihkan pengaturan rekening pemilik agar siap diisi dengan data Anda
update app_settings
set
  account_number = '',
  account_holder = '',
  contact_phone = ''
where id = 'default';

# SewaPribadi - Aplikasi Manajemen Rumah Kontrakan Mandiri

Aplikasi web & Progressive Web App (PWA) untuk manajemen properti sewa kontrakan personal dengan arsitektur **Zero Cost (Rp 0/bulan)**:
- **Pengingat Jatuh Tempo Otomatis:** Memonitor status unit (*Aktif Lancar*, *Mendekati Tempo*, *Jatuh Tempo*, dan *Kosong*).
- **One-Click WhatsApp Billing Generator:** Mengirim rincian tagihan lengkap ke penyewa dalam 1-klik tanpa langganan API berbayar.
- **Formulir Pendaftaran Mandiri Calon Penyewa (`/sewa`):** Calon penyewa dapat mengisi data diri, pekerjaan, jumlah penghuni, kepemilikan kendaraan, siklus sewa, dan tanggal masuk secara mandiri dari ponsel mereka.
- **1-Click Approval di Dasbor (`/applications`):** Pemilik dapat meninjau data permohonan calon penyewa dan langsung menyetujuinya menjadi kontrak sewa aktif tanpa ketik ulang.
- **Landing Page Promosi Publik (`/katalog`):** Etalase publik menarik untuk mempromosikan unit-unit kontrakan (foto, fasilitas, harga, status ketersediaan) yang siap dibagikan ke media sosial, OLX, atau WhatsApp.
- **Fleksibilitas Siklus Sewa:** Default **6 bulan (Semesteran)**, serta mendukung Bulanan, 3 Bulan, dan Tahunan.
- **Buku Kas & Laba Bersih Riil:** Pencatatan uang sewa masuk, deposit, biaya perbaikan pompa/tukang, PBB, dan retribusi RT/RW.

---

## 🚀 Rute & Fitur Aplikasi

### Area Publik (Calon Penyewa & Promosi):
1. **`/katalog` (Landing Page Promosi):**
   - Menampilkan unit-unit kontrakan dengan status *Siap Huni* vs *Sedang Terisi*.
   - Rincian fasilitas (Listrik token, PDAM, parkir, dll.) dan kisaran harga sewa.
   - Tombol **"Daftar / Booking Unit"** & **"Tanya Pemilik via WhatsApp"**.
2. **`/sewa` (Formulir Pendaftaran Mandiri):**
   - Formulir ramah ponsel untuk calon penyewa mengisi data identitas, pekerjaan, jumlah penghuni, dan rencana tanggal masuk.
3. **`/sewa/sukses` (Konfirmasi & WhatsApp):**
   - Ringkasan pendaftaran dan tombol instan kirim konfirmasi ke WhatsApp pemilik kontrakan.

### Area Pemilik (Dasbor Manajemen):
1. **`/` (Dasbor Utama):**
   - Statistik okupansi, tagihan jatuh tempo, kas bulan berjalan, laba bersih riil, dan banner notifikasi permohonan baru.
2. **`/properties` (Kelola Unit):**
   - Rincian properti, nomor meter PLN/PDAM, data penyewa, tombol *Perpanjang*, dan *Tagih WA*.
3. **`/applications` (Pusat Permohonan Masuk):**
   - Daftar calon penyewa yang mendaftar online dengan tombol aksi **"Setujui & Jadikan Penyewa"** (1-klik otomatis buat kontrak sewa), **"Chat WA"**, dan **"Tolak"**.
4. **`/finance` (Buku Kas & Cashflow):**
   - Riwayat uang masuk dan pengeluaran operasional unit.
5. **`/settings` (Pengaturan):**
   - Rekening bank, kontak WhatsApp pemilik, kustomisasi template tagihan, dan **Pusat Tautan Publik** (tombol salin link form dan link katalog).

---

## 🛠️ Menjalankan Aplikasi

1. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Buka di peramban: [http://localhost:3000](http://localhost:3000).

2. **Jalankan Unit Tests:**
   ```bash
   npx tsx scripts/test-logic.ts
   ```

3. **Build Produksi:**
   ```bash
   npm run build
   ```

---

## 🗄️ Database Supabase (Opsional)

Aplikasi memiliki mode ganda (*dual storage mode*):
- **Local Storage Mode:** Langsung berjalan offline di browser tanpa perlu setup apapun.
- **Supabase Cloud Mode:** Untuk sinkronisasi cloud gratis, jalankan script SQL di `supabase/migrations/` dan atur `.env.local`:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

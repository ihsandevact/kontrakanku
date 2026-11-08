'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  FileSignature,
  FileText,
  Globe,
  HelpCircle,
  KeyRound,
  MessageSquare,
  Receipt,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Zap,
  XCircle,
  Send,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeDemoTab, setActiveDemoTab] = useState<'whatsapp' | 'finance' | 'catalog' | 'contract'>('whatsapp');
  const [copiedWa, setCopiedWa] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const sampleWaMessage = `Halo Pak Ahmad, selamat siang 🙏
Mengingatkan sewa Unit Melati 01 akan jatuh tempo pada 10 November 2026.

📋 Rincian Tagihan:
• Sewa Kamar: Rp 1.500.000
• Biaya Listrik: Rp 150.000
• Total Pembayaran: Rp 1.650.000

Pembayaran dapat ditransfer ke:
🏦 Bank BCA: 8820-192-881
a.n Budi Santoso (Pemilik)

Mohon konfirmasi bukti transfer jika sudah melakukan pembayaran ya Pak. Terima kasih banyak! 🙏`;

  const handleCopyWa = () => {
    navigator.clipboard.writeText(sampleWaMessage);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'Apakah Kontrakin benar-benar 100% gratis digunakan?',
      a: 'Ya, Kontrakin dapat digunakan secara gratis tanpa biaya langganan bulanan tersembunyi dan tanpa potongan komisi sewa sama sekali. Seluruh uang sewa 100% langsung ditransfer penyewa ke rekening bank pribadi Anda.',
    },
    {
      q: 'Apakah penyewa saya juga wajib mendownload aplikasi atau membuat akun?',
      a: 'Tidak perlu sama sekali! Calon penyewa dan penyewa Anda tidak perlu membuat akun atau login. Mereka bisa melihat katalog unit di web browser, mengajukan permohonan sewa, dan menandatangani surat kontrak sewa digital langsung dari smartphone mereka.',
    },
    {
      q: 'Bagaimana jika saya memiliki beberapa kontrakan atau indekos di lokasi berbeda?',
      a: 'Anda dapat mengelola banyak properti sekaligus (misal: Kontrakan Mawar di Jakarta Selatan dan Paviliun Berkah di Depok) dalam satu akun dasbor yang sama. Setiap properti bisa memiliki banyak unit atau kamar tanpa batas.',
    },
    {
      q: 'Apakah surat perjanjian sewa (SPSM) sah secara hukum?',
      a: 'Ya, dokumen SPSM disusun berdasarkan asas kebebasan berkontrak (Pasal 1338 KUHPerdata) yang memuat hak, kewajiban, tata cara deposit, dan aturan pemeliharaan fasilitas properti. Dokumen dilengkapi stempel tanda tangan digital, tanggal sah, dan dapat dicetak/disimpan sebagai PDF resmi.',
    },
    {
      q: 'Bagaimana keamanan data properti dan nomor rekening saya?',
      a: 'Data akun, unit properti, data penyewa, dan catatan buku kas Anda terisolasi secara mandiri per akun pemilik kontrakan dan tidak dapat diakses oleh pemilik kontrakan lain.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-20 py-4 sm:py-10">
      {/* ==========================================
          1. HERO SECTION
          ========================================== */}
      <section className="text-center space-y-4 sm:space-y-5 max-w-3xl mx-auto pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Platform Manajemen Kontrakan Mandiri di Indonesia</span>
        </div>

        <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Kelola Kontrakan Lebih Rapi,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Bebas Nunggak & Laba Jelas
          </span>
        </h1>

        <p className="text-xs sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto px-1">
          Otomasi tagihan sewa WhatsApp 1-klik, pencatatan kas laba bersih riil, etalase toko katalog online gratis, dan surat kontrak sewa digital sah (SPSM).
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition cursor-pointer"
          >
            <span>Mulai Kelola Gratis Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 shadow-2xs transition"
          >
            <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Masuk ke Dasbor Pemilik</span>
          </Link>
        </div>

        {/* Guarantees Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-6 pt-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>100% Gratis Tanpa Komisi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Data Terisolasi & Aman</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Akses Cepat dari Smartphone</span>
          </div>
        </div>
      </section>

      {/* ==========================================
          2. INTERACTIVE APP SHOWCASE MOCKUP
          ========================================== */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl border border-slate-800">
          {/* Header Bar Mockup */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 mb-3 sm:mb-4 px-1 sm:px-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80 shrink-0" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 shrink-0" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 shrink-0" />
              <span className="text-[11px] sm:text-xs text-slate-400 font-mono ml-1 sm:ml-2 truncate hidden xs:inline">
                kontrakin-demo.app
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-400 font-medium shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Simulasi Interaktif</span>
            </div>
          </div>

          {/* Tab Switchers: 2 Kolom Seimbang di Mobile, 4 Kolom di Desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3.5 sm:mb-6">
            <button
              onClick={() => setActiveDemoTab('whatsapp')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 sm:p-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[42px] ${
                activeDemoTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Tagihan WA</span>
            </button>

            <button
              onClick={() => setActiveDemoTab('finance')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 sm:p-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[42px] ${
                activeDemoTab === 'finance'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Buku Kas</span>
            </button>

            <button
              onClick={() => setActiveDemoTab('catalog')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 sm:p-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[42px] ${
                activeDemoTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Katalog Web</span>
            </button>

            <button
              onClick={() => setActiveDemoTab('contract')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 sm:p-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[42px] ${
                activeDemoTab === 'contract'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileSignature className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Kontrak SPSM</span>
            </button>
          </div>

          {/* Interactive Screen Display */}
          <div className="bg-slate-950 rounded-2xl p-3 sm:p-6 border border-slate-800/80 min-h-[310px] flex flex-col justify-center">
            {/* TAB 1: TAGIHAN WHATSAPP */}
            {activeDemoTab === 'whatsapp' && (
              <div className="space-y-3.5 sm:space-y-4 max-w-xl mx-auto w-full">
                {/* Simulated WA Header */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-inner shrink-0">
                      AF
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold text-white flex flex-wrap items-center gap-1.5">
                        <span className="truncate">Ahmad Faqih</span>
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 whitespace-nowrap">
                          Unit Melati 01
                        </span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-emerald-400 truncate">Online • Siap kirim tagihan</div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyWa}
                    className="self-start xs:self-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition shrink-0 cursor-pointer"
                  >
                    {copiedWa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWa ? 'Tersalin!' : 'Salin Pesan'}</span>
                  </button>
                </div>

                {/* Simulated Chat Bubble */}
                <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed shadow-sm break-words">
                  {sampleWaMessage}
                </div>

                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-[10px] sm:text-xs text-slate-400 pt-1">
                  <span>💡 Pesan otomatis siap dikirim dalam 1-klik</span>
                  <span className="text-emerald-400 font-semibold self-start xs:self-auto">1-Klik ke WhatsApp</span>
                </div>
              </div>
            )}

            {/* TAB 2: BUKU KAS RIIL */}
            {activeDemoTab === 'finance' && (
              <div className="space-y-3.5 sm:space-y-4 max-w-xl mx-auto w-full">
                {/* Stats Summary: 2 Kolom di Mobile + 1 Kolom Penuh untuk Laba Bersih */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Pemasukan Sewa</div>
                    <div className="text-xs sm:text-base font-bold text-emerald-400 mt-0.5 truncate">+Rp 7.200.000</div>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Biaya Servis</div>
                    <div className="text-xs sm:text-base font-bold text-rose-400 mt-0.5 truncate">-Rp 450.000</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center flex flex-col justify-center">
                    <div className="text-[9px] sm:text-[10px] text-emerald-300 uppercase font-bold">Laba Bersih Riil</div>
                    <div className="text-xs sm:text-base font-extrabold text-white mt-0.5 truncate">Rp 6.750.000</div>
                  </div>
                </div>

                {/* Simulated Ledger Rows */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-xs">
                        ↓
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate text-[11px] sm:text-xs">Sewa Melati 01 (Ahmad Faqih)</div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">10 Nov 2026 • Periode Nov - Des</div>
                      </div>
                    </div>
                    <div className="font-bold text-emerald-400 shrink-0 text-[11px] sm:text-xs whitespace-nowrap">+Rp 1.650.000</div>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0 text-xs">
                        ↑
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate text-[11px] sm:text-xs">Servis Pompa Air & Kran</div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">05 Nov 2026 • Biaya Unit</div>
                      </div>
                    </div>
                    <div className="font-bold text-rose-400 shrink-0 text-[11px] sm:text-xs whitespace-nowrap">-Rp 450.000</div>
                  </div>
                </div>

                <div className="text-[10px] sm:text-xs text-slate-400 text-center pt-1">
                  💡 Uang kontrakan tidak lagi tercampur uang dapur. Laba bersih terhitung otomatis.
                </div>
              </div>
            )}

            {/* TAB 3: WEB TOKO KATALOG */}
            {activeDemoTab === 'catalog' && (
              <div className="space-y-3.5 sm:space-y-4 max-w-xl mx-auto w-full">
                {/* Storefront Header */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">Berkah Residence Mandiri</div>
                      <div className="text-[9px] sm:text-[10px] text-emerald-400 font-mono truncate max-w-[160px] xs:max-w-[220px] sm:max-w-none">
                        kontrakin.com/katalog/berkah-residence
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold shrink-0">
                    Etalase Publik
                  </span>
                </div>

                {/* Simulated Unit Card */}
                <div className="p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 sm:space-y-3">
                  <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-1 sm:gap-2">
                    <div className="min-w-0">
                      <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-medium">
                        Tersedia Segera
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">Paviliun Mawar 02 (Lantai 1)</h4>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">
                        Rp 1.350.000 <span className="text-slate-400 font-normal text-[10px] sm:text-xs">/ bulan</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 xs:text-right shrink-0">
                      Deposit: Rp 500.000<br className="hidden xs:inline" />
                      <span className="xs:hidden"> • </span>Min: Bebas (1 Bulan)
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-slate-300">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">AC Dingin</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">KM Dalam</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Listrik Token</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">WiFi</span>
                  </div>

                  <div className="pt-1 flex flex-col xs:flex-row gap-2">
                    <button className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition cursor-default">
                      Ajukan Sewa Online
                    </button>
                    <button className="py-2 px-3 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium text-center transition cursor-default">
                      Tanya Pemilik
                    </button>
                  </div>
                </div>

                <div className="text-[10px] sm:text-xs text-slate-400 text-center pt-1">
                  💡 Setiap pemilik otomatis punya toko online untuk dibagikan ke WhatsApp & Medsos.
                </div>
              </div>
            )}

            {/* TAB 4: KONTRAK SPSM */}
            {activeDemoTab === 'contract' && (
              <div className="space-y-3.5 sm:space-y-4 max-w-xl mx-auto w-full">
                {/* Contract Mockup Header */}
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 truncate">SPSM/2026/XI/BERKAH-02</span>
                    <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Sah & Terverifikasi
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    Surat Perjanjian Sewa Mandiri (SPSM)
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">
                    Berdasarkan KUHPerdata Pasal 1338 • Mengikat Pemilik & Penyewa
                  </p>
                </div>

                {/* Clauses Sneak Peek */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-[10px] sm:text-[11px] text-slate-300">
                  <div className="flex gap-2">
                    <span className="font-bold text-emerald-400 shrink-0">Pasal 1:</span>
                    <span>Masa sewa 1 tahun dengan jadwal jatuh tempo tiap tanggal 10.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-emerald-400 shrink-0">Pasal 2:</span>
                    <span>Deposit jaminan dikembalikan utuh bila fasilitas terawat baik.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-emerald-400 shrink-0">Pasal 3:</span>
                    <span>Penyewa dilarang mengalihkan sewa tanpa persetujuan pemilik.</span>
                  </div>
                </div>

                {/* Signatures Stamp */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileSignature className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">Tanda Tangan Digital Sah</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">Diteken langsung dari HP • Siap Cetak PDF</div>
                    </div>
                  </div>
                  <button className="w-full xs:w-auto px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs text-center shrink-0 transition cursor-default">
                    Unduh PDF
                  </button>
                </div>

                <div className="text-[10px] sm:text-xs text-slate-400 text-center pt-1">
                  💡 Tidak butuh kuitansi kertas atau materai manual. Sah secara hukum tertulis.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
          3. HIGHLIGHT FITUR UTAMA (ICON-FIRST)
          ========================================== */}
      <section id="fitur" className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-xl border border-emerald-800/40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-center">
          {/* Fitur 1: Tagihan WhatsApp */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/30 transition">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center mb-1.5 sm:mb-2 shadow-inner shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="text-xs sm:text-sm font-bold text-white leading-snug">
              Tagihan WhatsApp
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-200/80 mt-0.5">
              1-Klik Otomatis
            </div>
          </div>

          {/* Fitur 2: Buku Kas Riil */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-teal-500/30 transition">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-500/15 border border-teal-400/30 text-teal-300 flex items-center justify-center mb-1.5 sm:mb-2 shadow-inner shrink-0">
              <Wallet className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="text-xs sm:text-sm font-bold text-white leading-snug">
              Buku Kas Riil
            </div>
            <div className="text-[10px] sm:text-[11px] text-teal-200/80 mt-0.5">
              Laba Bersih Akurat
            </div>
          </div>

          {/* Fitur 3: Katalog Promosi */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/30 transition">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center mb-1.5 sm:mb-2 shadow-inner shrink-0">
              <Globe className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="text-xs sm:text-sm font-bold text-white leading-snug">
              Katalog Promosi
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-200/80 mt-0.5">
              Toko Sewa Mandiri
            </div>
          </div>

          {/* Fitur 4: Kontrak Digital */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-teal-500/30 transition">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-500/15 border border-teal-400/30 text-teal-300 flex items-center justify-center mb-1.5 sm:mb-2 shadow-inner shrink-0">
              <FileSignature className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="text-xs sm:text-sm font-bold text-white leading-snug">
              Kontrak SPSM
            </div>
            <div className="text-[10px] sm:text-[11px] text-teal-200/80 mt-0.5">
              Tanda Tangan Online
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          4. MASALAH NYATA VS SOLUSI KONTRAKIN
          ========================================== */}
      <section id="solusi" className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-1.5 sm:space-y-2 max-w-xl mx-auto px-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <span>Mengapa Juragan Memilih Kontrakin</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tinggalkan Cara Lama yang Menguras Waktu & Pikiran
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Hampir semua pemilik kontrakan menghadapi 4 masalah klasik ini sebelum menggunakan Kontrakin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
          {/* Komparasi 1: Nunggak */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Cara Lama: Sering Kelupaan & Nunggak</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
                  Lupa tanggal sewa tiap kamar. Penyewa sudah telat berminggu-minggu baru tersadar saat uang mulai menipis.
                </p>
              </div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                <span className="font-bold">Solusi Kontrakin:</span> Indikator warna otomatis mendeteksi status H-3, Hari H, dan keterlambatan pembayaran secara real-time.
              </div>
            </div>
          </div>

          {/* Komparasi 2: Canggung Menagih */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Cara Lama: Sungkan Merangkai Kata Tagihan</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
                  Bingung dan tidak enak hati merangkai kata sopan di WhatsApp agar penyewa tidak merasa tersinggung.
                </p>
              </div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                <span className="font-bold">Solusi Kontrakin:</span> Draft tagihan WhatsApp santun & profesional siap kirim dalam 1 sentuhan, lengkap dengan rekening bank.
              </div>
            </div>
          </div>

          {/* Komparasi 3: Kas Campur Aduk */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Cara Lama: Uang Sewa Tercampur Uang Dapur</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
                  Catatan kuitansi tercecer. Tidak tahu pasti berapa laba bersih setelah dipotong biaya pipa, genteng bocor, atau pompa air.
                </p>
              </div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                <span className="font-bold">Solusi Kontrakin:</span> Buku kas otomatis memisahkan pemasukan sewa dan biaya perbaikan. Laba bersih tersaji transparan.
              </div>
            </div>
          </div>

          {/* Komparasi 4: Perjanjian Lisan */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Cara Lama: Cuma Modal Percaya Lisan</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
                  Tanpa perjanjian tertulis resmi, rawan sengketa saat penyewa kabur meninggalkan tagihan listrik atau merusak fasilitas unit.
                </p>
              </div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                <span className="font-bold">Solusi Kontrakin:</span> Surat Perjanjian Sewa Mandiri (SPSM) berpasal hukum standar diteken digital dari HP dan siap unduh PDF.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          5. CARA KERJA 3 LANGKAH
          ========================================== */}
      <section id="cara-kerja" className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-1.5 sm:space-y-2 max-w-xl mx-auto px-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span>Alur Praktis</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            3 Langkah Mudah untuk Memulai
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tidak butuh setup rumit. Dalam 1 menit, sistem manajemen kontrakan Anda siap bekerja.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          {/* Step 1 */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative space-y-2.5 sm:space-y-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-emerald-600/20">
              1
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Input Data Properti & Unit
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Masukkan nama kontrakan, nomor kamar, harga bulanan/tahunan, dan unggah foto. Anda otomatis mendapatkan alamat toko web katalog pribadi.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative space-y-2.5 sm:space-y-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-teal-600/20">
              2
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Tanda Tangani Kontrak SPSM
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Buat surat perjanjian sewa digital. Kirim tautan ke calon penyewa agar mereka menandatangani langsung dari layar smartphone masing-masing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative space-y-2.5 sm:space-y-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-emerald-600/20">
              3
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Tagih 1-Klik & Pantau Kas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Saat tanggal jatuh tempo tiba, kirim tagihan ramah ke WhatsApp penyewa dalam 1 klik. Catat uang masuk dan pantau laba bersih secara riil.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          6. 4 FITUR UTAMA LENGKAP
          ========================================== */}
      <section className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-1.5 sm:space-y-2 max-w-xl mx-auto px-1">
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Semua yang Dibutuhkan Juragan Kontrakan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Didesain khusus untuk pemilik rumah kontrakan, paviliun, dan kos-kosan mandiri di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
          {/* Fitur 1 */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2.5 sm:space-y-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
              Pengingat Tagihan WhatsApp 1-Klik
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Sistem otomatis mendeteksi jatuh tempo sewa dan menyiapkan pesan WhatsApp sopan lengkap dengan rincian unit, nomor rekening bank, dan batas pembayaran—langsung terkirim ke WhatsApp penyewa.
            </p>
          </div>

          {/* Fitur 2 */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2.5 sm:space-y-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
              Buku Kas Laba Bersih Riil
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Catat setiap uang masuk sewa dan biaya perbaikan genteng, pipa, atau cat unit. Ketahui secara pasti berapa uang bersih yang Anda hasilkan tanpa pusing menghitung manual.
            </p>
          </div>

          {/* Fitur 3 */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2.5 sm:space-y-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
              Tautan Katalog Online & Permohonan Mandiri
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Dapatkan tautan website khusus untuk usaha kontrakan Anda (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 font-mono text-xs">kontrakin.com/katalog/nama-usaha</code>). Calon penyewa bisa melihat ketersediaan unit dan langsung mengajukan sewa mandiri.
            </p>
          </div>

          {/* Fitur 4 */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2.5 sm:space-y-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileSignature className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
              Surat Perjanjian Sewa Digital (SPSM)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Lindungi properti Anda dengan kontrak sewa resmi berpasal hukum standar. Penyewa dapat menandatangani dokumen secara digital langsung dari layar smartphone dan mencetak PDF resmi.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          7. PERTANYAAN UMUM (FAQ) ACCORDION
          ========================================== */}
      <section id="faq" className="space-y-5 sm:space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tanya Jawab</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Segala hal yang perlu Anda ketahui sebelum menggunakan Kontrakin.
          </p>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-3.5 sm:p-5 text-left flex items-center justify-between gap-3 sm:gap-4 font-semibold text-xs sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                >
                  <span className="leading-snug">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-2.5 sm:pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          8. CALL TO ACTION SECTION
          ========================================== */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center space-y-4 sm:space-y-5 shadow-xl shadow-emerald-700/20">
        <h2 className="text-xl xs:text-2xl sm:text-4xl font-extrabold tracking-tight max-w-xl mx-auto">
          Siap Mengelola Kontrakan Anda dengan Tenang & Tertib?
        </h2>
        <p className="text-xs sm:text-base text-emerald-100 max-w-lg mx-auto">
          Daftarkan kontrakan Anda sekarang juga. Hanya butuh 1 menit untuk memulai dan 100% gratis selamanya.
        </p>
        <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.98] cursor-pointer"
          >
            <span>Daftar Akun Pemilik Kontrakan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-emerald-700/60 hover:bg-emerald-700/80 text-white font-semibold text-xs sm:text-sm border border-emerald-500/40 transition cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Masuk ke Akun Saya</span>
          </Link>
        </div>
      </section>

      {/* ==========================================
          9. SAAS FOOTER
          ========================================== */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 pt-8 sm:pt-10 pb-6 text-slate-500 dark:text-slate-400 text-xs space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              kontrak<span className="text-emerald-600 dark:text-emerald-400">in</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] sm:text-xs">Platform Manajemen Kontrakan Mandiri</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 text-xs">
            <a href="#fitur" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Fitur</a>
            <a href="#solusi" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Solusi</a>
            <a href="#cara-kerja" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Cara Kerja</a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">FAQ</a>
            <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Masuk</Link>
            <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Daftar Akun</Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-center sm:text-left">
          <div>
            © 2026 kontrakin. Didesain khusus untuk Juragan Kontrakan & Indekos di Indonesia.
          </div>
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Data Terisolasi & Terproteksi</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

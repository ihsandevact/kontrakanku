'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { formatSlug } from '@/lib/auth';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Home,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const baseSlug = formatSlug(businessName);
    if (!baseSlug || baseSlug.length < 2) {
      setErrorMessage('Harap masukkan nama usaha kontrakan yang valid (minimal 2 karakter).');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal harus terdiri dari 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        email: email.trim(),
        password,
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        slug: baseSlug,
      });

      if (res.success) {
        // Registration successful -> redirect to dashboard
        router.replace('/');
      } else {
        setErrorMessage(res.error || 'Pendaftaran gagal. Silakan coba kembali.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage('Terjadi kesalahan saat memproses pendaftaran akun.');
    } finally {
      setIsLoading(false);
    }
  };

  const previewSlug = formatSlug(businessName) || 'nama-kontrakan';

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full py-3 sm:py-8 my-auto">
      <div className="w-full max-w-lg my-auto p-4 xs:p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-5 sm:space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Pendaftaran Pemilik Mandiri</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
              Daftar Akun <span className="text-emerald-600 dark:text-emerald-400">KontrakinAja!</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Mulai kelola unit kontrakan Anda dengan rapi, tagihan WhatsApp otomatis, dan dapatkan web katalog online gratis.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* ==========================================
              BAGIAN 1: PROFIL KONTRAKAN & KATALOG
              ========================================== */}
          <div className="space-y-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>1. Profil Properti & Katalog</span>
            </div>

            {/* Nama Usaha Kontrakan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Usaha / Komplek Kontrakan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Kontrakan Berkah Romangpolong"
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                />
              </div>
            </div>

            {/* Live Auto-Generated URL Badge */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/25 text-xs text-emerald-800 dark:text-emerald-300">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block sm:inline">
                    Tautan Web Etalase:
                  </span>{' '}
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    kontrakinaja.com/katalog/{previewSlug}
                  </span>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                💡 Dibuat otomatis oleh sistem & dapat dipersonalisasi di menu Pengaturan.
              </p>
            </div>
          </div>

          {/* ==========================================
              BAGIAN 2: KONTAK & AKUN MASUK
              ========================================== */}
          <div className="space-y-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>2. Kontak & Kredensial Masuk</span>
            </div>

            {/* Grid: Nama Pemilik & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pemilik <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Haji Ahmad Fauzi"
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Grid: Email & Kata Sandi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="w-full pl-9 pr-9 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantees Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 py-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% Gratis</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Siap Pakai 1 Menit</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Data Aman Terisolasi</span>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mendaftarkan Akun Anda...</span>
              </>
            ) : (
              <>
                <span>Daftar Akun Pemilik Kontrakan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login & Return Home */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center space-y-2.5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sudah memiliki akun pemilik?{' '}
            <Link
              href="/login"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
            >
              Masuk ke Dasbor
            </Link>
          </p>

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda KontrakinAja!</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

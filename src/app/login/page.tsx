'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  Lock,
  Mail,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage('Harap masukkan kata sandi akun Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Support email or fallback to demo account if left blank
      const loginEmail = email.trim() || 'demo@kontrakinaja.com';
      const res = await login(loginEmail, password);

      if (res.success) {
        router.replace(redirectTarget);
      } else {
        setErrorMessage(
          res.error || 'Email atau kata sandi salah. Silakan periksa kembali email dan kata sandi Anda.'
        );
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Terjadi kesalahan saat memproses login. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full py-4 sm:py-8 my-auto">
      <div className="w-full max-w-sm sm:max-w-md my-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <Building2 className="w-7 h-7" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            <span>Akses Masuk Pemilik</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            Kontrakin<span className="text-emerald-600 dark:text-emerald-400">Aja!</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Masuk untuk mengelola unit kontrakan, tagihan sewa WhatsApp, dan pencatatan kas laba bersih Anda di KontrakinAja!.
          </p>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Inputs */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Pemilik <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Kata Sandi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi akun Anda"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer pt-3"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Memverifikasi Akses...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Dasbor</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1.5">
        <span className="text-xs text-slate-600 dark:text-slate-400 block">
          Belum punya akun pemilik kontrakan?
        </span>
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Daftar Akun Baru Sekarang (Gratis)</span>
        </Link>
      </div>

      {/* Footer Return Link */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Beranda</span>
        </Link>
      </div>
    </div>
  </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-[60vh] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

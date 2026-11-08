'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRight,
  Building2,
  Compass,
  Home,
  LayoutDashboard,
  LogIn,
  Sparkles,
  UserPlus,
} from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isHome = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-black text-xl text-emerald-600 dark:text-emerald-400 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="tracking-tight text-slate-900 dark:text-white font-extrabold text-lg">
            kontrak<span className="text-emerald-600 dark:text-emerald-400">in</span>
          </span>
        </Link>

        {/* Navigation Anchors / Links */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            {isHome ? (
              <>
                <a href="#fitur" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Fitur
                </a>
                <a href="#solusi" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Solusi
                </a>
                <a href="#cara-kerja" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Cara Kerja
                </a>
                <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  FAQ
                </a>
                <Link
                  href="/katalog"
                  className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition font-bold"
                >
                  <Compass className="w-4 h-4" />
                  <span>Katalog Unit</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  <Home className="w-4 h-4" />
                  <span>Beranda</span>
                </Link>
                <Link
                  href="/katalog"
                  className={`inline-flex items-center gap-1.5 transition ${
                    pathname.startsWith('/katalog')
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Katalog Unit</span>
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated ? (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xs shadow-emerald-600/20 active:scale-[0.98] transition cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Buka Dashboard</span>
            </Link>
          ) : isAuthPage ? (
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                ← Beranda
              </Link>
              {pathname === '/login' ? (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xs transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar Akun</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xs transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </Link>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xs shadow-emerald-600/20 active:scale-[0.98] transition cursor-pointer shrink-0"
              >
                <span>Daftar Gratis</span>
                <span className="hidden sm:inline">🚀</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

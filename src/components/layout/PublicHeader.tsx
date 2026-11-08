'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Compass } from 'lucide-react';

export const PublicHeader: React.FC = () => {
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
            Kontrakin<span className="text-emerald-600 dark:text-emerald-400">Aja!</span>
          </span>
        </Link>

        {/* Navigation Anchors for Landing Page */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
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
        </nav>

        {/* Action Buttons: Pure Public Guest Login/Register */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
        </div>
      </div>
    </header>
  );
};

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sparkles,
  ExternalLink,
  Calendar,
  Home,
  Building2,
  UserCheck,
  WalletCards,
  Settings,
} from 'lucide-react';

interface RouteMeta {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const { profile } = useAuth();

  const routeMeta: RouteMeta = useMemo(() => {
    if (pathname === '/') {
      return {
        title: 'Beranda Kontrakan',
        subtitle: 'Ringkasan operasional unit dan pemantauan jatuh tempo',
        icon: Home,
      };
    }
    if (pathname.startsWith('/properties')) {
      return {
        title: 'Kelola Properti & Kamar',
        subtitle: 'Daftar unit kontrakan, kamar sewa, dan status keterisian',
        icon: Building2,
      };
    }
    if (pathname.startsWith('/applications')) {
      return {
        title: 'Permohonan Calon Penyewa',
        subtitle: 'Pengajuan sewa masuk dari etalase katalog online Anda',
        icon: UserCheck,
      };
    }
    if (pathname.startsWith('/finance')) {
      return {
        title: 'Buku Kas Keuangan',
        subtitle: 'Pencatatan arus kas sewa masuk, pengeluaran, dan laba operasional',
        icon: WalletCards,
      };
    }
    if (pathname.startsWith('/settings')) {
      return {
        title: 'Pengaturan Akun & Usaha',
        subtitle: 'Profil pemilik, tautan katalog mandiri, dan nomor WhatsApp',
        icon: Settings,
      };
    }
    return {
      title: 'Dasbor Kontrakan',
      subtitle: 'Panel manajemen sewa kontrakan mandiri',
      icon: Home,
    };
  }, [pathname]);

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const PageIcon = routeMeta.icon;

  return (
    <header className="hidden md:flex h-16 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur items-center justify-between px-6 select-none">
      {/* Left: Dynamic Page Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
          <PageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-none truncate">
            {routeMeta.title}
          </h1>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-1">
            {routeMeta.subtitle}
          </span>
        </div>
      </div>

      {/* Right: Date Badge & Quick Action Button */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{todayFormatted}</span>
        </div>

        <Link
          href={profile?.slug ? `/katalog/${profile.slug}` : '/katalog'}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition shadow-2xs hover:scale-102 active:scale-98"
          title="Buka etalase website katalog online publik Anda"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Katalog Publik</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </Link>
      </div>
    </header>
  );
};

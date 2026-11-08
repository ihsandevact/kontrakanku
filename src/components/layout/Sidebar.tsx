'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import {
  Home,
  Building2,
  WalletCards,
  Settings,
  UserCheck,
  Sparkles,
  ExternalLink,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  dueSoonCount?: number;
  pendingAppsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  dueSoonCount = 0,
  pendingAppsCount = 0,
}) => {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  const navItems = [
    {
      label: 'Beranda',
      href: '/',
      icon: Home,
      badge: dueSoonCount > 0 ? dueSoonCount : null,
      badgeColor: 'bg-amber-500 text-white',
      badgeTitle: `${dueSoonCount} tagihan perlu perhatian`,
    },
    {
      label: 'Properti',
      href: '/properties',
      icon: Building2,
    },
    {
      label: 'Permohonan',
      href: '/applications',
      icon: UserCheck,
      badge: pendingAppsCount > 0 ? pendingAppsCount : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      badgeTitle: `${pendingAppsCount} calon penyewa baru`,
    },
    {
      label: 'Keuangan',
      href: '/finance',
      icon: WalletCards,
    },
    {
      label: 'Pengaturan',
      href: '/settings',
      icon: Settings,
    },
  ];

  const ownerInitial = (profile?.owner_name || profile?.business_name || 'J')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 select-none shadow-xs">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg text-emerald-700 dark:text-emerald-400 group min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="tracking-tight text-slate-900 dark:text-white font-black text-lg leading-none">
                  kontrak<span className="text-emerald-600 dark:text-emerald-400">in</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 leading-none">
                  Juragan
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate mt-1 leading-none">
                {profile?.business_name || 'Manajemen Mandiri'}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col justify-between py-4 px-3 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                Menu Utama
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && item.badge > 0 ? (
                        <span
                          title={item.badgeTitle}
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full shrink-0 shadow-xs ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 opacity-70" />
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Storefront Mini Banner Widget */}
          <div className="pt-4 space-y-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900/60 border border-emerald-500/20 shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Etalase Online Anda
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mb-2.5">
                {profile?.slug ? `/katalog/${profile.slug}` : 'Katalog Publik Siap Pakai'}
              </p>
              <Link
                href={profile?.slug ? `/katalog/${profile.slug}` : '/katalog'}
                target="_blank"
                className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border border-emerald-500/30 text-[11px] font-bold shadow-2xs transition active:scale-98"
                title="Buka website katalog publik Anda di tab baru"
              >
                <span>Lihat Web Toko</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer: User Profile Card & Logout */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs shrink-0">
                {ownerInitial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {profile?.owner_name || 'Pemilik'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {profile?.business_name || 'Juragan Kontrakan'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition shrink-0 cursor-pointer"
              title="Keluar dari akun pemilik"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Confirmation Modal for Logout */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Keluar dari Akun Pemilik"
        message="Apakah Anda yakin ingin keluar? Sesi aktif di perangkat ini akan diakhiri dan Anda perlu memasukkan sandi kembali untuk mengakses dasbor."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        variant="warning"
      />
    </>
  );
};

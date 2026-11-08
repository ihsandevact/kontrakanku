'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Building2,
  WalletCards,
  Settings,
  UserCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface MobileNavProps {
  dueSoonCount?: number;
  pendingAppsCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  dueSoonCount = 0,
  pendingAppsCount = 0,
}) => {
  const pathname = usePathname();
  const { profile } = useAuth();

  const navItems = [
    {
      label: 'Beranda',
      href: '/',
      icon: Home,
      badge: dueSoonCount > 0 ? dueSoonCount : null,
      badgeColor: 'bg-amber-500',
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
      badgeColor: 'bg-rose-500',
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

  return (
    <>
      {/* Mobile Top Header (hidden on md and above) */}
      <header className="md:hidden sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="px-3.5 h-14 flex items-center justify-between gap-2">
          {/* Brand Info */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-base text-emerald-700 dark:text-emerald-400 min-w-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col min-w-0 justify-center">
              <span className="leading-tight tracking-tight text-slate-900 dark:text-white font-bold text-sm truncate max-w-[170px] xs:max-w-[220px]">
                {profile?.business_name || 'KontrakinAja!'}
              </span>
              <span className="text-[10px] leading-tight font-medium text-slate-500 dark:text-slate-400 truncate max-w-[170px] xs:max-w-[220px] mt-0.5">
                {profile?.owner_name || 'Manajemen Mandiri'}
              </span>
            </div>
          </Link>

          {/* Quick Action: Open Storefront Catalog */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href={profile?.slug ? `/katalog/${profile.slug}` : '/katalog'}
              target="_blank"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition shadow-2xs active:scale-95"
              title="Buka etalase katalog online publik Anda"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Katalog</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (5 tabs) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200/80 dark:border-slate-800 pb-safe select-none">
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1">
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
                className={`flex flex-col items-center justify-center relative transition-all py-1 min-h-[48px] active:scale-95 cursor-pointer ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`p-1 rounded-xl transition ${
                      isActive
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20'
                        : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`absolute -top-1 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold rounded-full text-white shadow-xs ${
                        item.badgeColor || 'bg-rose-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[62px] text-center">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

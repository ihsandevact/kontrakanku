'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isPublicPath } from '@/lib/auth';
import { getLeases, getTenantApplications } from '@/lib/storage';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { PublicHeader } from './PublicHeader';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [pendingAppsCount, setPendingAppsCount] = useState<number>(0);
  const [dueSoonCount, setDueSoonCount] = useState<number>(0);

  const isPublic = isPublicPath(pathname);

  // Sync notification badges when in protected owner area
  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated && !isPublic) {
      Promise.all([getLeases(), getTenantApplications()])
        .then(([leases, apps]) => {
          if (!isMounted) return;
          const urgent = leases.filter(
            (l) => l.status === 'due_soon' || l.status === 'overdue'
          ).length;
          const pending = apps.filter((a) => a.status === 'pending').length;
          setDueSoonCount(urgent);
          setPendingAppsCount(pending);
        })
        .catch(() => {
          // Silently handle if storage query is interrupted
        });
    }

    return () => {
      isMounted = false;
    };
  }, [pathname, isPublic, isAuthenticated]);

  // Loading state while verifying landlord session
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Memuat Kontrakin...</span>
      </div>
    );
  }

  // 1. Unauthenticated Visitor at Root ('/') -> SaaS Landing Page with Public Header
  if (!isAuthenticated && pathname === '/') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
        <PublicHeader />
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
      </div>
    );
  }

  // 2. Public Auth or Shareable Pages (/login, /register, /katalog/*, /sewa/*, /kontrak/*)
  if (isPublic && pathname !== '/') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
        <main className="flex-1 flex flex-col px-4 sm:px-6">{children}</main>
      </div>
    );
  }

  // 3. Authenticated Landlord Protected Area (Desktop: Sidebar w-64 + TopBar; Mobile: MobileNav)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Desktop Sidebar (hidden on mobile, fixed w-64) */}
      <Sidebar
        dueSoonCount={dueSoonCount}
        pendingAppsCount={pendingAppsCount}
      />

      {/* Main Content Area: Offset by md:pl-64 on desktop */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-[padding] duration-200">
        {/* Desktop TopBar */}
        <TopBar />

        {/* Mobile Navigation Header & Bottom Bar */}
        <MobileNav
          dueSoonCount={dueSoonCount}
          pendingAppsCount={pendingAppsCount}
        />

        {/* Page Content Canvas */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-24 md:pb-12 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

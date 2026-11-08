'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isPublicPath } from '@/lib/auth';
import { ShieldCheck } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const isPublic = isPublicPath(pathname);

  useEffect(() => {
    if (!isPublic && !isLoading && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isPublic, isLoading, isAuthenticated, pathname, router]);

  // Public pages render directly
  if (isPublic) {
    return <>{children}</>;
  }

  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-pulse">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Memverifikasi akses pemilik...</span>
        </div>
      </div>
    );
  }

  // If authenticated on private page, render content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
};

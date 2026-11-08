import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'KontrakinAja! - Manajemen Rumah Kontrakan Mandiri',
  description:
    'Aplikasi manajemen sewa kontrakan personal: pengingat jatuh tempo otomatis, kirim tagihan WhatsApp 1-klik, katalog sewa online, dan kontrak sewa digital legal.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KontrakinAja!',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
        <AuthProvider>
          <AppShell>
            <AuthGuard>{children}</AuthGuard>
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}

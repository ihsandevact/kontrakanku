'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/landing/LandingPage';
import {
  AppSettings,
  DashboardMetrics,
  Lease,
  Property,
} from '@/types/database';
import {
  getDashboardMetrics,
  getLeases,
  getProperties,
  getSettings,
} from '@/lib/storage';
import {
  formatDateIndonesian,
  formatRupiah,
  getCycleLabel,
  getCycleShortLabel,
} from '@/lib/formatters';
import { formatDaysUntilDue, getDaysUntilDue } from '@/lib/billing';
import { StatusBadge } from '@/components/StatusBadge';
import { WhatsAppModal } from '@/components/WhatsAppModal';
import { RenewLeaseModal } from '@/components/RenewLeaseModal';
import { PropertyFormModal } from '@/components/PropertyFormModal';
import { CheckInTenantModal } from '@/components/CheckInTenantModal';
import { TransactionFormModal } from '@/components/TransactionFormModal';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  Plus,
  RotateCw,
  TrendingDown,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  Wallet,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading, profile } = useAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [activeWaModal, setActiveWaModal] = useState<{
    lease: Lease;
    property: Property;
  } | null>(null);
  const [activeRenewModal, setActiveRenewModal] = useState<{
    lease: Lease;
    property: Property;
  } | null>(null);
  const [activeCheckInModal, setActiveCheckInModal] = useState<{
    property: Property;
    lease?: Lease | null;
  } | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [selectedPropertyForModal, setSelectedPropertyForModal] = useState<Property | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, p, l, s] = await Promise.all([
        getDashboardMetrics(),
        getProperties(),
        getLeases(),
        getSettings(),
      ]);
      setMetrics(m);
      setProperties(p);
      setLeases(l);
      setSettings(s);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, profile?.id]);

  // If auth is still checking
  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium">Memuat KontrakinAja!...</span>
      </div>
    );
  }

  // If visitor is not logged in, render SaaS Landing Page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const urgentLeases = leases.filter(
    (l) => l.status === 'due_soon' || l.status === 'overdue'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-emerald-700/30">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 mb-2 border border-emerald-400/25">
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              <span>{profile?.business_name || 'Kontrakan Mandiri'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Dasbor {profile?.business_name ? `• ${profile.business_name}` : 'Pengelolaan Sewa'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-lg">
              {profile?.owner_name ? `Selamat datang, ${profile.owner_name}. ` : ''}
              Pantau status jatuh tempo penyewa dan kirim tagihan WhatsApp dalam satu klik.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <button
              onClick={() => {
                setSelectedPropertyForModal(null);
                setIsPropertyModalOpen(true);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs sm:text-sm font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Tambah Unit</span>
            </button>
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/15 text-white text-xs sm:text-sm font-semibold border border-white/20 transition backdrop-blur-xs"
            >
              <Wallet className="w-4 h-4 text-emerald-300" />
              <span>Catat Kas</span>
            </button>
            <Link
              href={profile?.slug ? `/katalog/${profile.slug}` : '/katalog'}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 text-xs sm:text-sm font-semibold border border-teal-400/30 transition backdrop-blur-xs"
              title="Lihat katalog promosi publik"
            >
              <span>Katalog</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </Link>
          </div>
        </div>
      </div>

      {/* Incoming Application Alert Banner */}
      {metrics && metrics.pendingApplicationsCount > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/10 border border-amber-500/30 flex flex-col xs:flex-row xs:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs animate-bounce">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                Ada {metrics.pendingApplicationsCount} Permohonan Calon Penyewa Baru!
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 xs:line-clamp-none">
                Calon penyewa baru saja mengisi formulir mandiri. Tinjau sekarang.
              </p>
            </div>
          </div>
          <Link
            href="/applications"
            className="w-full xs:w-auto inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition whitespace-nowrap shrink-0"
          >
            <span>Tinjau ({metrics.pendingApplicationsCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metrics Row (Equal Height, Mobile-Friendly) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Okupansi */}
        <div className="bg-white dark:bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[110px] sm:min-h-[116px]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Okupansi</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="my-1.5 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
              {metrics ? `${metrics.occupiedProperties}/${metrics.totalProperties}` : '-'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Terisi</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span>Kosong: {metrics?.vacantProperties ?? 0}</span>
            <Link href="/properties" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Kelola →
            </Link>
          </div>
        </div>

        {/* Perlu Perhatian / Due Soon */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-xs flex flex-col justify-between min-h-[110px] sm:min-h-[116px] ${
          urgentLeases.length > 0
            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300/70 dark:border-amber-800/60'
            : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
            <span>Perlu Ditagih</span>
            <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="my-1.5 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-300 truncate">
              {metrics ? metrics.dueSoonCount + metrics.overdueCount : 0}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400/80 font-medium">Penyewa</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              {metrics?.overdueCount ? `${metrics.overdueCount} telat` : '0 telat'}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">H-7 Notif</span>
          </div>
        </div>

        {/* Pemasukan Bulan Ini */}
        <div className="bg-white dark:bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[110px] sm:min-h-[116px]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Sewa Bln Ini</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-base xs:text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white block truncate">
              {metrics ? formatRupiah(metrics.totalIncomeCurrentMonth) : '-'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="truncate">Biaya: {metrics ? formatRupiah(metrics.totalExpenseCurrentMonth) : '-'}</span>
            <Link href="/finance" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline shrink-0 ml-1">
              Kas →
            </Link>
          </div>
        </div>

        {/* Laba Bersih Bulan Ini */}
        <div className="bg-white dark:bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[110px] sm:min-h-[116px]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Laba Bersih</span>
            <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <div className="my-1.5">
            <span className={`text-base xs:text-lg sm:text-xl font-bold tracking-tight block truncate ${
              (metrics?.netProfitCurrentMonth ?? 0) >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {metrics ? formatRupiah(metrics.netProfitCurrentMonth) : '-'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80 truncate">
            <span>Setelah biaya perawatan</span>
          </div>
        </div>
      </div>

      {/* Section: Urgent Invoices / Perlu Ditagih Segera */}
      {properties.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Penyewa Mendekati Jatuh Tempo
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
              {urgentLeases.length} Unit
            </span>
          </div>

          {urgentLeases.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-6 text-center border border-slate-200/80 dark:border-slate-800">
              <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Semua pembayaran sewa lancar!
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tidak ada unit yang jatuh tempo dalam 7 hari ke depan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {urgentLeases.map((lease) => {
                const property = properties.find((p) => p.id === lease.property_id);
                if (!property) return null;
                const days = getDaysUntilDue(lease.next_due_date);

                return (
                  <div
                    key={lease.id}
                    className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400/50 dark:hover:border-amber-500/40 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">
                            {property.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Penyewa: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{lease.tenant_name}</strong>
                            <span className="text-slate-400 ml-1 font-mono">({lease.tenant_phone})</span>
                          </p>
                        </div>
                        <StatusBadge status={lease.status} />
                      </div>

                      {/* Streamlined Bill Box */}
                      <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/80">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                            Jatuh Tempo:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {formatDateIndonesian(lease.next_due_date)}
                          </span>
                          <span className={`inline-block text-[11px] font-bold mt-1 ${
                            days < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {formatDaysUntilDue(days)}
                          </span>
                        </div>
                        <div className="border-l border-slate-200/60 dark:border-slate-800 pl-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                            Tagihan ({getCycleShortLabel(lease.billing_cycle)}):
                          </span>
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white block">
                            {formatRupiah(lease.rate_amount)}
                          </span>
                          {lease.deposit_amount && lease.deposit_amount > 0 ? (
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Deposit: {formatRupiah(lease.deposit_amount)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Actions for this lease */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setActiveWaModal({ lease, property })}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Kirim Tagihan WA</span>
                      </button>
                      <button
                        onClick={() => setActiveRenewModal({ lease, property })}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 active:bg-teal-500/25 text-teal-700 dark:text-teal-300 border border-teal-500/30 text-xs sm:text-sm font-semibold transition"
                        title="Perpanjang jika sudah bayar"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />
                        <span>Perpanjang</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Section: Overview of All Properties */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Status Unit Kontrakan Anda
            </h2>
          </div>
          <Link
            href="/properties"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Properti</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Belum Ada Unit Kontrakan Terdaftar
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Akun kontrakan Anda masih kosong. Klik tombol di bawah untuk mulai menambahkan unit kontrakan atau kamar pertama Anda lengkap dengan tarif sewa dan nomor meteran.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPropertyForModal(null);
                setIsPropertyModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Unit Kontrakan Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {properties.map((prop) => {
              const lease = leases.find((l) => l.property_id === prop.id);
              const status = lease ? lease.status : 'vacant';

              return (
                <div
                  key={prop.id}
                  className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {prop.name}
                      </h3>
                      <StatusBadge status={status} />
                    </div>
                    {prop.address && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{prop.address}</span>
                      </p>
                    )}

                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
                      {lease ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Penyewa:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {lease.tenant_name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Siklus Sewa:</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {getCycleShortLabel(lease.billing_cycle)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Jatuh Tempo:</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {formatDateIndonesian(lease.next_due_date)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="py-3 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-slate-400 text-xs font-medium">Unit Kosong</p>
                          <button
                            onClick={() => setActiveCheckInModal({ property: prop, lease: null })}
                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Check-in Penyewa</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Info & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    {prop.electricity_id ? (
                      <span className="text-[11px] text-slate-400 font-mono">
                        ⚡ {prop.electricity_id}
                      </span>
                    ) : (
                      <span />
                    )}
                    {lease && (
                      <button
                        onClick={() => setActiveWaModal({ lease, property: prop })}
                        className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1.5 ml-auto"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Tagih WA</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {activeWaModal && settings && (
        <WhatsAppModal
          isOpen={Boolean(activeWaModal)}
          onClose={() => setActiveWaModal(null)}
          lease={activeWaModal.lease}
          property={activeWaModal.property}
          settings={settings}
        />
      )}

      {activeRenewModal && (
        <RenewLeaseModal
          isOpen={Boolean(activeRenewModal)}
          onClose={() => setActiveRenewModal(null)}
          lease={activeRenewModal.lease}
          property={activeRenewModal.property}
          onSuccess={loadData}
        />
      )}

      {activeCheckInModal && (
        <CheckInTenantModal
          isOpen={Boolean(activeCheckInModal)}
          onClose={() => setActiveCheckInModal(null)}
          property={activeCheckInModal.property}
          lease={activeCheckInModal.lease}
          onSuccess={loadData}
        />
      )}

      {isPropertyModalOpen && (
        <PropertyFormModal
          isOpen={isPropertyModalOpen}
          onClose={() => {
            setIsPropertyModalOpen(false);
            setSelectedPropertyForModal(null);
          }}
          property={selectedPropertyForModal}
          lease={null}
          onSuccess={loadData}
        />
      )}

      {isTxModalOpen && (
        <TransactionFormModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          properties={properties}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  AppSettings,
  Property,
  TenantApplication,
} from '@/types/database';
import {
  approveTenantApplication,
  getProperties,
  getSettings,
  getTenantApplications,
  updateApplicationStatus,
} from '@/lib/storage';
import { formatDateIndonesian, formatRupiah, getCycleLabel } from '@/lib/formatters';
import { generateOwnerReplyUrl } from '@/lib/application-whatsapp';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ApplicationCardSkeleton } from '@/components/ui/Skeleton';
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  Phone,
  Sparkles,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';

export default function ApplicationsPage() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [appToApprove, setAppToApprove] = useState<TenantApplication | null>(null);
  const [appToReject, setAppToReject] = useState<TenantApplication | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [apps, props, s] = await Promise.all([
        getTenantApplications(),
        getProperties(),
        getSettings(),
      ]);
      setApplications(apps);
      setProperties(props);
      setSettings(s);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyFormLink = () => {
    if (typeof window !== 'undefined') {
      const formPath = profile?.slug ? `/sewa/${profile.slug}` : '/sewa';
      const url = `${window.location.origin}${formPath}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const confirmApprove = async () => {
    if (!appToApprove) return;
    setProcessingId(appToApprove.id);
    try {
      await approveTenantApplication(appToApprove.id);
      setAppToApprove(null);
      await loadData();
    } catch (err) {
      console.error('Failed to approve application', err);
      alert('Gagal menyetujui permohonan. Periksa kembali unit properti.');
    } finally {
      setProcessingId(null);
    }
  };

  const confirmReject = async () => {
    if (!appToReject) return;
    setProcessingId(appToReject.id);
    try {
      await updateApplicationStatus(appToReject.id, 'rejected');
      setAppToReject(null);
      await loadData();
    } catch (err) {
      console.error('Failed to reject application', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col gap-3.5 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                Permohonan Calon Penyewa
              </h1>
              {pendingCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse shadow-xs">
                  {pendingCount} Baru
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Data calon penyewa yang mengisi formulir mandiri via web atau media sosial.
            </p>
          </div>

          {/* Action Links - Mobile friendly grid */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyFormLink}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-800 shadow-xs transition active:scale-[0.98]"
              title="Salin tautan formulir pendaftaran untuk dibagikan"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Salin Link</span>
                </>
              )}
            </button>

            <Link
              href={profile?.slug ? `/sewa/${profile.slug}` : '/sewa'}
              target="_blank"
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-800 shadow-xs transition active:scale-[0.98]"
              title="Buka form pendaftaran publik"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Form Sewa</span>
            </Link>

            <Link
              href={profile?.slug ? `/katalog/${profile.slug}` : '/katalog'}
              target="_blank"
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition active:scale-[0.98]"
              title="Buka katalog unit promosi"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Katalog Unit</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Native Mobile Smooth Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs sm:text-sm no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'pending', label: 'Menunggu', count: pendingCount, highlight: pendingCount > 0 },
          { id: 'approved', label: 'Disetujui', count: approvedCount, highlight: false },
          { id: 'rejected', label: 'Ditolak', count: rejectedCount, highlight: false },
          { id: 'all', label: 'Semua', count: applications.length, highlight: false },
        ].map((tab) => {
          const isActive = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-semibold transition whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5 shrink-0 active:scale-[0.98] ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.highlight
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))
        ) : (
          filteredApplications.map((app) => {
          const prop = properties.find((p) => p.id === app.property_id);
          const isPending = app.status === 'pending';
          const isApproved = app.status === 'approved';

          const replyWaUrl = settings
            ? generateOwnerReplyUrl({
                applicantName: app.full_name,
                applicantPhone: app.phone,
                propertyName: prop?.name || 'Rumah Kontrakan',
                ownerName: settings.account_holder,
              })
            : '#';

          return (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div>
                {/* Header Card: Avatar + Name + Status Pill */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                      {app.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug truncate">
                        {app.full_name}
                      </h2>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 mt-0.5">
                        <a
                          href={`tel:${app.phone}`}
                          className="font-mono font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{app.phone}</span>
                        </a>
                        {app.occupation && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[140px] sm:max-w-none text-[11px] sm:text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {app.occupation}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-xs ${
                        isPending
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : isApproved
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPending ? 'bg-amber-500 animate-pulse' : isApproved ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span>
                        {isPending ? 'Menunggu' : isApproved ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Details Box: 2x2 grid on mobile, 4 cols on desktop */}
                <div className="mt-3.5 p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/70 dark:border-slate-800/80 text-xs space-y-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                        Unit Minat
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate" title={prop?.name}>
                        {prop?.name || 'Unit Tidak Ditemukan'}
                      </span>
                      {prop?.monthly_rate ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          {formatRupiah(prop.monthly_rate)}/bln
                        </span>
                      ) : null}
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                        Siklus Sewa
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {getCycleLabel(app.preferred_cycle)}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Min. 6 Bulan
                      </span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                        Rencana Masuk
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                        {formatDateIndonesian(app.move_in_date)}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Mulai Kontrak
                      </span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                        Penghuni
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {app.family_members || 1} Jiwa
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5 truncate" title={app.vehicles || 'Tanpa kendaraan'}>
                        {app.vehicles ? `🚗 ${app.vehicles}` : 'Tanpa kendaraan'}
                      </span>
                    </div>
                  </div>

                  {/* NIK / KTP row if present */}
                  {app.nik && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 font-medium text-[11px]">No. KTP / NIK:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 tracking-wider text-[11px] sm:text-xs">
                        {app.nik}
                      </span>
                    </div>
                  )}

                  {/* Notes from prospective tenant */}
                  {app.notes && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-semibold block text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-0.5">
                        Catatan Calon Penyewa:
                      </span>
                      &quot;{app.notes}&quot;
                    </div>
                  )}

                  {/* Timestamp and ID */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Masuk: {new Date(app.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span className="font-mono">#{app.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Mobile Optimized */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {isPending ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Primary Button on Mobile (prominent full width) / right on Desktop */}
                    <button
                      onClick={() => setAppToApprove(app)}
                      disabled={processingId === app.id}
                      className="order-1 sm:order-2 w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span>{processingId === app.id ? 'Memproses...' : 'Setujui & Jadikan Penyewa'}</span>
                    </button>

                    {/* Secondary Buttons: 2 Equal Columns on Mobile / Left on Desktop */}
                    <div className="order-2 sm:order-1 grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                      <a
                        href={replyWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.99] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Chat WA Calon</span>
                      </a>

                      <button
                        onClick={() => setAppToReject(app)}
                        disabled={processingId === app.id}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-[0.99] text-xs font-semibold border border-rose-200/80 dark:border-rose-900/40 transition disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <a
                      href={replyWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.99] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 transition w-full sm:w-auto"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Chat WhatsApp Calon</span>
                    </a>

                    <div className="text-xs text-center sm:text-right">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Telah disetujui & unit terisi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                          <XCircle className="w-3.5 h-3.5 shrink-0" /> Permohonan ditolak
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }))}
      </div>

      {/* Empty State */}
      {!isLoading && filteredApplications.length === 0 && (
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-8 text-center border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Tidak ada permohonan pada filter ini
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Bagikan tautan form pendaftaran mandiri atau katalog ke calon penyewa untuk menerima permohonan baru.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Link
              href={profile?.slug ? `/sewa/${profile.slug}` : '/sewa'}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Form Sewa</span>
            </Link>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Application Approval */}
      <ConfirmModal
        isOpen={Boolean(appToApprove)}
        onClose={() => setAppToApprove(null)}
        onConfirm={confirmApprove}
        title="Setujui Calon Penyewa"
        message={
          appToApprove ? (
            <span>
              Setujui pendaftaran <strong>"{appToApprove.full_name}"</strong> untuk unit{' '}
              <strong>"{appToApprove.property?.name || 'unit kontrakan ini'}"</strong>? Tindakan ini akan langsung membuat kontrak sewa aktif dan mengubah status unit menjadi berpenghuni.
            </span>
          ) : ''
        }
        confirmLabel="Ya, Setujui Permohonan"
        cancelLabel="Batal"
        variant="success"
        isLoading={Boolean(processingId)}
      />

      {/* Confirmation Modal for Application Rejection */}
      <ConfirmModal
        isOpen={Boolean(appToReject)}
        onClose={() => setAppToReject(null)}
        onConfirm={confirmReject}
        title="Tolak Permohonan Sewa"
        message={
          appToReject ? (
            <span>
              Apakah Anda yakin ingin menolak permohonan sewa dari <strong>"{appToReject.full_name}"</strong>? Status permohonan akan diubah menjadi Ditolak.
            </span>
          ) : ''
        }
        confirmLabel="Ya, Tolak Permohonan"
        cancelLabel="Batal"
        variant="danger"
        isLoading={Boolean(processingId)}
      />
    </div>
  );
}

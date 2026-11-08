'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppSettings, Property, TenantApplication } from '@/types/database';
import { getPropertyById, getSettings } from '@/lib/storage';
import { generateApplicantConfirmationUrl } from '@/lib/application-whatsapp';
import { formatDateIndonesian, getCycleLabel } from '@/lib/formatters';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Home,
  MessageSquare,
  Sparkles,
  User,
} from 'lucide-react';

export default function ApplicationSuccessPage() {
  const [application, setApplication] = useState<TenantApplication | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await getSettings();
        setSettings(s);

        if (typeof window !== 'undefined') {
          const raw = sessionStorage.getItem('last_submitted_application');
          if (raw) {
            const app = JSON.parse(raw) as TenantApplication;
            setApplication(app);
            if (app.property_id) {
              const p = await getPropertyById(app.property_id);
              setProperty(p);
            }
          }
        }
      } catch (err) {
        console.error('Error loading success page info', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const confirmationWaUrl =
    application && settings
      ? generateApplicantConfirmationUrl({
          application,
          propertyName: property?.name || 'Rumah Kontrakan',
          ownerName: settings.account_holder,
          ownerPhone: settings.contact_phone || '628123456789',
        })
      : '#';

  return (
    <div className="max-w-lg mx-auto space-y-6 pt-4 text-center">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30 animate-in zoom-in-75 duration-300">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Formulir Minat Sewa Terkirim!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Terima kasih telah mendaftar. Data Anda telah tercatat langsung di sistem pemilik kontrakan.
        </p>
      </div>

      {/* Summary Box */}
      {application && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 text-left text-xs space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              Rincian Pengajuan
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ID: {application.id.substring(0, 8)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Nama Calon Penyewa:</span>
            <span className="font-bold text-slate-900 dark:text-white">{application.full_name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Unit yang Diminati:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {property?.name || 'Unit Kontrakan'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Siklus Sewa:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {getCycleLabel(application.preferred_cycle)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Rencana Tanggal Masuk:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatDateIndonesian(application.move_in_date)}
            </span>
          </div>
        </div>
      )}

      {/* Call to action: Direct WhatsApp Confirmation */}
      <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-left space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
          <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Langkah Selanjutnya: Konfirmasi ke WhatsApp</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Agar permohonan Anda dapat segera diproses atau dijadwalkan survei lokasi, silakan kirim pesan konfirmasi instan ke pemilik kontrakan:
        </p>

        <a
          href={confirmationWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Kirim Konfirmasi WhatsApp ke Pemilik</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          href="/katalog"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Kembali ke Katalog Kontrakan</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

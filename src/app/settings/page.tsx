'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AppSettings, BillingCycle } from '@/types/database';
import { clearAllData, getSettings, resetToDemoData, saveSettings } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { SettingsSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { changeOwnerCredential, clearAuthSession, formatSlug } from '@/lib/auth';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Database,
  ExternalLink,
  HelpCircle,
  KeyRound,
  Lock,
  LogOut,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Share2,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
} from 'lucide-react';

export default function SettingsPage() {
  const { profile, updateProfile, logout, isLoading: isAuthLoading } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Landlord Profile States
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [ownerName, setOwnerName] = useState(profile?.owner_name || '');
  const [slug, setSlug] = useState(profile?.slug || '');

  const [bankName, setBankName] = useState(profile?.bank_name || 'BCA');
  const [accountNumber, setAccountNumber] = useState(profile?.account_number || '');
  const [accountHolder, setAccountHolder] = useState(profile?.account_holder || profile?.owner_name || '');
  const [contactPhone, setContactPhone] = useState(profile?.phone || '');
  const [reminderDays, setReminderDays] = useState(profile?.reminder_days_before || 7);
  const [defaultCycle, setDefaultCycle] = useState<BillingCycle>(profile?.default_cycle || 'semi_annual');
  const [customTemplate, setCustomTemplate] = useState(profile?.custom_wa_template || '');

  const [copiedLink, setCopiedLink] = useState<'form' | 'catalog' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingCred, setIsSavingCred] = useState(false);
  const [changeCredSuccess, setChangeCredSuccess] = useState<string | null>(null);
  const [changeCredError, setChangeCredError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleChangeCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeCredError(null);
    setChangeCredSuccess(null);
    setIsSavingCred(true);
    try {
      const res = await changeOwnerCredential(currentPassword, newPassword);
      if (res.success) {
        setChangeCredSuccess(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setChangeCredSuccess(null), 4000);
      } else {
        setChangeCredError(res.message);
      }
    } catch (err) {
      console.error('Failed to change password:', err);
      setChangeCredError('Gagal mengubah kata sandi.');
    } finally {
      setIsSavingCred(false);
    }
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
    } else {
      clearAuthSession();
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || '');
      setOwnerName(profile.owner_name || '');
      setSlug(profile.slug || '');
      if (profile.phone) setContactPhone(profile.phone);
      if (profile.bank_name) setBankName(profile.bank_name);
      if (profile.account_number) setAccountNumber(profile.account_number);
      setAccountHolder(profile.account_holder || profile.owner_name || '');
      if (profile.reminder_days_before) setReminderDays(profile.reminder_days_before);
      if (profile.default_cycle) setDefaultCycle(profile.default_cycle);
      if (profile.custom_wa_template) setCustomTemplate(profile.custom_wa_template);
    }
  }, [profile]);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setSettings(s);
        if (!profile) {
          setBankName(s.bank_name);
          setAccountNumber(s.account_number);
          setAccountHolder(s.account_holder);
          setContactPhone(s.contact_phone || '');
          setReminderDays(s.reminder_days_before);
          setDefaultCycle(s.default_cycle);
          setCustomTemplate(s.custom_wa_template || '');
        }
        setIsLoadingSettings(false);
      })
      .catch(() => {
        setIsLoadingSettings(false);
      });
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cleanSlug = formatSlug(slug || businessName || 'kontrakan');
      const trimmedBusiness = businessName.trim();
      const trimmedOwner = ownerName.trim();
      const trimmedPhone = contactPhone.trim();
      const trimmedBank = bankName.trim();
      const trimmedAccount = accountNumber.trim();
      const trimmedHolder = accountHolder.trim();
      const numReminderDays = Number(reminderDays) || 7;
      const trimmedCustomWa = customTemplate.trim() || null;

      if (profile) {
        const res = await updateProfile({
          business_name: trimmedBusiness,
          owner_name: trimmedOwner,
          slug: cleanSlug,
          phone: trimmedPhone,
          bank_name: trimmedBank,
          account_number: trimmedAccount,
          account_holder: trimmedHolder,
          reminder_days_before: numReminderDays,
          default_cycle: defaultCycle,
          custom_wa_template: trimmedCustomWa,
        });

        if (!res.success && res.error) {
          console.warn('Profile update notice:', res.error);
        }
      }

      if (settings) {
        const updated = await saveSettings({
          ...settings,
          bank_name: trimmedBank,
          account_number: trimmedAccount,
          account_holder: trimmedHolder,
          contact_phone: trimmedPhone,
          reminder_days_before: numReminderDays,
          default_cycle: defaultCycle,
          custom_wa_template: trimmedCustomWa,
        });
        setSettings(updated);
      }

      // Keep local input fields synchronized with saved values
      setBusinessName(trimmedBusiness);
      setOwnerName(trimmedOwner);
      setSlug(cleanSlug);
      setContactPhone(trimmedPhone);
      setBankName(trimmedBank);
      setAccountNumber(trimmedAccount);
      setAccountHolder(trimmedHolder);
      setReminderDays(numReminderDays);
      setCustomTemplate(trimmedCustomWa || '');

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSlug = slug || profile?.slug || 'kontrakan-berkah';

  const handleCopyLink = async (type: 'form' | 'catalog') => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    const path = type === 'form' ? `/sewa/${currentSlug}` : `/katalog/${currentSlug}`;
    const url = `${origin}${path}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(type);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setCustomTemplate((prev) => prev + tag);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = customTemplate;
    const updated = current.substring(0, start) + tag + current.substring(end);
    setCustomTemplate(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const [showResetDemoConfirm, setShowResetDemoConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const confirmResetDemo = () => {
    resetToDemoData();
    window.location.reload();
  };

  const confirmClearAllData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      setShowClearAllConfirm(false);
      alert('Semua data dummy telah berhasil dibersihkan! Aplikasi kini siap diisi dengan data kontrakan riil Anda.');
      window.location.reload();
    } catch (err) {
      console.error('Failed to clear all data', err);
      alert('Gagal membersihkan data.');
    } finally {
      setIsClearing(false);
    }
  };

  const supabaseReady = isSupabaseConfigured();
  const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === 'true';

  if (isAuthLoading || (isLoadingSettings && !profile)) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Sesuaikan rekening transfer, kontak WhatsApp, tautan promosi, dan format penagihan.
        </p>
      </div>

      {/* Card: Pusat Tautan Promosi & Pendaftaran Calon Penyewa */}
      <div className="bg-gradient-to-br from-emerald-900/60 to-slate-900 p-5 rounded-2xl border border-emerald-500/30 shadow-xs space-y-4 text-white">
        <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-500/20">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm sm:text-base">
              Pusat Tautan Publik & Promosi
            </h2>
            <p className="text-xs text-emerald-100/70">
              Bagikan tautan berikut ke calon penyewa via WhatsApp atau media sosial (OLX, FB).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Link 1: Formulir Calon Penyewa */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">Formulir Calon Penyewa</span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">/sewa/{currentSlug}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Formulir mandiri tempat calon penyewa mengisi identitas diri & rencana sewa unit Anda.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopyLink('form')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
              >
                {copiedLink === 'form' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Link Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link Form</span>
                  </>
                )}
              </button>
              <Link
                href={`/sewa/${currentSlug}`}
                target="_blank"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Buka form"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Link 2: Katalog Promosi Kontrakan */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300">Katalog Promosi Publik</span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">/katalog/{currentSlug}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Etalase publik menampilkan seluruh unit kontrakan, foto, fasilitas, & harga sewa Anda.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopyLink('catalog')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition"
              >
                {copiedLink === 'catalog' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Link Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link Katalog</span>
                  </>
                )}
              </button>
              <Link
                href={`/katalog/${currentSlug}`}
                target="_blank"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Buka katalog"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Section: Identitas Usaha Kontrakan & Profil Pemilik */}
        <div className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                Identitas Usaha Kontrakan & Profil Pemilik
              </h2>
              <p className="text-xs text-slate-500">
                Nama usaha kontrakan Anda dan URL publik yang akan diakses oleh calon penyewa.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Usaha Kontrakan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kontrakan Berkah Barokah"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (!profile?.slug) setSlug(formatSlug(e.target.value));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Pemilik *
              </label>
              <input
                type="text"
                required
                placeholder="Nama Anda sebagai pemilik"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Slug URL Publik (Tautan Toko Kontrakan) *
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2">
              <span className="text-xs text-slate-400 font-mono select-none">.../katalog/</span>
              <input
                type="text"
                required
                placeholder="kontrakan-berkah"
                value={slug}
                onChange={(e) => setSlug(formatSlug(e.target.value))}
                className="flex-1 bg-transparent border-0 text-slate-900 dark:text-white text-base sm:text-sm font-mono font-semibold focus:outline-none ml-1"
              />
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Hanya huruf kecil, angka, dan tanda hubung (-). Tautan publik Anda: <strong className="text-emerald-500 font-mono">/katalog/{currentSlug}</strong>
            </span>
          </div>
        </div>
        {/* Section: Rekening Bank & Kontak WhatsApp Pemilik */}
        <div className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                Rekening Pembayaran & Kontak WhatsApp Pemilik
              </h2>
              <p className="text-xs text-slate-500">
                Data rekening untuk tagihan dan nomor WhatsApp untuk menerima pendaftaran calon penyewa.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp Pemilik (Menerima Pendaftaran) *
              </label>
              <input
                type="tel"
                required
                placeholder="Contoh: 081234567890"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-600 dark:text-emerald-400"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Calon penyewa yang selesai mengisi form akan mengirim konfirmasi ke nomor ini.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Bank / E-Wallet *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: BCA / Mandiri / BRI"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Rekening *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 1234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Atas Nama Pemilik Rekening *
              </label>
              <input
                type="text"
                required
                placeholder="Nama pemilik rekening"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section: Siklus & Ambang Batas Pengingat */}
        <div className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                Siklus Sewa & Ambang Batas Pengingat
              </h2>
              <p className="text-xs text-slate-500">
                Atur berapa hari sebelum jatuh tempo status &apos;Mendekati Tempo&apos; aktif.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ambang Batas Pengingat (Hari sebelum Jatuh Tempo) *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  className="w-24 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-center"
                />
                <span className="text-xs text-slate-500">
                  Hari (Status &quot;Mendekati Tempo&quot; akan muncul <strong>H-{reminderDays}</strong>)
                </span>
              </div>
            </div>

            <div>
              <CustomSelect
                label="Siklus Sewa Bawaan (Default Unit Baru)"
                required
                value={defaultCycle}
                onChange={(val) => setDefaultCycle(val as BillingCycle)}
                title="Siklus Sewa Bawaan"
                options={[
                  { value: 'semi_annual', label: '6 Bulan (Semesteran - Bawaan)' },
                  { value: 'monthly', label: '1 Bulan (Bulanan)' },
                  { value: 'quarterly', label: '3 Bulan (Triwulan)' },
                  { value: 'annual', label: '12 Bulan (Tahunan)' },
                ]}
                className="bg-slate-50 dark:bg-slate-950/60"
              />
            </div>
          </div>
        </div>

        {/* Section: Template WhatsApp Custom */}
        <div className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                Kustomisasi Format Pesan WhatsApp Tagihan
              </h2>
              <p className="text-xs text-slate-500">
                Kosongkan untuk menggunakan format bawaan standar yang sopan dan rapi.
              </p>
            </div>
          </div>

          <div>
            <textarea
              ref={textareaRef}
              rows={6}
              placeholder="Biarkan kosong untuk memakai template bawaan standar..."
              value={customTemplate}
              onChange={(e) => setCustomTemplate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
            <div className="mt-2 text-xs text-slate-500 space-y-1.5">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Klik tag di bawah untuk langsung menyisipkan ke pesan:
              </span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {[
                  { tag: '{{tenantName}}', label: 'Nama Penyewa' },
                  { tag: '{{propertyName}}', label: 'Nama Properti' },
                  { tag: '{{billingCycle}}', label: 'Siklus Sewa' },
                  { tag: '{{nextDueDate}}', label: 'Tgl Jatuh Tempo' },
                  { tag: '{{rateAmount}}', label: 'Nominal Sewa' },
                  { tag: '{{bankName}}', label: 'Nama Bank' },
                  { tag: '{{accountNumber}}', label: 'No Rekening' },
                  { tag: '{{accountHolder}}', label: 'Atas Nama' },
                ].map(({ tag }) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleInsertTag(tag)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 text-xs transition"
                  >
                    <Plus className="w-3 h-3 text-emerald-500" />
                    <span className="font-mono text-[11px]">{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-1">
          {isSaved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan berhasil disimpan!</span>
            </span>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* Keamanan & Akses Pemilik Kontrakan */}
      <div className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Keamanan & Akses Pemilik Kontrakan</span>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Ubah kata sandi akun pemilik untuk menjaga keamanan akses dasbor Anda. Pastikan Anda mengingat kata sandi baru sebelum menyimpannya.
        </p>

        {changeCredSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{changeCredSuccess}</span>
          </div>
        )}

        {changeCredError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{changeCredError}</span>
          </div>
        )}

        <form onSubmit={handleChangeCredential} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingCred}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isSavingCred ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cloud & Database Status (Developer Sandbox - Hanya di Local Dev) */}
      {isDev && (
        <div className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-dashed border-amber-500/40 dark:border-amber-500/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
              <Database className="w-4 h-4 text-amber-500" />
              <span>Status Penyimpanan Data</span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Dev Only
              </span>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                supabaseReady
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
              }`}
            >
              {supabaseReady ? 'Terhubung ke Supabase Cloud' : 'Local Storage Mode (Aktif)'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {supabaseReady
              ? 'Aplikasi terhubung langsung ke database PostgreSQL Supabase gratis milik Anda.'
              : 'Aplikasi saat ini berjalan dalam mode peramban offline/local storage. Semua data yang Anda ubah tersimpan aman di peramban ini. Untuk menghubungkan ke Supabase, masukkan kredensial di file .env.local.'}
          </p>

          {/* Zona Pengelolaan & Pembersihan Data */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Hapus Seluruh Data Dummy / Kosongkan
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Bersihkan semua data contoh (properti, penyewa, kas, dan form) agar aplikasi kosong dan siap diisi unit riil Anda.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(true)}
                disabled={isClearing}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold transition active:scale-[0.98] disabled:opacity-50 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearing ? 'Membersihkan...' : 'Hapus Semua Data'}</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">Ingin memulihkan kembali data contoh?</span>
              <button
                type="button"
                onClick={() => setShowResetDemoConfirm(true)}
                className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Demo Mock Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals (Hanya Aktif di Lingkungan Dev) */}
      {isDev && (
        <>
          <ConfirmModal
            isOpen={showClearAllConfirm}
            onClose={() => setShowClearAllConfirm(false)}
            onConfirm={confirmClearAllData}
            title="Kosongkan Seluruh Data Aplikasi"
            message="PERINGATAN: Tindakan ini akan menghapus SEMUA data dummy (seluruh unit properti, data penyewa & jatuh tempo, permohonan baru, serta riwayat transaksi kas), baik dari penyimpanan browser maupun dari database Supabase jika terhubung. Apakah Anda yakin ingin mengosongkan semua data?"
            confirmLabel="Ya, Kosongkan Semua Data"
            cancelLabel="Batal"
            variant="danger"
            isLoading={isClearing}
          />

          <ConfirmModal
            isOpen={showResetDemoConfirm}
            onClose={() => setShowResetDemoConfirm(false)}
            onConfirm={confirmResetDemo}
            title="Muat Ulang Data Contoh (Mock Data)"
            message="Reset semua data ke data contoh kontrakan awal? Seluruh data kustom yang Anda tambahkan di browser ini akan digantikan dengan data contoh default."
            confirmLabel="Ya, Muat Ulang Demo"
            cancelLabel="Batal"
            variant="warning"
          />
        </>
      )}

      {/* Confirmation Modal for Logout */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Keluar dari Akun Pemilik"
        message="Apakah Anda yakin ingin keluar? Sesi aktif di browser ini akan diakhiri dan Anda perlu memasukkan PIN/sandi kembali untuk mengakses dasbor."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        variant="warning"
      />
    </div>
  );
}

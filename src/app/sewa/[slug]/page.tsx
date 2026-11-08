'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BillingCycle, LandlordProfile, Property } from '@/types/database';
import { getPublicPropertiesBySlug, submitPublicTenantApplication } from '@/lib/storage';
import { formatPhoneNumber } from '@/lib/whatsapp';
import { formatRupiah } from '@/lib/formatters';
import { CustomSelect } from '@/components/ui/CustomSelect';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Info,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

const BILLING_CYCLE_OPTIONS: { id: BillingCycle; label: string; months: number }[] = [
  { id: 'monthly', label: '1 Bulan (Bulanan)', months: 1 },
  { id: 'quarterly', label: '3 Bulan (Triwulan)', months: 3 },
  { id: 'semi_annual', label: '6 Bulan (Semesteran - Bawaan)', months: 6 },
  { id: 'annual', label: '12 Bulan (Tahunan / 1 Tahun)', months: 12 },
];

function getValidInitialCycle(minMonths?: number | null): BillingCycle {
  const min = minMonths ?? 6;
  if (min <= 1) return 'monthly';
  if (min <= 3) return 'quarterly';
  if (min <= 6) return 'semi_annual';
  return 'annual';
}

function LandlordSewaContent() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProp = searchParams.get('property') || '';

  const [landlord, setLandlord] = useState<LandlordProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<string>(preselectedProp);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<number>(2);
  const [preferredCycle, setPreferredCycle] = useState<BillingCycle>('semi_annual');

  const todayStr = new Date().toISOString().split('T')[0];
  const [moveInDate, setMoveInDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await getPublicPropertiesBySlug(slug);
        if (!res || !res.landlord) {
          setNotFound(true);
        } else {
          setLandlord(res.landlord);
          setProperties(res.properties);

          const defaultProp = preselectedProp || (res.properties.length > 0 ? res.properties[0].id : '');
          setPropertyId(defaultProp);
          if (defaultProp) {
            const p = res.properties.find((item) => item.id === defaultProp);
            setPreferredCycle(getValidInitialCycle(p?.min_rental_months));
          }
        }
      } catch (err) {
        console.error('Failed to load landlord application form:', err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [slug, preselectedProp]);

  const handlePropertyChange = (id: string) => {
    setPropertyId(id);
    const p = properties.find((item) => item.id === id);
    const minM = p?.min_rental_months ?? 6;
    const currentOpt = BILLING_CYCLE_OPTIONS.find((c) => c.id === preferredCycle);
    if (!currentOpt || (minM > 1 && currentOpt.months < minM)) {
      setPreferredCycle(getValidInitialCycle(minM));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !propertyId || !landlord) {
      alert('Harap lengkapi nama, nomor WhatsApp, dan unit kontrakan yang dipilih.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdApp = await submitPublicTenantApplication(
        {
          property_id: propertyId,
          full_name: fullName.trim(),
          phone: phone.trim(),
          nik: nik.trim() || null,
          occupation: occupation.trim() || null,
          family_members: Number(familyMembers) || 1,
          preferred_cycle: preferredCycle,
          move_in_date: moveInDate,
          notes: notes.trim() || null,
        },
        landlord.id
      );

      const targetProperty = properties.find((p) => p.id === propertyId);
      router.push(
        `/sewa/sukses?name=${encodeURIComponent(createdApp.full_name)}&property=${encodeURIComponent(
          targetProperty?.name || 'Unit Kontrakan'
        )}&appId=${createdApp.id}`
      );
    } catch (err) {
      console.error('Failed to submit application', err);
      alert('Terjadi kesalahan saat mengirim formulir pendaftaran. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium">Memuat formulir pendaftaran...</span>
      </div>
    );
  }

  if (notFound || !landlord) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Formulir Tidak Ditemukan
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Pemilik kontrakan dengan tautan <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-emerald-600">/sewa/{slug}</code> tidak terdaftar di sistem KontrakinAja!.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  const selectedPropertyObj = properties.find((p) => p.id === propertyId);
  const minRentalMonths = selectedPropertyObj?.min_rental_months ?? 6;
  const rawPhone = landlord?.phone || '';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          href={`/katalog/${slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog {landlord.business_name}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white shadow-md border border-emerald-700/30 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
          <Building2 className="w-3.5 h-3.5" />
          <span>{landlord.business_name}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Formulir Pendaftaran Calon Penyewa
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
          Silakan isi data diri Anda dengan benar. Data Anda diteruskan langsung ke pemilik kontrakan (<strong>{landlord.owner_name}</strong>) untuk proses survei dan penandatanganan kontrak sewa.
        </p>
      </div>

      {/* Form or Empty State Card */}
      {properties.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Belum Ada Unit Kontrakan yang Tersedia
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Pemilik {landlord.business_name} belum mendaftarkan unit kontrakan untuk disewakan saat ini. Anda dapat menanyakan langsung ketersediaan unit kepada pemilik via WhatsApp.
            </p>
          </div>
          {rawPhone && (
            <div className="pt-2">
              <a
                href={`https://wa.me/${formatPhoneNumber(rawPhone)}?text=${encodeURIComponent(
                  `Halo ${landlord.owner_name}, saya ingin menanyakan ketersediaan unit kontrakan di ${landlord.business_name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xs transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hubungi {landlord.owner_name} via WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          {/* Unit Selection Preview Card */}
          {selectedPropertyObj && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                  {selectedPropertyObj.photos?.[0] || selectedPropertyObj.photo_url ? (
                    <img
                      src={selectedPropertyObj.photos?.[0] || selectedPropertyObj.photo_url || ''}
                      alt={selectedPropertyObj.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedPropertyObj.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Unit Terpilih
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {selectedPropertyObj.address || 'Katalog Resmi Unit'}
                  </p>
                </div>
              </div>

              {selectedPropertyObj.monthly_rate && (
                <div className="text-left sm:text-right shrink-0">
                  <div className="flex items-baseline sm:justify-end gap-1">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(selectedPropertyObj.monthly_rate)}
                    </span>
                    <span className="text-[11px] text-slate-400">/ bln</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Min. Sewa: {minRentalMonths === 12 ? '1 Tahun' : `${minRentalMonths} Bulan`}
                  </span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Unit Kontrakan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Unit Kontrakan yang Diminati <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                value={propertyId}
                onChange={handlePropertyChange}
                title="Pilih Unit Kontrakan"
                placeholder="-- Pilih Unit Kontrakan --"
                options={properties.map((p) => ({
                  value: p.id,
                  label: p.name,
                  description: p.address || 'Unit siap huni',
                }))}
              />
            </div>

          {/* Grid Nama & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap Calon Penyewa <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Reza"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Grid NIK & Pekerjaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor KTP / NIK (Opsional)
              </label>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="16 digit nomor NIK"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pekerjaan / Instansi
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Karyawan Swasta / BUMN / Wiraswasta"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Siklus Sewa & Tanggal Rencana Masuk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilihan Pembayaran Sewa <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                value={preferredCycle}
                onChange={(val) => setPreferredCycle(val as BillingCycle)}
                title="Pilih Siklus Pembayaran Sewa"
                options={BILLING_CYCLE_OPTIONS.map((c) => {
                  const isDisabled = minRentalMonths > 1 && c.months < minRentalMonths;
                  return {
                    value: c.id,
                    label: c.label,
                    disabled: isDisabled,
                    description: isDisabled ? `Batas minimal sewa unit ini adalah ${minRentalMonths} bulan` : undefined,
                  };
                })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Rencana Tanggal Mulai Masuk <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Catatan / Permintaan Khusus
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jumlah anggota keluarga yang ikut tinggal, kendaraan yang dibawa, dsb."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Privacy & Trust Badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Data Anda terlindungi & diteruskan langsung ke pemilik kontrakan ({landlord.owner_name}) tanpa perantara.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || properties.length === 0}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mengirimkan Permohonan Sewa...</span>
              </div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Permohonan Sewa Mandiri</span>
              </>
            )}
          </button>
        </form>
      </div>
      )}
    </div>
  );
}

export default function LandlordSewaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <LandlordSewaContent />
    </Suspense>
  );
}

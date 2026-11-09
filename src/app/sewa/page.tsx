'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BillingCycle, Property } from '@/types/database';
import { getProperties, saveTenantApplication } from '@/lib/storage';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { SewaFormSkeleton } from '@/components/ui/Skeleton';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Info,
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

function TenantRegistrationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPropertyId = searchParams.get('propertyId') || '';

  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<string>(preselectedPropertyId);
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

  useEffect(() => {
    setIsLoading(true);
    getProperties()
      .then((list) => {
        setProperties(list);
        if (!propertyId && list.length > 0) {
          const defaultId = preselectedPropertyId || list[0].id;
          setPropertyId(defaultId);
          const p = list.find((item) => item.id === defaultId);
          const minM = p?.min_rental_months ?? 6;
          setPreferredCycle(getValidInitialCycle(minM));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [preselectedPropertyId, propertyId]);

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
    if (!fullName.trim() || !phone.trim() || !propertyId) {
      alert('Harap lengkapi nama, nomor WhatsApp, dan unit kontrakan yang dipilih.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdApp = await saveTenantApplication({
        property_id: propertyId,
        full_name: fullName.trim(),
        phone: phone.trim(),
        nik: nik.trim() || null,
        occupation: occupation.trim() || null,
        family_members: Number(familyMembers),
        vehicles: null,
        preferred_cycle: preferredCycle,
        move_in_date: moveInDate,
        notes: notes.trim() || null,
      });

      // Store in sessionStorage so the success page can access details
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('last_submitted_application', JSON.stringify(createdApp));
      }

      router.push('/sewa/sukses');
    } catch (err) {
      console.error('Failed to submit application', err);
      alert('Gagal mengirim formulir. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <SewaFormSkeleton />;
  }

  const selectedProp = properties.find((p) => p.id === propertyId);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 sm:space-y-6 overflow-hidden">
      {/* Back button & Title */}
      <div className="flex items-center justify-between min-w-0">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition min-w-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Kembali ke Katalog Unit</span>
        </Link>
        <span className="text-[11px] font-medium text-slate-400 shrink-0">
          Formulir Mandiri
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900/95 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden w-full min-w-0 box-border">
        {/* Header Form */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white space-y-1.5 break-words">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-200 border border-white/20 uppercase tracking-wider">
            Pendaftaran Calon Penyewa
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white break-words">
            Formulir Minat Sewa Kontrakan
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed break-words">
            Isi data diri Anda di bawah ini. Data Anda aman dan akan langsung diteruskan ke pemilik kontrakan untuk konfirmasi jadwal survei.
          </p>
        </div>

        {/* Selected Unit Indicator */}
        {selectedProp && (
          <div className="p-3.5 sm:p-4 bg-emerald-500/10 dark:bg-emerald-950/30 border-b border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs w-full min-w-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block leading-none mb-1">
                  Unit yang Dipilih:
                </span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">
                  {selectedProp.name}
                </span>
              </div>
            </div>
            <div className="w-full sm:w-auto flex items-center justify-between sm:flex-col sm:items-end pt-2 sm:pt-0 border-t border-emerald-500/20 sm:border-0 shrink-0">
              {selectedProp.monthly_rate && (
                <div className="font-bold text-emerald-700 dark:text-emerald-300 text-sm sm:text-xs">
                  Rp {selectedProp.monthly_rate.toLocaleString('id-ID')} / bln
                </div>
              )}
              <span className="inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-md border border-emerald-500/20 mt-0.5">
                {selectedProp.min_rental_months === 1
                  ? 'Sewa Bebas / Fleksibel'
                  : `Min. ${selectedProp.min_rental_months === 12 ? '1 Tahun' : `${selectedProp.min_rental_months || 6} Bulan`}`}
              </span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 w-full min-w-0">
          {/* Pilih Unit */}
          <div className="w-full min-w-0">
            <CustomSelect
              label="Pilih Unit Rumah Kontrakan"
              required
              value={propertyId}
              onChange={handlePropertyChange}
              title="Pilih Unit Rumah Kontrakan"
              options={properties.map((p) => ({
                value: p.id,
                label: p.name,
                description: p.address || undefined,
              }))}
              className="bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section: Identitas Calon Penyewa */}
          <div className="space-y-3.5 w-full min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Identitas Calon Penyewa</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full">
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sesuai KTP"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 box-border"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0812xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono box-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full">
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor KTP / NIK (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="16 digit NIK"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono box-border"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pekerjaan / Profesi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Karyawan Swasta, PNS, dll"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 box-border"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section: Rencana Hunian & Sewa */}
          <div className="space-y-3.5 w-full min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Rencana Tinggal & Siklus Pembayaran</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full">
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Penghuni yang Akan Tinggal *
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(Number(e.target.value))}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-bold box-border"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Termasuk anak atau keluarga inti
                </span>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rencana Tanggal Mulai Masuk *
                </label>
                <input
                  type="date"
                  required
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium box-border appearance-none"
                />
              </div>
            </div>

            <div className="w-full min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilihan Siklus Pembayaran Sewa *
                </label>
                {selectedProp && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedProp.min_rental_months === 1
                      ? 'Ketentuan: Sewa Bebas (Fleksibel)'
                      : `Ketentuan: Min. ${selectedProp.min_rental_months === 12 ? '1 Tahun' : `${selectedProp.min_rental_months || 6} Bulan`}`}
                  </span>
                )}
              </div>
              <CustomSelect
                value={preferredCycle}
                onChange={(val) => setPreferredCycle(val as BillingCycle)}
                title="Pilihan Siklus Pembayaran Sewa"
                options={BILLING_CYCLE_OPTIONS.map((opt) => {
                  const minM = selectedProp?.min_rental_months ?? 6;
                  const isDisabled = minM > 1 && opt.months < minM;
                  return {
                    value: opt.id,
                    label: opt.label,
                    description: isDisabled ? 'Di bawah batas min. sewa unit' : undefined,
                    disabled: isDisabled,
                  };
                })}
                className="bg-slate-50 dark:bg-slate-950 font-medium"
              />
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed break-words">
                {selectedProp?.min_rental_months && selectedProp.min_rental_months > 1
                  ? `Unit ini memiliki ketentuan minimal sewa ${selectedProp.min_rental_months === 12 ? '1 Tahun' : `${selectedProp.min_rental_months} Bulan`}. Pilihan durasi di bawahnya dinonaktifkan.`
                  : 'Unit ini fleksibel (bebas memilih mulai dari 1 bulan).'}
              </p>
            </div>

            <div className="w-full min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan / Pertanyaan Tambahan (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Apakah boleh membawa hewan peliharaan kecil? Kapan bisa survei lokasi?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full max-w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 box-border resize-y"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 text-xs text-slate-500 flex items-start gap-2 border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span className="leading-relaxed break-words flex-1 min-w-0">
              Setelah mengirim formulir, Anda dapat langsung mengonfirmasi pengajuan Anda ke WhatsApp pemilik kontrakan.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 box-border cursor-pointer active:scale-[0.99]"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>{isSubmitting ? 'Mengirim Formulir...' : 'Kirim Formulir Pendaftaran Sewa'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TenantRegistrationPage() {
  return (
    <Suspense fallback={<SewaFormSkeleton />}>
      <TenantRegistrationFormContent />
    </Suspense>
  );
}

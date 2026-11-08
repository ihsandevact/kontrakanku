'use client';

import React, { useEffect, useState } from 'react';
import { BillingCycle, Lease, Property } from '@/types/database';
import { calculateNextDueDate } from '@/lib/billing';
import { getCycleMonths, formatRupiah } from '@/lib/formatters';
import { saveLease } from '@/lib/storage';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import {
  UserPlus,
  UserCheck,
  Building2,
  Calendar,
  CreditCard,
  Phone,
  User,
  ShieldAlert,
  FileText,
  Sparkles,
} from 'lucide-react';

interface CheckInTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  lease?: Lease | null;
  onSuccess: () => void;
}

export const CheckInTenantModal: React.FC<CheckInTenantModalProps> = ({
  isOpen,
  onClose,
  property,
  lease,
  onSuccess,
}) => {
  const isEditing = Boolean(lease);
  const todayStr = new Date().toISOString().split('T')[0];

  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantNik, setTenantNik] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('semi_annual');
  const [rateAmount, setRateAmount] = useState<number | ''>(9000000);
  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(todayStr);
  const [nextDueDate, setNextDueDate] = useState(
    calculateNextDueDate(todayStr, 'semi_annual')
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (!isOpen) return;

    if (lease) {
      setTenantName(lease.tenant_name || '');
      setTenantPhone(lease.tenant_phone || '');
      setTenantNik(lease.tenant_nik || '');
      setBillingCycle(lease.billing_cycle || 'semi_annual');
      setRateAmount(lease.rate_amount || 0);
      setDepositAmount(lease.deposit_amount ?? '');
      setStartDate(lease.start_date || todayStr);
      setNextDueDate(
        lease.next_due_date ||
          calculateNextDueDate(lease.start_date || todayStr, lease.billing_cycle || 'semi_annual')
      );
      setNotes(lease.notes || '');
    } else {
      // New Check-in
      const initialCycle: BillingCycle =
        property?.min_rental_months === 12
          ? 'annual'
          : property?.min_rental_months === 3
          ? 'quarterly'
          : property?.min_rental_months === 1
          ? 'monthly'
          : 'semi_annual';

      const months = getCycleMonths(initialCycle);
      const calculatedRate = (property?.monthly_rate || 1500000) * months;

      setTenantName('');
      setTenantPhone('');
      setTenantNik('');
      setBillingCycle(initialCycle);
      setRateAmount(calculatedRate);
      setDepositAmount('');
      setStartDate(todayStr);
      setNextDueDate(calculateNextDueDate(todayStr, initialCycle));
      setNotes('');
    }
  }, [isOpen, property, lease, todayStr]);

  if (!isOpen || !property) return null;

  // Handle cycle change: auto-calculate rate and due date
  const handleCycleChange = (newCycle: BillingCycle) => {
    setBillingCycle(newCycle);

    // Auto-update due date
    try {
      const calculatedDue = calculateNextDueDate(startDate, newCycle);
      setNextDueDate(calculatedDue);
    } catch {
      // ignore
    }

    // Auto-calculate suggested total rate if monthly_rate exists
    if (property?.monthly_rate) {
      const months = getCycleMonths(newCycle);
      setRateAmount(property.monthly_rate * months);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    try {
      const calculatedDue = calculateNextDueDate(val, billingCycle);
      setNextDueDate(calculatedDue);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim()) {
      alert('Nama penyewa wajib diisi.');
      return;
    }
    if (!tenantPhone.trim()) {
      alert('Nomor WhatsApp penyewa wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const sanitizedPhone = tenantPhone.trim();

      await saveLease({
        ...(lease?.id ? { id: lease.id } : {}),
        property_id: property.id,
        tenant_name: tenantName.trim(),
        tenant_phone: sanitizedPhone,
        tenant_nik: tenantNik.trim() || null,
        billing_cycle: billingCycle,
        rate_amount: Number(rateAmount) || 0,
        deposit_amount: depositAmount === '' ? null : Number(depositAmount),
        start_date: startDate,
        next_due_date: nextDueDate,
        notes: notes.trim() || null,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to check-in tenant / save lease:', err);
      alert('Gagal menyimpan data sewa. Silakan periksa kembali isian Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cycleMonths = getCycleMonths(billingCycle);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Perbarui Kontrak Penyewa' : 'Check-in Penyewa Baru'}
      description={`Mulai masa sewa baru untuk unit ${property.name}`}
      icon={
        isEditing ? (
          <UserCheck className="w-4 h-4 text-emerald-600" />
        ) : (
          <UserPlus className="w-4 h-4 text-emerald-600" />
        )
      }
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* Banner Unit Terpilih */}
        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {property.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                Unit Terpilih
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">
              {property.address || 'Alamat belum diatur'}
            </p>
            {property.monthly_rate ? (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                Tarif Acuan: {formatRupiah(property.monthly_rate)} / bulan
                {property.min_rental_months ? (
                  <span className="text-slate-500 font-normal ml-1.5 text-[11px]">
                    (Min. {property.min_rental_months === 12 ? '1 Tahun' : `${property.min_rental_months} Bulan`})
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>

        {/* Identitas Penyewa */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Identitas Penyewa</span>
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Penyewa *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp Aktif *
              </label>
              <input
                type="tel"
                required
                placeholder="Contoh: 081234567890"
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Target pengiriman kuitansi tagihan & link kontrak
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIK KTP (Opsional)
              </label>
              <input
                type="text"
                maxLength={16}
                placeholder="16 Digit NIK KTP"
                value={tenantNik}
                onChange={(e) => setTenantNik(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Untuk lembar surat perjanjian sewa (SPSM)
              </span>
            </div>
          </div>
        </div>

        {/* Masa Sewa & Keuangan */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Ketentuan Sewa & Tarif</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mulai Masuk / Sewa *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Siklus Pembayaran *
              </label>
              <CustomSelect
                value={billingCycle}
                onChange={(val) => handleCycleChange(val as BillingCycle)}
                options={[
                  { value: 'monthly', label: 'Bulanan (1 Bulan)' },
                  { value: 'quarterly', label: 'Per 3 Bulan (Triwulan)' },
                  { value: 'semi_annual', label: 'Per 6 Bulan (Semester)' },
                  { value: 'annual', label: 'Per 1 Tahun (Tahunan)' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Tarif Sewa Periode Ini *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  min={0}
                  step={50000}
                  placeholder="9000000"
                  value={rateAmount}
                  onChange={(e) =>
                    setRateAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">
                {rateAmount !== '' ? `${formatRupiah(Number(rateAmount))} untuk ${cycleMonths} bulan` : ''}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Uang Jaminan / Deposit (Opsional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  Rp
                </span>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  placeholder="Contoh: 500000"
                  value={depositAmount}
                  onChange={(e) =>
                    setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Dikembalikan saat masa sewa selesai
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Jatuh Tempo Berikutnya *
            </label>
            <input
              type="date"
              required
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Dihitung otomatis berdasarkan tanggal mulai & siklus pembayaran
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Perjanjian Khusus (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Bawa 1 motor, listrik token ditanggung penyewa"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-[0.98] disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Menyimpan...</span>
            ) : isEditing ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Simpan Perubahan Kontrak</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Check-in Penyewa Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

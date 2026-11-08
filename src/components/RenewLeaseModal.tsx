'use client';

import React, { useState } from 'react';
import { Lease, Property } from '@/types/database';
import { calculateNextDueDate } from '@/lib/billing';
import { formatDateIndonesian, formatRupiah, getCycleShortLabel } from '@/lib/formatters';
import { renewLease } from '@/lib/storage';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { ArrowRight, Calendar, CheckCircle2, RotateCw } from 'lucide-react';

interface RenewLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  lease: Lease;
  property: Property;
  onSuccess: () => void;
}

export const RenewLeaseModal: React.FC<RenewLeaseModalProps> = ({
  isOpen,
  onClose,
  lease,
  property,
  onSuccess,
}) => {
  const nextCalculatedDueDate = calculateNextDueDate(lease.next_due_date, lease.billing_cycle);

  const [paymentAmount, setPaymentAmount] = useState<number>(lease.rate_amount);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await renewLease(lease.id, paymentAmount, notes);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to renew lease', err);
      alert('Gagal memperpanjang sewa. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Perpanjang Masa Sewa"
      description={`${property.name} - ${lease.tenant_name}`}
      icon={<RotateCw className="w-4 h-4" />}
      headerAccentBg="bg-teal-500/10 text-teal-600 dark:text-teal-400"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* Due date progression visual */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-500" />
            <span>Perpanjangan ({getCycleShortLabel(lease.billing_cycle)}):</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-slate-600 dark:text-slate-400">
              {formatDateIndonesian(lease.next_due_date)}
            </span>
            <ArrowRight className="w-4 h-4 text-teal-500 mx-2 flex-shrink-0" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {formatDateIndonesian(nextCalculatedDueDate)}
            </span>
          </div>
        </div>

        {/* Payment amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nominal Pembayaran Diterima (Rp) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Rp
            </span>
            <input
              type="number"
              required
              min={0}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Otomatis dibukukan sebagai pemasukan sewa pada tanggal hari ini.
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Catatan Pembayaran (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: Transfer BCA lunas, bukti tersimpan"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="bg-emerald-500/10 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span>
            Menekan konfirmasi akan memperpanjang masa sewa sebesar <strong>{getCycleShortLabel(lease.billing_cycle)}</strong> dan mencatat pemasukan sebesar <strong>{formatRupiah(paymentAmount)}</strong>.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-center"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 rounded-xl shadow-xs transition disabled:opacity-50 text-center"
          >
            {isSubmitting ? 'Memproses...' : 'Konfirmasi Pelunasan'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

'use client';

import React, { useState } from 'react';
import { Property, TransactionCategory } from '@/types/database';
import { saveTransaction } from '@/lib/storage';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { WalletCards } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSuccess: () => void;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  properties,
  onSuccess,
}) => {
  const [propertyId, setPropertyId] = useState<string>(properties[0]?.id || '');
  const [category, setCategory] = useState<TransactionCategory>('expense_maintenance');
  const [amount, setAmount] = useState<number | ''>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !amount) {
      alert('Pilih properti dan masukkan nominal transaksi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveTransaction({
        property_id: propertyId,
        category,
        amount: Number(amount),
        transaction_date: transactionDate,
        description: description.trim(),
        receipt_file_url: receiptUrl.trim() || null,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save transaction', err);
      alert('Gagal mencatat transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Transaksi Kas"
      description="Pemasukan sewa atau pengeluaran perawatan unit"
      icon={<WalletCards className="w-4 h-4" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* Properti */}
        <CustomSelect
          label="Unit Properti Terkait"
          required
          value={propertyId}
          onChange={setPropertyId}
          title="Pilih Unit Properti Terkait"
          options={properties.map((p) => ({ value: p.id, label: p.name }))}
          className="bg-slate-50 dark:bg-slate-950/60"
        />

        {/* Kategori */}
        <CustomSelect
          label="Kategori Transaksi"
          required
          value={category}
          onChange={(val) => setCategory(val as TransactionCategory)}
          title="Pilih Kategori Transaksi"
          options={[
            { group: 'Pengeluaran (Biaya)', value: 'expense_maintenance', label: 'Perbaikan / Biaya Tukang' },
            { group: 'Pengeluaran (Biaya)', value: 'expense_tax', label: 'Pajak Bumi & Bangunan (PBB)' },
            { group: 'Pengeluaran (Biaya)', value: 'expense_other', label: 'Retribusi RT/RW / Iuran Lingkungan' },
            { group: 'Pemasukan (Uang Masuk)', value: 'income_rent', label: 'Uang Sewa Kontrakan' },
            { group: 'Pemasukan (Uang Masuk)', value: 'income_deposit', label: 'Uang Jaminan / Deposit' },
          ]}
          className="bg-slate-50 dark:bg-slate-950/60"
        />

        {/* Nominal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nominal Transaksi (Rp) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Rp
            </span>
            <input
              type="number"
              required
              min={1}
              placeholder="Contoh: 150000"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            />
          </div>
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tanggal Transaksi *
          </label>
          <input
            type="date"
            required
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Keterangan / Rincian *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Beli kran wastafel & ongkos tukang"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Foto Bukti / Link Nota */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Link Foto Nota / Bukti (Opsional)
          </label>
          <input
            type="text"
            placeholder="URL foto / nama file nota"
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
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
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-xs transition disabled:opacity-50 text-center"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
import { Property, Transaction, TransactionCategory } from '@/types/database';
import {
  deleteTransaction,
  getProperties,
  getTransactions,
} from '@/lib/storage';
import { formatDateIndonesian, formatRupiah, getCategoryLabel } from '@/lib/formatters';
import { TransactionFormModal } from '@/components/TransactionFormModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { FinanceSummarySkeleton, TransactionRowSkeleton } from '@/components/ui/Skeleton';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Filter,
  Plus,
  Receipt,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  WalletCards,
} from 'lucide-react';

export default function FinancePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, t] = await Promise.all([getProperties(), getTransactions()]);
      setProperties(p);
      setTransactions(t);
    } catch (err) {
      console.error('Error loading finance data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmDeleteTx = async () => {
    if (!txToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(txToDelete.id);
      await loadData();
      setTxToDelete(null);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter logic
  const filteredTransactions = transactions.filter((t) => {
    if (selectedPropertyId !== 'all' && t.property_id !== selectedPropertyId) {
      return false;
    }
    if (categoryFilter === 'income') {
      return t.category.startsWith('income_');
    }
    if (categoryFilter === 'expense') {
      return t.category.startsWith('expense_');
    }
    return true;
  });

  // Calculate totals for filtered list
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of filteredTransactions) {
    if (t.category.startsWith('income_')) {
      totalIncome += Number(t.amount);
    } else if (t.category.startsWith('expense_')) {
      totalExpense += Number(t.amount);
    }
  }

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Buku Kas & Laba Bersih
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pencatatan uang sewa masuk, deposit, dan biaya operasional perawatan unit.
          </p>
        </div>
        <button
          onClick={() => setIsTxModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Transaksi</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      {isLoading ? (
        <FinanceSummarySkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
          {/* Total Pemasukan (Col 1 di Mobile) */}
          <div className="bg-white dark:bg-slate-900/90 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[95px] sm:min-h-[110px]">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="truncate">Pemasukan</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="my-1 sm:my-2">
              <span className="text-base xs:text-lg sm:text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300 block truncate">
                {formatRupiah(totalIncome)}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
              Sewa unit & deposit
            </p>
          </div>

          {/* Total Pengeluaran (Col 2 di Mobile) */}
          <div className="bg-white dark:bg-slate-900/90 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[95px] sm:min-h-[110px]">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-400">
              <span className="truncate">Pengeluaran</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-500/10 dark:bg-rose-500/15 flex items-center justify-center shrink-0">
                <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <div className="my-1 sm:my-2">
              <span className="text-base xs:text-lg sm:text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-300 block truncate">
                {formatRupiah(totalExpense)}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
              Biaya perawatan unit
            </p>
          </div>

          {/* Laba Bersih Riil (Col-Span-2 di Mobile sebagai Hero Banner) */}
          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-emerald-700/30 flex flex-col justify-between min-h-[95px] sm:min-h-[110px]">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-200">
              <span>Laba Bersih Riil</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Wallet className="w-3.5 h-3.5 text-emerald-300" />
              </div>
            </div>
            <div className="my-1 sm:my-2">
              <span className="text-lg xs:text-xl sm:text-2xl font-bold text-white tracking-tight block truncate">
                {formatRupiah(netProfit)}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-200/80 truncate">
              Pemasukan dikurangi biaya perawatan
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar (Stacked on Mobile) */}
      <div className="bg-white dark:bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs sm:text-sm shadow-2xs">
        <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2 w-full sm:w-auto">
          <span className="text-slate-400 text-xs font-semibold whitespace-nowrap">Filter Unit:</span>
          <div className="flex-1 sm:w-64 min-w-0 w-full">
            <CustomSelect
              value={selectedPropertyId}
              onChange={setSelectedPropertyId}
              title="Filter Unit Kontrakan"
              options={[
                { value: 'all', label: 'Semua Unit Kontrakan' },
                ...properties.map((p) => ({ value: p.id, label: p.name })),
              ]}
              className="py-1.5 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'income', label: 'Pemasukan (+)' },
            { id: 'expense', label: 'Pengeluaran (-)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`text-center py-2 px-1.5 rounded-xl font-semibold transition text-xs truncate cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table / Cards */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Riwayat Transaksi ({filteredTransactions.length})
            </h3>
          </div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <TransactionRowSkeleton key={i} />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400 space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="max-w-xs mx-auto">
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                {transactions.length === 0 ? 'Belum Ada Transaksi Kas' : 'Tidak Ada Transaksi pada Filter Ini'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {transactions.length === 0
                  ? 'Catat uang masuk sewa atau biaya perawatan/operasional unit untuk menghitung laba bersih secara akurat.'
                  : 'Silakan ubah filter kategori atau filter unit di atas.'}
              </p>
            </div>
            {transactions.length === 0 && (
              <button
                onClick={() => setIsTxModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catat Transaksi Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const catInfo = getCategoryLabel(tx.category);
              const prop = properties.find((p) => p.id === tx.property_id);

              return (
                <div
                  key={tx.id}
                  className="p-3 sm:p-4 sm:px-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition flex items-center justify-between gap-2.5 sm:gap-3"
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        catInfo.isIncome
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {catInfo.isIncome ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[180px] xs:max-w-[240px] sm:max-w-none">
                          {tx.description}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border shrink-0 ${
                            catInfo.isIncome
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                          }`}
                        >
                          {catInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 flex-wrap">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px] sm:max-w-none">
                          {prop ? prop.name : 'Unit Kontrakan'}
                        </span>
                        <span>•</span>
                        <span>{formatDateIndonesian(tx.transaction_date)}</span>
                        {tx.receipt_file_url && (
                          <>
                            <span>•</span>
                            <span className="text-teal-600 dark:text-teal-400 font-medium">Ada Bukti</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nominal and Delete */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                        catInfo.isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {catInfo.isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setTxToDelete(tx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Hapus transaksi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {isTxModalOpen && (
        <TransactionFormModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          properties={properties}
          onSuccess={loadData}
        />
      )}

      {/* Confirmation Modal for Transaction Deletion */}
      <ConfirmModal
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        onConfirm={confirmDeleteTx}
        title="Hapus Catatan Transaksi"
        message={
          txToDelete ? (
            <span>
              Apakah Anda yakin ingin menghapus transaksi <strong>"{txToDelete.description}"</strong> sebesar{' '}
              <strong className="text-slate-900 dark:text-white font-mono">{formatRupiah(txToDelete.amount)}</strong>? Tindakan ini akan memperbarui total laba bersih.
            </span>
          ) : ''
        }
        confirmLabel="Ya, Hapus Transaksi"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

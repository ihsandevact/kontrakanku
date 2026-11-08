import { BillingCycle, LeaseStatus, TransactionCategory } from '@/types/database';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndonesian(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getCycleLabel(cycle: BillingCycle): string {
  switch (cycle) {
    case 'monthly':
      return '1 Bulan (Bulanan)';
    case 'quarterly':
      return '3 Bulan (Triwulan)';
    case 'semi_annual':
      return '6 Bulan (Semester)';
    case 'annual':
      return '12 Bulan (Tahunan)';
    default:
      return cycle;
  }
}

export function getCycleShortLabel(cycle: BillingCycle): string {
  switch (cycle) {
    case 'monthly':
      return '1 Bulan';
    case 'quarterly':
      return '3 Bulan';
    case 'semi_annual':
      return '6 Bulan';
    case 'annual':
      return '1 Tahun';
    default:
      return cycle;
  }
}

export function getCycleMonths(cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly':
      return 1;
    case 'quarterly':
      return 3;
    case 'semi_annual':
      return 6;
    case 'annual':
      return 12;
    default:
      return 6;
  }
}

export function formatRentalPeriod(months?: number | null): string {
  if (months === 1) return 'Bebas';
  if (!months || months === 6) return '6 Bulan';
  if (months === 3) return '3 Bulan';
  if (months === 12) return '1 Tahun';
  return `${months} Bulan`;
}

export function formatRentalPeriodShort(months?: number | null): string {
  if (months === 1) return 'Bebas';
  if (!months || months === 6) return '6 Bln';
  if (months === 3) return '3 Bln';
  if (months === 12) return '1 Thn';
  return `${months} Bln`;
}

export function getCategoryLabel(category: TransactionCategory): {
  label: string;
  isIncome: boolean;
} {
  switch (category) {
    case 'income_rent':
      return { label: 'Sewa Masuk', isIncome: true };
    case 'income_deposit':
      return { label: 'Deposit / Jaminan', isIncome: true };
    case 'expense_maintenance':
      return { label: 'Perbaikan / Tukang', isIncome: false };
    case 'expense_tax':
      return { label: 'Pajak PBB', isIncome: false };
    case 'expense_other':
      return { label: 'Retribusi / Lainnya', isIncome: false };
    default:
      return { label: category, isIncome: false };
  }
}

export function getStatusBadge(status: LeaseStatus): {
  label: string;
  colorClass: string;
  bgClass: string;
  dotColor: string;
} {
  switch (status) {
    case 'active':
      return {
        label: 'Aktif Lancar',
        colorClass: 'text-emerald-700 dark:text-emerald-300',
        bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 dark:border-emerald-500/30',
        dotColor: 'bg-emerald-500',
      };
    case 'due_soon':
      return {
        label: 'Mendekati Tempo',
        colorClass: 'text-amber-700 dark:text-amber-300',
        bgClass: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 dark:border-amber-500/30',
        dotColor: 'bg-amber-500 shadow-xs shadow-amber-500/50',
      };
    case 'overdue':
      return {
        label: 'Jatuh Tempo',
        colorClass: 'text-rose-700 dark:text-rose-300',
        bgClass: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/25 dark:border-rose-500/30',
        dotColor: 'bg-rose-500 shadow-xs shadow-rose-500/50',
      };
    case 'vacant':
      return {
        label: 'Kosong',
        colorClass: 'text-slate-600 dark:text-slate-300',
        bgClass: 'bg-slate-500/10 dark:bg-slate-500/15 border-slate-500/20 dark:border-slate-500/30',
        dotColor: 'bg-slate-400',
      };
    default:
      return {
        label: status,
        colorClass: 'text-gray-700',
        bgClass: 'bg-gray-500/10 border-gray-500/20',
        dotColor: 'bg-gray-400',
      };
  }
}

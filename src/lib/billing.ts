import { BillingCycle, LeaseStatus } from '@/types/database';
import { getCycleMonths } from './formatters';

export function calculateNextDueDate(startDateOrCurrentDue: string, cycle: BillingCycle): string {
  const date = new Date(startDateOrCurrentDue);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date provided to calculateNextDueDate');
  }

  const monthsToAdd = getCycleMonths(cycle);
  const targetDate = new Date(date);
  
  // Handling end of month / leap year edge cases safely
  const originalDay = targetDate.getDate();
  targetDate.setMonth(targetDate.getMonth() + monthsToAdd);
  
  // If month overflowed (e.g. Jan 31 + 1 month became March 2/3), rewind to last day of previous month
  if (targetDate.getDate() !== originalDay) {
    targetDate.setDate(0);
  }

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getDaysUntilDue(nextDueDate: string): number {
  if (!nextDueDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(nextDueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function evaluateLeaseStatus(nextDueDate: string, reminderDays: number = 7): LeaseStatus {
  if (!nextDueDate) return 'vacant';
  const days = getDaysUntilDue(nextDueDate);

  if (days < 0) {
    return 'overdue';
  } else if (days <= reminderDays) {
    return 'due_soon';
  } else {
    return 'active';
  }
}

export function formatDaysUntilDue(days: number): string {
  if (days < 0) {
    return `Lewat ${Math.abs(days)} hari`;
  } else if (days === 0) {
    return 'Jatuh tempo HARI INI';
  } else if (days === 1) {
    return 'Besok (H-1)';
  } else {
    return `${days} hari lagi (H-${days})`;
  }
}

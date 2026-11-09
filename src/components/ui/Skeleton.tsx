'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/80 ${className}`}
      {...props}
    />
  );
};

/**
 * Skeleton for Property Cards on `/properties`
 */
export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header: Title & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-5 w-3/5 rounded-lg" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full shrink-0" />
        </div>

        {/* Meters (PLN / PDAM) */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>

        {/* Tenant / Lease Info Box */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/70 dark:border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="h-8 rounded-xl sm:w-28" />
        <Skeleton className="h-8 rounded-xl sm:w-28" />
        <Skeleton className="h-8 rounded-xl sm:w-24 sm:ml-auto" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Financial Summary Cards on `/finance`
 */
export const FinanceSummarySkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
      {/* Pemasukan Card */}
      <div className="bg-white dark:bg-slate-900/90 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[95px] sm:min-h-[110px] space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <Skeleton className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
        </div>
        <Skeleton className="h-6 sm:h-8 w-3/4 rounded-lg my-1" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
      </div>

      {/* Pengeluaran Card */}
      <div className="bg-white dark:bg-slate-900/90 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[95px] sm:min-h-[110px] space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <Skeleton className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
        </div>
        <Skeleton className="h-6 sm:h-8 w-3/4 rounded-lg my-1" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
      </div>

      {/* Laba Bersih Hero Banner */}
      <div className="col-span-2 sm:col-span-1 bg-slate-900/80 dark:bg-slate-950 p-3.5 sm:p-5 rounded-2xl shadow-xs border border-slate-800 flex flex-col justify-between min-h-[95px] sm:min-h-[110px] space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-24 rounded-md bg-slate-700" />
          <Skeleton className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-700" />
        </div>
        <Skeleton className="h-6 sm:h-8 w-3/4 rounded-lg my-1 bg-slate-700" />
        <Skeleton className="h-3 w-1/2 rounded-md bg-slate-700" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Transaction Rows on `/finance`
 */
export const TransactionRowSkeleton: React.FC = () => {
  return (
    <div className="p-3 sm:p-4 sm:px-5 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0" />
        <div className="space-y-1.5 min-w-0 flex-1">
          <Skeleton className="h-4 w-2/5 rounded-md" />
          <Skeleton className="h-3 w-1/4 rounded-md" />
        </div>
      </div>
      <div className="space-y-1.5 text-right shrink-0">
        <Skeleton className="h-4 w-24 rounded-md ml-auto" />
        <Skeleton className="h-3 w-16 rounded-md ml-auto" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Application Cards on `/applications`
 */
export const ApplicationCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3.5">
      {/* Header: Avatar, Name & Status Pill */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Skeleton className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-4.5 w-1/3 rounded-lg" />
            <Skeleton className="h-3.5 w-1/2 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full shrink-0" />
      </div>

      {/* Details Box */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>
      </div>

      {/* Action Row */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <Skeleton className="h-8 w-28 rounded-xl" />
        <Skeleton className="h-8 w-36 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Public Catalog Cards on `/katalog` & `/katalog/[slug]`
 */
export const CatalogCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Photo Box */}
        <Skeleton className="w-full h-48 sm:h-52 rounded-none" />

        {/* Content Body */}
        <div className="p-5 pt-0 space-y-3.5">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-3.5 w-1/2 rounded-md" />
          </div>

          {/* Pricing & Min Rental */}
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-xl" />
          </div>

          {/* Facility Chips */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3 w-20 rounded-md" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-28 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-5 pt-0 space-y-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Application Form on `/sewa` & `/sewa/[slug]`
 */
export const SewaFormSkeleton: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Unit Selected Preview Skeleton Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/5 rounded-lg" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </div>

      {/* Form Fields Box Skeleton */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Skeleton className="h-5 w-48 rounded-lg" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <Skeleton className="h-3.5 w-36 rounded-md" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>

        <Skeleton className="h-12 w-full rounded-xl pt-2" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Contract Document on `/kontrak/[id]`
 */
export const ContractDocumentSkeleton: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Contract Paper Box */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        {/* Title & Document Badge */}
        <div className="text-center space-y-2 border-b border-slate-100 dark:border-slate-800 pb-5">
          <Skeleton className="h-6 w-3/4 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-1/2 mx-auto rounded-md" />
          <Skeleton className="h-4 w-1/3 mx-auto rounded-md" />
        </div>

        {/* Parties Identity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-3.5 w-28 rounded-md" />
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-3.5 w-28 rounded-md" />
          </div>
        </div>

        {/* Legal Clauses Skeleton */}
        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-44 rounded-md" />
          <div className="space-y-2 pl-4">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-11/12 rounded-md" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
            <Skeleton className="h-3.5 w-full rounded-md" />
          </div>
        </div>

        {/* Signature Areas Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 text-center">
            <Skeleton className="h-4 w-32 mx-auto rounded-md" />
            <Skeleton className="h-20 w-36 mx-auto rounded-xl" />
            <Skeleton className="h-3 w-28 mx-auto rounded-md" />
          </div>
          <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 text-center">
            <Skeleton className="h-4 w-32 mx-auto rounded-md" />
            <Skeleton className="h-20 w-36 mx-auto rounded-xl" />
            <Skeleton className="h-3 w-28 mx-auto rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Settings Page on `/settings`
 */
export const SettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>

      {/* Card 1: Profil Bisnis */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Card 2: Rekening */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <Skeleton className="h-5 w-44 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

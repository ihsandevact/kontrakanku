'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property } from '@/types/database';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { formatRupiah } from '@/lib/formatters';
import { formatPhoneNumber } from '@/lib/whatsapp';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  ExternalLink,
  Flame,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  isOccupied?: boolean;
  ownerName?: string;
  ownerPhone?: string;
  businessName?: string;
  applyUrl?: string;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  isOpen,
  onClose,
  property,
  isOccupied = false,
  ownerName = 'Pemilik Kontrakan',
  ownerPhone,
  businessName = 'Kontrakan Mandiri',
  applyUrl,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Reset active photo index when opened or property changed
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [property?.id, isOpen]);

  if (!property) return null;

  // Prepare photos array
  const photos: string[] =
    property.photos && property.photos.length > 0
      ? property.photos
      : property.photo_url
      ? [property.photo_url]
      : [];

  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[activePhotoIndex] : null;

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  // Pricing calculations
  const monthlyRate = property.monthly_rate || 0;
  const minMonths = property.min_rental_months ?? 6;
  const packageTotal = monthlyRate * minMonths;

  // Formatted period label
  const periodLabel = minMonths === 12 ? '1 Tahun' : `${minMonths} Bulan`;

  // WhatsApp inquiry URL
  const waInquiryText = `Halo ${ownerName}, saya melihat detail unit *${property.name}* di katalog online ${businessName}. Apakah unit ini masih tersedia untuk disewa?`;
  const waUrl = ownerPhone
    ? `https://wa.me/${formatPhoneNumber(ownerPhone)}?text=${encodeURIComponent(waInquiryText)}`
    : null;

  // Default facilities fallback
  const facilitiesList =
    property.facilities && property.facilities.length > 0
      ? property.facilities
      : ['Listrik Token Mandiri', 'Air PDAM Lancar', 'Parkir Motor Aman', 'Bebas Banjir'];

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={property.name}
      description={property.address || `${businessName} • Hunian Nyaman Siap Huni`}
      icon={<Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
      headerAccentBg="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 pb-4">
        {/* Photo Gallery Viewer */}
        <div className="space-y-2.5">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-inner group">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={`${property.name} - Foto ${activePhotoIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2 bg-slate-100 dark:bg-slate-800/80">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700/60 flex items-center justify-center text-slate-400">
                  <Building2 className="w-8 h-8" />
                </div>
                <span className="text-xs font-medium text-slate-400">Foto belum diunggah</span>
              </div>
            )}

            {/* Availability Status Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                  isOccupied
                    ? 'bg-slate-900/80 text-slate-300 border border-white/10'
                    : 'bg-emerald-600/90 text-white border border-emerald-400/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOccupied ? 'bg-slate-400' : 'bg-emerald-300 animate-pulse'
                  }`}
                />
                <span>{isOccupied ? 'Sedang Terisi' : 'Tersedia • Siap Huni'}</span>
              </span>
            </div>

            {/* Photo Counter Pill */}
            {photos.length > 1 && (
              <div className="absolute top-3 right-3 z-10">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/15 shadow-xs">
                  {activePhotoIndex + 1} / {photos.length} Foto
                </span>
              </div>
            )}

            {/* Navigation Arrows for multi-photo */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition active:scale-90 border border-white/20 shadow-md cursor-pointer"
                  aria-label="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition active:scale-90 border border-white/20 shadow-md cursor-pointer"
                  aria-label="Foto Selanjutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Gallery Strip */}
          {photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-emerald-500 scale-105 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-bold text-emerald-300 text-center py-0.5 uppercase tracking-tighter">
                      Cover
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Terms Highlight Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Biaya Sewa Unit
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
                  {monthlyRate > 0 ? formatRupiah(monthlyRate) : 'Hubungi Pemilik'}
                </span>
                {monthlyRate > 0 && (
                  <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                    / bulan
                  </span>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-emerald-200/60 dark:border-emerald-800/40 pt-2 sm:pt-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {minMonths <= 1 ? 'Min. Sewa Bebas (1 Bln)' : `Min. Sewa: ${periodLabel}`}
                </span>
              </span>
              {monthlyRate > 0 && minMonths > 1 && (
                <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300/90 mt-1">
                  Paket {periodLabel}: <strong>{formatRupiah(packageTotal)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Technical & Utilities Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Listrik Unit
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block mt-0.5 truncate">
                {property.electricity_id
                  ? `Token Prabayar (ID: ${property.electricity_id})`
                  : 'Listrik Token Mandiri'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Isi ulang pulsa mandiri sesuai pemakaian
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Sumber Air Bersih
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block mt-0.5 truncate">
                {property.water_id
                  ? `PDAM Mandiri (ID: ${property.water_id})`
                  : 'PDAM / Air Bersih Deras 24 Jam'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Kualitas jernih, higienis, dan tidak berbau
              </span>
            </div>
          </div>
        </div>

        {/* Location & Address */}
        {property.address && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Lokasi & Alamat Unit
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                {property.address}
              </p>
            </div>
          </div>
        )}

        {/* Facilities Badges */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Fasilitas Unit & Lingkungan</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {facilitiesList.map((facility, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200/80 dark:border-slate-700 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{facility}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Description & House Rules */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Deskripsi & Ketentuan Unit</span>
          </span>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {property.description?.trim() ||
              `Unit ${property.name} di ${businessName} dalam kondisi bersih, terawat, dan siap ditempati. Lingkungan tenang, aman, dan strategis dekat dengan akses jalan utama, minimarket, serta fasilitas umum.`}
          </div>
        </div>

        {/* Landlord Trust Badge */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Dikelola langsung oleh <strong>{ownerName}</strong> tanpa calo atau biaya komisi perantara. Seluruh pembayaran sewa langsung ke rekening pemilik.
          </span>
        </div>

        {/* Sticky Action Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          {!isOccupied ? (
            applyUrl ? (
              <Link
                href={applyUrl}
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-[0.98] cursor-pointer"
              >
                <span>Ajukan Sewa Unit Ini Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : null
          ) : (
            <div className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold text-center border border-slate-200 dark:border-slate-700">
              Unit ini sedang terisi penuh oleh penyewa aktif
            </div>
          )}

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tanya Pemilik via WA</span>
            </a>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
};

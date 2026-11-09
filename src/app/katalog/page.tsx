'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppSettings, Lease, Property } from '@/types/database';
import { getLeases, getProperties, getSettings } from '@/lib/storage';
import { formatRupiah } from '@/lib/formatters';
import { generateCatalogInquiryUrl } from '@/lib/application-whatsapp';
import { PropertyDetailModal } from '@/components/public/PropertyDetailModal';
import { CatalogCardSkeleton } from '@/components/ui/Skeleton';
import {
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Flame,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialUnitId = searchParams.get('unit') || '';

  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Initial data loading - only runs on initial mount to prevent modal re-fetch flicker
  useEffect(() => {
    async function load() {
      try {
        const [p, l, s] = await Promise.all([
          getProperties(),
          getLeases(),
          getSettings(),
        ]);
        const listedProps = p.filter((item) => item.is_public_listed !== false);
        setProperties(listedProps);
        setLeases(l);
        setSettings(s);

        // Deep-linking: auto-open modal if ?unit= matches a property on initial mount
        if (initialUnitId && listedProps.length > 0) {
          const matched = listedProps.find((item) => item.id === initialUnitId);
          if (matched) setSelectedProperty(matched);
        }
      } catch (err) {
        console.error('Failed to load catalog data', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Handle browser back/forward buttons smoothly without page reload
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const unit = new URLSearchParams(window.location.search).get('unit');
      if (unit && properties.length > 0) {
        const matched = properties.find((p) => p.id === unit);
        setSelectedProperty(matched || null);
      } else {
        setSelectedProperty(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [properties]);

  // Deep-linking URL sync helpers (instant 0ms without page re-fetch)
  const handleOpenDetail = (prop: Property) => {
    setSelectedProperty(prop);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('unit') !== prop.id) {
        url.searchParams.set('unit', prop.id);
        window.history.pushState({ unitId: prop.id }, '', url.toString());
      }
    }
  };

  const handleCloseDetail = () => {
    setSelectedProperty(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('unit')) {
        url.searchParams.delete('unit');
        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  };

  const occupiedPropertyIds = new Set(
    leases
      .filter((l) => l.status === 'active' || l.status === 'due_soon' || l.status === 'overdue')
      .map((l) => l.property_id)
  );

  const displayedProperties = properties.filter((p) => {
    if (p.is_public_listed === false) return false;
    if (filterAvailability === 'available') {
      return !occupiedPropertyIds.has(p.id);
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner Promosi */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white p-6 sm:p-10 border border-emerald-700/30 shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Katalog Resmi Rumah Kontrakan Mandiri</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Hunian Kontrakan Nyaman, Bersih & Terjangkau
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Pilihan rumah kontrakan siap huni langsung dari pemilik tanpa perantara. Dilengkapi fasilitas lengkap, lingkungan aman, bebas banjir, dan air bersih 24 jam.
          </p>

          {/* Value Props Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-emerald-200">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs">
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Tanpa Biaya Perantara</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs">
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Listrik Token & PDAM Mandiri</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs">
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Bebas Banjir</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterAvailability('all')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              filterAvailability === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Semua Unit ({properties.length})
          </button>
          <button
            onClick={() => setFilterAvailability('available')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              filterAvailability === 'available'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Siap Huni ({properties.length - occupiedPropertyIds.size})</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Menampilkan {displayedProperties.length} unit
        </span>
      </div>

      {/* Grid Properties */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CatalogCardSkeleton key={i} />
          ))}
        </div>
      ) : displayedProperties.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak Ada Unit Kontrakan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Belum ada unit yang terdaftar atau tersedia untuk publik saat ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProperties.map((prop) => {
          const isOccupied = occupiedPropertyIds.has(prop.id);
          const monthlyPrice = prop.monthly_rate || 0;
          const photoSrc = prop.photos?.[0] || prop.photo_url || null;
          const totalPhotos = prop.photos?.length || (prop.photo_url ? 1 : 0);

          // WhatsApp inquiry URL
          const inquiryUrl = settings
            ? generateCatalogInquiryUrl({
                propertyName: prop.name,
                ownerName: settings.account_holder,
                ownerPhone: settings.contact_phone || '628123456789',
              })
            : '#';

          // Facilities limiter: max 3 preview items
          const allFacilities = prop.facilities && prop.facilities.length > 0
            ? prop.facilities
            : ['Listrik Token Mandiri', 'Air PDAM Lancar', 'Parkir Motor Aman', 'Bebas Banjir'];
          const previewFacilities = allFacilities.slice(0, 3);
          const remainingCount = allFacilities.length - previewFacilities.length;

          return (
            <div
              key={prop.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group h-full ${
                !isOccupied
                  ? 'border-slate-200/90 dark:border-slate-800'
                  : 'border-slate-200/80 dark:border-slate-800 opacity-90'
              }`}
            >
              <div>
                {/* Visual Header with Real Photo or Fallback - Clickable */}
                <div
                  onClick={() => handleOpenDetail(prop)}
                  className="block relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900 group cursor-pointer"
                >
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt={prop.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-800 via-emerald-950 to-teal-900 flex items-center justify-center">
                      <Building2 className="w-24 h-24 text-white/10" />
                    </div>
                  )}

                  {/* Gradient shadow overlay for text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/50 p-4 sm:p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between z-10">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          !isOccupied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800/90 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {!isOccupied ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span>Siap Huni Segera</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span>Sedang Terisi</span>
                          </>
                        )}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {totalPhotos > 1 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-black/60 text-white backdrop-blur-xs border border-white/15">
                            <Camera className="w-3 h-3 text-emerald-400" />
                            <span>{totalPhotos} Foto</span>
                          </span>
                        )}
                        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-black/50 text-emerald-200 backdrop-blur-xs border border-white/10">
                          ID: {prop.id.substring(0, 6)}
                        </span>
                      </div>
                    </div>

                    <div className="z-10 text-white">
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight drop-shadow-xs group-hover:text-emerald-300 transition-colors flex items-center gap-1.5 line-clamp-1">
                        <span>{prop.name}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400 shrink-0" />
                      </h3>
                      {prop.address && (
                        <p className="text-xs text-slate-200/90 flex items-center gap-1 mt-1 drop-shadow-xs truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{prop.address}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3.5">
                  {/* Price & Minimum Stay Compact Row */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Biaya Sewa
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(monthlyPrice)}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/ bln</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs shrink-0">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Min. {prop.min_rental_months === 12 ? '1 Thn' : `${prop.min_rental_months || 6} Bln`}</span>
                    </span>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {prop.description || 'Unit rumah kontrakan bersih, nyaman, dan strategis. Sangat cocok untuk keluarga kecil atau karyawan.'}
                  </p>

                  {/* Limited Facility Chips (Max 3 + "+X lainnya") */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Fasilitas Utama:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {previewFacilities.map((fac, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{fac}</span>
                        </span>
                      ))}
                      {remainingCount > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(prop)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer"
                        >
                          +{remainingCount} lainnya
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenDetail(prop)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer group"
                >
                  <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Lihat Foto & Detail Unit</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {!isOccupied ? (
                    <Link
                      href={`/sewa?propertyId=${prop.id}`}
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-[0.99]"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Daftar / Booking</span>
                    </Link>
                  ) : (
                    <div className="w-full sm:flex-1 py-2.5 text-center text-xs text-slate-400 font-medium italic bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      Sedang terisi penuh
                    </div>
                  )}

                  <a
                    href={inquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>Tanya Pemilik</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Detail Modal with deep linking */}
      <PropertyDetailModal
        isOpen={!!selectedProperty}
        onClose={handleCloseDetail}
        property={selectedProperty}
        isOccupied={selectedProperty ? occupiedPropertyIds.has(selectedProperty.id) : false}
        ownerName={settings?.account_holder || 'Pemilik Kontrakan'}
        ownerPhone={settings?.contact_phone || undefined}
        businessName="Kontrakan Mandiri"
        applyUrl={selectedProperty ? `/sewa?propertyId=${selectedProperty.id}` : undefined}
      />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto py-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CatalogCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}

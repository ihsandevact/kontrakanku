'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LandlordProfile, Lease, Property } from '@/types/database';
import { getLeases, getPublicPropertiesBySlug } from '@/lib/storage';
import { formatRupiah } from '@/lib/formatters';
import { formatPhoneNumber } from '@/lib/whatsapp';
import {
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Home,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function LandlordCatalogPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [landlord, setLandlord] = useState<LandlordProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await getPublicPropertiesBySlug(slug);
        if (!res || !res.landlord) {
          setNotFound(true);
        } else {
          setLandlord(res.landlord);
          setProperties(res.properties);

          const l = await getLeases(res.landlord.id);
          setLeases(l);
        }
      } catch (err) {
        console.error('Failed to load public catalog:', err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium">Memuat katalog unit kontrakan...</span>
      </div>
    );
  }

  if (notFound || !landlord) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Katalog Kontrakan Tidak Ditemukan
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Tautan katalog <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-emerald-600">/katalog/{slug}</code> tidak terdaftar pada sistem kami. Pastikan tautan yang diberikan pemilik sudah tepat.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  const occupiedPropertyIds = new Set(
    leases
      .filter((l) => l.status === 'active' || l.status === 'due_soon' || l.status === 'overdue')
      .map((l) => l.property_id)
  );

  const displayedProperties = properties.filter((p) => {
    if (filterAvailability === 'available') {
      return !occupiedPropertyIds.has(p.id);
    }
    return true;
  });

  const rawPhone = landlord.phone || '';
  const waUrl = rawPhone
    ? `https://wa.me/${formatPhoneNumber(rawPhone)}?text=${encodeURIComponent(
        `Halo ${landlord.owner_name}, saya melihat katalog online ${landlord.business_name}. Apakah ada unit kontrakan yang masih tersedia?`
      )}`
    : '#';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner Pemilik Kontrakan */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white p-6 sm:p-10 border border-emerald-700/30 shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Katalog Resmi • {landlord.business_name}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Pilihan Unit Sewa Nyaman & Strategis di {landlord.business_name}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Dikelola langsung secara mandiri dan amanah oleh <strong>{landlord.owner_name}</strong>. Tanpa perantara dan tanpa biaya komisi tambahan.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-2 w-full sm:w-auto">
            <Link
              href={`/sewa/${slug}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-500/20 active:scale-95 w-full sm:w-auto text-center cursor-pointer"
            >
              <span>Ajukan Sewa Mandiri</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {rawPhone && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/15 backdrop-blur transition w-full sm:w-auto text-center cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>Tanya Pemilik ({landlord.owner_name})</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterAvailability('all')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              filterAvailability === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Semua Unit ({properties.length})
          </button>
          <button
            onClick={() => setFilterAvailability('available')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
              filterAvailability === 'available'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Siap Huni ({properties.length - occupiedPropertyIds.size})</span>
          </button>
        </div>
      </div>

      {/* Property Grid or Empty State */}
      {displayedProperties.length === 0 ? (
        <div className="p-8 sm:p-14 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {properties.length === 0
                ? 'Belum Ada Unit yang Dipublikasikan'
                : 'Semua Unit Sedang Terisi Penuh'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {properties.length === 0
                ? `Pemilik ${landlord.business_name} belum menambahkan unit publik ke dalam katalog ini. Silakan hubungi via WhatsApp untuk bertanya langsung.`
                : `Saat ini seluruh unit di ${landlord.business_name} sedang tersewa. Hubungi pemilik via WhatsApp untuk konfirmasi jadwal ketersediaan berikutnya.`}
            </p>
          </div>
          {rawPhone && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Hubungi {landlord.owner_name} via WA</span>
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProperties.map((prop) => {
            const isOccupied = occupiedPropertyIds.has(prop.id);
            const coverPhoto = prop.photos?.[0] || prop.photo_url || null;

            return (
              <div
                key={prop.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  {/* Image / Header */}
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {coverPhoto ? (
                      <img
                        src={coverPhoto}
                        alt={prop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Building2 className="w-10 h-10 mb-1" />
                        <span className="text-xs">Foto Belum Tersedia</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                          isOccupied
                            ? 'bg-slate-900/80 text-slate-300 backdrop-blur'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isOccupied ? 'Terisi' : 'Tersedia'}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        {prop.name}
                      </h3>
                      {prop.address && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{prop.address}</span>
                        </p>
                      )}
                    </div>

                    {prop.monthly_rate && (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Tarif Sewa
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(prop.monthly_rate)}
                          </span>
                          <span className="text-xs text-slate-500">/ bulan</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Min. sewa: {prop.min_rental_months === 12 ? '1 Tahun' : `${prop.min_rental_months || 6} Bulan`}
                        </span>
                      </div>
                    )}

                    {prop.facilities && prop.facilities.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Fasilitas:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {prop.facilities.map((f, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <Link
                    href={`/sewa/${slug}?property=${prop.id}`}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <span>Ajukan Sewa Unit Ini</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

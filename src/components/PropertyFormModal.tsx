'use client';

import React, { useEffect, useState } from 'react';
import { Lease, Property } from '@/types/database';
import { saveProperty } from '@/lib/storage';
import { formatRupiah } from '@/lib/formatters';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import {
  Building2,
  Camera,
  Check,
  Globe,
  Plus,
  Star,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { compressMultipleImages } from '@/lib/image-utils';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  lease?: Lease | null; // Dijaga opsional agar tidak memutus pemanggilan komponen lama
  onSuccess: (savedProperty?: Property) => void;
}

const PRESET_FACILITIES = [
  'Listrik Token Mandiri',
  'Air PDAM Deras',
  'Parkir Motor Luas',
  'Bebas Banjir',
  '2 Kamar Tidur',
  '1 Kamar Tidur',
  'Dapur Pribadi',
  'Kamar Mandi Dalam',
  'Akses Mobil',
  'AC / Pendingin Ruangan',
  'Teras / Halaman Depan',
  'Lingkungan Tenang & Aman',
];

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  property,
  onSuccess,
}) => {
  const isEditing = Boolean(property);

  // Property state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [electricityId, setElectricityId] = useState('');
  const [waterId, setWaterId] = useState('');
  const [monthlyRate, setMonthlyRate] = useState<number | ''>(1500000);
  const [minRentalMonths, setMinRentalMonths] = useState<number>(6);
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState<string[]>([
    'Listrik Token Mandiri',
    'Air PDAM Deras',
    'Parkir Motor Luas',
    'Bebas Banjir',
  ]);
  const [isPublicListed, setIsPublicListed] = useState<boolean>(true);
  const [customFacility, setCustomFacility] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (property) {
      setName(property.name || '');
      setAddress(property.address || '');
      setElectricityId(property.electricity_id || '');
      setWaterId(property.water_id || '');
      setMonthlyRate(property.monthly_rate ?? 1500000);
      setMinRentalMonths(property.min_rental_months ?? 6);
      setDescription(property.description || '');
      setFacilities(
        property.facilities && property.facilities.length > 0
          ? property.facilities
          : ['Listrik Token Mandiri', 'Air PDAM Deras', 'Parkir Motor Luas', 'Bebas Banjir']
      );
      setIsPublicListed(property.is_public_listed ?? true);
      const initialPhotos: string[] = [];
      if (property.photos && property.photos.length > 0) {
        initialPhotos.push(...property.photos);
      } else if (property.photo_url) {
        initialPhotos.push(property.photo_url);
      }
      setPhotos(initialPhotos);
    } else {
      setName('');
      setAddress('');
      setElectricityId('');
      setWaterId('');
      setMonthlyRate(1500000);
      setMinRentalMonths(6);
      setDescription('');
      setFacilities([
        'Listrik Token Mandiri',
        'Air PDAM Deras',
        'Parkir Motor Luas',
        'Bebas Banjir',
      ]);
      setIsPublicListed(true);
      setPhotos([]);
    }
  }, [property, isOpen]);

  if (!isOpen) return null;

  const toggleFacility = (fac: string) => {
    setFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  };

  const handleAddCustomFacility = () => {
    const trimmed = customFacility.trim();
    if (trimmed && !facilities.includes(trimmed)) {
      setFacilities((prev) => [...prev, trimmed]);
      setCustomFacility('');
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsCompressing(true);
    try {
      const compressedList = await compressMultipleImages(files, 1200, 0.8);
      setPhotos((prev) => [...prev, ...compressedList].slice(0, 8));
    } catch (err) {
      console.error('Error compressing photos:', err);
      alert('Gagal memproses foto. Silakan coba kembali.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const next = [...prev];
      const [chosen] = next.splice(index, 1);
      return [chosen, ...next];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama unit properti wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedProp = await saveProperty({
        ...(property?.id ? { id: property.id } : {}),
        name: name.trim(),
        address: address.trim() || null,
        electricity_id: electricityId.trim() || null,
        water_id: waterId.trim() || null,
        monthly_rate: monthlyRate === '' ? null : Number(monthlyRate),
        min_rental_months: minRentalMonths,
        description: description.trim() || null,
        facilities: facilities.length > 0 ? facilities : null,
        is_public_listed: isPublicListed,
        photo_url: photos.length > 0 ? photos[0] : null,
        photos: photos.length > 0 ? photos : null,
      });

      onSuccess(savedProp);
      onClose();
    } catch (err) {
      console.error('Failed to save property', err);
      alert('Gagal menyimpan properti. Periksa kembali isian Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Unit Properti' : 'Tambah Unit Kontrakan Baru'}
      description="Identitas fisik bangunan, foto promosi, fasilitas, dan tarif katalog"
      icon={<Building2 className="w-4 h-4 text-emerald-600" />}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-5">
        {/* Section 1: Identitas Fisik Unit */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Identitas Fisik Unit</span>
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Unit / Rumah *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kontrakan Melati No. 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Unit
            </label>
            <input
              type="text"
              placeholder="Contoh: Jl. Melati Indah No. 16, RT 03/RW 05"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ID Meter PLN (Listrik Token)
              </label>
              <input
                type="text"
                placeholder="Contoh: 531234567890"
                value={electricityId}
                onChange={(e) => setElectricityId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Sambungan PDAM (Air)
              </label>
              <input
                type="text"
                placeholder="Contoh: PDAM-02198765"
                value={waterId}
                onChange={(e) => setWaterId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Promosi Katalog & Spesifikasi */}
        <div className="space-y-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>2. Foto & Promosi Katalog</span>
            </h4>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {photos.length > 0 ? `${photos.length}/8 foto terunggah` : 'Maks. 8 foto'}
            </span>
          </div>

          {/* Upload Foto & Galeri */}
          <div>
            {photos.length === 0 ? (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full py-7 px-4 rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center group ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/70 bg-slate-50/70 dark:bg-slate-950/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                    {isCompressing
                      ? 'Sedang Mengompresi Foto...'
                      : 'Klik untuk Unggah Foto Kamar / Rumah'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block max-w-sm">
                    Pilih hingga 8 foto (JPG, PNG, WebP). Otomatis dikompresi agar loading katalog cepat dan hemat kuota.
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isCompressing}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {photos.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800 shadow-2xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      {idx === 0 ? (
                        <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                          <Star className="w-2.5 h-2.5 fill-current" /> Cover Utama
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCoverPhoto(idx)}
                          className="absolute top-1.5 left-1.5 bg-black/70 hover:bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs"
                          title="Jadikan Foto Sampul Utama"
                        >
                          Jadikan Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 8 && (
                    <label
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`aspect-4/3 rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 ${
                        isDragging
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[11px] font-bold text-center px-1">
                        {isCompressing ? 'Memproses...' : '+ Tambah Foto'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        ({photos.length}/8)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isCompressing}
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>💡</span>
                  <span>
                    Foto pertama otomatis menjadi sampul depan di website katalog. Anda dapat mengeklik &quot;Jadikan Cover&quot; pada foto mana saja.
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Tarif Standar Bulanan & Visibilitas Publik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tarif Standar Bulanan (Rp) *
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
                  placeholder="1500000"
                  value={monthlyRate}
                  onChange={(e) =>
                    setMonthlyRate(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {monthlyRate
                  ? minRentalMonths === 1
                    ? `Fleksibel: ${formatRupiah(Number(monthlyRate))} / bulan`
                    : `Estimasi paket min. (${minRentalMonths === 12 ? '1 tahun' : `${minRentalMonths} bln`}): ${formatRupiah(Number(monthlyRate) * minRentalMonths)}`
                  : 'Ditampilkan pada kartu katalog'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Visibilitas Publik
              </label>
              <button
                type="button"
                onClick={() => setIsPublicListed(!isPublicListed)}
                className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer text-left ${
                  isPublicListed
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className={`w-4 h-4 ${isPublicListed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span className="font-semibold">
                    {isPublicListed ? 'Tayang di Katalog' : 'Disembunyikan'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  Ubah
                </span>
              </button>
              <p className="text-[11px] text-slate-500 mt-1">
                {isPublicListed
                  ? 'Unit dapat dilihat & dipesan calon penyewa di web'
                  : 'Hanya tampil di dasbor internal pemilik'}
              </p>
            </div>
          </div>

          {/* Minimal Durasi Sewa */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Minimal Durasi Sewa *
              </label>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Ketentuan minimal kontrak sewa
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 1, label: 'Bebas', subtitle: 'Mulai 1 Bln' },
                { value: 3, label: '3 Bulan', subtitle: 'Triwulan' },
                { value: 6, label: '6 Bulan', subtitle: 'Bawaan' },
                { value: 12, label: '1 Tahun', subtitle: '12 Bulan' },
              ].map((opt) => {
                const isSelected = minRentalMonths === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMinRentalMonths(opt.value)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {opt.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {monthlyRate
                ? minRentalMonths === 1
                  ? `Ditampilkan di katalog: Sewa Bebas / Bulanan (${formatRupiah(Number(monthlyRate))}/bln)`
                  : `Ditampilkan di katalog: Sewa ${minRentalMonths === 12 ? '1 Thn' : `${minRentalMonths} Bln`}: ${formatRupiah(Number(monthlyRate) * minRentalMonths)}`
                : 'Pilih batas minimal durasi sewa yang diizinkan untuk unit ini'}
            </p>
          </div>

          {/* Deskripsi Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Unit (Ditampilkan di Katalog Promosi)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Unit kontrakan bersih, baru dicat, ventilasi sejuk, dapur pribadi dengan wastafel, lingkungan aman dan bebas banjir."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Fasilitas Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Fasilitas Unit (Klik untuk Aktifkan / Nonaktifkan):
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PRESET_FACILITIES.map((preset) => {
                const isSelected = facilities.includes(preset);
                return (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => toggleFacility(preset)}
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition active:scale-[0.98] ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-semibold shadow-2xs'
                        : 'bg-white dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{preset}</span>
                  </button>
                );
              })}
            </div>

            {/* Tambah Fasilitas Kustom */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tambah fasilitas kustom lain..."
                value={customFacility}
                onChange={(e) => setCustomFacility(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomFacility();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCustomFacility}
                disabled={!customFacility.trim()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition disabled:opacity-40"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5">
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
            {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan Unit' : 'Simpan Unit Baru'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

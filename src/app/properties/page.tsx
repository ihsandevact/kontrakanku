'use client';

import React, { useEffect, useState } from 'react';
import { AppSettings, Lease, LeaseStatus, Property } from '@/types/database';
import {
  deleteProperty,
  getLeases,
  getProperties,
  getSettings,
} from '@/lib/storage';
import {
  formatDateIndonesian,
  formatRupiah,
  getCycleLabel,
  getCycleShortLabel,
} from '@/lib/formatters';
import { formatDaysUntilDue, getDaysUntilDue } from '@/lib/billing';
import { StatusBadge } from '@/components/StatusBadge';
import { WhatsAppModal } from '@/components/WhatsAppModal';
import { RenewLeaseModal } from '@/components/RenewLeaseModal';
import { PropertyFormModal } from '@/components/PropertyFormModal';
import { CheckInTenantModal } from '@/components/CheckInTenantModal';
import { ContractModal } from '@/components/ContractModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import {
  Building2,
  Calendar,
  Edit2,
  FileText,
  Filter,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RotateCw,
  Trash2,
  User,
  UserPlus,
  Zap,
} from 'lucide-react';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);

  // Dedicated Tenant Check-in Modal
  const [activeCheckIn, setActiveCheckIn] = useState<{
    property: Property;
    lease?: Lease | null;
  } | null>(null);

  const [activeWaModal, setActiveWaModal] = useState<{
    lease: Lease;
    property: Property;
  } | null>(null);
  const [activeRenewModal, setActiveRenewModal] = useState<{
    lease: Lease;
    property: Property;
  } | null>(null);
  const [activeContractModal, setActiveContractModal] = useState<{
    lease: Lease;
    property: Property;
  } | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, l, s] = await Promise.all([
        getProperties(),
        getLeases(),
        getSettings(),
      ]);
      setProperties(p);
      setLeases(l);
      setSettings(s);
    } catch (err) {
      console.error('Error loading properties data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (prop: Property) => {
    setSelectedProperty(prop);
    setSelectedLease(null);
    setModalMode('edit');
  };

  const handleOpenCheckIn = (prop: Property, lease?: Lease | null) => {
    setActiveCheckIn({ property: prop, lease: lease || null });
  };

  const handleDelete = (prop: Property) => {
    setPropertyToDelete(prop);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    setIsDeletingProperty(true);
    try {
      await deleteProperty(propertyToDelete.id);
      await loadData();
      setPropertyToDelete(null);
    } catch (err) {
      console.error('Failed to delete property:', err);
    } finally {
      setIsDeletingProperty(false);
    }
  };

  // Filter properties by tenancy status
  const filteredProperties = properties.filter((prop) => {
    if (filterStatus === 'all') return true;
    const lease = leases.find((l) => l.property_id === prop.id);
    const status = lease ? lease.status : 'vacant';
    return status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Kelola Unit Kontrakan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Total {properties.length} unit properti terdaftar ({properties.length - leases.filter(l => l.status !== 'vacant').length} kosong)
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProperty(null);
            setSelectedLease(null);
            setModalMode('create');
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Unit Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        {[
          { id: 'all', label: 'Semua Unit' },
          { id: 'active', label: 'Aktif Lancar' },
          { id: 'due_soon', label: 'Mendekati Tempo' },
          { id: 'overdue', label: 'Jatuh Tempo / Telat' },
          { id: 'vacant', label: 'Kosong' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap text-xs sm:text-sm ${
              filterStatus === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Property Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="p-8 sm:p-14 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {properties.length === 0 ? 'Belum Ada Unit Kontrakan' : 'Tidak Ada Unit pada Filter Ini'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {properties.length === 0
                ? 'Mulai kelola kontrakan Anda dengan menambahkan kamar atau rumah kontrakan pertama. Anda dapat mencatat nomor ID meteran listrik/air, tarif sewa, dan foto galeri.'
                : 'Tidak ada unit kontrakan yang sesuai dengan kriteria filter yang Anda pilih.'}
            </p>
          </div>
          {properties.length === 0 && (
            <button
              onClick={() => {
                setSelectedProperty(null);
                setSelectedLease(null);
                setModalMode('create');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Unit Kontrakan Baru</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProperties.map((prop) => {
          const lease = leases.find((l) => l.property_id === prop.id);
          const status = lease ? lease.status : 'vacant';
          const days = lease ? getDaysUntilDue(lease.next_due_date) : 0;

          return (
            <div
              key={prop.id}
              className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div>
                {/* Header Unit */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {prop.name}
                    </h2>
                    {prop.address && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{prop.address}</span>
                      </p>
                    )}
                  </div>
                  <StatusBadge status={status} className="shrink-0 mt-0.5" />
                </div>

                {/* Meter PLN & PDAM */}
                {(prop.electricity_id || prop.water_id) && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                    {prop.electricity_id && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                        <span>⚡ PLN:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{prop.electricity_id}</span>
                      </span>
                    )}
                    {prop.water_id && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                        <span>💧 PDAM:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{prop.water_id}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Lease Details Box */}
                {lease ? (
                  <div className="mt-3.5 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/70 dark:border-slate-800/80 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                        <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{lease.tenant_name}</span>
                        <button
                          onClick={() => handleOpenCheckIn(prop, lease)}
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Ubah Data / Ketentuan Kontrak Penyewa"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lease.tenant_phone}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Siklus Sewa:
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {getCycleShortLabel(lease.billing_cycle)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Biaya Sewa:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatRupiah(lease.rate_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/60 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Jatuh Tempo:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatDateIndonesian(lease.next_due_date)}
                        </span>
                        <span className={`block text-[11px] font-bold mt-0.5 ${
                          days < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : days <= 7
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {formatDaysUntilDue(days)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Uang Deposit:
                        </span>
                        <span>
                          {lease.deposit_amount && lease.deposit_amount > 0
                            ? formatRupiah(lease.deposit_amount)
                            : 'Tidak ada (Rp 0)'}
                        </span>
                      </div>
                    </div>

                    {lease.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/40 dark:border-slate-800/60">
                        Catatan: {lease.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Unit sedang kosong.</p>
                    {prop.monthly_rate ? (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Tarif Promosi: {formatRupiah(prop.monthly_rate)} / bln
                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 ml-1.5">
                          (Min. {prop.min_rental_months === 12 ? '1 Tahun' : `${prop.min_rental_months || 6} Bulan`})
                        </span>
                      </p>
                    ) : null}
                    <button
                      onClick={() => handleOpenCheckIn(prop)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Check-in Penyewa</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {lease ? (
                  <div className="space-y-2">
                    {/* Mobile View (< 640px): 2 Baris Simetris & Rapi */}
                    <div className="grid grid-cols-2 sm:hidden gap-2">
                      <button
                        onClick={() => setActiveContractModal({ lease, property: prop })}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition inline-flex items-center justify-center gap-1.5 shadow-2xs"
                        title="Surat Perjanjian Sewa / Tanda Tangan Online"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Kontrak</span>
                      </button>
                      <button
                        onClick={() => setActiveRenewModal({ lease, property: prop })}
                        className="w-full py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 active:bg-teal-500/25 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/30 transition inline-flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Perpanjang</span>
                      </button>
                    </div>

                    <div className="flex sm:hidden items-center gap-2">
                      <button
                        onClick={() => handleEdit(prop)}
                        className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition shrink-0"
                        title="Edit Unit"
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(prop)}
                        className="p-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition shrink-0"
                        title="Hapus Unit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveWaModal({ lease, property: prop })}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Tagih via WhatsApp</span>
                      </button>
                    </div>

                    {/* Desktop View (>= 640px): 1 Baris Sejajar Elegan */}
                    <div className="hidden sm:flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(prop)}
                          className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition"
                          title="Edit Unit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(prop)}
                          className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium inline-flex items-center gap-1 border border-rose-200 dark:border-rose-900/40 transition"
                          title="Hapus Unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveContractModal({ lease, property: prop })}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition inline-flex items-center gap-1.5"
                          title="Surat Perjanjian Sewa / Tanda Tangan Online"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Kontrak</span>
                        </button>
                        <button
                          onClick={() => setActiveRenewModal({ lease, property: prop })}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 active:bg-teal-500/25 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-500/30 transition inline-flex items-center gap-1.5"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Perpanjang</span>
                        </button>
                        <button
                          onClick={() => setActiveWaModal({ lease, property: prop })}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Tagih WA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Mobile View (< 640px): 1 Baris Simetris */}
                    <div className="flex sm:hidden items-center gap-2">
                      <button
                        onClick={() => handleEdit(prop)}
                        className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition shrink-0"
                        title="Edit Unit"
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(prop)}
                        className="p-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition shrink-0"
                        title="Hapus Unit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenCheckIn(prop)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>+ Check-in Penyewa</span>
                      </button>
                    </div>

                    {/* Desktop View (>= 640px) */}
                    <div className="hidden sm:flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(prop)}
                          className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          title="Edit Unit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit Unit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(prop)}
                          className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium inline-flex items-center gap-1 border border-rose-200 dark:border-rose-900/40 transition cursor-pointer"
                          title="Hapus Unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleOpenCheckIn(prop)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Check-in Penyewa</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Modals */}
      {modalMode && (
        <PropertyFormModal
          isOpen={Boolean(modalMode)}
          onClose={() => {
            setModalMode(null);
            setSelectedProperty(null);
            setSelectedLease(null);
          }}
          property={selectedProperty}
          lease={selectedLease}
          onSuccess={loadData}
        />
      )}

      {activeCheckIn && (
        <CheckInTenantModal
          isOpen={Boolean(activeCheckIn)}
          onClose={() => setActiveCheckIn(null)}
          property={activeCheckIn.property}
          lease={activeCheckIn.lease}
          onSuccess={loadData}
        />
      )}

      {activeWaModal && settings && (
        <WhatsAppModal
          isOpen={Boolean(activeWaModal)}
          onClose={() => setActiveWaModal(null)}
          lease={activeWaModal.lease}
          property={activeWaModal.property}
          settings={settings}
        />
      )}

      {activeRenewModal && (
        <RenewLeaseModal
          isOpen={Boolean(activeRenewModal)}
          onClose={() => setActiveRenewModal(null)}
          lease={activeRenewModal.lease}
          property={activeRenewModal.property}
          onSuccess={loadData}
        />
      )}

      {activeContractModal && (
        <ContractModal
          isOpen={Boolean(activeContractModal)}
          onClose={() => setActiveContractModal(null)}
          lease={activeContractModal.lease}
          property={activeContractModal.property}
          onSuccess={loadData}
        />
      )}

      {/* Confirmation Modal for Property Deletion */}
      <ConfirmModal
        isOpen={Boolean(propertyToDelete)}
        onClose={() => setPropertyToDelete(null)}
        onConfirm={confirmDeleteProperty}
        title="Hapus Unit Kontrakan"
        message={
          propertyToDelete ? (
            <span>
              Apakah Anda yakin ingin menghapus unit <strong>"{propertyToDelete.name}"</strong>? Data kontrak dan riwayat kas terkait unit ini juga akan terhapus secara permanen.
            </span>
          ) : ''
        }
        confirmLabel="Ya, Hapus Unit"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeletingProperty}
      />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { AppSettings, Lease, LeaseContract, Property } from '@/types/database';
import { getContractByLeaseId, getSettings, resetContract, saveContract, signContract } from '@/lib/storage';
import {
  DEFAULT_CONTRACT_CLAUSES,
  generateContractNumber,
  generateContractWhatsAppUrl,
} from '@/lib/contract-utils';
import { formatDateIndonesian, formatRupiah, getCycleLabel } from '@/lib/formatters';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SignaturePad } from '@/components/SignaturePad';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileCheck,
  FileText,
  MessageSquare,
  Phone,
  Printer,
  RotateCcw,
  Share2,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  lease: Lease | null;
  property: Property | null;
  onSuccess?: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  lease,
  property,
  onSuccess,
}) => {
  const [contract, setContract] = useState<LeaseContract | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [ownerSigData, setOwnerSigData] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [reSyncData, setReSyncData] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [targetPhone, setTargetPhone] = useState<string>('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [showChangeSigConfirm, setShowChangeSigConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen || !lease || !property) return;
    const activeLease = lease;
    const activeProp = property;

    async function initContract() {
      setIsLoading(true);
      try {
        const [appSettings, existingContract] = await Promise.all([
          getSettings(),
          getContractByLeaseId(activeLease.id),
        ]);
        setSettings(appSettings);

        const initialTenantPhone = activeLease.tenant_phone || existingContract?.tenant_phone || '';
        setTargetPhone(initialTenantPhone);

        if (existingContract) {
          // Auto-sync tenant details from active lease so contract always targets the correct tenant phone
          const isOutOfSync =
            (activeLease.tenant_phone && existingContract.tenant_phone !== activeLease.tenant_phone) ||
            (activeLease.tenant_name && existingContract.tenant_name !== activeLease.tenant_name) ||
            (activeLease.rate_amount && existingContract.rent_amount !== activeLease.rate_amount) ||
            (appSettings.contact_phone && existingContract.owner_phone !== appSettings.contact_phone);

          const syncedContract: LeaseContract = {
            ...existingContract,
            tenant_name: activeLease.tenant_name || existingContract.tenant_name,
            tenant_phone: activeLease.tenant_phone || existingContract.tenant_phone,
            tenant_nik: activeLease.tenant_nik ?? existingContract.tenant_nik,
            rent_amount: activeLease.rate_amount || existingContract.rent_amount,
            deposit_amount: activeLease.deposit_amount ?? existingContract.deposit_amount,
            owner_name: appSettings.account_holder || existingContract.owner_name,
            owner_phone: appSettings.contact_phone || existingContract.owner_phone,
            property_name: activeProp.name || existingContract.property_name,
            property_address: activeProp.address ?? existingContract.property_address,
          };

          if (isOutOfSync) {
            await saveContract(syncedContract);
          }
          setContract(syncedContract);
          setOwnerSigData(existingContract.owner_signature || null);
        } else {
          // Initialize fresh draft contract
          const contractNumber = generateContractNumber(activeProp.name, activeLease.start_date);
          const draft: LeaseContract = {
            id: `ctr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            lease_id: activeLease.id,
            property_id: activeProp.id,
            contract_number: contractNumber,
            start_date: activeLease.start_date,
            end_date: activeLease.next_due_date,
            billing_cycle: activeLease.billing_cycle,
            rent_amount: activeLease.rate_amount,
            deposit_amount: activeLease.deposit_amount || 0,
            owner_name: appSettings.account_holder || 'Pemilik Kontrakan',
            owner_phone: appSettings.contact_phone || '',
            tenant_name: activeLease.tenant_name,
            tenant_phone: activeLease.tenant_phone,
            tenant_nik: activeLease.tenant_nik || null,
            property_name: activeProp.name,
            property_address: activeProp.address || null,
            facilities: activeProp.facilities || null,
            electricity_id: activeProp.electricity_id || null,
            water_id: activeProp.water_id || null,
            custom_clauses: DEFAULT_CONTRACT_CLAUSES,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const saved = await saveContract(draft);
          setContract(saved);
        }
      } catch (err) {
        console.error('Failed to init contract:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initContract();
  }, [isOpen, lease, property]);

  if (!isOpen || !lease || !property) return null;

  const handleOwnerSaveSignature = async (dataUrl: string) => {
    if (!contract) return;
    setOwnerSigData(dataUrl);
    setIsSaving(true);
    try {
      const updated = await signContract(contract.id, 'owner', dataUrl);
      setContract(updated);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to sign contract:', err);
      alert('Gagal menyimpan tanda tangan pemilik.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!contract || typeof window === 'undefined') return;
    const url = `${window.location.origin}/kontrak/${contract.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleResetContract = async () => {
    if (!contract || !lease || !property) return;
    setIsResetting(true);
    try {
      const reset = await resetContract(contract.id, {
        reSyncWithLease: reSyncData,
        lease,
        property,
      });
      setContract(reset);
      setOwnerSigData(null);
      setShowResetConfirm(false);
      setResetSuccessMessage('Perjanjian kontrak berhasil direset. Silakan bubuhkan tanda tangan baru.');
      setTimeout(() => setResetSuccessMessage(null), 4000);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to reset contract:', err);
      alert('Gagal mereset kontrak. Silakan coba kembali.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSavePhone = async () => {
    if (!contract || !targetPhone) return;
    try {
      const updated: LeaseContract = { ...contract, tenant_phone: targetPhone };
      await saveContract(updated);
      setContract(updated);
      setIsEditingPhone(false);
    } catch (err) {
      console.error('Failed to update tenant phone in contract:', err);
    }
  };

  const contractUrl = contract && typeof window !== 'undefined'
    ? `${window.location.origin}/kontrak/${contract.id}`
    : '#';

  const effectiveTenantPhone = targetPhone || lease?.tenant_phone || contract?.tenant_phone || '';
  const effectiveTenantName = lease?.tenant_name || contract?.tenant_name || 'Penyewa';

  const waUrl = contract && effectiveTenantPhone
    ? generateContractWhatsAppUrl({
        contractId: contract.id,
        tenantName: effectiveTenantName,
        tenantPhone: effectiveTenantPhone,
        propertyName: contract.property_name,
        contractNumber: contract.contract_number,
      })
    : '#';

  const isCompleted = contract?.status === 'completed';
  const isPendingTenant = contract?.status === 'pending_tenant';
  const hasOwnerSigned = Boolean(contract?.owner_signature);
  const hasTenantSigned = Boolean(contract?.tenant_signature);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Surat Perjanjian Sewa (SPSM) & Tanda Tangan"
      description={`Unit: ${property.name} • Penyewa: ${lease.tenant_name}`}
      icon={<FileText className="w-4 h-4 text-emerald-600" />}
      maxWidth="max-w-2xl"
    >
      <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5">
        {isLoading || !contract ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Menyiapkan dokumen kontrak...</p>
          </div>
        ) : (
          <>
            {/* Status & Contract Header Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Nomor Kontrak Resmi:
                  </span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {contract.contract_number}
                  </span>
                </div>

                {/* Status Badge & Reset Button */}
                <div className="flex flex-wrap items-center gap-2">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Kontrak Sah & Lengkap</span>
                    </span>
                  ) : isPendingTenant ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Menunggu Tanda Tangan Penyewa</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-500/30">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Draf Baru</span>
                    </span>
                  )}

                  {(hasOwnerSigned || hasTenantSigned) && !showResetConfirm && (
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
                      title="Reset tanda tangan untuk menandatangani ulang"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Kontrak</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Rincian Pihak & Finansial */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Pemilik</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{contract.owner_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Penyewa</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{contract.tenant_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Biaya Sewa</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(contract.rent_amount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Masa Sewa</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{getCycleLabel(contract.billing_cycle)}</span>
                </div>
              </div>
            </div>

            {/* Feedback Notifications */}
            {resetSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            {/* Reset Confirmation Panel */}
            {showResetConfirm && (
              <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Reset Perjanjian Kontrak untuk Tanda Tangan Ulang?
                    </h4>
                    <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      Tindakan ini akan mengosongkan <strong>tanda tangan pemilik</strong> dan <strong>tanda tangan penyewa</strong>, serta mengembalikan status dokumen ke <strong>Draf Awal</strong> agar kedua belah pihak dapat melakukan tanda tangan ulang dari awal.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer pt-1 pl-1">
                  <input
                    type="checkbox"
                    checked={reSyncData}
                    onChange={(e) => setReSyncData(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Sinkronkan ulang tarif, tanggal & klausul dari data sewa aktif terkini</span>
                </label>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-500/20">
                  <button
                    type="button"
                    disabled={isResetting}
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isResetting}
                    onClick={handleResetContract}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    {isResetting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Mereset Kontrak...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Ya, Reset Perjanjian</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Area Tanda Tangan Pemilik */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Tanda Tangan Pihak Pertama (Pemilik)</span>
                </h4>
                {hasOwnerSigned && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Ditandatangani ({formatDateIndonesian(contract.owner_signed_at || '')})</span>
                  </span>
                )}
              </div>

              {hasOwnerSigned ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-14 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/30 p-1 flex items-center justify-center">
                      <img src={contract.owner_signature!} alt="Tanda tangan pemilik" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Tanda Tangan Pemilik Tersimpan
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {contract.owner_name} • {contract.owner_phone}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowChangeSigConfirm(true)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 underline cursor-pointer"
                  >
                    Ganti Tanda Tangan
                  </button>
                </div>
              ) : (
                <SignaturePad
                  title="Bubuhkan Tanda Tangan Pemilik di Sini:"
                  height={150}
                  onSave={handleOwnerSaveSignature}
                  initialDataUrl={ownerSigData}
                />
              )}
            </div>

            {/* Status Tanda Tangan Penyewa */}
            <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>2. Tanda Tangan Pihak Kedua (Penyewa)</span>
                </h4>
                {hasTenantSigned ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Ditandatangani ({formatDateIndonesian(contract.tenant_signed_at || '')})</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Belum Ditandatangani
                  </span>
                )}
              </div>

              {hasTenantSigned ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3">
                  <div className="w-28 h-14 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/30 p-1 flex items-center justify-center">
                    <img src={contract.tenant_signature!} alt="Tanda tangan penyewa" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Tanda Tangan Penyewa Sah
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {effectiveTenantName} • {effectiveTenantPhone}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Kirimkan link kontrak kepada {effectiveTenantName}:
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Penyewa dapat membuka link kontrak di layar HP untuk membaca pasal dan menandatangani secara online dengan jari/stylus.
                    </p>
                  </div>

                  {/* Target Nomor WhatsApp Penyewa Card */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Target Nomor WA Penyewa
                        </div>
                        {isEditingPhone ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <input
                              type="tel"
                              value={targetPhone}
                              onChange={(e) => setTargetPhone(e.target.value)}
                              placeholder="Contoh: 082348635212"
                              className="px-2.5 py-1 text-base sm:text-xs border border-emerald-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSavePhone}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition cursor-pointer"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetPhone(lease?.tenant_phone || contract?.tenant_phone || '');
                                setIsEditingPhone(false);
                              }}
                              className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                              {effectiveTenantPhone || '(Nomor HP belum diisi)'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              ({effectiveTenantName})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isEditingPhone && (
                      <button
                        type="button"
                        onClick={() => setIsEditingPhone(true)}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 self-start sm:self-auto cursor-pointer"
                      >
                        Ubah Nomor WA
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Bar */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={effectiveTenantPhone ? waUrl : undefined}
                  onClick={(e) => {
                    if (!effectiveTenantPhone) {
                      e.preventDefault();
                      alert('Nomor WhatsApp penyewa belum diisi. Silakan masukkan nomor HP penyewa terlebih dahulu.');
                      setIsEditingPhone(true);
                    }
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs transition ${
                    effectiveTenantPhone
                      ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 cursor-pointer'
                      : 'bg-emerald-600/60 cursor-not-allowed'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="truncate">
                    {effectiveTenantPhone
                      ? `Kirim ke WA Penyewa (${effectiveTenantPhone})`
                      : 'Kirim Link via WhatsApp (Isi No HP)'}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600">Link Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Salin Link Kontrak</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/kontrak/${contract.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Lembar Surat Perjanjian Resmi</span>
                  </Link>

                  {(hasOwnerSigned || hasTenantSigned) && !showResetConfirm && (
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Perjanjian</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal for Owner Signature Reset */}
      <ConfirmModal
        isOpen={showChangeSigConfirm}
        onClose={() => setShowChangeSigConfirm(false)}
        onConfirm={() => {
          setOwnerSigData(null);
          setShowChangeSigConfirm(false);
        }}
        title="Ubah Tanda Tangan Pemilik"
        message="Apakah Anda yakin ingin mengganti tanda tangan pemilik saat ini? Anda dapat membubuhkan goresan tanda tangan baru pada kanvas."
        confirmLabel="Ya, Ganti Tanda Tangan"
        cancelLabel="Batal"
        variant="warning"
      />
    </ResponsiveModal>
  );
};

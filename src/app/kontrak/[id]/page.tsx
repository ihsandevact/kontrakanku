'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LeaseContract } from '@/types/database';
import { getContractById, signContract } from '@/lib/storage';
import { formatDateIndonesian, formatRupiah, getCycleLabel } from '@/lib/formatters';
import { generateTenantSignedNotificationUrl } from '@/lib/contract-utils';
import { SignaturePad } from '@/components/SignaturePad';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileCheck,
  FileText,
  Lock,
  MessageSquare,
  Printer,
  Scale,
  Share2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function TenantContractPage() {
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<LeaseContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantSig, setTenantSig] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showSignSuccess, setShowSignSuccess] = useState(false);

  useEffect(() => {
    async function loadContract() {
      try {
        const found = await getContractById(contractId);
        setContract(found || null);
        setTenantSig(found?.tenant_signature || null);
      } catch (err) {
        console.error('Failed to load contract:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadContract();
  }, [contractId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleTenantSign = async () => {
    if (!contract) return;
    if (!tenantSig) {
      alert('Silakan bubuhkan tanda tangan Anda pada area kanvas terlebih dahulu.');
      return;
    }
    if (!agreedToTerms) {
      alert('Harap centang persetujuan seluruh pasal perjanjian sebelum melanjutkan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await signContract(contract.id, 'tenant', tenantSig);
      setContract(updated);
      setShowSignSuccess(true);
    } catch (err) {
      console.error('Failed to sign contract:', err);
      alert('Gagal menyimpan tanda tangan penyewa. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Memuat Surat Perjanjian Sewa Menyewa...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Dokumen Kontrak Tidak Ditemukan
        </h2>
        <p className="text-xs text-slate-500">
          Tautan kontrak yang Anda buka tidak valid atau dokumen sewa belum dibuat oleh pemilik kontrakan.
        </p>
      </div>
    );
  }

  const isCompleted = contract.status === 'completed';
  const hasOwnerSigned = Boolean(contract.owner_signature);
  const hasTenantSigned = Boolean(contract.tenant_signature);

  const confirmWhatsAppUrl = generateTenantSignedNotificationUrl({
    ownerPhone: contract.owner_phone,
    ownerName: contract.owner_name,
    tenantName: contract.tenant_name,
    propertyName: contract.property_name,
    contractNumber: contract.contract_number,
    contractId: contract.id,
  });

  return (
    <div className="-mx-1 xs:-mx-2 sm:mx-auto max-w-3xl space-y-4 sm:space-y-6 pb-16">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 sm:px-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            {contract.contract_number}
          </span>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Resmi / Sah</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-semibold border border-amber-500/30">
              <Clock className="w-3 h-3 animate-pulse" />
              <span>Menunggu Tanda Tangan</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Salin Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert after tenant signing */}
      {showSignSuccess && (
        <div className="print:hidden p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Kontrak Berhasil Ditandatangani!</span>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
            Terima kasih. Surat Perjanjian Sewa Menyewa ini kini resmi berlaku dan telah ditandatangani oleh kedua belah pihak. Anda dapat mengunduh atau mencetak salinan dokumen ini.
          </p>
          <div className="pt-1">
            <a
              href={confirmWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Kirim Konfirmasi ke Pemilik via WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Formal SPSM Document Sheet (A4 Print-Ready) */}
      <div className="bg-white text-slate-900 px-3.5 py-5 xs:px-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-5 sm:space-y-6 print:border-none print:shadow-none print:p-0 print:rounded-none">
        {/* Document Header */}
        <div className="text-center pb-5 border-b-2 border-slate-900 space-y-1">
          <h1 className="text-base sm:text-xl font-extrabold uppercase tracking-tight text-slate-900 leading-snug">
            Surat Perjanjian Sewa Menyewa Rumah Kontrakan
          </h1>
          <p className="text-xs font-mono font-semibold text-slate-600 tracking-wider">
            Nomor: {contract.contract_number}
          </p>
        </div>

        {/* Pembukaan */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
          Pada hari ini, bertanggal <strong>{formatDateIndonesian(contract.start_date)}</strong>, telah dibuat dan disepakati perjanjian sewa menyewa rumah kontrakan oleh dan antara pihak-pihak sebagai berikut:
        </p>

        {/* Pihak-Pihak */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Pihak Pertama */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2">
              <span>I. PIHAK PERTAMA (PEMILIK KONTRAKAN)</span>
              <span className="text-[11px] font-normal text-slate-500">Pemberi Sewa</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-700">
              <div>
                <span className="font-semibold">Nama Lengkap:</span> {contract.owner_name}
              </div>
              <div>
                <span className="font-semibold">No. Telepon / WA:</span> {contract.owner_phone}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Selanjutnya dalam perjanjian ini disebut sebagai <strong>PIHAK PERTAMA</strong>.
            </p>
          </div>

          {/* Pihak Kedua */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2">
              <span>II. PIHAK KEDUA (PENYEWA KONTRAKAN)</span>
              <span className="text-[11px] font-normal text-slate-500">Penyewa</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-700">
              <div>
                <span className="font-semibold">Nama Lengkap:</span> {contract.tenant_name}
              </div>
              <div>
                <span className="font-semibold">No. Telepon / WA:</span> {contract.tenant_phone}
              </div>
              {contract.tenant_nik && (
                <div className="sm:col-span-2">
                  <span className="font-semibold">Nomor KTP / NIK:</span> {contract.tenant_nik}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Selanjutnya dalam perjanjian ini disebut sebagai <strong>PIHAK KEDUA</strong>.
            </p>
          </div>
        </div>

        {/* Objek Sewa & Ketentuan Finansial */}
        <div className="space-y-2 text-xs sm:text-sm pt-2">
          <p className="text-slate-700 leading-relaxed text-justify">
            Kedua belah pihak telah sepakat untuk mengikatkan diri dalam perjanjian sewa menyewa rumah kontrakan dengan rincian objek dan ketentuan sebagai berikut:
          </p>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px] uppercase font-bold">Objek Unit</span>
                <span className="font-bold text-slate-900">{contract.property_name}</span>
                {contract.property_address && (
                  <span className="block text-slate-600 text-[11px]">{contract.property_address}</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] uppercase font-bold">Biaya Sewa</span>
                <span className="font-black text-emerald-700 text-base">
                  {formatRupiah(contract.rent_amount)}
                </span>
                <span className="text-slate-500 text-[11px]"> per {getCycleLabel(contract.billing_cycle)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs text-slate-700">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Masa Berlaku</span>
                <span>{formatDateIndonesian(contract.start_date)} s/d {formatDateIndonesian(contract.end_date)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Uang Jaminan (Deposit)</span>
                <span>{contract.deposit_amount ? formatRupiah(contract.deposit_amount) : 'Rp 0 (Tanpa Deposit)'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Meteran Utilitas</span>
                <span className="font-mono text-[11px]">
                  PLN: {contract.electricity_id || '-'} | PDAM: {contract.water_id || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Butir-Butir Pasal */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 text-center border-b border-slate-200 pb-1.5">
            Ketentuan & Pasal-Pasal Perjanjian
          </h3>

          <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed text-justify">
            {(contract.custom_clauses || []).map((clause, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="font-bold text-slate-900">{clause.title}</h4>
                <p>{clause.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Area Tanda Tangan Dokumen (Dual Signatures) */}
        <div className="pt-6 border-t-2 border-slate-900 space-y-4">
          <p className="text-xs text-slate-700 text-center italic">
            Demikian surat perjanjian ini dibuat dan disepakati oleh kedua belah pihak secara sadar tanpa paksaan dari pihak manapun, serta memiliki kekuatan hukum yang sah.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3.5 sm:gap-4 pt-4 text-center text-xs">
            {/* Kolom Tanda Tangan Pihak Pertama (Pemilik) */}
            <div className="space-y-2 flex flex-col items-center justify-between min-h-[160px] p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">PIHAK PERTAMA</span>
                <span className="text-[11px] text-slate-500">Pemilik Kontrakan</span>
              </div>

              <div className="w-full flex items-center justify-center my-auto min-h-[70px]">
                {hasOwnerSigned ? (
                  <img
                    src={contract.owner_signature!}
                    alt="Tanda tangan pemilik"
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    Belum ditandatangani pemilik
                  </span>
                )}
              </div>

              <div>
                <span className="font-bold text-slate-900 block underline">{contract.owner_name}</span>
                {contract.owner_signed_at && (
                  <span className="text-[10px] text-emerald-700 font-mono block">
                    {formatDateIndonesian(contract.owner_signed_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Kolom Tanda Tangan Pihak Kedua (Penyewa) */}
            <div className="space-y-2 flex flex-col items-center justify-between min-h-[160px] p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">PIHAK KEDUA</span>
                <span className="text-[11px] text-slate-500">Penyewa Kontrakan</span>
              </div>

              <div className="w-full flex items-center justify-center my-auto min-h-[70px]">
                {hasTenantSigned ? (
                  <img
                    src={contract.tenant_signature!}
                    alt="Tanda tangan penyewa"
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-amber-600 italic font-medium">
                    Menunggu tanda tangan penyewa
                  </span>
                )}
              </div>

              <div>
                <span className="font-bold text-slate-900 block underline">{contract.tenant_name}</span>
                {contract.tenant_signed_at && (
                  <span className="text-[10px] text-emerald-700 font-mono block">
                    {formatDateIndonesian(contract.tenant_signed_at)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stempel Legalitas Digital */}
          {isCompleted && (
            <div className="pt-2 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>DIVERIFIKASI SECARA ELEKTRONIK • DOKUMEN DIGITAL SAH</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Tenant Signing Section (If tenant has not signed yet, hidden on print) */}
      {!hasTenantSigned && (
        <div className="print:hidden p-3.5 xs:p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tanda Tangani Surat Perjanjian Ini (Khusus Penyewa)
              </h3>
              <p className="text-xs text-slate-500">
                Halo <strong>{contract.tenant_name}</strong>, silakan bubuhkan tanda tangan Anda menggunakan jari di bawah ini.
              </p>
            </div>
          </div>

          {/* Signature Canvas */}
          <SignaturePad
            title="Goreskan Tanda Tangan Anda di Sini:"
            height={160}
            onSave={(dataUrl) => setTenantSig(dataUrl)}
            onClear={() => setTenantSig(null)}
          />

          {/* Terms Agreement Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1 text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
            />
            <span className="leading-relaxed">
              Saya menyatakan telah membaca, memahami, dan menyetujui seluruh isi ketentuan dan pasal-pasal dalam Surat Perjanjian Sewa Menyewa (SPSM) ini.
            </span>
          </label>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTenantSign}
              disabled={!tenantSig || !agreedToTerms || isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan Tanda Tangan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tanda Tangani & Konfirmasi Kontrak Resmi</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

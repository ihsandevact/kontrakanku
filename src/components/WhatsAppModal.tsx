'use client';

import React, { useState } from 'react';
import { AppSettings, Lease, Property } from '@/types/database';
import {
  buildBillingMessageText,
  formatPhoneNumber,
  generateWhatsAppBillingUrl,
} from '@/lib/whatsapp';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { Check, Copy, ExternalLink, MessageSquare } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lease: Lease;
  property: Property;
  settings: AppSettings;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  lease,
  property,
  settings,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const messageData = {
    tenantName: lease.tenant_name,
    tenantPhone: lease.tenant_phone,
    propertyName: property.name,
    billingCycle: lease.billing_cycle,
    rateAmount: lease.rate_amount,
    depositAmount: lease.deposit_amount,
    nextDueDate: lease.next_due_date,
    settings,
  };

  const messageText = buildBillingMessageText(messageData);
  const waUrl = generateWhatsAppBillingUrl(messageData);
  const formattedPhone = formatPhoneNumber(lease.tenant_phone);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Kirim Tagihan WhatsApp"
      description={`Ke: ${lease.tenant_name} (${formattedPhone})`}
      icon={<MessageSquare className="w-4 h-4" />}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col">
        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[10px]">
              Pratinjau Pesan Tagihan:
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>
          </div>

          {/* Chat bubble simulation (High Contrast Dark/Light) */}
          <div className="p-3.5 sm:p-4 bg-emerald-50 dark:bg-slate-950/80 rounded-xl border border-emerald-500/20 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line font-sans leading-relaxed shadow-inner">
            {messageText}
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">ℹ</span>
            <span>
              Tombol hijau di bawah akan membuka WhatsApp langsung ke nomor penyewa dengan rincian di atas sudah otomatis terisi.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-5 sm:py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="order-2 sm:order-1 px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition text-center"
          >
            Tutup
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="order-1 sm:order-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-xs transition text-center"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka WhatsApp Sekarang</span>
          </a>
        </div>
      </div>
    </ResponsiveModal>
  );
};

'use client';

import React, { useState } from 'react';
import { ResponsiveModal } from './ResponsiveModal';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Trash2,
} from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Batal',
  variant = 'danger',
  isLoading: externalLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Confirmation action failed:', err);
    } finally {
      setInternalLoading(false);
    }
  };

  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
          confirmBg: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-xs',
          defaultConfirmLabel: 'Ya, Hapus',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          confirmBg: 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-xs',
          defaultConfirmLabel: 'Ya, Lanjutkan',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          confirmBg: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-xs',
          defaultConfirmLabel: 'Ya, Setujui',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
          confirmBg: 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white shadow-xs',
          defaultConfirmLabel: 'Konfirmasi',
        };
    }
  };

  const config = getVariantConfig();

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      icon={config.icon}
      maxWidth="max-w-md"
    >
      <div className="p-4 sm:p-6 space-y-4">
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-50 ${config.confirmBg}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <span>{confirmLabel || config.defaultConfirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

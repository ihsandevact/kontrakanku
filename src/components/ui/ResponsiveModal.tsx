'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';

export interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  headerAccentBg?: string;
  maxWidth?: string;
  dismissible?: boolean;
  children: React.ReactNode;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  headerAccentBg,
  maxWidth = 'max-w-md',
  dismissible = true,
  children,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Support closing via Escape key on keyboard
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted) return null;

  // Mobile Bottom Drawer using Vaul
  if (isMobile) {
    return (
      <Drawer.Root
        open={isOpen}
        dismissible={dismissible}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-xs transition-opacity" />
          <Drawer.Content className="bg-white dark:bg-slate-900 flex flex-col rounded-t-[24px] max-h-[90vh] fixed bottom-0 left-0 right-0 z-[100] outline-none border-t border-slate-200/80 dark:border-slate-800 shadow-2xl">
            {/* Visual Drag Handle (Hidden when dismissible is false) */}
            <div className="pt-3 pb-1">
              {dismissible ? (
                <Drawer.Handle className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 dark:bg-slate-700 cursor-grab active:cursor-grabbing" />
              ) : (
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200/50 dark:bg-slate-800/50" />
              )}
            </div>

            {/* Mobile Header */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {icon && (
                  <div
                    className={`w-8 h-8 rounded-xl ${
                      headerAccentBg || 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    } flex items-center justify-center shrink-0`}
                  >
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  <Drawer.Title className="font-bold text-slate-900 dark:text-white text-base leading-snug truncate">
                    {title}
                  </Drawer.Title>
                  {description && (
                    <Drawer.Description className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {description}
                    </Drawer.Description>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 ml-2 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto overscroll-contain flex-1 pb-safe">
              {children}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  // Desktop Centered Modal rendered through createPortal to document.body
  const desktopModalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none"
    >
      <div
        className={`w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 select-text`}
      >
        {/* Desktop Header */}
        <div
          className={`px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between ${
            headerAccentBg || 'bg-emerald-500/10 dark:bg-emerald-950/40'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 ml-2 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Content Body */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  return createPortal(desktopModalContent, document.body);
};

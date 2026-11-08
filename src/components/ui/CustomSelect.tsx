'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  title?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  title = 'Pilih Opsi',
  label,
  disabled = false,
  className = '',
  id,
  name,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const desktopDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);

    const handleResize = () => setIsMobile(mql.matches);
    mql.addEventListener('change', handleResize);
    return () => mql.removeEventListener('change', handleResize);
  }, []);

  // Handle click outside on desktop
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isMobile]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string, isDisabled?: boolean) => {
    if (isDisabled) return;
    onChange(val);
    setIsOpen(false);
  };

  // Group options if any option has a group property
  const hasGroups = options.some((opt) => opt.group);
  const groupedOptions: { [group: string]: SelectOption[] } = {};

  if (hasGroups) {
    options.forEach((opt) => {
      const g = opt.group || 'Lainnya';
      if (!groupedOptions[g]) groupedOptions[g] = [];
      groupedOptions[g].push(opt);
    });
  }

  const renderOptionsList = () => {
    if (hasGroups) {
      return Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
        <div key={groupName} className="space-y-1 pb-1">
          <div className="px-3.5 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {groupName}
          </div>
          {groupOpts.map((opt) => renderOptionItem(opt))}
        </div>
      ));
    }

    return options.map((opt) => renderOptionItem(opt));
  };

  const renderOptionItem = (opt: SelectOption) => {
    const isSelected = opt.value === value;
    return (
      <button
        key={opt.value}
        type="button"
        disabled={opt.disabled}
        onClick={() => handleSelect(opt.value, opt.disabled)}
        className={`w-full text-left px-3.5 py-3 sm:py-2.5 rounded-xl transition flex items-center justify-between gap-3 text-xs sm:text-sm min-h-[48px] sm:min-h-[40px] cursor-pointer active:scale-[0.99] ${
          opt.disabled
            ? 'opacity-40 cursor-not-allowed bg-transparent text-slate-400 dark:text-slate-600'
            : isSelected
            ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/25'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
        }`}
      >
        <div className="min-w-0 flex-1 pr-1">
          <span className="block break-words whitespace-normal leading-snug">{opt.label}</span>
          {opt.description && (
            <span
              className={`block text-[11px] mt-0.5 break-words whitespace-normal leading-relaxed ${
                isSelected
                  ? 'text-emerald-700/80 dark:text-emerald-400/80'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {opt.description}
            </span>
          )}
        </div>
        {isSelected && (
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />
        )}
      </button>
    );
  };

  return (
    <div className={`relative ${label ? 'space-y-1' : ''}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Hidden input for HTML form compatibility */}
      {name && <input type="hidden" name={name} value={value} required={required} />}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium flex items-center justify-between gap-2 transition focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs ${className}`}
      >
        <span className="truncate text-left min-w-0 flex-1">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Desktop Floating Dropdown Popover */}
      {isOpen && !isMobile && (
        <div
          ref={desktopDropdownRef}
          className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {renderOptionsList()}
        </div>
      )}

      {/* Mobile Bottom-Sheet Drawer Overlay (Rendered via Portal to body) */}
      {isOpen && isMobile && mounted &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex flex-col justify-end">
            {/* Backdrop */}
            <div
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            />

            {/* Bottom Sheet Card */}
            <div className="relative z-[75] bg-white dark:bg-slate-900 rounded-t-3xl max-h-[80vh] flex flex-col shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200 pb-safe">
              {/* Drag Handle */}
              <div className="pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />
              </div>

              {/* Mobile Header */}
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    {title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pilih salah satu opsi di bawah ini:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Options List */}
              <div className="overflow-y-auto p-3 space-y-1 max-h-[60vh]">
                {renderOptionsList()}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

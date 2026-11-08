'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Edit3, RotateCcw, Trash2 } from 'lucide-react';

interface SignaturePadProps {
  onSave?: (dataUrl: string) => void;
  onClear?: () => void;
  initialDataUrl?: string | null;
  readOnly?: boolean;
  title?: string;
  height?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  initialDataUrl = null,
  readOnly = false,
  title = 'Tanda Tangan Digital',
  height = 180,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(initialDataUrl));
  const [isSaved, setIsSaved] = useState(Boolean(initialDataUrl));

  // Initialize and resize canvas with HiDPI support
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const setupCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.strokeStyle = '#0f172a'; // slate-900 / dark ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // If there's an initial image, draw it
        if (initialDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, rect.width, height);
            setHasSignature(true);
            setIsSaved(true);
          };
          img.src = initialDataUrl;
        }
      }
    };

    setupCanvas();

    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [height, initialDataUrl]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Capture pointer to track outside canvas
    e.currentTarget.setPointerCapture(e.pointerId);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
    setHasSignature(true);
    setIsSaved(false);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDrawing(false);

    // Auto-save data
    const canvas = canvasRef.current;
    if (canvas && onSave) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
      setIsSaved(true);
    }
  };

  const handleClear = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }

    setHasSignature(false);
    setIsSaved(false);
    if (onClear) onClear();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{title}</span>
        </label>
        {!readOnly && hasSignature && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Ulangi / Hapus Tanda Tangan</span>
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className={`relative w-full rounded-2xl border-2 transition overflow-hidden touch-none select-none bg-white ${
          readOnly
            ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60'
            : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500'
        }`}
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className={`w-full h-full block ${
            readOnly ? 'cursor-default' : 'cursor-crosshair active:cursor-crosshair'
          }`}
        />

        {/* Visual Guide Line */}
        {!readOnly && (
          <div className="absolute bottom-6 left-6 right-6 border-b border-slate-300 pointer-events-none flex items-center justify-between text-[10px] text-slate-400 pb-0.5">
            <span>Tanda Tangan di atas garis ini</span>
            <span>Gunakan Jari / Stylus / Mouse</span>
          </div>
        )}

        {/* Empty state hint */}
        {!readOnly && !hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
            <span>Klik atau usap di sini untuk membubuhkan tanda tangan</span>
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  CheckCircle2,
  Edit3,
  PenTool,
  RotateCcw,
  Trash2,
  Undo2,
  X,
  Maximize2,
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

type Stroke = Point[];

interface SignaturePadProps {
  onSave?: (dataUrl: string) => void;
  onClear?: () => void;
  onDialogOpenChange?: (isOpen: boolean) => void;
  initialDataUrl?: string | null;
  readOnly?: boolean;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  height?: number; // legacy fallback
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  onDialogOpenChange,
  initialDataUrl = null,
  readOnly = false,
  title = 'Tanda Tangan Digital',
  subtitle = 'Bubuhkan tanda tangan elektronik Anda yang sah untuk dokumen kontrak ini.',
  buttonLabel = 'Buka Kanvas Tanda Tangan',
}) => {
  const [currentSignature, setCurrentSignature] = useState<string | null>(initialDataUrl);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Dialog Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke>([]);

  // Keep strokesRef in sync with strokes
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  // Synchronize initial data URL if parent changes
  useEffect(() => {
    setCurrentSignature(initialDataUrl);
  }, [initialDataUrl]);

  // Lock body scroll and ensure pointer-events active when dialog is open
  useEffect(() => {
    if (isDialogOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPointerEvents = document.body.style.pointerEvents;
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'auto';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.pointerEvents = originalPointerEvents;
      };
    }
  }, [isDialogOpen]);

  // Helper to ensure consistent stroke styling
  const applyStrokeStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#0f172a'; // Deep slate dark ink
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  // Redraw canvas from strokes list
  const redrawCanvas = useCallback((strokeList: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply ink style
    applyStrokeStyle(ctx);

    for (const stroke of strokeList) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  }, []);

  // Setup HiDPI Canvas when dialog opens or resizes
  useEffect(() => {
    if (!isDialogOpen) return;

    let timeoutId: NodeJS.Timeout;

    const setupCanvas = () => {
      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width || container.clientWidth || 320;
      const height = rect.height || container.clientHeight || 260;

      // Set actual resolution
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // Set display dimensions
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        applyStrokeStyle(ctx);
      }

      redrawCanvas(strokesRef.current);
    };

    // Small delay ensures modal animation finishes layout
    timeoutId = setTimeout(setupCanvas, 60);

    window.addEventListener('resize', setupCanvas);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', setupCanvas);
    };
  }, [isDialogOpen, redrawCanvas]);

  const getPointFromClient = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawingAt = (pt: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    setIsDrawing(true);
    currentStrokeRef.current = [pt];

    applyStrokeStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    // Draw tiny line segment so tap makes a visible dot
    ctx.lineTo(pt.x + 0.1, pt.y + 0.1);
    ctx.stroke();
  };

  const drawAt = (pt: Point) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    currentStrokeRef.current.push(pt);
    applyStrokeStyle(ctx);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const stopDrawingStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setIsDrawing(false);

    if (currentStrokeRef.current.length > 0) {
      const newStrokes = [...strokesRef.current, [...currentStrokeRef.current]];
      currentStrokeRef.current = [];
      setStrokes(newStrokes);
      strokesRef.current = newStrokes;
    }
  };

  // Dedicated Native Touch Listeners with { passive: false } for mobile touchscreens
  useEffect(() => {
    if (!isDialogOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Stop mobile browser scrolling/gestures
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        startDrawingAt(getPointFromClient(touch.clientX, touch.clientY));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Stop mobile browser scrolling/gestures
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        drawAt(getPointFromClient(touch.clientX, touch.clientY));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      stopDrawingStroke();
    };

    const handleTouchCancel = (e: TouchEvent) => {
      e.preventDefault();
      stopDrawingStroke();
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [isDialogOpen]);

  // Pointer event handlers for desktop mouse or stylus
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch') return; // Handled by native touch listener
    startDrawingAt(getPointFromClient(e.clientX, e.clientY));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch') return;
    drawAt(getPointFromClient(e.clientX, e.clientY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch') return;
    stopDrawingStroke();
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    strokesRef.current = newStrokes;
    redrawCanvas(newStrokes);
  };

  const handleClearDialog = () => {
    setStrokes([]);
    strokesRef.current = [];
    currentStrokeRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    }
  };

  const handleOpenDialog = () => {
    if (readOnly) return;
    setStrokes([]);
    strokesRef.current = [];
    currentStrokeRef.current = [];
    setIsDialogOpen(true);
    if (onDialogOpenChange) onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    if (onDialogOpenChange) onDialogOpenChange(false);
  };

  const handleSaveAndUse = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;

    const dataUrl = canvas.toDataURL('image/png');
    setCurrentSignature(dataUrl);
    if (onSave) onSave(dataUrl);
    handleCloseDialog();
  };

  const handleRemoveSignature = () => {
    if (readOnly) return;
    setCurrentSignature(null);
    setStrokes([]);
    strokesRef.current = [];
    if (onClear) onClear();
  };

  return (
    <div className="space-y-3">
      {/* Read-Only State */}
      {readOnly ? (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
          {currentSignature ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-full max-w-[280px] h-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shadow-xs">
                <img
                  src={currentSignature}
                  alt="Tanda Tangan"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Tanda Tangan Terverifikasi</span>
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Belum dibubuhi tanda tangan.</span>
          )}
        </div>
      ) : currentSignature ? (
        /* State 1: Tanda Tangan Sudah Ada (Preview Card) */
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-xs space-y-3 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tanda Tangan Siap</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Siap disimpan ke surat kontrak</span>
          </div>

          {/* Clean Signature Preview Box */}
          <div className="relative w-full h-28 sm:h-32 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 overflow-hidden">
            <img
              src={currentSignature}
              alt="Pratinjau Tanda Tangan"
              className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-xs"
            />
            {/* Subtle Baseline Watermark */}
            <div className="absolute bottom-4 left-6 right-6 border-b border-dashed border-slate-300/80 dark:border-slate-700/60 pointer-events-none"></div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleOpenDialog}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition active:scale-[0.98] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ganti Tanda Tangan</span>
            </button>

            <button
              type="button"
              onClick={handleRemoveSignature}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      ) : (
        /* State 2: Belum Ada Tanda Tangan (Trigger Box yang Luas & Ramah) */
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <PenTool className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleOpenDialog}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition active:scale-[0.98] cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>{buttonLabel}</span>
              <Maximize2 className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DIALOG KANVAS TANDA TANGAN (RENDERED VIA PORTAL TO BODY Z-[200])   */}
      {/* ========================================================================= */}
      {isDialogOpen &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseDialog();
            }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 select-none pointer-events-auto"
          >
            <div
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] select-text pointer-events-auto"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Goreskan Tanda Tangan Anda
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Gunakan jari, stylus, atau mouse di area bawah
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body: Spacious Responsive Canvas Area */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-3 min-h-0 overflow-y-auto">
                <div
                  ref={canvasContainerRef}
                  className="relative w-full h-[250px] xs:h-[280px] sm:h-[320px] rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white overflow-hidden touch-none select-none shadow-inner"
                  style={{ touchAction: 'none' }}
                >
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="w-full h-full block cursor-crosshair active:cursor-crosshair touch-none"
                    style={{ touchAction: 'none' }}
                  />

                  {/* Empty State Guide Watermark */}
                  {strokes.length === 0 && !isDrawing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 p-4 text-center space-y-1">
                      <Edit3 className="w-8 h-8 text-slate-300 stroke-1 mb-1" />
                      <span className="text-xs sm:text-sm font-medium text-slate-500">
                        Sentuh & usap di sini untuk tanda tangan
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Layar HP dan bottomsheet terkunci aman saat Anda menggores
                      </span>
                    </div>
                  )}

                  {/* Visual Baseline Guide */}
                  <div className="absolute bottom-7 left-6 right-6 border-b-2 border-dashed border-slate-300 pointer-events-none flex items-center justify-between text-[10px] text-slate-400 font-medium pb-1">
                    <span>Garis Tanda Tangan</span>
                    <span className="hidden xs:inline">Bebas angkat jari berulang kali</span>
                  </div>
                </div>

                {/* Stroke Counter & Quick Actions */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      {strokes.length > 0
                        ? `${strokes.length} goresan terdeteksi`
                        : 'Kanvas kosong'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={strokes.length === 0}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      <Undo2 className="w-3 h-3" />
                      <span>Urungkan</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearDialog}
                      disabled={strokes.length === 0}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Bersihkan</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndUse}
                  disabled={strokes.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition active:scale-[0.98] cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Gunakan Tanda Tangan</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

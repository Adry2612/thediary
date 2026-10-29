"use client";

import { useEffect, useRef } from "react";

interface ToastProps {
  message: string;
  open: boolean;
  onDismiss: () => void;
  /** Tiempo visible antes de cerrarse solo. */
  durationMs?: number;
}

/**
 * Aviso breve y no interactivo. Se anuncia como estado y desaparece solo para
 * no ocupar el centro de la práctica.
 */
export function Toast({
  message,
  open,
  onDismiss,
  durationMs = 5000,
}: ToastProps) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => dismissRef.current(), durationMs);
    return () => window.clearTimeout(timeout);
  }, [durationMs, open]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] z-50 mx-auto max-w-md rounded-lg border border-zinc-700 bg-zinc-900/95 px-4 py-3 text-center text-sm text-zinc-100 shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur motion-safe:animate-[enter_240ms_cubic-bezier(0.16,1,0.3,1)_both]"
    >
      {message}
    </div>
  );
}

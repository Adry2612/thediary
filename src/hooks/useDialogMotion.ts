"use client";

import { useEffect, useRef, useState } from "react";

/** Duración de la salida: más corta que la entrada, como pide el diseño. */
export const DIALOG_EXIT_DURATION_MS = 120;

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Mantiene el `<dialog>` nativo abierto durante su animación de salida y luego
 * lo cierra. `native.close()` lo saca de la capa superior al instante, así que
 * el cierre se retrasa lo que dura la transición.
 */
export function useDialogMotion(open: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsClosing(false);
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (!dialog.open) {
      setIsClosing(false);
      return;
    }

    if (prefersReducedMotion()) {
      dialog.close();
      setIsClosing(false);
      return;
    }

    setIsClosing(true);
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      if (dialogRef.current?.open) dialogRef.current.close();
      setIsClosing(false);
    }, DIALOG_EXIT_DURATION_MS);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return { dialogRef, isClosing };
}

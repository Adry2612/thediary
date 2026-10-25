"use client";

import { useEffect, useRef, useState } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Mantiene un elemento montado mientras se reproduce su animación de salida y
 * expone si debe mostrarse con la transición de entrada.
 *
 * La entrada se activa en el siguiente frame para que el navegador pueda
 * animar desde el estado oculto. Sin movimiento reducido, la salida espera
 * `duration` antes de desmontar; con él, todo ocurre en el mismo frame.
 */
export function useAnimatedPresence(open: boolean, duration = 180) {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function cancelFrame() {
      if (frameRef.current === null) return;
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    function cancelTimeout() {
      if (timeoutRef.current === null) return;
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (open) {
      cancelTimeout();
      setIsMounted(true);

      if (prefersReducedMotion()) {
        setIsVisible(true);
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        setIsVisible(true);
      });
      return cancelFrame;
    }

    cancelFrame();
    setIsVisible(false);

    if (prefersReducedMotion()) {
      setIsMounted(false);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setIsMounted(false);
    }, duration);
    return cancelTimeout;
  }, [duration, open]);

  return { isMounted, isVisible };
}

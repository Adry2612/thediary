"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/hooks/useDialogMotion";

/**
 * Cierra un elemento montado por su padre después de su salida. Sirve para las
 * modales que se desmontan al cerrarse: sin esperar, desaparecerían de golpe.
 */
export function useDeferredClose(action: () => void, duration = 120) {
  const [isClosing, setIsClosing] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const actionRef = useRef(action);
  actionRef.current = action;

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const requestClose = useCallback(
    (nextAction?: () => void) => {
      const run = nextAction ?? actionRef.current;
      if (isClosing) return;
      if (prefersReducedMotion()) {
        run();
        return;
      }

      setIsClosing(true);
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        run();
      }, duration);
    },
    [duration, isClosing],
  );

  return { isClosing, requestClose };
}

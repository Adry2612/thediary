"use client";

import { useEffect, useRef } from "react";
import { shouldHoldWakeLock } from "@/utils/screen-wake-lock";

type WakeLockSentinelLike = {
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

function getWakeLock() {
  if (typeof navigator === "undefined") return null;
  return (navigator as WakeLockNavigator).wakeLock ?? null;
}

/**
 * Mantiene la pantalla encendida mientras `active` sea verdadero. El sistema
 * libera el bloqueo al ocultar la página, así que se vuelve a pedir al volver.
 */
export function useScreenWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    const wakeLock = getWakeLock();

    function releaseSentinel() {
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (!sentinel) return;
      void sentinel.release().catch(() => {});
    }

    if (!active || !wakeLock) {
      releaseSentinel();
      return;
    }

    let cancelled = false;

    async function request() {
      if (!wakeLock) return;
      if (
        !shouldHoldWakeLock({
          isRunning: true,
          isVisible: document.visibilityState === "visible",
          isSupported: Boolean(wakeLock),
        })
      ) {
        return;
      }

      try {
        const sentinel = await wakeLock.request("screen");
        if (cancelled) {
          void sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener("release", () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null;
        });
      } catch {
        // NotAllowedError o falta de interacción: la práctica sigue sin el bloqueo.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void request();
    }

    void request();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseSentinel();
    };
  }, [active]);
}

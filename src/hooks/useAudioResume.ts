"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  getAudioSession,
  getAudioSessionState,
  isIOSWebKit,
  needsAudioGesture,
  shouldResumeAudio,
} from "@/utils/audio-resume";

/**
 * Reanuda el contexto de audio de una herramienta al volver a la página.
 * Si el navegador exige un gesto, deja `needsGesture` para que la vista ofrezca
 * una acción explícita en lugar de quedarse en silencio. En iOS el
 * `AudioContext` puede seguir en `running` mientras la sesión de audio está
 * interrumpida, así que se consultan ambos estados.
 */
export function useAudioResume({
  contextRef,
  active,
  onResume,
}: {
  contextRef: RefObject<AudioContext | null>;
  active: boolean;
  onResume?: () => void;
}) {
  const [needsGesture, setNeedsGesture] = useState(false);
  const onResumeRef = useRef(onResume);
  onResumeRef.current = onResume;

  const evaluate = useCallback(() => {
    const context = contextRef.current;
    if (!context || context.state === "closed") return;
    setNeedsGesture(needsAudioGesture(context.state, getAudioSessionState()));
  }, [contextRef]);

  const resume = useCallback(
    async ({ confirmOnIOS = false }: { confirmOnIOS?: boolean } = {}) => {
      const context = contextRef.current;
      if (!context || context.state === "closed") return;

      try {
        // En iOS, con la sesión interrumpida y el contexto aún en `running`,
        // un `resume()` no basta: reiniciar el contexto fuerza la reactivación.
        if (
          context.state === "running" &&
          getAudioSessionState() === "interrupted"
        ) {
          await context.suspend();
        }
        await context.resume();
      } catch {
        setNeedsGesture(true);
        return;
      }

      // Reanclar después de reanudar: `currentTime` ya es el bueno y el
      // planificador no debe soltar de golpe los pulsos perdidos.
      onResumeRef.current?.();
      evaluate();

      // Si el reloj de audio no avanza, el contexto está congelado aunque diga
      // `running`: sin gesto del usuario no sonará nada.
      const before = context.currentTime;
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      const clockFrozen =
        contextRef.current === context &&
        document.visibilityState === "visible" &&
        (context.state as string) !== "closed" &&
        context.currentTime - before < 0.05;

      if (clockFrozen) {
        setNeedsGesture(true);
        return;
      }

      // En iOS no hay forma fiable de confirmar que la sesión volvió a sonar
      // (el contexto puede estar `running` y mudo), así que se ofrece el gesto.
      if (
        confirmOnIOS &&
        typeof navigator !== "undefined" &&
        isIOSWebKit(
          navigator.userAgent,
          navigator.platform,
          navigator.maxTouchPoints ?? 0,
        )
      ) {
        setNeedsGesture(true);
      }
    },
    [contextRef, evaluate],
  );

  useEffect(() => {
    if (!active) {
      setNeedsGesture(false);
      return;
    }

    const context = contextRef.current;
    const audioSession = getAudioSession();

    function handleStateChange() {
      if (document.visibilityState === "visible") evaluate();
    }

    function handleVisibilityChange() {
      if (
        !shouldResumeAudio({
          isActive: active,
          isVisible: document.visibilityState === "visible",
        })
      ) {
        return;
      }
      void resume({ confirmOnIOS: true });
    }

    context?.addEventListener("statechange", handleStateChange);
    audioSession?.addEventListener?.("statechange", handleStateChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      context?.removeEventListener("statechange", handleStateChange);
      audioSession?.removeEventListener?.("statechange", handleStateChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active, contextRef, evaluate, resume]);

  return { needsGesture, resume };
}

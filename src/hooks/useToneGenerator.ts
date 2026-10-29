"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ToneGeneratorError = "unsupported" | "failed";

/**
 * Tono seno continuo con su propio contexto de audio. Se detiene al salir de
 * la herramienta y nunca comparte nodos con el metrónomo.
 */
export function useToneGenerator({
  frequency,
  level,
}: {
  frequency: number;
  level: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<ToneGeneratorError | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stop = useCallback(() => {
    try {
      oscillatorRef.current?.stop();
    } catch {
      // Ya estaba detenido.
    }
    oscillatorRef.current?.disconnect();
    gainRef.current?.disconnect();
    oscillatorRef.current = null;
    gainRef.current = null;
    if (contextRef.current) {
      void contextRef.current.close().catch(() => undefined);
      contextRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    if (isPlaying) return;
    setError(null);

    if (typeof window === "undefined" || !window.AudioContext) {
      setError("unsupported");
      return;
    }

    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      gain.gain.setValueAtTime(Math.max(0, Math.min(1, level)) * 0.2, context.currentTime);
      contextRef.current = context;
      oscillatorRef.current = oscillator;
      gainRef.current = gain;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      setIsPlaying(true);
    } catch {
      setError("failed");
      stop();
    }
  }, [frequency, isPlaying, level, stop]);

  useEffect(() => {
    const context = contextRef.current;
    const oscillator = oscillatorRef.current;
    if (!isPlaying || !context || !oscillator) return;

    oscillator.frequency.setTargetAtTime(
      frequency,
      context.currentTime,
      0.02,
    );
  }, [frequency, isPlaying]);

  useEffect(() => {
    const context = contextRef.current;
    const gain = gainRef.current;
    if (!isPlaying || !context || !gain) return;

    gain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, level)) * 0.2,
      context.currentTime,
      0.02,
    );
  }, [isPlaying, level]);

  return { isPlaying, error, start, stop };
}

"use client";

import { useEffect, useState } from "react";
import {
  WAVEFORM_BAR_COUNT,
  WAVEFORM_BASELINE_HEIGHT,
  appendWaveformLevel,
  getWaveformLevels,
} from "@/utils/recording-waveform";

function emptyLevels() {
  return Array.from(
    { length: WAVEFORM_BAR_COUNT },
    () => WAVEFORM_BASELINE_HEIGHT,
  );
}

function closeAudioContext(audioContext: AudioContext) {
  if (audioContext.state === "closed") return;

  void audioContext.close().catch((error: unknown) => {
    console.error("No se pudo cerrar el analizador de audio.", error);
  });
}

/**
 * Niveles de la grabación en curso. Mantiene un búfer que crece por la derecha
 * y sale por la izquierda. Con movimiento reducido actualiza un medidor fijo,
 * sin desplazar la onda.
 */
export function useRecordingWaveformLevels(
  stream: MediaStream | null,
  isRecording: boolean,
  onError: (message: string) => void,
) {
  const [levels, setLevels] = useState<number[]>(emptyLevels);

  useEffect(() => {
    if (!stream || !isRecording) {
      setLevels(emptyLevels());
      return;
    }
    if (!window.AudioContext) {
      onError("Este navegador no permite visualizar el nivel de audio.");
      return;
    }

    let audioContext: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let frame: number | null = null;

    try {
      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const samples = new Uint8Array(analyser.fftSize);
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      let lastUpdate = -100;

      function updateWaveform(timestamp: number) {
        if (timestamp - lastUpdate >= 80) {
          analyser.getByteTimeDomainData(samples);
          const level = getWaveformLevels(samples, 1)[0];
          setLevels((current) =>
            reducedMotion ?
              Array.from({ length: WAVEFORM_BAR_COUNT }, () => level)
            : appendWaveformLevel(current, level, WAVEFORM_BAR_COUNT),
          );
          lastUpdate = timestamp;
        }

        frame = requestAnimationFrame(updateWaveform);
      }

      frame = requestAnimationFrame(updateWaveform);
    } catch (error) {
      if (audioContext) closeAudioContext(audioContext);
      source?.disconnect();
      onError(
        error instanceof Error
          ? error.message
          : "No se pudo mostrar la onda de audio.",
      );
      return;
    }

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      source?.disconnect();
      if (audioContext) closeAudioContext(audioContext);
    };
  }, [isRecording, onError, stream]);

  return levels;
}

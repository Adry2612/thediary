"use client";

import { useEffect, useState } from "react";
import {
  WAVEFORM_BAR_COUNT,
  WAVEFORM_BASELINE_HEIGHT,
  getWaveformPeaks,
} from "@/utils/recording-waveform";

const peaksCache = new Map<string, number[]>();

function emptyPeaks() {
  return Array.from(
    { length: WAVEFORM_BAR_COUNT },
    () => WAVEFORM_BASELINE_HEIGHT,
  );
}

type AudioContextConstructor = new () => AudioContext;

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;
  const audioWindow = window as Window & {
    webkitAudioContext?: AudioContextConstructor;
  };
  return window.AudioContext ?? audioWindow.webkitAudioContext ?? null;
}

/**
 * Picos de una toma guardada, calculados una sola vez y recordados por id. Si
 * el navegador no puede decodificar el audio, devuelve la línea base: la toma
 * sigue disponible aunque no se dibuje su onda.
 */
export function useRecordingPeaks(
  recordingId: string | null,
  blob: Blob | null | undefined,
) {
  const [peaks, setPeaks] = useState<number[] | null>(() =>
    recordingId ? (peaksCache.get(recordingId) ?? null) : null,
  );

  useEffect(() => {
    if (!recordingId || !blob) {
      setPeaks(null);
      return;
    }

    const cached = peaksCache.get(recordingId);
    if (cached) {
      setPeaks(cached);
      return;
    }

    let isActive = true;
    const AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor) {
      setPeaks(emptyPeaks());
      return;
    }

    const audioContext = new AudioContextConstructor();

    void (async () => {
      try {
        const buffer = await audioContext.decodeAudioData(
          await blob.arrayBuffer(),
        );
        const nextPeaks = getWaveformPeaks(
          buffer.getChannelData(0),
          WAVEFORM_BAR_COUNT,
        );
        peaksCache.set(recordingId, nextPeaks);
        if (isActive) setPeaks(nextPeaks);
      } catch {
        if (isActive) setPeaks(emptyPeaks());
      } finally {
        void audioContext.close().catch(() => undefined);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [blob, recordingId]);

  return peaks;
}

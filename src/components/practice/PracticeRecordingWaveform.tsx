"use client";

import { useEffect, useState } from "react";
import { getWaveformLevels } from "@/lib/recording-waveform";

interface PracticeRecordingWaveformProps {
  stream: MediaStream | null;
  onError: (message: string) => void;
}

const BAR_COUNT = 32;

function closeAudioContext(audioContext: AudioContext) {
  if (audioContext.state === "closed") return;

  void audioContext.close().catch((error: unknown) => {
    console.error("No se pudo cerrar el analizador de audio.", error);
  });
}

export function PracticeRecordingWaveform({
  stream,
  onError,
}: PracticeRecordingWaveformProps) {
  const [levels, setLevels] = useState<number[]>(() =>
    Array(BAR_COUNT).fill(0.08),
  );

  useEffect(() => {
    if (!stream) return;
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
          setLevels(getWaveformLevels(samples, BAR_COUNT));
          lastUpdate = timestamp;
        }

        if (!reducedMotion) frame = requestAnimationFrame(updateWaveform);
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
  }, [onError, stream]);

  if (!stream) return null;

  return (
    <div
      className="mt-5 flex h-12 items-center justify-center gap-1"
      role="img"
      aria-label="Onda de audio de la grabación en curso"
    >
      {levels.map((level, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="w-1 rounded-full bg-accent-green-fg/80"
          style={{ height: `${Math.max(8, level * 100)}%` }}
        />
      ))}
    </div>
  );
}

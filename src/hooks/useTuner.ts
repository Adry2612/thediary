"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  detectPitch,
  getNoteFromFrequency,
  type DetectedNote,
  type PitchDetection,
} from "@/utils/tuner";

export type TunerError =
  | "unsupported"
  | "permission"
  | "failed"
  | "insecure"
  | "audio";

type AudioContextConstructor = new () => AudioContext;

/**
 * Micrófono del afinador. Solo escucha mientras `active` es verdadero y se
 * detiene al cambiar de herramienta o salir de la sección.
 */
export function useTuner(active: boolean, a4: number) {
  const [isListening, setIsListening] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [detection, setDetection] = useState<PitchDetection | null>(null);
  const [error, setError] = useState<TunerError | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const frameRef = useRef<number | null>(null);
  const stopRequestedRef = useRef(false);

  const stop = useCallback(() => {
    stopRequestedRef.current = true;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    gainRef.current?.disconnect();
    gainRef.current = null;
    if (contextRef.current) {
      void contextRef.current.close().catch(() => undefined);
      contextRef.current = null;
    }
    setIsListening(false);
    setIsStarting(false);
    setDetection(null);
  }, []);

  useEffect(() => {
    if (!active) stop();
  }, [active, stop]);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    if (isListening) return;
    stopRequestedRef.current = false;
    setError(null);

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError("unsupported");
      return;
    }

    if (!window.isSecureContext) {
      setError("insecure");
      return;
    }

    const AudioContextConstructor =
      window.AudioContext ??
      (window as typeof window & {
        webkitAudioContext?: AudioContextConstructor;
      }).webkitAudioContext;
    if (!AudioContextConstructor) {
      setError("unsupported");
      return;
    }

    setIsStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      if (stopRequestedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const context = new AudioContextConstructor();
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      const source = context.createMediaStreamSource(stream);
      const silentSink = context.createGain();
      silentSink.gain.value = 0;
      source.connect(analyser);
      analyser.connect(silentSink);
      silentSink.connect(context.destination);

      contextRef.current = context;
      sourceRef.current = source;
      gainRef.current = silentSink;

      if (context.state === "suspended") {
        await context.resume();
      }
      if (stopRequestedRef.current) {
        stop();
        return;
      }
      if (context.state !== "running") {
        setError("audio");
        stop();
        return;
      }

      const samples = new Float32Array(analyser.fftSize);
      setIsStarting(false);
      setIsListening(true);

      let lastUpdate = -100;
      const update = (timestamp: number) => {
        if (timestamp - lastUpdate >= 90) {
          analyser.getFloatTimeDomainData(samples);
          setDetection(detectPitch(samples, context.sampleRate));
          lastUpdate = timestamp;
        }
        frameRef.current = requestAnimationFrame(update);
      };
      frameRef.current = requestAnimationFrame(update);
    } catch (startError) {
      const name =
        startError instanceof DOMException ? startError.name : "unknown";
      setError(
        name === "NotAllowedError" || name === "SecurityError"
          ? "permission"
          : name === "NotReadableError" ||
              name === "NotFoundError" ||
              name === "NotSupportedError"
            ? "failed"
            : "audio",
      );
      stop();
    }
  }, [isListening, stop]);

  const note: DetectedNote | null =
    detection ? getNoteFromFrequency(detection.frequency, a4) : null;

  return {
    isListening,
    isStarting,
    detection,
    note,
    error,
    start,
    stop,
  };
}

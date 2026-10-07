"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const MIN_BPM = 40;
export const MAX_BPM = 240;

const SCHEDULER_INTERVAL_MS = 25;
const SCHEDULE_AHEAD_SECONDS = 0.1;
const CLICK_DURATION_SECONDS = 0.075;
const VISUAL_PULSE_MS = 90;
const BEATS_PER_BAR = 4;
const TAP_RESET_MS = 2_000;
const MIN_TAP_INTERVAL_MS = 250;
const MAX_TAP_INTERVALS = 4;

function clampBpm(value: number) {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)));
}

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "El navegador no pudo activar el audio.";
}

function scheduleClick(
  context: AudioContext,
  scheduledAt: number,
  volume: number,
  isDownbeat: boolean,
  activeOscillators: Set<OscillatorNode>,
) {
  if (volume === 0) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const peakVolume = isDownbeat ? volume : volume * 0.78;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(isDownbeat ? 1_000 : 760, scheduledAt);
  gain.gain.setValueAtTime(0.0001, scheduledAt);
  gain.gain.linearRampToValueAtTime(peakVolume, scheduledAt + 0.004);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    scheduledAt + CLICK_DURATION_SECONDS,
  );

  oscillator.connect(gain);
  gain.connect(context.destination);
  activeOscillators.add(oscillator);
  oscillator.addEventListener(
    "ended",
    () => {
      activeOscillators.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    },
    { once: true },
  );
  oscillator.start(scheduledAt);
  oscillator.stop(scheduledAt + CLICK_DURATION_SECONDS);
}

export function useMetronome(initialBpm = 80, initialVolume = 0.3) {
  const [bpm, setBpmState] = useState(() => clampBpm(initialBpm));
  const [volume, setVolumeState] = useState(() => clampVolume(initialVolume));
  const [subdivision, setSubdivisionState] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [activeBeat, setActiveBeat] = useState<number | null>(null);
  const [activeSubdivision, setActiveSubdivision] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const bpmRef = useRef(bpm);
  const volumeRef = useRef(volume);
  const subdivisionRef = useRef(subdivision);
  const runningRef = useRef(false);
  const startingRef = useRef(false);
  const mountedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextBeatTimeRef = useRef(0);
  const beatNumberRef = useRef(0);
  const subdivisionNumberRef = useRef(0);
  const schedulerRef = useRef<number | null>(null);
  const activeOscillatorsRef = useRef(new Set<OscillatorNode>());
  const pulseTimeoutsRef = useRef(new Set<number>());
  const lastTapTimeRef = useRef<number | null>(null);
  const tapIntervalsRef = useRef<number[]>([]);
  const pulseReleaseTimeoutRef = useRef<number | null>(null);

  const setBpm = useCallback((value: number) => {
    const nextBpm = clampBpm(value);
    bpmRef.current = nextBpm;
    setBpmState(nextBpm);
  }, []);

  const setVolume = useCallback((value: number) => {
    const nextVolume = clampVolume(value);
    volumeRef.current = nextVolume;
    setVolumeState(nextVolume);
  }, []);

  const setSubdivision = useCallback((value: number) => {
    if (![1, 2, 3, 4].includes(value)) return;
    subdivisionRef.current = value;
    setSubdivisionState(value);
    subdivisionNumberRef.current = 0;
  }, []);

  const clearPulseTimeouts = useCallback(() => {
    for (const timeoutId of pulseTimeoutsRef.current) {
      window.clearTimeout(timeoutId);
    }
    pulseTimeoutsRef.current.clear();
    pulseReleaseTimeoutRef.current = null;
  }, []);

  const stopActiveOscillators = useCallback(() => {
    for (const oscillator of activeOscillatorsRef.current) {
      oscillator.stop();
    }
    activeOscillatorsRef.current.clear();
  }, []);

  const scheduleVisualPulse = useCallback(
    (
      context: AudioContext,
      scheduledAt: number,
      beat: number,
      subdivisionStep: number,
    ) => {
      const delay = Math.max(0, (scheduledAt - context.currentTime) * 1_000);
      const pulseTimeout = window.setTimeout(() => {
        pulseTimeoutsRef.current.delete(pulseTimeout);
        setActiveBeat(beat);
        setActiveSubdivision(subdivisionStep);
        setIsPulsing(true);

        if (pulseReleaseTimeoutRef.current !== null) {
          window.clearTimeout(pulseReleaseTimeoutRef.current);
          pulseTimeoutsRef.current.delete(pulseReleaseTimeoutRef.current);
        }
        const releaseTimeout = window.setTimeout(() => {
          pulseTimeoutsRef.current.delete(releaseTimeout);
          pulseReleaseTimeoutRef.current = null;
          setIsPulsing(false);
        }, VISUAL_PULSE_MS);
        pulseReleaseTimeoutRef.current = releaseTimeout;
        pulseTimeoutsRef.current.add(releaseTimeout);
      }, delay);

      pulseTimeoutsRef.current.add(pulseTimeout);
    },
    [],
  );

  const scheduleNextBeats = useCallback(() => {
    const context = audioContextRef.current;
    if (!context || !runningRef.current) return;

    const schedulingLimit = context.currentTime + SCHEDULE_AHEAD_SECONDS;
    while (nextBeatTimeRef.current < schedulingLimit) {
      const beatNumber = beatNumberRef.current;
      const subdivisionNumber = subdivisionNumberRef.current;
      scheduleClick(
        context,
        nextBeatTimeRef.current,
        volumeRef.current,
        beatNumber === 0 && subdivisionNumber === 0,
        activeOscillatorsRef.current,
      );
      scheduleVisualPulse(
        context,
        nextBeatTimeRef.current,
        beatNumber,
        subdivisionNumber,
      );

      nextBeatTimeRef.current += 60 / bpmRef.current / subdivisionRef.current;
      subdivisionNumberRef.current += 1;
      if (subdivisionNumberRef.current >= subdivisionRef.current) {
        subdivisionNumberRef.current = 0;
        beatNumberRef.current = (beatNumberRef.current + 1) % BEATS_PER_BAR;
      }
    }
  }, [scheduleVisualPulse]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      runningRef.current = false;

      if (schedulerRef.current !== null) {
        window.clearInterval(schedulerRef.current);
      }
      clearPulseTimeouts();
      stopActiveOscillators();

      const context = audioContextRef.current;
      if (context && context.state !== "closed") {
        void context.close();
      }
    };
  }, [clearPulseTimeouts, stopActiveOscillators]);

  useEffect(() => {
    if (!isRunning) return;

    scheduleNextBeats();
    const scheduler = window.setInterval(
      scheduleNextBeats,
      SCHEDULER_INTERVAL_MS,
    );
    schedulerRef.current = scheduler;

    return () => {
      window.clearInterval(scheduler);
      if (schedulerRef.current === scheduler) schedulerRef.current = null;
    };
  }, [isRunning, scheduleNextBeats]);

  const start = useCallback(async () => {
    if (runningRef.current || startingRef.current) return;

    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      setAudioError("Este navegador no admite la Web Audio API.");
      return;
    }

    startingRef.current = true;
    setIsStarting(true);
    setAudioError(null);

    let context = audioContextRef.current;
    try {
      if (!context || context.state === "closed") {
        context = new AudioContextConstructor();
        audioContextRef.current = context;
      }

      await context.resume();
    } catch (error) {
      if (mountedRef.current) {
        setAudioError(`No se pudo activar el audio: ${getErrorMessage(error)}`);
      }
      startingRef.current = false;
      if (mountedRef.current) setIsStarting(false);
      return;
    }

    startingRef.current = false;
    if (mountedRef.current) setIsStarting(false);
    if (!mountedRef.current) return;
    if (context.state !== "running") {
      setAudioError("El navegador mantuvo el contexto de audio suspendido.");
      return;
    }

    nextBeatTimeRef.current = context.currentTime + 0.05;
    beatNumberRef.current = 0;
    subdivisionNumberRef.current = 0;
    runningRef.current = true;
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    startingRef.current = false;
    runningRef.current = false;
    setIsStarting(false);
    setIsRunning(false);
    setIsPulsing(false);
    setActiveBeat(null);
    setActiveSubdivision(null);
    clearPulseTimeouts();
    stopActiveOscillators();

    const context = audioContextRef.current;
    if (context && context.state === "running") {
      void context.suspend().catch((error: unknown) => {
        if (mountedRef.current) {
          setAudioError(`No se pudo detener el audio: ${getErrorMessage(error)}`);
        }
      });
    }
  }, [clearPulseTimeouts, stopActiveOscillators]);

  const tapTempo = useCallback(() => {
    const now = performance.now();
    const previousTap = lastTapTimeRef.current;

    if (previousTap === null || now - previousTap > TAP_RESET_MS) {
      lastTapTimeRef.current = now;
      tapIntervalsRef.current = [];
      setTapCount(1);
      return;
    }

    const interval = now - previousTap;
    if (interval < MIN_TAP_INTERVAL_MS) return;

    lastTapTimeRef.current = now;
    tapIntervalsRef.current = [
      ...tapIntervalsRef.current,
      interval,
    ].slice(-MAX_TAP_INTERVALS);
    setTapCount(tapIntervalsRef.current.length + 1);

    const averageInterval =
      tapIntervalsRef.current.reduce((total, value) => total + value, 0) /
      tapIntervalsRef.current.length;
    setBpm(60_000 / averageInterval);
  }, [setBpm]);

  return {
    audioError,
    bpm,
    isPulsing,
    isRunning,
    isStarting,
    setBpm,
    setVolume,
    setSubdivision,
    start,
    stop,
    tapCount,
    tapTempo,
    volume,
    subdivision,
    activeBeat,
    activeSubdivision,
  };
}

"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  clampMetronomeBpm,
  clampMetronomeVolume,
  getTapTempoUpdate,
  MAX_BPM,
  MIN_BPM,
  type TapTempoState,
} from "@/lib/metronome-tempo";
import {
  getMetronomeMeter,
  type MetronomeMeterSignature,
} from "@/lib/metronome-meter";
import { getScheduledMetronomeBeats } from "@/lib/metronome-scheduler";
import {
  DEFAULT_TEMPO_RAMP_SETTINGS,
  getTempoRampIntervalSeconds,
  normalizeTempoRampSettings,
  type TempoRampSettings,
} from "@/lib/metronome-tempo-ramp";
import { scheduleMetronomeClick } from "@/lib/metronome-audio";
import { type PracticeSound } from "@/lib/practice-sounds";
import {
  closeMetronomeAudioContext,
  getOrCreateMetronomeAudioContext,
  resumeMetronomeAudioContext,
  suspendMetronomeAudioContext,
} from "@/lib/metronome-audio-context";

export { MAX_BPM, MIN_BPM };

const SCHEDULER_INTERVAL_MS = 25;
const VISUAL_PULSE_MS = 90;
const DEFAULT_METRONOME_METER = getMetronomeMeter("4/4");

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "El navegador no pudo activar el audio.";
}

function useMetronomeController(initialBpm = 80, initialVolume = 0.3) {
  const [bpm, setBpmState] = useState(() => clampMetronomeBpm(initialBpm));
  const [volume, setVolumeState] = useState(() =>
    clampMetronomeVolume(initialVolume),
  );
  const [subdivision, setSubdivisionState] = useState(1);
  const [meterSignature, setMeterSignatureState] =
    useState<MetronomeMeterSignature>(DEFAULT_METRONOME_METER.signature);
  const [tempoRamp, setTempoRampState] = useState(
    DEFAULT_TEMPO_RAMP_SETTINGS,
  );
  const [practiceStartSound, setPracticeStartSound] = useState<PracticeSound>("voice");
  const [practiceEndSound, setPracticeEndSound] = useState<PracticeSound>("alarm");
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
  const meterRef = useRef(DEFAULT_METRONOME_METER);
  const tempoRampRef = useRef(tempoRamp);
  const runningRef = useRef(false);
  const startingRef = useRef(false);
  const startAttemptRef = useRef(0);
  const mountedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextBeatTimeRef = useRef(0);
  const beatNumberRef = useRef(0);
  const subdivisionNumberRef = useRef(0);
  const completedBarsRef = useRef(0);
  const nextTempoIncreaseAtRef = useRef<number | null>(null);
  const nextTempoIncreaseBarRef = useRef<number | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const activeOscillatorsRef = useRef(new Set<OscillatorNode>());
  const pulseTimeoutsRef = useRef(new Set<number>());
  const tapTempoStateRef = useRef<TapTempoState>({
    lastTapTime: null,
    intervals: [],
    tapCount: 0,
  });
  const pulseReleaseTimeoutRef = useRef<number | null>(null);

  const setBpm = useCallback((value: number) => {
    const nextBpm = clampMetronomeBpm(value);
    bpmRef.current = nextBpm;
    setBpmState(nextBpm);
  }, []);

  const setVolume = useCallback((value: number) => {
    const nextVolume = clampMetronomeVolume(value);
    volumeRef.current = nextVolume;
    setVolumeState(nextVolume);
  }, []);

  const setSubdivision = useCallback((value: number) => {
    if (![1, 2, 3, 4].includes(value)) return;
    subdivisionRef.current = value;
    setSubdivisionState(value);
    subdivisionNumberRef.current = 0;
  }, []);

  const resetTempoRampSchedule = useCallback(
    (settings: TempoRampSettings, completedBars: number) => {
      const currentTime = audioContextRef.current?.currentTime ?? 0;
      const intervalSeconds = getTempoRampIntervalSeconds(settings);

      nextTempoIncreaseAtRef.current =
        settings.enabled && intervalSeconds !== null
          ? currentTime + intervalSeconds
          : null;
      nextTempoIncreaseBarRef.current =
        settings.enabled && settings.intervalUnit === "bars"
          ? completedBars + settings.intervalValue
          : null;
    },
    [],
  );

  const setMeterSignature = useCallback(
    (signature: MetronomeMeterSignature) => {
      meterRef.current = getMetronomeMeter(signature);
      setMeterSignatureState(signature);
      beatNumberRef.current = 0;
      subdivisionNumberRef.current = 0;
      completedBarsRef.current = 0;
      resetTempoRampSchedule(tempoRampRef.current, 0);
    },
    [resetTempoRampSchedule],
  );

  const setTempoRamp = useCallback(
    (settings: TempoRampSettings) => {
      const normalizedSettings = normalizeTempoRampSettings(settings);
      tempoRampRef.current = normalizedSettings;
      setTempoRampState(normalizedSettings);
      resetTempoRampSchedule(normalizedSettings, completedBarsRef.current);
    },
    [resetTempoRampSchedule],
  );

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

    const schedule = getScheduledMetronomeBeats({
      state: {
        nextBeatTime: nextBeatTimeRef.current,
        beatNumber: beatNumberRef.current,
        subdivisionNumber: subdivisionNumberRef.current,
        completedBars: completedBarsRef.current,
        nextTempoIncreaseAt: nextTempoIncreaseAtRef.current,
        nextTempoIncreaseBar: nextTempoIncreaseBarRef.current,
      },
      currentTime: context.currentTime,
      bpm: bpmRef.current,
      subdivision: subdivisionRef.current,
      beatsPerMeasure: meterRef.current.beatsPerMeasure,
      tempoRamp: tempoRampRef.current,
    });

    for (const beat of schedule.beats) {
      scheduleMetronomeClick({
        context,
        scheduledAt: beat.scheduledAt,
        volume: volumeRef.current,
        isDownbeat: beat.isDownbeat,
        activeOscillators: activeOscillatorsRef.current,
      });
      scheduleVisualPulse(
        context,
        beat.scheduledAt,
        beat.beat,
        beat.subdivision,
      );
    }

    nextBeatTimeRef.current = schedule.state.nextBeatTime;
    beatNumberRef.current = schedule.state.beatNumber;
    subdivisionNumberRef.current = schedule.state.subdivisionNumber;
    completedBarsRef.current = schedule.state.completedBars;
    nextTempoIncreaseAtRef.current = schedule.state.nextTempoIncreaseAt;
    nextTempoIncreaseBarRef.current = schedule.state.nextTempoIncreaseBar;
    bpmRef.current = schedule.bpm;
    setBpmState(schedule.bpm);
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
        closeMetronomeAudioContext(context);
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

  const suspendAfterCancelledStart = useCallback((context: AudioContext) => {
    if (startingRef.current || runningRef.current) return;

    void suspendMetronomeAudioContext(context).catch((error: unknown) => {
      if (mountedRef.current) {
        setAudioError(`No se pudo detener el audio: ${getErrorMessage(error)}`);
      }
    });
  }, []);

  const start = useCallback(async () => {
    if (runningRef.current || startingRef.current) return;
    const startAttempt = ++startAttemptRef.current;

    const AudioContextConstructor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextConstructor) {
      setAudioError("Este navegador no admite la Web Audio API.");
      return;
    }

    startingRef.current = true;
    setIsStarting(true);
    setAudioError(null);

    let context: AudioContext;
    try {
      context = getOrCreateMetronomeAudioContext(
        audioContextRef.current,
        AudioContextConstructor,
      );
      audioContextRef.current = context;
      await resumeMetronomeAudioContext(context);
    } catch (error) {
      const isCurrentAttempt = startAttemptRef.current === startAttempt;
      if (!isCurrentAttempt) {
        if (audioContextRef.current) {
          suspendAfterCancelledStart(audioContextRef.current);
        }
        return;
      }
      if (mountedRef.current && isCurrentAttempt) {
        setAudioError(`No se pudo activar el audio: ${getErrorMessage(error)}`);
      }
      startingRef.current = false;
      if (mountedRef.current) setIsStarting(false);
      return;
    }

    if (startAttemptRef.current !== startAttempt) {
      suspendAfterCancelledStart(context);
      return;
    }
    if (!mountedRef.current) {
      startingRef.current = false;
      return;
    }
    startingRef.current = false;
    setIsStarting(false);
    if (context.state !== "running") {
      setAudioError("El navegador mantuvo el contexto de audio suspendido.");
      return;
    }

    nextBeatTimeRef.current = context.currentTime + 0.05;
    beatNumberRef.current = 0;
    subdivisionNumberRef.current = 0;
    completedBarsRef.current = 0;
    resetTempoRampSchedule(tempoRampRef.current, 0);
    runningRef.current = true;
    setIsRunning(true);
  }, [resetTempoRampSchedule, suspendAfterCancelledStart]);

  const stop = useCallback(() => {
    startAttemptRef.current += 1;
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
    if (!context) return;

    void suspendMetronomeAudioContext(context).catch((error: unknown) => {
      if (mountedRef.current) {
        setAudioError(`No se pudo detener el audio: ${getErrorMessage(error)}`);
      }
    });
  }, [clearPulseTimeouts, stopActiveOscillators]);

  const tapTempo = useCallback(() => {
    const update = getTapTempoUpdate(
      tapTempoStateRef.current,
      performance.now(),
    );
    if (!update.accepted) return;

    tapTempoStateRef.current = update.state;
    setTapCount(update.state.tapCount);
    if (update.bpm !== null) setBpm(update.bpm);
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
    meterSignature,
    setMeterSignature,
    tempoRamp,
    setTempoRamp,
    practiceStartSound,
    setPracticeStartSound,
    practiceEndSound,
    setPracticeEndSound,
    activeBeat,
    activeSubdivision,
  };
}

type MetronomeController = ReturnType<typeof useMetronomeController>;

const MetronomeContext = createContext<MetronomeController | null>(null);

export function MetronomeProvider({ children }: { children: ReactNode }) {
  const metronome = useMetronomeController();

  return createElement(MetronomeContext.Provider, { value: metronome }, children);
}

export function useMetronome() {
  const metronome = useContext(MetronomeContext);
  if (!metronome) {
    throw new Error("useMetronome must be used within a MetronomeProvider.");
  }

  return metronome;
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  synchronizePracticeTimer,
  type PracticeTimerPlanItem,
  type PracticeTimerRuntime,
} from "@/lib/practice-timer";
import type {
  PracticePhase,
  PracticeSkill,
  PracticeTimerResult,
} from "@/types/practice";
import type { PracticeSound } from "@/lib/practice-sounds";

type TimerSnapshot = {
  elapsedSeconds: number;
  startedAt: string | null;
  phaseIndex: number;
  remainingSeconds: number;
  isRunning: boolean;
  awaitingPhaseAdvance: boolean;
};

function emptySkillElapsedMs(): Record<PracticeSkill, number> {
  return { technique: 0, theory: 0, repertoire: 0, improvisation: 0 };
}

function createSnapshot(
  runtime: PracticeTimerRuntime,
  phasePlan: PracticeTimerPlanItem[],
  countUp: boolean,
): TimerSnapshot {
  const currentPhase = phasePlan[runtime.phaseIndex];
  const remainingMs = currentPhase
    ? Math.max(0, currentPhase.durationMs - runtime.phaseElapsedMs)
    : 0;

  return {
    elapsedSeconds: Math.floor(runtime.elapsedMs / 1000),
    startedAt:
      runtime.startedAtMs === null
        ? null
        : new Date(runtime.startedAtMs).toISOString(),
    phaseIndex: runtime.phaseIndex,
    remainingSeconds:
      countUp ? Math.floor(runtime.elapsedMs / 1000) : Math.ceil(remainingMs / 1000),
    isRunning: runtime.isRunning,
    awaitingPhaseAdvance: runtime.awaitingPhaseAdvance,
  };
}

function validatePhases(phases: PracticePhase[]): PracticeTimerPlanItem[] {
  return phases.map((phase) => {
    if (!Number.isFinite(phase.durationMinutes) || phase.durationMinutes <= 0) {
      throw new RangeError(
        `La duración de la etapa "${phase.name}" debe ser mayor que cero.`,
      );
    }

    return {
      phase,
      durationMs: phase.durationMinutes * 60_000,
    };
  });
}

export function usePracticeTimer(
  phases: PracticePhase[],
  onPhaseChange?: (phase: PracticePhase) => void,
  onComplete?: (result: PracticeTimerResult) => void,
  countUp = false,
  startSound: PracticeSound = 'voice',
  endSound: PracticeSound = 'alarm',
) {
  const phasePlan = useMemo(() => validatePhases(phases), [phases]);
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(() =>
    createSnapshot(
      {
        elapsedMs: 0,
        phaseElapsedMs: 0,
        phaseElapsedTotalsMs: phasePlan.map(() => 0),
        skillElapsedMs: emptySkillElapsedMs(),
        phaseIndex: 0,
        lastUpdatedAtMs: Date.now(),
        startedAtMs: null,
        isRunning: false,
        awaitingPhaseAdvance: false,
      },
      phasePlan,
      countUp,
    ),
  );
  const [autoAdvance, setAutoAdvance] = useState(false);
  const runtimeRef = useRef<PracticeTimerRuntime>({
    elapsedMs: 0,
    phaseElapsedMs: 0,
    phaseElapsedTotalsMs: phasePlan.map(() => 0),
    skillElapsedMs: emptySkillElapsedMs(),
    phaseIndex: 0,
    lastUpdatedAtMs: Date.now(),
    startedAtMs: null,
    isRunning: false,
    awaitingPhaseAdvance: false,
  });
  const audioContextRef = useRef<AudioContext | null>(null);
  const onPhaseChangeRef = useRef(onPhaseChange);
  const onCompleteRef = useRef(onComplete);
  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;

  const playTransitionTone = useCallback((isStartingBlock: boolean) => {
    if (typeof window === 'undefined') return;

    try {
      const AudioContextConstructor =
        window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextConstructor) return;
      const context =
        audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = context;
      if (context.state === 'suspended') void context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      const sound = isStartingBlock ? startSound : endSound;
      oscillator.type = sound === 'voice' ? 'sawtooth' : sound === 'alarm' ? 'square' : 'sine';
      oscillator.frequency.value = sound === 'voice'
        ? (isStartingBlock ? 520 : 390)
        : sound === 'alarm'
          ? (isStartingBlock ? 1_200 : 700)
          : (isStartingBlock ? 880 : 330);
      gain.gain.setValueAtTime(0.0001, now);
      const duration = sound === 'bell' ? 0.8 : sound === 'alarm' ? 0.35 : 0.28;
      gain.gain.exponentialRampToValueAtTime(0.24, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    } catch {
      // Audio is optional; the timer must continue if the browser blocks it.
    }
  }, [endSound, startSound]);

  const completeSession = useCallback(
    (runtime: PracticeTimerRuntime, completed: boolean) => {
      const skillSeconds = Object.fromEntries(
        Object.entries(runtime.skillElapsedMs).map(([skill, milliseconds]) => [
          skill,
          Math.floor(milliseconds / 1000),
        ]),
      ) as Record<PracticeSkill, number>;

      onCompleteRef.current?.({
        elapsedSeconds: Math.floor(runtime.elapsedMs / 1000),
        startedAt: new Date(runtime.startedAtMs ?? Date.now()).toISOString(),
        completed,
        skillSeconds,
        phases: phasePlan.map(({ phase }, index) => ({
          id: phase.id,
          name: phase.name,
          skill: phase.skill,
          elapsedSeconds: Math.floor(
            (runtime.phaseElapsedTotalsMs[index] ?? 0) / 1000,
          ),
        })),
      });
    },
    [phasePlan],
  );

  const publishSnapshot = useCallback(
    (runtime: PracticeTimerRuntime) => {
      const nextSnapshot = createSnapshot(runtime, phasePlan, countUp);
      setSnapshot((current) => {
        if (
          current.elapsedSeconds === nextSnapshot.elapsedSeconds &&
          current.startedAt === nextSnapshot.startedAt &&
          current.phaseIndex === nextSnapshot.phaseIndex &&
          current.remainingSeconds === nextSnapshot.remainingSeconds &&
          current.isRunning === nextSnapshot.isRunning &&
          current.awaitingPhaseAdvance === nextSnapshot.awaitingPhaseAdvance
        ) {
          return current;
        }

        return nextSnapshot;
      });
    },
    [countUp, phasePlan],
  );

  const synchronize = useCallback(
    (now: number) => {
      const runtime = runtimeRef.current;
      if (!runtime.isRunning) return;

      const result = synchronizePracticeTimer(runtime, phasePlan, now, countUp);
      if (result.completed) {
        runtimeRef.current = result.runtime;
        publishSnapshot(result.runtime);
        playTransitionTone(false);
        completeSession(result.runtime, true);
        return;
      }

      if (autoAdvance && result.runtime.awaitingPhaseAdvance) {
        playTransitionTone(false);
        const nextPhaseIndex = result.runtime.phaseIndex + 1;
        const nextPhase = phasePlan[nextPhaseIndex]?.phase;
        const nextRuntime: PracticeTimerRuntime = {
          ...result.runtime,
          phaseIndex: nextPhaseIndex,
          phaseElapsedMs: 0,
          isRunning: Boolean(nextPhase),
          awaitingPhaseAdvance: false,
        };
        runtimeRef.current = nextRuntime;
        if (nextPhase) {
          window.setTimeout(() => playTransitionTone(true), 220);
          onPhaseChangeRef.current?.(nextPhase);
        }
        publishSnapshot(nextRuntime);
        return;
      }

      runtimeRef.current = result.runtime;
      if (result.runtime.awaitingPhaseAdvance) playTransitionTone(false);
      publishSnapshot(result.runtime);
    },
    [
      autoAdvance,
      completeSession,
      countUp,
      phasePlan,
      playTransitionTone,
      publishSnapshot,
    ],
  );

  useEffect(() => {
    if (!snapshot.isRunning) return;

    const intervalId = window.setInterval(() => synchronize(Date.now()), 250);
    return () => window.clearInterval(intervalId);
  }, [snapshot.isRunning, synchronize]);

  useEffect(() => {
    const runtime: PracticeTimerRuntime = {
      elapsedMs: 0,
      phaseElapsedMs: 0,
      phaseElapsedTotalsMs: phasePlan.map(() => 0),
      skillElapsedMs: emptySkillElapsedMs(),
      phaseIndex: 0,
      lastUpdatedAtMs: Date.now(),
      startedAtMs: null,
      isRunning: false,
      awaitingPhaseAdvance: false,
    };

    runtimeRef.current = runtime;
    publishSnapshot(runtime);
  }, [countUp, phasePlan, publishSnapshot]);

  const resume = useCallback(() => {
    const runtime = runtimeRef.current;
    if (
      runtime.isRunning ||
      runtime.awaitingPhaseAdvance ||
      runtime.phaseIndex >= phasePlan.length
    ) {
      return;
    }

    const nextRuntime = {
      ...runtime,
      lastUpdatedAtMs: Date.now(),
      startedAtMs: runtime.startedAtMs ?? Date.now(),
      isRunning: true,
      awaitingPhaseAdvance: false,
    };
    runtimeRef.current = nextRuntime;
    playTransitionTone(true);
    publishSnapshot(nextRuntime);
  }, [phasePlan.length, playTransitionTone, publishSnapshot]);

  const pause = useCallback(() => {
    const now = Date.now();
    synchronize(now);

    const runtime = runtimeRef.current;
    if (!runtime.isRunning) return;

    const pausedRuntime = { ...runtime, isRunning: false };
    runtimeRef.current = pausedRuntime;
    publishSnapshot(pausedRuntime);
  }, [publishSnapshot, synchronize]);

  const skip = useCallback(() => {
    const now = Date.now();
    synchronize(now);

    const runtime = runtimeRef.current;
    if (runtime.phaseIndex >= phasePlan.length) return;

    const nextPhaseIndex = runtime.phaseIndex + 1;
    const nextPhase = phasePlan[nextPhaseIndex]?.phase;
    const nextRuntime: PracticeTimerRuntime = {
      ...runtime,
      phaseIndex: nextPhaseIndex,
      phaseElapsedMs: 0,
      lastUpdatedAtMs: now,
      isRunning:
        Boolean(nextPhase) &&
        (runtime.isRunning || runtime.awaitingPhaseAdvance),
      awaitingPhaseAdvance: false,
    };

    runtimeRef.current = nextRuntime;
    if (nextPhase) {
      playTransitionTone(false);
      window.setTimeout(() => playTransitionTone(true), 220);
      onPhaseChangeRef.current?.(nextPhase);
    }
    publishSnapshot(nextRuntime);
    if (!nextPhase) completeSession(nextRuntime, true);
  }, [completeSession, phasePlan, playTransitionTone, publishSnapshot, synchronize]);

  const finish = useCallback(() => {
    const now = Date.now();
    synchronize(now);

    const runtime = runtimeRef.current;
    if (runtime.phaseIndex >= phasePlan.length) return;

    const finishedRuntime = {
      ...runtime,
      lastUpdatedAtMs: now,
      isRunning: false,
      awaitingPhaseAdvance: false,
    };
    runtimeRef.current = finishedRuntime;
    publishSnapshot(finishedRuntime);
    completeSession(finishedRuntime, false);
  }, [completeSession, phasePlan.length, publishSnapshot, synchronize]);

  const reset = useCallback(() => {
    const runtime: PracticeTimerRuntime = {
      elapsedMs: 0,
      phaseElapsedMs: 0,
      phaseElapsedTotalsMs: phasePlan.map(() => 0),
      skillElapsedMs: emptySkillElapsedMs(),
      phaseIndex: 0,
      lastUpdatedAtMs: Date.now(),
      startedAtMs: null,
      isRunning: false,
      awaitingPhaseAdvance: false,
    };

    runtimeRef.current = runtime;
    publishSnapshot(runtime);
  }, [publishSnapshot]);

  const currentPhase = phasePlan[snapshot.phaseIndex]?.phase ?? null;

  return {
    currentPhase,
    currentPhaseIndex: snapshot.phaseIndex,
    elapsedSeconds: snapshot.elapsedSeconds,
    startedAt: snapshot.startedAt,
    isRunning: snapshot.isRunning,
    awaitingPhaseAdvance: snapshot.awaitingPhaseAdvance,
    remainingSeconds: snapshot.remainingSeconds,
    pause,
    reset,
    resume,
    skip,
    finish,
    autoAdvance,
    setAutoAdvance,
    isCountUp: countUp,
  };
}

export type PracticeTimerController = ReturnType<typeof usePracticeTimer>;

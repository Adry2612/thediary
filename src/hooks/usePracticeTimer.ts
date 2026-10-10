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
  const onPhaseChangeRef = useRef(onPhaseChange);
  const onCompleteRef = useRef(onComplete);
  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;

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
      runtimeRef.current = result.runtime;
      publishSnapshot(result.runtime);
      if (result.completed) completeSession(result.runtime, true);
    },
    [completeSession, countUp, phasePlan, publishSnapshot],
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
    publishSnapshot(nextRuntime);
  }, [phasePlan.length, publishSnapshot]);

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
    if (nextPhase) onPhaseChangeRef.current?.(nextPhase);
    publishSnapshot(nextRuntime);
    if (!nextPhase) completeSession(nextRuntime, true);
  }, [completeSession, phasePlan, publishSnapshot, synchronize]);

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
    isCountUp: countUp,
  };
}

export type PracticeTimerController = ReturnType<typeof usePracticeTimer>;

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PracticePhase,
  PracticeSkill,
  PracticeTimerResult,
} from "@/types/practice";

type PhasePlanItem = {
  phase: PracticePhase;
  durationMs: number;
};

type TimerSnapshot = {
  elapsedSeconds: number;
  phaseIndex: number;
  remainingSeconds: number;
  isRunning: boolean;
};

type TimerRuntime = {
  elapsedMs: number;
  phaseElapsedMs: number;
  phaseElapsedTotalsMs: number[];
  skillElapsedMs: Record<PracticeSkill, number>;
  phaseIndex: number;
  lastUpdatedAtMs: number;
  startedAtMs: number | null;
  isRunning: boolean;
};

function emptySkillElapsedMs(): Record<PracticeSkill, number> {
  return { technique: 0, theory: 0, repertoire: 0, improvisation: 0 };
}

function createSnapshot(
  runtime: TimerRuntime,
  phasePlan: PhasePlanItem[],
): TimerSnapshot {
  const currentPhase = phasePlan[runtime.phaseIndex];
  const remainingMs = currentPhase
    ? Math.max(0, currentPhase.durationMs - runtime.phaseElapsedMs)
    : 0;

  return {
    elapsedSeconds: Math.floor(runtime.elapsedMs / 1000),
    phaseIndex: runtime.phaseIndex,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    isRunning: runtime.isRunning,
  };
}

function validatePhases(phases: PracticePhase[]): PhasePlanItem[] {
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
      },
      phasePlan,
    ),
  );
  const runtimeRef = useRef<TimerRuntime>({
    elapsedMs: 0,
    phaseElapsedMs: 0,
    phaseElapsedTotalsMs: phasePlan.map(() => 0),
    skillElapsedMs: emptySkillElapsedMs(),
    phaseIndex: 0,
    lastUpdatedAtMs: Date.now(),
    startedAtMs: null,
    isRunning: false,
  });
  const onPhaseChangeRef = useRef(onPhaseChange);
  const onCompleteRef = useRef(onComplete);
  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;

  const completeSession = useCallback(
    (runtime: TimerRuntime) => {
      if (runtime.startedAtMs === null) return;

      const skillSeconds = Object.fromEntries(
        Object.entries(runtime.skillElapsedMs).map(([skill, milliseconds]) => [
          skill,
          Math.floor(milliseconds / 1000),
        ]),
      ) as Record<PracticeSkill, number>;

      onCompleteRef.current?.({
        elapsedSeconds: Math.floor(runtime.elapsedMs / 1000),
        startedAt: new Date(runtime.startedAtMs).toISOString(),
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
    (runtime: TimerRuntime) => {
      const nextSnapshot = createSnapshot(runtime, phasePlan);
      setSnapshot((current) => {
        if (
          current.elapsedSeconds === nextSnapshot.elapsedSeconds &&
          current.phaseIndex === nextSnapshot.phaseIndex &&
          current.remainingSeconds === nextSnapshot.remainingSeconds &&
          current.isRunning === nextSnapshot.isRunning
        ) {
          return current;
        }

        return nextSnapshot;
      });
    },
    [phasePlan],
  );

  const synchronize = useCallback(
    (now: number) => {
      const runtime = runtimeRef.current;
      if (!runtime.isRunning) return;

      const deltaMs = Math.max(0, now - runtime.lastUpdatedAtMs);
      let phaseIndex = runtime.phaseIndex;
      let phaseElapsedMs = runtime.phaseElapsedMs;
      let elapsedMs = runtime.elapsedMs;
      let remainingMs = deltaMs;
      const skillElapsedMs = { ...runtime.skillElapsedMs };
      const phaseElapsedTotalsMs = [...runtime.phaseElapsedTotalsMs];

      while (remainingMs > 0 && phaseIndex < phasePlan.length) {
        const activePhase = phasePlan[phaseIndex];
        const phaseRemainingMs = activePhase.durationMs - phaseElapsedMs;
        const consumedMs = Math.min(remainingMs, phaseRemainingMs);

        phaseElapsedMs += consumedMs;
        elapsedMs += consumedMs;
        remainingMs -= consumedMs;
        phaseElapsedTotalsMs[phaseIndex] += consumedMs;
        skillElapsedMs[activePhase.phase.skill] += consumedMs;

        if (phaseElapsedMs < activePhase.durationMs) break;

        phaseElapsedMs = 0;
        phaseIndex += 1;

        const nextPhase = phasePlan[phaseIndex]?.phase;
        if (nextPhase) onPhaseChangeRef.current?.(nextPhase);
      }

      const nextRuntime: TimerRuntime = {
        elapsedMs,
        phaseElapsedMs,
        phaseElapsedTotalsMs,
        skillElapsedMs,
        phaseIndex,
        lastUpdatedAtMs: now,
        startedAtMs: runtime.startedAtMs,
        isRunning: phaseIndex < phasePlan.length,
      };

      runtimeRef.current = nextRuntime;
      publishSnapshot(nextRuntime);
      if (!nextRuntime.isRunning) completeSession(nextRuntime);
    },
    [completeSession, phasePlan, publishSnapshot],
  );

  useEffect(() => {
    if (!snapshot.isRunning) return;

    const intervalId = window.setInterval(() => synchronize(Date.now()), 250);
    return () => window.clearInterval(intervalId);
  }, [snapshot.isRunning, synchronize]);

  useEffect(() => {
    const runtime: TimerRuntime = {
      elapsedMs: 0,
      phaseElapsedMs: 0,
      phaseElapsedTotalsMs: phasePlan.map(() => 0),
      skillElapsedMs: emptySkillElapsedMs(),
      phaseIndex: 0,
      lastUpdatedAtMs: Date.now(),
      startedAtMs: null,
      isRunning: false,
    };

    runtimeRef.current = runtime;
    publishSnapshot(runtime);
  }, [phasePlan, publishSnapshot]);

  const resume = useCallback(() => {
    const runtime = runtimeRef.current;
    if (runtime.isRunning || runtime.phaseIndex >= phasePlan.length) return;

    const nextRuntime = {
      ...runtime,
      lastUpdatedAtMs: Date.now(),
      startedAtMs: runtime.startedAtMs ?? Date.now(),
      isRunning: true,
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
    const nextRuntime: TimerRuntime = {
      ...runtime,
      phaseIndex: nextPhaseIndex,
      phaseElapsedMs: 0,
      lastUpdatedAtMs: now,
      isRunning: Boolean(nextPhase) && runtime.isRunning,
    };

    runtimeRef.current = nextRuntime;
    if (nextPhase) onPhaseChangeRef.current?.(nextPhase);
    publishSnapshot(nextRuntime);
    if (!nextRuntime.isRunning) completeSession(nextRuntime);
  }, [completeSession, phasePlan, publishSnapshot, synchronize]);

  const reset = useCallback(() => {
    const runtime: TimerRuntime = {
      elapsedMs: 0,
      phaseElapsedMs: 0,
      phaseElapsedTotalsMs: phasePlan.map(() => 0),
      skillElapsedMs: emptySkillElapsedMs(),
      phaseIndex: 0,
      lastUpdatedAtMs: Date.now(),
      startedAtMs: null,
      isRunning: false,
    };

    runtimeRef.current = runtime;
    publishSnapshot(runtime);
  }, [publishSnapshot]);

  const currentPhase = phasePlan[snapshot.phaseIndex]?.phase ?? null;

  return {
    currentPhase,
    currentPhaseIndex: snapshot.phaseIndex,
    elapsedSeconds: snapshot.elapsedSeconds,
    isRunning: snapshot.isRunning,
    remainingSeconds: snapshot.remainingSeconds,
    pause,
    reset,
    resume,
    skip,
  };
}

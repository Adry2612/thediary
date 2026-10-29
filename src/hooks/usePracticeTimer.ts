"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  shouldSignalBlockEnd,
  synchronizePracticeTimer,
  type PracticeTimerPlanItem,
  type PracticeTimerRuntime,
} from "@/utils/practice-timer";
import { getPracticePlanKey } from "@/utils/practice-plan";
import type {
  PracticePhase,
  PracticeSkill,
  PracticeTimerResult,
} from "@/types/practice";
import {
  DEFAULT_PRACTICE_END_SOUND,
  DEFAULT_PRACTICE_START_SOUND,
  type PracticeSound,
} from "@/utils/practice-sounds";
import {
  playPracticeSound,
  stopPracticeSounds,
} from "@/services/practice-sound";

type TimerSnapshot = {
  elapsedSeconds: number;
  startedAt: string | null;
  phaseIndex: number;
  remainingSeconds: number;
  phaseElapsedSeconds: number;
  phasePlannedSeconds: number;
  isRunning: boolean;
  awaitingPhaseAdvance: boolean;
};

function emptySkillElapsedMs(): Record<PracticeSkill, number> {
  return { technique: 0, theory: 0, repertoire: 0, lick: 0, improvisation: 0 };
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
    phaseElapsedSeconds: Math.floor(runtime.phaseElapsedMs / 1000),
    phasePlannedSeconds: currentPhase
      ? Math.ceil(currentPhase.durationMs / 1000)
      : 0,
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
  startSound: PracticeSound = DEFAULT_PRACTICE_START_SOUND,
  endSound: PracticeSound = DEFAULT_PRACTICE_END_SOUND,
  targetSeconds: number | null = null,
) {
  const targetMs =
    targetSeconds !== null && targetSeconds > 0 ? targetSeconds * 1000 : null;
  const phasePlan = useMemo(() => validatePhases(phases), [phases]);
  const phasePlanKey = getPracticePlanKey(phases);
  const phasePlanRef = useRef(phasePlan);
  phasePlanRef.current = phasePlan;
  const [isTargetReached, setIsTargetReached] = useState(false);
  const alertedTargetRef = useRef<number | null>(null);
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
  const [continueAfterBlockTime, setContinueAfterBlockTime] = useState(false);
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

  const playTransitionTone = useCallback(
    (isStartingBlock: boolean) => {
      playPracticeSound(
        isStartingBlock ? startSound : endSound,
        isStartingBlock ? "start" : "end",
      );
    },
    [endSound, startSound],
  );

  const completeSession = useCallback(
    (runtime: PracticeTimerRuntime, completed: boolean) => {
      const skillSeconds = Object.fromEntries(
        Object.entries(runtime.skillElapsedMs).map(([skill, milliseconds]) => [
          skill,
          Math.floor(milliseconds / 1000),
        ]),
      ) as Record<PracticeSkill, number>;

      setIsTargetReached(false);
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
          lickId: phase.lickId,
        })),
      });
    },
    [phasePlan],
  );

  const publishSnapshot = useCallback(
    (runtime: PracticeTimerRuntime) => {
      const nextSnapshot = createSnapshot(
        runtime,
        phasePlanRef.current,
        countUp,
      );
      setSnapshot((current) => {
        if (
          current.elapsedSeconds === nextSnapshot.elapsedSeconds &&
          current.startedAt === nextSnapshot.startedAt &&
          current.phaseIndex === nextSnapshot.phaseIndex &&
          current.remainingSeconds === nextSnapshot.remainingSeconds &&
          current.phaseElapsedSeconds === nextSnapshot.phaseElapsedSeconds &&
          current.phasePlannedSeconds === nextSnapshot.phasePlannedSeconds &&
          current.isRunning === nextSnapshot.isRunning &&
          current.awaitingPhaseAdvance === nextSnapshot.awaitingPhaseAdvance
        ) {
          return current;
        }

        return nextSnapshot;
      });
    },
    [countUp, phasePlanKey],
  );

  const synchronize = useCallback(
    (now: number) => {
      const runtime = runtimeRef.current;
      if (!runtime.isRunning) return;

      const activeTargetMs =
        targetMs !== null && alertedTargetRef.current !== targetMs
          ? targetMs
          : null;
      const result = synchronizePracticeTimer(
        runtime,
        phasePlan,
        now,
        countUp,
        continueAfterBlockTime,
        activeTargetMs,
      );
      if (result.completed) {
        runtimeRef.current = result.runtime;
        publishSnapshot(result.runtime);
        playTransitionTone(false);
        completeSession(result.runtime, true);
        return;
      }

      if (result.targetReached) {
        runtimeRef.current = result.runtime;
        publishSnapshot(result.runtime);
        alertedTargetRef.current = targetMs;
        playTransitionTone(false);
        setIsTargetReached(true);
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
      if (shouldSignalBlockEnd(runtime, result.runtime)) {
        playTransitionTone(false);
      }
      publishSnapshot(result.runtime);
    },
    [
      autoAdvance,
      completeSession,
      continueAfterBlockTime,
      countUp,
      phasePlan,
      playTransitionTone,
      publishSnapshot,
      targetMs,
    ],
  );

  useEffect(() => stopPracticeSounds, []);

  useEffect(() => {
    if (!snapshot.isRunning) return;

    const intervalId = window.setInterval(() => synchronize(Date.now()), 250);
    return () => window.clearInterval(intervalId);
  }, [snapshot.isRunning, synchronize]);

  useEffect(() => {
    alertedTargetRef.current = null;
    setIsTargetReached(false);
  }, [targetMs]);

  useEffect(() => {
    if (targetMs === null) return;
    if (runtimeRef.current.elapsedMs < targetMs) return;
    if (alertedTargetRef.current === targetMs) return;

    const pausedRuntime: PracticeTimerRuntime = {
      ...runtimeRef.current,
      isRunning: false,
      awaitingPhaseAdvance: false,
    };
    runtimeRef.current = pausedRuntime;
    alertedTargetRef.current = targetMs;
    publishSnapshot(pausedRuntime);
    playTransitionTone(false);
    setIsTargetReached(true);
  }, [targetMs, playTransitionTone, publishSnapshot]);

  useEffect(() => {
    const runtime: PracticeTimerRuntime = {
      elapsedMs: 0,
      phaseElapsedMs: 0,
      phaseElapsedTotalsMs: phasePlanRef.current.map(() => 0),
      skillElapsedMs: emptySkillElapsedMs(),
      phaseIndex: 0,
      lastUpdatedAtMs: Date.now(),
      startedAtMs: null,
      isRunning: false,
      awaitingPhaseAdvance: false,
    };

    alertedTargetRef.current = null;
    setIsTargetReached(false);
    runtimeRef.current = runtime;
    publishSnapshot(runtime);
  }, [countUp, phasePlanKey, publishSnapshot]);

  const resume = useCallback(() => {
    setIsTargetReached(false);
    const runtime = runtimeRef.current;
    if (runtime.isRunning || runtime.phaseIndex >= phasePlan.length) {
      return;
    }
    if (runtime.awaitingPhaseAdvance && !continueAfterBlockTime) return;

    const activePhase = phasePlan[runtime.phaseIndex];
    const blockAlreadyEnded =
      activePhase !== undefined &&
      runtime.phaseElapsedMs >= activePhase.durationMs;
    const nextRuntime = {
      ...runtime,
      lastUpdatedAtMs: Date.now(),
      startedAtMs: runtime.startedAtMs ?? Date.now(),
      isRunning: true,
      awaitingPhaseAdvance:
        blockAlreadyEnded &&
        continueAfterBlockTime &&
        runtime.phaseIndex < phasePlan.length - 1,
    };
    runtimeRef.current = nextRuntime;
    playTransitionTone(true);
    publishSnapshot(nextRuntime);
  }, [
    continueAfterBlockTime,
    phasePlan,
    playTransitionTone,
    publishSnapshot,
  ]);

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
    setIsTargetReached(false);
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
      if (!runtime.awaitingPhaseAdvance) playTransitionTone(false);
      window.setTimeout(() => playTransitionTone(true), 220);
      onPhaseChangeRef.current?.(nextPhase);
    }
    publishSnapshot(nextRuntime);
    if (!nextPhase) completeSession(nextRuntime, true);
  }, [completeSession, phasePlan, playTransitionTone, publishSnapshot, synchronize]);

  const finish = useCallback(() => {
    setIsTargetReached(false);
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
      phaseElapsedTotalsMs: phasePlanRef.current.map(() => 0),
      skillElapsedMs: emptySkillElapsedMs(),
      phaseIndex: 0,
      lastUpdatedAtMs: Date.now(),
      startedAtMs: null,
      isRunning: false,
      awaitingPhaseAdvance: false,
    };

    alertedTargetRef.current = null;
    setIsTargetReached(false);
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
    isTargetReached,
    awaitingPhaseAdvance: snapshot.awaitingPhaseAdvance,
    remainingSeconds: snapshot.remainingSeconds,
    phaseElapsedSeconds: snapshot.phaseElapsedSeconds,
    phasePlannedSeconds: snapshot.phasePlannedSeconds,
    pause,
    reset,
    resume,
    skip,
    finish,
    autoAdvance,
    setAutoAdvance,
    continueAfterBlockTime,
    setContinueAfterBlockTime,
    isCountUp: countUp,
  };
}

export type PracticeTimerController = ReturnType<typeof usePracticeTimer>;

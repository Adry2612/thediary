import type { PracticePhase, PracticeSkill } from "../types/practice.ts";

export type PracticeTimerPlanItem = {
  phase: PracticePhase;
  durationMs: number;
};

export type PracticeTimerRuntime = {
  elapsedMs: number;
  phaseElapsedMs: number;
  phaseElapsedTotalsMs: number[];
  skillElapsedMs: Record<PracticeSkill, number>;
  phaseIndex: number;
  lastUpdatedAtMs: number;
  startedAtMs: number | null;
  isRunning: boolean;
  awaitingPhaseAdvance: boolean;
};

export function synchronizePracticeTimer(
  runtime: PracticeTimerRuntime,
  phasePlan: PracticeTimerPlanItem[],
  now: number,
  countUp = false,
  continueAfterBlockTime = false,
): { runtime: PracticeTimerRuntime; completed: boolean } {
  const deltaMs = Math.max(0, now - runtime.lastUpdatedAtMs);
  const activePhase = phasePlan[runtime.phaseIndex];
  if (!activePhase) {
    throw new RangeError("No hay un bloque activo para sincronizar.");
  }

  const isLastPhase = runtime.phaseIndex === phasePlan.length - 1;
  const runsOvertime = continueAfterBlockTime && !isLastPhase && !countUp;
  const remainingMs = Math.max(
    0,
    activePhase.durationMs - runtime.phaseElapsedMs,
  );
  const consumedMs =
    countUp || runsOvertime ? deltaMs : Math.min(deltaMs, remainingMs);
  const phaseElapsedMs = runtime.phaseElapsedMs + consumedMs;
  const phaseElapsedTotalsMs = [...runtime.phaseElapsedTotalsMs];
  const skillElapsedMs = { ...runtime.skillElapsedMs };

  phaseElapsedTotalsMs[runtime.phaseIndex] += consumedMs;
  skillElapsedMs[activePhase.phase.skill] += consumedMs;

  const phaseEnded = !countUp && phaseElapsedMs >= activePhase.durationMs;
  const completed = phaseEnded && isLastPhase;
  const keepsRunning = !phaseEnded || (runsOvertime && !completed);

  return {
    runtime: {
      ...runtime,
      elapsedMs: runtime.elapsedMs + consumedMs,
      phaseElapsedMs,
      phaseElapsedTotalsMs,
      skillElapsedMs,
      phaseIndex: completed ? runtime.phaseIndex + 1 : runtime.phaseIndex,
      lastUpdatedAtMs: now,
      isRunning: keepsRunning,
      awaitingPhaseAdvance: phaseEnded && !completed,
    },
    completed,
  };
}

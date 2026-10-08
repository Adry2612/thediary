import type { PracticePhase, PracticeSkill } from "@/types/practice";

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
): { runtime: PracticeTimerRuntime; completed: boolean } {
  const deltaMs = Math.max(0, now - runtime.lastUpdatedAtMs);
  const activePhase = phasePlan[runtime.phaseIndex];
  if (!activePhase) {
    throw new RangeError("No hay un bloque activo para sincronizar.");
  }

  const remainingMs = Math.max(
    0,
    activePhase.durationMs - runtime.phaseElapsedMs,
  );
  const consumedMs = Math.min(deltaMs, remainingMs);
  const phaseElapsedMs = runtime.phaseElapsedMs + consumedMs;
  const phaseElapsedTotalsMs = [...runtime.phaseElapsedTotalsMs];
  const skillElapsedMs = { ...runtime.skillElapsedMs };

  phaseElapsedTotalsMs[runtime.phaseIndex] += consumedMs;
  skillElapsedMs[activePhase.phase.skill] += consumedMs;

  const phaseEnded = phaseElapsedMs >= activePhase.durationMs;
  const completed =
    phaseEnded && runtime.phaseIndex === phasePlan.length - 1;

  return {
    runtime: {
      ...runtime,
      elapsedMs: runtime.elapsedMs + consumedMs,
      phaseElapsedMs,
      phaseElapsedTotalsMs,
      skillElapsedMs,
      phaseIndex: completed ? runtime.phaseIndex + 1 : runtime.phaseIndex,
      lastUpdatedAtMs: now,
      isRunning: !phaseEnded,
      awaitingPhaseAdvance: phaseEnded && !completed,
    },
    completed,
  };
}

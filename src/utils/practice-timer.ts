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

/**
 * Indica si el aviso de fin de bloque debe sonar ahora. Solo avisa en el
 * flanco de subida: mientras el bloque siga en overtime, `awaitingPhaseAdvance`
 * permanece activo y no debe repetirse el sonido en cada sincronización.
 */
export function shouldSignalBlockEnd(
  previous: Pick<PracticeTimerRuntime, "awaitingPhaseAdvance">,
  next: Pick<PracticeTimerRuntime, "awaitingPhaseAdvance">,
): boolean {
  return next.awaitingPhaseAdvance && !previous.awaitingPhaseAdvance;
}

export function synchronizePracticeTimer(
  runtime: PracticeTimerRuntime,
  phasePlan: PracticeTimerPlanItem[],
  now: number,
  countUp = false,
  continueAfterBlockTime = false,
  limitMs: number | null = null,
): { runtime: PracticeTimerRuntime; completed: boolean; targetReached: boolean } {
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
  const remainingToLimit =
    limitMs === null ? Number.POSITIVE_INFINITY : Math.max(0, limitMs - runtime.elapsedMs);
  const requestedConsumedMs =
    countUp || runsOvertime ? deltaMs : Math.min(deltaMs, remainingMs);
  const consumedMs = Math.min(requestedConsumedMs, remainingToLimit);
  const reachedLimit =
    limitMs !== null && runtime.elapsedMs + consumedMs >= limitMs;
  const phaseElapsedMs = runtime.phaseElapsedMs + consumedMs;
  const phaseElapsedTotalsMs = [...runtime.phaseElapsedTotalsMs];
  const skillElapsedMs = { ...runtime.skillElapsedMs };

  phaseElapsedTotalsMs[runtime.phaseIndex] += consumedMs;
  skillElapsedMs[activePhase.phase.skill] += consumedMs;

  const phaseEnded = !countUp && phaseElapsedMs >= activePhase.durationMs;
  const completed = phaseEnded && isLastPhase;
  const targetReached = reachedLimit && !completed;
  const keepsRunning =
    (!phaseEnded || (runsOvertime && !completed)) && !targetReached;

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
      awaitingPhaseAdvance: phaseEnded && !completed && !targetReached,
    },
    completed,
    targetReached,
  };
}

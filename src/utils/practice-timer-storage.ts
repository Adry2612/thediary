import { PRACTICE_SKILLS, type PracticeSkill } from "../types/practice.ts";
import type { PracticeTimerRuntime } from "./practice-timer.ts";

export const PRACTICE_TIMER_STORAGE_KEY = "thediary.active-practice-timer";
const STORAGE_VERSION = 1;
const TOTALS_TOLERANCE_MS = 1;

export type StoredPracticeTimer = {
  version: 1;
  sessionId: string;
  planKey: string;
  countUp: boolean;
  runtime: PracticeTimerRuntime;
};

export type TimerRestoreContext = {
  sessionId: string;
  planKey: string;
  countUp: boolean;
  phaseCount: number;
};

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function parseSkillElapsed(value: unknown): Record<PracticeSkill, number> | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const skillElapsed = {} as Record<PracticeSkill, number>;

  for (const skill of PRACTICE_SKILLS) {
    const seconds = record[skill];
    if (!isFiniteNonNegative(seconds)) return null;
    skillElapsed[skill] = seconds;
  }

  return skillElapsed;
}

function parseRuntime(
  value: unknown,
  phaseCount?: number,
): PracticeTimerRuntime | null {
  if (typeof value !== "object" || value === null) return null;
  const runtime = value as Record<string, unknown>;

  if (
    !isFiniteNonNegative(runtime.elapsedMs) ||
    !isFiniteNonNegative(runtime.phaseElapsedMs) ||
    !isFiniteNonNegative(runtime.lastUpdatedAtMs)
  ) {
    return null;
  }

  if (
    runtime.startedAtMs !== null &&
    !isFiniteNonNegative(runtime.startedAtMs)
  ) {
    return null;
  }

  if (
    typeof runtime.isRunning !== "boolean" ||
    typeof runtime.awaitingPhaseAdvance !== "boolean"
  ) {
    return null;
  }

  if (
    !Number.isInteger(runtime.phaseIndex) ||
    (runtime.phaseIndex as number) < 0 ||
    (phaseCount !== undefined && (runtime.phaseIndex as number) >= phaseCount)
  ) {
    return null;
  }

  if (!Array.isArray(runtime.phaseElapsedTotalsMs)) return null;
  if (
    phaseCount !== undefined &&
    runtime.phaseElapsedTotalsMs.length !== phaseCount
  ) {
    return null;
  }
  if (!runtime.phaseElapsedTotalsMs.every(isFiniteNonNegative)) return null;

  const skillElapsedMs = parseSkillElapsed(runtime.skillElapsedMs);
  if (!skillElapsedMs) return null;

  const totals = runtime.phaseElapsedTotalsMs as number[];
  if (
    Math.abs(sumValues(totals) - runtime.elapsedMs) > TOTALS_TOLERANCE_MS ||
    Math.abs(
      sumValues(PRACTICE_SKILLS.map((skill) => skillElapsedMs[skill])) -
        runtime.elapsedMs,
    ) > TOTALS_TOLERANCE_MS
  ) {
    return null;
  }

  return {
    elapsedMs: runtime.elapsedMs,
    phaseElapsedMs: runtime.phaseElapsedMs,
    phaseElapsedTotalsMs: totals,
    skillElapsedMs,
    phaseIndex: runtime.phaseIndex as number,
    lastUpdatedAtMs: runtime.lastUpdatedAtMs,
    startedAtMs: runtime.startedAtMs as number | null,
    isRunning: runtime.isRunning,
    awaitingPhaseAdvance: runtime.awaitingPhaseAdvance,
  };
}

/** Valida y normaliza una instantánea guardada. Devuelve `null` si no sirve. */
export function parseStoredTimer(
  raw: string | null,
  phaseCount?: number,
): StoredPracticeTimer | null {
  if (!raw) return null;

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof value !== "object" || value === null) return null;
  const stored = value as Record<string, unknown>;

  if (
    stored.version !== STORAGE_VERSION ||
    typeof stored.sessionId !== "string" ||
    stored.sessionId.trim() === "" ||
    typeof stored.planKey !== "string" ||
    typeof stored.countUp !== "boolean"
  ) {
    return null;
  }

  const runtime = parseRuntime(stored.runtime, phaseCount);
  if (!runtime) return null;

  return {
    version: STORAGE_VERSION,
    sessionId: stored.sessionId,
    planKey: stored.planKey,
    countUp: stored.countUp,
    runtime,
  };
}

/** Indica si la instantánea pertenece a la práctica y al plan actuales. */
export function shouldRestoreTimer(
  stored: StoredPracticeTimer | null,
  context: TimerRestoreContext,
): boolean {
  if (!stored || context.phaseCount <= 0) return false;
  if (stored.sessionId !== context.sessionId) return false;
  if (stored.planKey !== context.planKey) return false;
  if (stored.countUp !== context.countUp) return false;
  if (stored.runtime.phaseIndex >= context.phaseCount) return false;
  if (stored.runtime.phaseElapsedTotalsMs.length !== context.phaseCount) {
    return false;
  }

  return true;
}

/** Ajusta el runtime restaurado si el objetivo ya se alcanzó mientras estaba fuera. */
export function resolveRestoredRuntime(
  runtime: PracticeTimerRuntime,
  targetMs: number | null,
): { runtime: PracticeTimerRuntime; targetReached: boolean } {
  const targetReached = targetMs !== null && runtime.elapsedMs >= targetMs;
  return {
    runtime: targetReached
      ? { ...runtime, isRunning: false, awaitingPhaseAdvance: false }
      : runtime,
    targetReached,
  };
}

export function serializeTimer(
  sessionId: string,
  planKey: string,
  countUp: boolean,
  runtime: PracticeTimerRuntime,
): string {
  const stored: StoredPracticeTimer = {
    version: STORAGE_VERSION,
    sessionId,
    planKey,
    countUp,
    runtime,
  };
  return JSON.stringify(stored);
}

export function readStoredTimer(
  phaseCount?: number,
): StoredPracticeTimer | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredTimer(
      window.localStorage.getItem(PRACTICE_TIMER_STORAGE_KEY),
      phaseCount,
    );
  } catch {
    return null;
  }
}

export function writeStoredTimer(stored: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRACTICE_TIMER_STORAGE_KEY, stored);
  } catch {
    // Un almacenamiento lleno o privado no debe detener la práctica.
  }
}

export function clearStoredTimer(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PRACTICE_TIMER_STORAGE_KEY);
  } catch {
    // Igual que al escribir: el fallo no interrumpe la práctica.
  }
}

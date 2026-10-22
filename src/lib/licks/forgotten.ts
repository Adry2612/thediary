import type { GuitarLick } from "../../types/lick.ts";
import { getDaysSince } from "./dates.ts";

export type ForgottenReason = "overdue" | "low-frequency";

export interface ForgottenLick {
  lick: GuitarLick;
  reason: ForgottenReason;
  daysSinceLastPractice?: number;
  daysSinceCreation: number;
}

interface Candidate {
  lick: GuitarLick;
  daysSinceLastPractice?: number;
  daysSinceCreation: number;
  frequency: number;
}

function getCandidate(lick: GuitarLick, today: Date): Candidate | null {
  const daysSinceCreation = getDaysSince(lick.createdAt, today);
  if (daysSinceCreation === undefined) return null;

  const neverPractised = !lick.lastPracticedAt;
  if (neverPractised && daysSinceCreation <= 0) return null;

  const daysSinceLastPractice = lick.lastPracticedAt
    ? getDaysSince(lick.lastPracticedAt, today)
    : undefined;
  const denominator = Math.max(daysSinceCreation, 1);
  const practiceCount =
    Number.isFinite(lick.practiceCount) && lick.practiceCount >= 0
      ? lick.practiceCount
      : 0;

  return {
    lick,
    ...(daysSinceLastPractice !== undefined ? { daysSinceLastPractice } : {}),
    daysSinceCreation,
    frequency: practiceCount / denominator,
  };
}

function compareOldestFirst(
  first: Candidate,
  second: Candidate,
  pick: (candidate: Candidate) => number | undefined,
): number {
  const firstValue = pick(first) ?? Number.NEGATIVE_INFINITY;
  const secondValue = pick(second) ?? Number.NEGATIVE_INFINITY;
  if (firstValue !== secondValue) return firstValue - secondValue;
  const firstCreated = Date.parse(first.lick.createdAt);
  const secondCreated = Date.parse(second.lick.createdAt);
  if (firstCreated !== secondCreated) return firstCreated - secondCreated;
  return first.lick.id.localeCompare(second.lick.id);
}

/**
 * Propone un lick para rescatar: primero el que lleva más de 30 días sin
 * practicarse, y si no hay ninguno, el de menor frecuencia de práctica para su
 * antigüedad. Nunca propone una idea creada hoy y sin practicar.
 */
export function getForgottenLick(
  licks: GuitarLick[],
  today: Date = new Date(),
): ForgottenLick | null {
  const candidates = licks
    .map((lick) => getCandidate(lick, today))
    .filter((candidate): candidate is Candidate => candidate !== null);
  if (candidates.length === 0) return null;

  const overdue = candidates.filter(
    (candidate) =>
      candidate.daysSinceLastPractice !== undefined &&
      candidate.daysSinceLastPractice > 30,
  );

  if (overdue.length > 0) {
    const chosen = [...overdue].sort((first, second) =>
      compareOldestFirst(first, second, (candidate) =>
        candidate.daysSinceLastPractice === undefined
          ? undefined
          : -candidate.daysSinceLastPractice,
      ),
    )[0];
    return {
      lick: chosen.lick,
      reason: "overdue",
      ...(chosen.daysSinceLastPractice !== undefined
        ? { daysSinceLastPractice: chosen.daysSinceLastPractice }
        : {}),
      daysSinceCreation: chosen.daysSinceCreation,
    };
  }

  const notPractisedToday = candidates.filter(
    (candidate) => candidate.daysSinceLastPractice !== 0,
  );
  if (notPractisedToday.length === 0) return null;

  const chosen = [...notPractisedToday].sort((first, second) => {
    if (first.frequency !== second.frequency) {
      return first.frequency - second.frequency;
    }
    return compareOldestFirst(first, second, (candidate) =>
      candidate.daysSinceLastPractice === undefined
        ? undefined
        : -candidate.daysSinceLastPractice,
    );
  })[0];

  return {
    lick: chosen.lick,
    reason: "low-frequency",
    ...(chosen.daysSinceLastPractice !== undefined
      ? { daysSinceLastPractice: chosen.daysSinceLastPractice }
      : {}),
    daysSinceCreation: chosen.daysSinceCreation,
  };
}

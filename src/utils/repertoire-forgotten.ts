import type { RepertoireItem } from "../types/practice.ts";
import type { RepertoireItemPracticeStats } from "./repertoire-analytics.ts";
import { getDaysSince } from "./licks/dates.ts";

export type ForgottenRepertoireReason = "overdue" | "low-frequency";

export interface ForgottenRepertoireItem {
  item: RepertoireItem;
  reason: ForgottenRepertoireReason;
  daysSinceLastPractice?: number;
  /** Días desde la última actualización; el modelo no guarda `createdAt`. */
  daysSinceUpdate: number;
}

interface Candidate {
  item: RepertoireItem;
  daysSinceLastPractice?: number;
  daysSinceUpdate: number;
  frequency: number;
}

function getCandidate(
  item: RepertoireItem,
  stats: RepertoireItemPracticeStats | undefined,
  today: Date,
): Candidate | null {
  // Las canciones marcadas para más adelante están aparcadas a propósito, y
  // los licks antiguos ya no forman parte de esta biblioteca.
  if (item.kind !== "song" || item.isFutureLearn) return null;

  const daysSinceUpdate = getDaysSince(item.updatedAt, today);
  if (daysSinceUpdate === undefined) return null;

  const lastPracticedAt = stats?.lastPracticedAt;
  const daysSinceLastPractice = lastPracticedAt
    ? getDaysSince(lastPracticedAt, today)
    : undefined;

  // No hay fecha de creación: la última actualización hace de proxy. Una
  // canción recién añadida o editada hoy no se propone si nunca se practicó.
  if (daysSinceLastPractice === undefined && daysSinceUpdate <= 0) return null;

  const rawSessionCount = stats?.sessionCount ?? 0;
  const sessionCount =
    Number.isFinite(rawSessionCount) && rawSessionCount >= 0
      ? rawSessionCount
      : 0;

  return {
    item,
    ...(daysSinceLastPractice !== undefined ? { daysSinceLastPractice } : {}),
    daysSinceUpdate,
    frequency: sessionCount / Math.max(daysSinceUpdate, 1),
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

  const firstUpdated = Date.parse(first.item.updatedAt);
  const secondUpdated = Date.parse(second.item.updatedAt);
  if (firstUpdated !== secondUpdated) return firstUpdated - secondUpdated;
  return first.item.id.localeCompare(second.item.id);
}

/**
 * Propone una canción para rescatar: primero la que lleva más de 30 días sin
 * practicarse y, si no hay ninguna, la de menor frecuencia de práctica para el
 * tiempo que lleva en la biblioteca. Nunca propone una canción recién puesta
 * al día que no se haya practicado.
 */
export function getForgottenRepertoireItem(
  items: RepertoireItem[],
  practiceStats: Map<string, RepertoireItemPracticeStats>,
  today: Date = new Date(),
): ForgottenRepertoireItem | null {
  const candidates = items
    .map((item) => getCandidate(item, practiceStats.get(item.id), today))
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
      item: chosen.item,
      reason: "overdue",
      ...(chosen.daysSinceLastPractice !== undefined
        ? { daysSinceLastPractice: chosen.daysSinceLastPractice }
        : {}),
      daysSinceUpdate: chosen.daysSinceUpdate,
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
    item: chosen.item,
    reason: "low-frequency",
    ...(chosen.daysSinceLastPractice !== undefined
      ? { daysSinceLastPractice: chosen.daysSinceLastPractice }
      : {}),
    daysSinceUpdate: chosen.daysSinceUpdate,
  };
}

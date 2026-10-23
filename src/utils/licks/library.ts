import type { GuitarLick } from "../../types/lick.ts";
import { getTechniqueDistribution } from "./distribution.ts";
import { normalizeMusicalKey } from "./keys.ts";

/**
 * Orden de la biblioteca: primero lo practicado más recientemente; después las
 * ideas sin practicar, y a igualdad por título.
 */
export function compareLicksForLibrary(
  first: GuitarLick,
  second: GuitarLick,
): number {
  const firstTime = first.lastPracticedAt
    ? Date.parse(first.lastPracticedAt)
    : Number.NEGATIVE_INFINITY;
  const secondTime = second.lastPracticedAt
    ? Date.parse(second.lastPracticedAt)
    : Number.NEGATIVE_INFINITY;

  if (firstTime !== secondTime) return secondTime - firstTime;
  return (
    first.title.localeCompare(second.title, undefined, {
      sensitivity: "base",
    }) || first.id.localeCompare(second.id)
  );
}

export function getSortedLicks(licks: GuitarLick[]): GuitarLick[] {
  return [...licks].sort(compareLicksForLibrary);
}

export function getVisibleLicks(
  licks: GuitarLick[],
  query: string,
): GuitarLick[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const sorted = getSortedLicks(licks);
  if (!normalizedQuery) return sorted;
  return sorted.filter((lick) =>
    lick.title.toLocaleLowerCase().includes(normalizedQuery),
  );
}

export function getDefaultLickId(licks: GuitarLick[]): string | undefined {
  return getSortedLicks(licks)[0]?.id;
}

export interface LicksSummary {
  total: number;
  withBpm: number;
  techniques: number;
  keys: number;
}

export function getLicksSummary(licks: GuitarLick[]): LicksSummary {
  const techniques = getTechniqueDistribution(licks).groups.filter(
    (group) => !group.unclassified,
  ).length;
  const keys = new Set(
    licks
      .map((lick) => normalizeMusicalKey(lick.key))
      .filter((key) => key !== undefined),
  ).size;

  return {
    total: licks.length,
    withBpm: licks.filter(
      (lick) => lick.currentBpm !== undefined || lick.bpmHistory.length > 0,
    ).length,
    techniques,
    keys,
  };
}

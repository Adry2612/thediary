import type { GuitarLick } from "../../types/lick.ts";
import { MUSICAL_KEYS, normalizeMusicalKey } from "./keys.ts";
import { LICK_TECHNIQUES, normalizeTechniques } from "./techniques.ts";

export interface DistributionGroup {
  id: string;
  /** Clave de traducción para las técnicas; las tonalidades usan `name`. */
  labelKey?: string;
  name?: string;
  count: number;
  percentage: number;
  unclassified?: boolean;
}

export interface LickDistribution {
  total: number;
  groups: DistributionGroup[];
}

function toPercentage(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

export function getTechniqueDistribution(licks: GuitarLick[]): LickDistribution {
  const counts = new Map<string, number>();
  let unclassified = 0;

  for (const lick of licks) {
    const techniques = normalizeTechniques(lick.techniques);
    if (techniques.length === 0) {
      unclassified += 1;
      continue;
    }
    for (const technique of techniques) {
      counts.set(technique, (counts.get(technique) ?? 0) + 1);
    }
  }

  const groups: DistributionGroup[] = LICK_TECHNIQUES.flatMap((technique) => {
    const count = counts.get(technique.id) ?? 0;
    return count > 0
      ? [
          {
            id: technique.id,
            labelKey: technique.labelKey,
            count,
            percentage: toPercentage(count, licks.length),
          },
        ]
      : [];
  });

  if (unclassified > 0) {
    groups.push({
      id: "UNCLASSIFIED",
      count: unclassified,
      percentage: toPercentage(unclassified, licks.length),
      unclassified: true,
    });
  }

  return { total: licks.length, groups };
}

export function getKeyDistribution(licks: GuitarLick[]): LickDistribution {
  const counts = new Map<string, number>();
  let unclassified = 0;

  for (const lick of licks) {
    const key = normalizeMusicalKey(lick.key);
    if (!key) {
      unclassified += 1;
      continue;
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const groups: DistributionGroup[] = MUSICAL_KEYS.flatMap((key) => {
    const count = counts.get(key) ?? 0;
    return count > 0
      ? [
          {
            id: key,
            name: key,
            count,
            percentage: toPercentage(count, licks.length),
          },
        ]
      : [];
  });

  if (unclassified > 0) {
    groups.push({
      id: "UNCLASSIFIED",
      count: unclassified,
      percentage: toPercentage(unclassified, licks.length),
      unclassified: true,
    });
  }

  return { total: licks.length, groups };
}

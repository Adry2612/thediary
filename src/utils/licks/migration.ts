import type { GuitarLick } from "../../types/lick.ts";
import type { RepertoireItem } from "../../types/practice.ts";
import { normalizeLicks } from "./normalize.ts";
import { normalizePracticeResources } from "../practice-resources.ts";

export interface RepertoireLickMigration {
  repertoireItems: RepertoireItem[];
  licks: GuitarLick[];
}

function toIsoDate(value: unknown): string | undefined {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return undefined;
  }
  return value;
}

function migrateItem(
  item: RepertoireItem,
  now: Date,
): GuitarLick {
  const resources = normalizePracticeResources(item.resources);

  return {
    id: item.id,
    title: item.title,
    ...(resources.length > 0 ? { resources } : {}),
    techniques: [],
    bpmHistory: [],
    createdAt:
      toIsoDate(item.updatedAt) ?? now.toISOString(),
    practiceCount: 0,
  };
}

/**
 * Mueve los licks que aún viven en el repertorio a su propia colección.
 *
 * Es idempotente: la fuente desaparece al migrarse, y un lick con el mismo id
 * que ya exista conserva el existente.
 */
export function migrateRepertoireLicks(
  repertoireItems: RepertoireItem[],
  licks: GuitarLick[],
  now: Date = new Date(),
): RepertoireLickMigration {
  const migrated = new Map(
    normalizeLicks(licks).map((lick) => [lick.id, lick]),
  );
  const remaining: RepertoireItem[] = [];

  for (const item of repertoireItems) {
    if (!item || item.kind !== "lick") {
      remaining.push(item);
      continue;
    }

    if (migrated.has(item.id)) continue;

    migrated.set(item.id, migrateItem(item, now));
  }

  return {
    repertoireItems: remaining,
    licks: [...migrated.values()],
  };
}

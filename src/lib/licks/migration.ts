import type { GuitarLick } from "../../types/lick.ts";
import type { RepertoireItem } from "../../types/practice.ts";
import { normalizeLicks } from "./normalize.ts";
import { repertoireTabToText } from "./tab-text.ts";

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
  return {
    id: item.id,
    title: item.title,
    tabContent: repertoireTabToText(item.tab),
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
 * que ya exista conserva el existente. Si un elemento no se puede convertir,
 * se queda en el repertorio en lugar de perderse.
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

    try {
      migrated.set(item.id, migrateItem(item, now));
    } catch {
      remaining.push(item);
    }
  }

  return {
    repertoireItems: remaining,
    licks: [...migrated.values()],
  };
}

import type { RepertoireTab } from "../../types/practice.ts";
import type { TabScore } from "../../types/tab-score.ts";
import { createEmptyScore, isTabScoreLike, normalizeTabScore } from "./model.ts";
import { migrateGridTab } from "./migration.ts";

/**
 * Devuelve la partitura que debe mostrarse para un elemento. La partitura
 * guardada manda; si falta o no es válida, la rejilla se migra en memoria y
 * nunca se reescribe el campo `tab`.
 */
export function resolveTabScore({
  score,
  tab,
  tuning,
}: {
  score?: unknown;
  tab?: RepertoireTab;
  tuning?: string;
}): TabScore {
  if (isTabScoreLike(score)) {
    return normalizeTabScore(score, tuning ?? tab?.tuning);
  }
  if (tab) return migrateGridTab(tab, tuning);
  return createEmptyScore(tuning ?? "EADGBE");
}

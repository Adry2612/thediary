import type { PracticeGoals } from "@/utils/practice-goals";
import { normalizeRepertoireDifficulty } from "../utils/repertoire-item.ts";
import type { RepertoireItem } from "@/types/practice";
import type { WeeklyRoutineSchedule } from "@/utils/weekly-routine-schedule";
import type { PersistedPracticeState } from "@/types/practice-storage";
import { migrateRepertoireLicks } from "../utils/licks/migration.ts";
import { normalizeLicks } from "../utils/licks/normalize.ts";
import { normalizeSessionRecord } from "../utils/practice-session-record.ts";
import {
  migrateLegacyEquipmentEntries,
  normalizeGuitarEntries,
  normalizeGuitars,
} from "../utils/equipment.ts";
import type { GuitarEntry } from "@/types/equipment";

interface NormalizePracticeStorageStateInput {
  state: Partial<PersistedPracticeState> | undefined;
  normalizeGoals: (value: unknown) => PracticeGoals;
  normalizeSchedule: (value: unknown) => WeeklyRoutineSchedule;
}

/** Claves de la primera versión del equipo, conservadas solo para migrar. */
type LegacyEquipmentKeys = {
  guitarSetups?: unknown;
  stringChanges?: unknown;
};

/**
 * Conserva el elemento tal cual salvo por la dificultad: si el valor guardado
 * no es una de las admitidas se descarta, y el elemento sigue cargando.
 */
function normalizeStoredRepertoireItem(item: RepertoireItem): RepertoireItem {
  if (!item || typeof item !== "object") return item;
  const difficulty = normalizeRepertoireDifficulty(item.difficulty);
  if (difficulty === item.difficulty) return item;
  const { difficulty: _discarded, ...rest } = item;
  return difficulty ? { ...rest, difficulty } : rest;
}

/**
 * Une el historial guardado con el de la versión anterior. Las entradas nuevas
 * ganan por identificador, así una migración repetida no duplica nada.
 */
function normalizeStoredGuitarEntries(
  value: unknown,
  legacy: LegacyEquipmentKeys,
): GuitarEntry[] {
  const entries = new Map<string, GuitarEntry>();
  for (const entry of migrateLegacyEquipmentEntries(legacy)) {
    entries.set(entry.id, entry);
  }
  for (const entry of normalizeGuitarEntries(value)) {
    entries.set(entry.id, entry);
  }
  return [...entries.values()];
}

export function normalizePracticeStorageState({
  state,
  normalizeGoals,
  normalizeSchedule,
}: NormalizePracticeStorageStateInput): PersistedPracticeState {
  const repertoireItems = Array.isArray(state?.repertoireItems)
    ? state.repertoireItems.map(normalizeStoredRepertoireItem)
    : [];
  const migration = migrateRepertoireLicks(
    repertoireItems,
    normalizeLicks(state?.licks),
  );
  const legacy = state as (Partial<PersistedPracticeState> &
    LegacyEquipmentKeys) | undefined;

  return {
    history: Array.isArray(state?.history)
      ? state.history.map(normalizeSessionRecord)
      : [],
    templates: Array.isArray(state?.templates) ? state.templates : [],
    repertoireItems: migration.repertoireItems,
    licks: migration.licks,
    customChords: Array.isArray(state?.customChords) ? state.customChords : [],
    weeklySchedule: normalizeSchedule(state?.weeklySchedule),
    practiceGoals: normalizeGoals(state?.practiceGoals),
    guitars: normalizeGuitars(state?.guitars),
    guitarEntries: normalizeStoredGuitarEntries(state?.guitarEntries, {
      guitarSetups: legacy?.guitarSetups,
      stringChanges: legacy?.stringChanges,
    }),
  };
}

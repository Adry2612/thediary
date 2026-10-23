import type { PracticeGoals } from "@/utils/practice-goals";
import { normalizeRepertoireDifficulty } from "../utils/repertoire-item.ts";
import type { RepertoireItem } from "@/types/practice";
import type { WeeklyRoutineSchedule } from "@/utils/weekly-routine-schedule";
import type { PersistedPracticeState } from "@/types/practice-storage";
import { migrateRepertoireLicks } from "../utils/licks/migration.ts";
import { normalizeLicks } from "../utils/licks/normalize.ts";
import { normalizeSessionRecord } from "../utils/practice-session-record.ts";

interface NormalizePracticeStorageStateInput {
  state: Partial<PersistedPracticeState> | undefined;
  normalizeGoals: (value: unknown) => PracticeGoals;
  normalizeSchedule: (value: unknown) => WeeklyRoutineSchedule;
}

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
  };
}

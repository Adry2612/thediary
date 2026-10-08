import type { PracticeGoals } from "@/lib/practice-goals";
import type { WeeklyRoutineSchedule } from "@/lib/weekly-routine-schedule";
import type { PersistedPracticeState } from "@/stores/practiceStorage";

interface NormalizePracticeStorageStateInput {
  state: Partial<PersistedPracticeState> | undefined;
  normalizeGoals: (value: unknown) => PracticeGoals;
  normalizeSchedule: (value: unknown) => WeeklyRoutineSchedule;
}

export function normalizePracticeStorageState({
  state,
  normalizeGoals,
  normalizeSchedule,
}: NormalizePracticeStorageStateInput): PersistedPracticeState {
  return {
    history: Array.isArray(state?.history) ? state.history : [],
    templates: Array.isArray(state?.templates) ? state.templates : [],
    repertoireItems: Array.isArray(state?.repertoireItems)
      ? state.repertoireItems
      : [],
    weeklySchedule: normalizeSchedule(state?.weeklySchedule),
    practiceGoals: normalizeGoals(state?.practiceGoals),
  };
}

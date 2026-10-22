import type { PersistedPracticeState } from "@/stores/practiceStorage";
import { DEFAULT_PRACTICE_GOALS } from "./practice-goals.ts";

/**
 * Si el estado guardado tiene algo que merezca la pena conservar o sincronizar.
 *
 * Los objetivos de práctica cuentan como datos solo cuando se han cambiado: un
 * estado recién creado tiene todo vacío y los valores por defecto.
 */
export function hasPracticeData(state: PersistedPracticeState): boolean {
  return (
    state.history.length > 0 ||
    state.templates.length > 0 ||
    state.repertoireItems.length > 0 ||
    state.licks.length > 0 ||
    state.customChords.length > 0 ||
    Object.values(state.weeklySchedule).some(
      (routineId) => routineId !== null,
    ) ||
    state.practiceGoals.dailyMinutes !== DEFAULT_PRACTICE_GOALS.dailyMinutes ||
    state.practiceGoals.weeklyDays !== DEFAULT_PRACTICE_GOALS.weeklyDays
  );
}

/**
 * Si han cambiado las partes del estado que se guardan. Compara por referencia,
 * que es como zustand produce el estado: cada acción que toca una parte la
 * reemplaza.
 */
export function hasPracticeStateChanged(
  current: PersistedPracticeState,
  previous: PersistedPracticeState,
): boolean {
  return (
    current.history !== previous.history ||
    current.templates !== previous.templates ||
    current.repertoireItems !== previous.repertoireItems ||
    current.licks !== previous.licks ||
    current.customChords !== previous.customChords ||
    current.weeklySchedule !== previous.weeklySchedule ||
    current.practiceGoals !== previous.practiceGoals
  );
}

/**
 * Lo que se guarda y se sincroniza: solo las partes persistentes, sin el resto
 * del estado de la tienda.
 */
export function toPersistedSnapshot(
  state: PersistedPracticeState,
): PersistedPracticeState {
  return {
    history: state.history,
    templates: state.templates,
    repertoireItems: state.repertoireItems,
    licks: state.licks,
    customChords: state.customChords,
    weeklySchedule: state.weeklySchedule,
    practiceGoals: state.practiceGoals,
  };
}

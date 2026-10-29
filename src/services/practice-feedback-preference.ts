import type { PracticeMetric } from "../types/practice.ts";

const FEEDBACK_PREFERENCE_KEY = "thediary.practice-feedback";

/** Clave de almacenamiento, para escuchar cambios desde otra pestaña. */
export const PRACTICE_FEEDBACK_PREFERENCE_KEY = FEEDBACK_PREFERENCE_KEY;

export interface PracticeFeedbackPreference {
  /** Si se pregunta el ánimo al terminar la práctica. */
  mood: boolean;
  /** Si se pregunta el foco al terminar la práctica. */
  focus: boolean;
}

/** Ambas métricas empiezan apagadas: son un extra, no parte del flujo base. */
export const DEFAULT_PRACTICE_FEEDBACK_PREFERENCE: PracticeFeedbackPreference =
  {
    mood: false,
    focus: false,
  };

/**
 * Solo los dos interruptores admitidos cuentan; lo demás se ignora para que una
 * preferencia antigua o manipulada no active métricas por accidente.
 */
export function normalizePracticeFeedbackPreference(
  value: unknown,
): PracticeFeedbackPreference {
  if (!value || typeof value !== "object") {
    return DEFAULT_PRACTICE_FEEDBACK_PREFERENCE;
  }

  const candidate = value as Record<string, unknown>;
  return {
    mood: candidate.mood === true,
    focus: candidate.focus === true,
  };
}

export function readPracticeFeedbackPreference(): PracticeFeedbackPreference {
  if (typeof window === "undefined") {
    return DEFAULT_PRACTICE_FEEDBACK_PREFERENCE;
  }

  try {
    const stored = window.localStorage.getItem(FEEDBACK_PREFERENCE_KEY);
    return stored ?
        normalizePracticeFeedbackPreference(JSON.parse(stored))
      : DEFAULT_PRACTICE_FEEDBACK_PREFERENCE;
  } catch {
    return DEFAULT_PRACTICE_FEEDBACK_PREFERENCE;
  }
}

export function savePracticeFeedbackPreference(
  value: unknown,
): PracticeFeedbackPreference {
  const preference = normalizePracticeFeedbackPreference(value);
  if (typeof window === "undefined") return preference;

  try {
    window.localStorage.setItem(
      FEEDBACK_PREFERENCE_KEY,
      JSON.stringify(preference),
    );
  } catch {
    // La preferencia es opcional: la práctica sigue sin métricas.
  }

  return preference;
}

/** Cambia un interruptor sin tocar el otro. */
export function setPracticeFeedbackEnabled(
  preference: PracticeFeedbackPreference,
  metric: PracticeMetric,
  enabled: boolean,
): PracticeFeedbackPreference {
  return { ...preference, [metric]: enabled === true };
}

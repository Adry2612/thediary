export type TechniqueNameLanguage = "es" | "original";
export type TuningDisplay = "name" | "notes";

export interface DisplayPreferences {
  /** Sin valor: se sigue el idioma de la interfaz. */
  techniqueNameLanguage?: TechniqueNameLanguage;
  tuningDisplay: TuningDisplay;
}

export const DISPLAY_PREFERENCES_KEY = "thediary.display-preferences";
/** Evento de la misma pestaña para que todos los consumidores se actualicen. */
export const DISPLAY_PREFERENCES_EVENT = "thediary:display-preferences";

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  tuningDisplay: "name",
};

const TECHNIQUE_LANGUAGES: readonly TechniqueNameLanguage[] = [
  "es",
  "original",
];
const TUNING_DISPLAYS: readonly TuningDisplay[] = ["name", "notes"];

/** Solo los valores admitidos cuentan; el resto vuelve al valor por defecto. */
export function normalizeDisplayPreferences(
  value: unknown,
): DisplayPreferences {
  if (!value || typeof value !== "object") return DEFAULT_DISPLAY_PREFERENCES;

  const candidate = value as Record<string, unknown>;
  const techniqueNameLanguage = TECHNIQUE_LANGUAGES.includes(
    candidate.techniqueNameLanguage as TechniqueNameLanguage,
  )
    ? (candidate.techniqueNameLanguage as TechniqueNameLanguage)
    : undefined;
  const tuningDisplay = TUNING_DISPLAYS.includes(
    candidate.tuningDisplay as TuningDisplay,
  )
    ? (candidate.tuningDisplay as TuningDisplay)
    : DEFAULT_DISPLAY_PREFERENCES.tuningDisplay;

  return {
    ...(techniqueNameLanguage ? { techniqueNameLanguage } : {}),
    tuningDisplay,
  };
}

export function readDisplayPreferences(): DisplayPreferences {
  if (typeof window === "undefined") return DEFAULT_DISPLAY_PREFERENCES;

  try {
    const stored = window.localStorage.getItem(DISPLAY_PREFERENCES_KEY);
    return stored
      ? normalizeDisplayPreferences(JSON.parse(stored))
      : DEFAULT_DISPLAY_PREFERENCES;
  } catch {
    return DEFAULT_DISPLAY_PREFERENCES;
  }
}

export function saveDisplayPreferences(value: unknown): DisplayPreferences {
  const preference = normalizeDisplayPreferences(value);
  if (typeof window === "undefined") return preference;

  try {
    window.localStorage.setItem(
      DISPLAY_PREFERENCES_KEY,
      JSON.stringify(preference),
    );
    window.dispatchEvent(new CustomEvent(DISPLAY_PREFERENCES_EVENT));
  } catch {
    // La preferencia es opcional: se mantiene el valor normalizado en memoria.
  }

  return preference;
}

/** Español si el usuario lo eligió; si no, el idioma de la interfaz. */
export function resolveTechniqueNameLanguage(
  preference: DisplayPreferences,
  locale: "es" | "en",
): TechniqueNameLanguage {
  return (
    preference.techniqueNameLanguage ?? (locale === "en" ? "original" : "es")
  );
}

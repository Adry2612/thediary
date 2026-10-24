import type { GuitarType } from "@/types/practice";

const GUITAR_PREFERENCE_KEY = "thediary.guitar-type";

/** Solo se recuerda un tipo admitido; cualquier otro valor se ignora. */
export function normalizeGuitarPreference(value: unknown): GuitarType | null {
  return value === "electric" || value === "acoustic" ? value : null;
}

/**
 * Último tipo de guitarra elegido, para que una práctica nueva empiece con él.
 * Es una preferencia del dispositivo, no un dato de la sesión.
 */
export function readGuitarPreference(): GuitarType | null {
  if (typeof window === "undefined") return null;

  try {
    return normalizeGuitarPreference(
      window.localStorage.getItem(GUITAR_PREFERENCE_KEY),
    );
  } catch {
    return null;
  }
}

export function saveGuitarPreference(value: unknown): GuitarType | null {
  const guitarType = normalizeGuitarPreference(value);
  if (typeof window === "undefined") return guitarType;

  try {
    if (guitarType) {
      window.localStorage.setItem(GUITAR_PREFERENCE_KEY, guitarType);
    } else {
      window.localStorage.removeItem(GUITAR_PREFERENCE_KEY);
    }
  } catch {
    // La preferencia es opcional: la práctica sigue sin ella.
  }

  return guitarType;
}

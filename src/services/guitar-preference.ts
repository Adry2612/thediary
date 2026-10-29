import type { GuitarType } from "@/types/practice";

const GUITAR_PREFERENCE_KEY = "thediary.guitar-type";
const GUITAR_ID_PREFERENCE_KEY = "thediary.guitar-id";

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

/**
 * Última guitarra concreta usada en este dispositivo. Permite atribuir una
 * práctica nueva sin preguntar, que es lo que evita que el uso quede sesgado.
 */
export function readGuitarIdPreference(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(GUITAR_ID_PREFERENCE_KEY);
    return value && value.trim() !== "" ? value.trim() : null;
  } catch {
    return null;
  }
}

export function saveGuitarIdPreference(value: unknown): string | null {
  const guitarId =
    typeof value === "string" && value.trim() !== "" ? value.trim() : null;
  if (typeof window === "undefined") return guitarId;

  try {
    if (guitarId) {
      window.localStorage.setItem(GUITAR_ID_PREFERENCE_KEY, guitarId);
    } else {
      window.localStorage.removeItem(GUITAR_ID_PREFERENCE_KEY);
    }
  } catch {
    // La preferencia es opcional: la práctica sigue sin guitarra concreta.
  }

  return guitarId;
}

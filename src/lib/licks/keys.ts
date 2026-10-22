import {
  MUSICAL_KEYS,
  type MusicalKey,
} from "../../types/lick.ts";

export { MUSICAL_KEYS };

/** Fuente única de validación para tonalidades guardadas o enviadas por la UI. */
export function isMusicalKey(value: unknown): value is MusicalKey {
  return (
    typeof value === "string" &&
    (MUSICAL_KEYS as readonly string[]).includes(value)
  );
}

export function normalizeMusicalKey(value: unknown): MusicalKey | undefined {
  return isMusicalKey(value) ? value : undefined;
}

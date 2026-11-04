import { TECHNIQUE_IDS, type TechniqueId } from "../../types/lick.ts";
import {
  TECHNIQUE_CATALOG,
  getTechniqueEntry,
} from "../catalogs/techniques.ts";

/** El catálogo de técnicas es compartido por licks y bloques de práctica. */
export const LICK_TECHNIQUES = TECHNIQUE_CATALOG;

export function getLickTechnique(id: TechniqueId) {
  return getTechniqueEntry(id);
}

export function isTechniqueId(value: unknown): value is TechniqueId {
  return (
    typeof value === "string" &&
    (TECHNIQUE_IDS as readonly string[]).includes(value)
  );
}

/** Conserva solo técnicas del catálogo, sin repetir y en el orden del catálogo. */
export function normalizeTechniques(value: unknown): TechniqueId[] {
  if (!Array.isArray(value)) return [];
  const selected = new Set(value.filter(isTechniqueId));
  return TECHNIQUE_IDS.filter((id) => selected.has(id));
}

import type { PracticeResourceKind } from "../types/practice.ts";

/**
 * Nombre visible de cada tipo de material. Es un `Record` completo a propósito:
 * añadir un tipo a `PRACTICE_RESOURCE_KINDS` sin darle nombre deja de compilar,
 * y el listado de materiales nunca muestra un hueco.
 */
export const RESOURCE_LABELS: Record<PracticeResourceKind, string> = {
  songsterr: "Songsterr",
  pdf: "PDF",
  audio: "Audio",
  image: "Imagen",
  guitarpro: "Guitar Pro",
  youtube: "YouTube",
  spotify: "Spotify",
  tab: "TAB",
};

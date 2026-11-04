import type { CatalogNameLanguage } from "../../types/display.ts";
import { normalizeCatalogName } from "./techniques.ts";

export interface TheoryCatalogEntry {
  id: string;
  /** Nombre en español. */
  es: string;
  /** Nombre original, que también es el valor canónico guardado. */
  en: string;
}

/**
 * Catálogo inicial de temas de teoría. Es una lista curada y ampliable; los
 * nombres libres de rutinas antiguas se conservan aparte.
 */
export const THEORY_CATALOG: readonly TheoryCatalogEntry[] = [
  { id: "notes-intervals", es: "Notas e intervalos", en: "Notes and intervals" },
  { id: "major-scale", es: "Escala mayor", en: "Major scale" },
  { id: "minor-scale", es: "Escala menor", en: "Minor scale" },
  {
    id: "pentatonic-scales",
    es: "Escalas pentatónicas",
    en: "Pentatonic scales",
  },
  { id: "modes", es: "Modos", en: "Modes" },
  { id: "triads", es: "Tríadas", en: "Triads" },
  { id: "seventh-chords", es: "Acordes de séptima", en: "Seventh chords" },
  {
    id: "chord-progressions",
    es: "Progresiones",
    en: "Chord progressions",
  },
  {
    id: "harmony-functions",
    es: "Armonía y funciones",
    en: "Harmony and functions",
  },
  { id: "circle-of-fifths", es: "Círculo de quintas", en: "Circle of fifths" },
  { id: "rhythm-meter", es: "Ritmo y compás", en: "Rhythm and meter" },
  { id: "ear-training", es: "Entrenamiento auditivo", en: "Ear training" },
  { id: "music-reading", es: "Lectura musical", en: "Music reading" },
  { id: "caged-system", es: "Sistema CAGED", en: "CAGED system" },
  { id: "arpeggios", es: "Arpegios", en: "Arpeggios" },
];

const BY_ID = new Map(THEORY_CATALOG.map((topic) => [topic.id, topic]));

export function getTheoryEntry(id: string): TheoryCatalogEntry | undefined {
  return BY_ID.get(id);
}

/** Encuentra un tema por su id, su nombre español o su nombre original. */
export function resolveTheoryEntry(value: string): TheoryCatalogEntry | null {
  const direct = getTheoryEntry(value);
  if (direct) return direct;

  const normalized = normalizeCatalogName(value);
  if (!normalized) return null;

  return (
    THEORY_CATALOG.find(
      (topic) =>
        normalizeCatalogName(topic.es) === normalized ||
        normalizeCatalogName(topic.en) === normalized,
    ) ?? null
  );
}

/** Nombre visible de un tema; un nombre ajeno al catálogo queda intacto. */
export function getTheoryName(
  value: string,
  language: CatalogNameLanguage,
): string {
  const entry = getTheoryEntry(value) ?? resolveTheoryEntry(value);
  if (!entry) return value;
  return language === "es" ? entry.es : entry.en;
}

/** Nombres de todos los temas en el idioma pedido. */
export function getTheoryCatalogNames(
  language: CatalogNameLanguage,
): string[] {
  return THEORY_CATALOG.map((topic) =>
    language === "es" ? topic.es : topic.en,
  );
}

/** Comprueba si un nombre es un tema del catálogo. */
export function isCatalogTheoryName(value: string): boolean {
  return resolveTheoryEntry(value) !== null;
}

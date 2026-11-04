import type { TuningDisplay } from "../../types/display.ts";
import { normalizeCatalogName } from "./techniques.ts";

export interface TuningCatalogEntry {
  id: string;
  /** Nombre en español. */
  es: string;
  /** Nombre original. */
  en: string;
  /** Notación por cuerda, de grave a aguda. */
  notes: string;
  /** Valor que guardan las canciones del repertorio. */
  stored: string;
  /** Otros valores guardados que representan la misma afinación. */
  aliases?: readonly string[];
  /** Si aparece en el desplegable de repertorio. */
  common?: boolean;
}

export const TUNING_CATALOG: readonly TuningCatalogEntry[] = [
  {
    id: "standard",
    es: "Estándar",
    en: "Standard",
    notes: "EADGBE",
    stored: "E Standard (EADGBE)",
  },
  {
    id: "drop-d",
    es: "Drop D",
    en: "Drop D",
    notes: "DADGBE",
    stored: "Drop D (DADGBE)",
  },
  {
    id: "drop-c",
    es: "Drop C",
    en: "Drop C",
    notes: "CGCFAD",
    stored: "Drop C (CGCFAD)",
  },
  {
    id: "d-standard",
    es: "Estándar en Re",
    en: "D Standard",
    notes: "DGCFAD",
    stored: "D Standard (DGCFAD)",
  },
  {
    id: "full-step-down",
    es: "Un tono abajo",
    en: "Full step down",
    notes: "DGCFAD",
    stored: "Full Step Down (D G C F A D)",
  },
  {
    id: "c-standard",
    es: "Estándar en Do",
    en: "C Standard",
    notes: "CFA#D#GC",
    stored: "C Standard (CFA#D#GC)",
  },
  {
    id: "open-g",
    es: "Open G",
    en: "Open G",
    notes: "DGDGBD",
    stored: "Open G (DGDGBD)",
  },
  {
    id: "open-d",
    es: "Open D",
    en: "Open D",
    notes: "DADF#AD",
    stored: "Open D (DADF#AD)",
  },
  {
    id: "open-e",
    es: "Open E",
    en: "Open E",
    notes: "EBEG#BE",
    stored: "Open E (EBEG#BE)",
  },
  {
    id: "dadgad",
    es: "DADGAD",
    en: "DADGAD",
    notes: "DADGAD",
    stored: "DADGAD",
  },
  {
    id: "half-step-down",
    es: "Medio tono abajo",
    en: "Half step down",
    notes: "EbAbDbGbBbEb",
    stored: "Half Step Down (Eb Ab Db Gb Bb eb)",
  },
  {
    id: "eb-standard",
    es: "Eb estándar",
    en: "Eb standard",
    notes: "EbAbDbGbBbEb",
    stored: "Eb Standard (EbAbDbGbBbEb)",
    common: false,
  },
];

const BY_ID = new Map(TUNING_CATALOG.map((tuning) => [tuning.id, tuning]));

function matchesValue(entry: TuningCatalogEntry, normalized: string): boolean {
  const values = [entry.stored, ...(entry.aliases ?? [])];
  return values.some((value) => normalizeCatalogName(value) === normalized);
}

function matchesName(entry: TuningCatalogEntry, normalized: string): boolean {
  return (
    normalizeCatalogName(entry.es) === normalized ||
    normalizeCatalogName(entry.en) === normalized
  );
}

function looksLikeBareNotes(value: string): boolean {
  return /^[A-Ga-g][#b]?(?:[A-Ga-g][#b]?){1,}$/.test(
    value.replace(/[\s-]/g, ""),
  );
}

/** Encuentra una afinación por valor guardado, nombre o notación de cuerdas. */
export function resolveTuningEntry(
  value: string,
): TuningCatalogEntry | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = normalizeCatalogName(trimmed);

  const byValue = TUNING_CATALOG.find((entry) =>
    matchesValue(entry, normalized),
  );
  if (byValue) return byValue;

  const byName = TUNING_CATALOG.find((entry) =>
    matchesName(entry, normalized),
  );
  if (byName) return byName;

  if (looksLikeBareNotes(trimmed)) {
    const notes = trimmed.replace(/[\s-]/g, "").toUpperCase();
    return (
      TUNING_CATALOG.find(
        (entry) => entry.notes.replace(/[\s-]/g, "").toUpperCase() === notes,
      ) ?? null
    );
  }

  return null;
}

/** Presenta una afinación como nombre localizado o como notas por cuerda. */
export function formatTuning(
  value: string,
  {
    display,
    locale,
  }: { display: TuningDisplay; locale: "es" | "en" },
): string {
  const entry = resolveTuningEntry(value);
  if (!entry) return value.trim();
  if (display === "notes") return entry.notes;
  return locale === "en" ? entry.en : entry.es;
}

/** Etiqueta de un preset del afinador. */
export function formatTuningPreset(
  presetId: string,
  options: { display: TuningDisplay; locale: "es" | "en" },
): string {
  const entry = BY_ID.get(presetId);
  if (!entry) return presetId;
  if (options.display === "notes") return entry.notes;
  return options.locale === "en" ? entry.en : entry.es;
}

/** Valores que ofrece el formulario de repertorio, incluida la opción libre. */
export function getCommonTuningValues(): string[] {
  return [
    ...TUNING_CATALOG.filter((entry) => entry.common !== false).flatMap(
      (entry) => [entry.stored, ...(entry.aliases ?? [])],
    ),
    "Otra...",
  ];
}

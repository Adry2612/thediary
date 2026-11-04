import { TECHNIQUE_IDS, type TechniqueId } from "../../types/lick.ts";
import type { CatalogNameLanguage } from "../../types/display.ts";

export interface TechniqueCatalogEntry {
  id: TechniqueId;
  /** Nombre en español. */
  es: string;
  /** Nombre original, que también es el valor canónico guardado. */
  en: string;
  /** Marca compacta para tarjetas, leyenda y filtros. */
  glyph: string;
}

/** Fuente única para licks, bloques de práctica, análisis y ajustes. */
export const TECHNIQUE_CATALOG: readonly TechniqueCatalogEntry[] = [
  {
    id: "ALTERNATE_PICKING",
    es: "Púa alterna",
    en: "Alternate picking",
    glyph: "AP",
  },
  {
    id: "SWEEP_PICKING",
    es: "Barridos",
    en: "Sweep picking",
    glyph: "SW",
  },
  { id: "LEGATO", es: "Legato", en: "Legato", glyph: "LG" },
  {
    id: "BENDING",
    es: "Bending y vibrato",
    en: "Bending and vibrato",
    glyph: "BD",
  },
  { id: "TAPPING", es: "Tapping", en: "Tapping", glyph: "TP" },
  {
    id: "HYBRID_PICKING",
    es: "Púa y dedos",
    en: "Hybrid picking",
    glyph: "HY",
  },
  {
    id: "ECONOMY_PICKING",
    es: "Economy picking",
    en: "Economy picking",
    glyph: "EC",
  },
  { id: "FINGERSTYLE", es: "Fingerstyle", en: "Fingerstyle", glyph: "FS" },
  {
    id: "RHYTHM_STRUMMING",
    es: "Ritmo y rascado",
    en: "Rhythm and strumming",
    glyph: "RH",
  },
  { id: "SLIDE", es: "Slide", en: "Slide", glyph: "SL" },
];

const BY_ID = new Map(
  TECHNIQUE_CATALOG.map((technique) => [technique.id, technique]),
);

export function getTechniqueEntry(
  id: string,
): TechniqueCatalogEntry | undefined {
  return BY_ID.get(id as TechniqueId);
}

/** Normaliza para comparar nombres sin mayúsculas, espacios ni acentos. */
export function normalizeCatalogName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es");
}

/** Encuentra una técnica por su id, su nombre español o su nombre original. */
export function resolveTechniqueEntry(
  value: string,
): TechniqueCatalogEntry | null {
  const direct = getTechniqueEntry(value);
  if (direct) return direct;

  const normalized = normalizeCatalogName(value);
  if (!normalized) return null;

  return (
    TECHNIQUE_CATALOG.find(
      (technique) =>
        normalizeCatalogName(technique.es) === normalized ||
        normalizeCatalogName(technique.en) === normalized,
    ) ?? null
  );
}

/** Nombre visible de una técnica; un nombre ajeno al catálogo queda intacto. */
export function getTechniqueName(
  value: string,
  language: CatalogNameLanguage,
): string {
  const entry = getTechniqueEntry(value) ?? resolveTechniqueEntry(value);
  if (!entry) return value;
  return language === "original" ? entry.en : entry.es;
}

/** Nombres de todas las técnicas en el idioma pedido. */
export function getTechniqueCatalogNames(
  language: CatalogNameLanguage,
): string[] {
  return TECHNIQUE_CATALOG.map((technique) =>
    language === "original" ? technique.en : technique.es,
  );
}

/** Comprueba si un nombre es una técnica del catálogo. */
export function isCatalogTechniqueName(value: string): boolean {
  return resolveTechniqueEntry(value) !== null;
}

/** Todos los ids válidos, en el orden del catálogo. */
export const TECHNIQUE_CATALOG_IDS: readonly TechniqueId[] = TECHNIQUE_IDS;

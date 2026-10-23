import {
  TECHNIQUE_IDS,
  type TechniqueId,
} from "../../types/lick.ts";

export interface LickTechniqueDescriptor {
  id: TechniqueId;
  /** Clave del diccionario `licks` con el nombre de la técnica. */
  labelKey: string;
  /** Marca compacta para tarjetas, leyenda y filtros. */
  glyph: string;
}

/** Fuente única de la paleta, las etiquetas y la validación de técnicas. */
export const LICK_TECHNIQUES: readonly LickTechniqueDescriptor[] = [
  { id: "ALTERNATE_PICKING", labelKey: "techniqueAlternatePicking", glyph: "AP" },
  { id: "SWEEP_PICKING", labelKey: "techniqueSweepPicking", glyph: "SW" },
  { id: "LEGATO", labelKey: "techniqueLegato", glyph: "LG" },
  { id: "BENDING", labelKey: "techniqueBending", glyph: "BD" },
  { id: "TAPPING", labelKey: "techniqueTapping", glyph: "TP" },
  { id: "HYBRID_PICKING", labelKey: "techniqueHybridPicking", glyph: "HY" },
  { id: "ECONOMY_PICKING", labelKey: "techniqueEconomyPicking", glyph: "EC" },
  { id: "FINGERSTYLE", labelKey: "techniqueFingerstyle", glyph: "FS" },
  { id: "RHYTHM_STRUMMING", labelKey: "techniqueRhythmStrumming", glyph: "RH" },
  { id: "SLIDE", labelKey: "techniqueSlide", glyph: "SL" },
];

const TECHNIQUE_BY_ID = new Map(
  LICK_TECHNIQUES.map((technique) => [technique.id, technique]),
);

export function getLickTechnique(
  id: TechniqueId,
): LickTechniqueDescriptor | undefined {
  return TECHNIQUE_BY_ID.get(id);
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

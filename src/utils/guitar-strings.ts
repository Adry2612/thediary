/**
 * Catálogo de juegos de cuerdas. Los datos viven en `guitar-strings.json` para
 * poder añadir modelos sin tocar código; aquí solo se leen y se formatean.
 */

import catalogue from "../data/guitar-strings.json" with { type: "json" };
import {
  GUITAR_STRING_KINDS,
  type GuitarStringKind,
  type GuitarStringSetSnapshot,
  type GuitarStringUnit,
} from "../types/equipment.ts";

export interface GuitarStringSet {
  id: string;
  brand: string;
  model: string;
  name: string;
  kind: GuitarStringKind;
  unit: GuitarStringUnit;
  gauges: number[];
  /** Ruta pública de la foto del paquete, si existe en local. */
  image?: string;
}

const SETS: GuitarStringSet[] = (catalogue.sets as GuitarStringSet[]).filter(
  (set) => (GUITAR_STRING_KINDS as readonly string[]).includes(set.kind),
);

export const GUITAR_STRING_SETS: readonly GuitarStringSet[] = SETS;

export function getStringSetsByKind(
  kind: GuitarStringKind,
): GuitarStringSet[] {
  return SETS.filter((set) => set.kind === kind);
}

export function getStringSetById(id: string): GuitarStringSet | undefined {
  return SETS.find((set) => set.id === id);
}

export function isGuitarStringKind(
  value: unknown,
): value is GuitarStringKind {
  return (
    typeof value === "string" &&
    (GUITAR_STRING_KINDS as readonly string[]).includes(value)
  );
}

/** «10-46» en pulgadas, «0.71-1.09 mm» en milímetros. */
export function formatGaugeRange(
  gauges: readonly number[],
  unit: GuitarStringUnit,
): string {
  if (gauges.length === 0) return "";
  const first = unit === "mm" ? gauges[0].toFixed(2) : String(gauges[0]);
  const last =
    unit === "mm" ? gauges[gauges.length - 1].toFixed(2) : String(gauges.at(-1));
  const range = gauges.length === 1 ? first : `${first}-${last}`;

  return unit === "mm" ? `${range} mm` : range;
}

/** Texto listo para mostrar: marca, modelo y calibres. */
export function formatStringSet(
  set: Pick<
    GuitarStringSetSnapshot,
    "brand" | "model" | "gauges" | "unit" | "gaugeText"
  >,
): string {
  const name = `${set.brand} ${set.model}`.trim();
  const gauges =
    set.gauges && set.unit ?
      formatGaugeRange(set.gauges, set.unit)
    : (set.gaugeText?.trim() ?? "");

  return gauges ? `${name} · ${gauges}` : name;
}

export function toGuitarStringSetSnapshot(
  set: GuitarStringSet,
): GuitarStringSetSnapshot {
  return {
    brand: set.brand,
    model: set.model,
    ...(set.name ? { name: set.name } : {}),
    kind: set.kind,
    gauges: [...set.gauges],
    unit: set.unit,
    ...(set.image ? { image: set.image } : {}),
  };
}

/** Lo que el formulario mantiene mientras se elige el juego. */
export type StringSetDraft = {
  kind: GuitarStringKind;
  /** Id del catálogo, "custom" para escribirlo o "" para no especificarlo. */
  setId: string;
  brand: string;
  model: string;
  gaugeText: string;
};

export const EMPTY_STRING_SET_DRAFT: StringSetDraft = {
  kind: "electric",
  setId: "",
  brand: "",
  model: "",
  gaugeText: "",
};

/** Convierte el borrador en lo que se guarda; sin marca ni modelo, nada. */
export function draftToStringSet(
  draft: StringSetDraft,
): GuitarStringSetSnapshot | undefined {
  if (draft.setId === "custom") {
    const brand = draft.brand.trim();
    const model = draft.model.trim();
    if (!brand || !model) return undefined;
    const gaugeText = draft.gaugeText.trim();

    return {
      brand,
      model,
      kind: draft.kind,
      ...(gaugeText ? { gaugeText } : {}),
    };
  }

  const set = getStringSetById(draft.setId);
  return set ? toGuitarStringSetSnapshot(set) : undefined;
}

/**
 * Calculadora de tiempos de delay y reverb: convierte un tempo en milisegundos
 * para la negra y sus divisiones, incluidas las con puntillo y los tresillos.
 */

export const MIN_DELAY_BPM = 40;
export const MAX_DELAY_BPM = 240;

export type DelayVariant = "plain" | "dotted" | "triplet";

export interface DelayBaseDivision {
  id: string;
  /** Nombre de la figura: 1/4 es una negra. */
  fraction: string;
  /** Duración en negras. */
  beats: number;
}

export const DELAY_BASE_DIVISIONS: readonly DelayBaseDivision[] = [
  { id: "whole", fraction: "1/1", beats: 4 },
  { id: "half", fraction: "1/2", beats: 2 },
  { id: "quarter", fraction: "1/4", beats: 1 },
  { id: "eighth", fraction: "1/8", beats: 0.5 },
  { id: "sixteenth", fraction: "1/16", beats: 0.25 },
  { id: "thirty-second", fraction: "1/32", beats: 0.125 },
];

export const DELAY_VARIANTS: readonly DelayVariant[] = [
  "plain",
  "dotted",
  "triplet",
];

const VARIANT_MULTIPLIERS: Record<DelayVariant, number> = {
  plain: 1,
  dotted: 1.5,
  triplet: 2 / 3,
};

export interface DelayDivision extends DelayBaseDivision {
  variant: DelayVariant;
  /** Milisegundos redondeados a dos decimales. */
  milliseconds: number;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

/** Milisegundos de una negra; `null` fuera del rango admitido. */
export function getBeatMilliseconds(bpm: number): number | null {
  if (!Number.isFinite(bpm) || bpm < MIN_DELAY_BPM || bpm > MAX_DELAY_BPM) {
    return null;
  }

  return round(60_000 / bpm);
}

/** Todas las divisiones para un tempo; `null` si el tempo no es válido. */
export function getDelayDivisions(bpm: number): DelayDivision[] | null {
  const beatMilliseconds = getBeatMilliseconds(bpm);
  if (beatMilliseconds === null) return null;

  return DELAY_BASE_DIVISIONS.flatMap((division) =>
    DELAY_VARIANTS.map((variant) => ({
      ...division,
      variant,
      milliseconds: round(
        (60_000 / bpm) * division.beats * VARIANT_MULTIPLIERS[variant],
      ),
    })),
  );
}

/** Texto con dos decimales fijos, también para valores enteros. */
export function formatDelayMilliseconds(milliseconds: number): string {
  return Number.isFinite(milliseconds) ? milliseconds.toFixed(2) : "—";
}

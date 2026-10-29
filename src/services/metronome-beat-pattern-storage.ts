import {
  normalizeBeatPattern,
  type MetronomeBeatPattern,
} from "@/utils/metronome-beat-pattern";

const STORAGE_KEY = "thediary.metronome-beat-patterns";

export type MetronomeBeatPatternMap = Record<string, MetronomeBeatPattern>;

/**
 * Patrones guardados por compás. Los valores se devuelven tal cual están
 * escritos: quien los use los pasa por `normalizeBeatPattern`, que es quien
 * conoce el número de pulsos del compás.
 */
export function readMetronomeBeatPatterns(): MetronomeBeatPatternMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const map: MetronomeBeatPatternMap = {};
    for (const [meter, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) {
        map[meter] = value as MetronomeBeatPattern;
      }
    }
    return map;
  } catch {
    return {};
  }
}

/** Patrón de un compás concreto, listo para usar aunque falte o esté roto. */
export function readMetronomeBeatPattern(
  meterSignature: string,
  beatsPerMeasure: number,
): MetronomeBeatPattern {
  return normalizeBeatPattern(
    readMetronomeBeatPatterns()[meterSignature],
    beatsPerMeasure,
  );
}

export function saveMetronomeBeatPattern(
  meterSignature: string,
  pattern: MetronomeBeatPattern,
): void {
  if (typeof window === "undefined") return;

  try {
    const patterns = readMetronomeBeatPatterns();
    patterns[meterSignature] = pattern;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  } catch {
    // La preferencia es opcional: el metrónomo sigue sonando con este patrón.
  }
}

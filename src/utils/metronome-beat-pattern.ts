/**
 * Estados de un pulso. `accent` es el resalte abierto (suena y deja cola) y
 * `accentClosed` el cerrado (el mismo golpe, ahogado enseguida).
 */
export const METRONOME_BEAT_STATES = [
  "normal",
  "accent",
  "accentClosed",
  "muted",
] as const;

export type MetronomeBeatState = (typeof METRONOME_BEAT_STATES)[number];

/** Un estado por pulso, en orden dentro del compás. */
export type MetronomeBeatPattern = MetronomeBeatState[];

export function isMetronomeBeatState(
  value: unknown,
): value is MetronomeBeatState {
  return METRONOME_BEAT_STATES.includes(value as MetronomeBeatState);
}

function normalizeBeatCount(beatsPerMeasure: number): number {
  if (!Number.isFinite(beatsPerMeasure)) return 1;
  return Math.max(1, Math.floor(beatsPerMeasure));
}

/** Primer pulso acentuado y el resto normales: el patrón de siempre. */
export function createDefaultBeatPattern(
  beatsPerMeasure: number,
): MetronomeBeatPattern {
  return Array.from({ length: normalizeBeatCount(beatsPerMeasure) }, (_, beat) =>
    beat === 0 ? "accent" : "normal",
  );
}

/**
 * Deja el patrón con un estado por pulso: descarta los valores desconocidos,
 * recorta lo que sobra y rellena lo que falta sin inventar acentos.
 */
export function normalizeBeatPattern(
  value: unknown,
  beatsPerMeasure: number,
): MetronomeBeatPattern {
  const beats = normalizeBeatCount(beatsPerMeasure);
  const source = Array.isArray(value) ? value : [];
  if (source.length === 0) return createDefaultBeatPattern(beats);

  return Array.from({ length: beats }, (_, index) => {
    const state = source[index];
    return isMetronomeBeatState(state) ? state : "normal";
  });
}

/** Acentúa el pulso (abierto) o lo devuelve a normal. */
export function toggleBeatAccent(
  pattern: MetronomeBeatPattern,
  beat: number,
): MetronomeBeatPattern {
  return pattern.map((state, index) =>
    index === beat ? (state === "accent" ? "normal" : "accent") : state,
  );
}

/** Silencia el pulso o lo devuelve a normal. Un pulso acentuado pasa a silencio. */
export function toggleBeatMute(
  pattern: MetronomeBeatPattern,
  beat: number,
): MetronomeBeatPattern {
  return pattern.map((state, index) =>
    index === beat ? (state === "muted" ? "normal" : "muted") : state,
  );
}

/**
 * Avanza el pulso: normal → resalte abierto → resalte cerrado → silencio →
 * normal. Un solo gesto recorre los cuatro estados.
 */
export function cycleBeatState(
  pattern: MetronomeBeatPattern,
  beat: number,
): MetronomeBeatPattern {
  return pattern.map((state, index) => {
    if (index !== beat) return state;
    if (state === "normal") return "accent";
    if (state === "accent") return "accentClosed";
    if (state === "accentClosed") return "muted";
    return "normal";
  });
}

export function getBeatState(
  pattern: readonly MetronomeBeatState[],
  beat: number,
): MetronomeBeatState {
  const state = pattern[beat];
  return isMetronomeBeatState(state) ? state : "normal";
}

/**
 * Afinador de guitarra: nombres de nota, presets de afinación y detección de
 * tono por autocorrelación. Todo es puro para poder probarlo con señales
 * sintéticas, sin micrófono ni navegador.
 */

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

const SEMITONES: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export interface TuningString {
  note: string;
  octave: number;
}

export interface TuningPreset {
  id: string;
  strings: TuningString[];
}

export const TUNING_PRESETS: readonly TuningPreset[] = [
  {
    id: "standard",
    strings: [
      { note: "E", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "B", octave: 3 },
      { note: "E", octave: 4 },
    ],
  },
  {
    id: "drop-d",
    strings: [
      { note: "D", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "B", octave: 3 },
      { note: "E", octave: 4 },
    ],
  },
  {
    id: "eb-standard",
    strings: [
      { note: "D#", octave: 2 },
      { note: "G#", octave: 2 },
      { note: "C#", octave: 3 },
      { note: "F#", octave: 3 },
      { note: "A#", octave: 3 },
      { note: "D#", octave: 4 },
    ],
  },
  {
    id: "open-g",
    strings: [
      { note: "D", octave: 2 },
      { note: "G", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "B", octave: 3 },
      { note: "D", octave: 4 },
    ],
  },
  {
    id: "dadgad",
    strings: [
      { note: "D", octave: 2 },
      { note: "A", octave: 2 },
      { note: "D", octave: 3 },
      { note: "G", octave: 3 },
      { note: "A", octave: 3 },
      { note: "D", octave: 4 },
    ],
  },
];

export const DEFAULT_TUNING_PRESET_ID = "standard";
export const DEFAULT_A4_REFERENCE = 440;
export const MIN_A4_REFERENCE = 415;
export const MAX_A4_REFERENCE = 466;

/** Frecuencia de una nota con su octava, referida a un A4 ajustable. */
export function getNoteFrequency(
  note: string,
  octave: number,
  a4 = DEFAULT_A4_REFERENCE,
): number {
  const semitone = SEMITONES[note];
  if (semitone === undefined || !Number.isFinite(octave)) {
    throw new RangeError(`Nota desconocida: ${note}${octave}`);
  }

  const midi = (octave + 1) * 12 + semitone;
  return a4 * 2 ** ((midi - 69) / 12);
}

export function getTuningPreset(
  presetId: string,
): TuningPreset | undefined {
  return TUNING_PRESETS.find((preset) => preset.id === presetId);
}

export interface TuningTarget extends TuningString {
  frequency: number;
}

/** Cuerdas del preset con su frecuencia objetivo según la referencia A4. */
export function getTuningTargets(
  presetId: string,
  a4 = DEFAULT_A4_REFERENCE,
): TuningTarget[] {
  const preset =
    getTuningPreset(presetId) ??
    TUNING_PRESETS.find((candidate) => candidate.id === DEFAULT_TUNING_PRESET_ID);

  return (preset?.strings ?? []).map((string) => ({
    ...string,
    frequency: getNoteFrequency(string.note, string.octave, a4),
  }));
}

export interface DetectedNote {
  note: string;
  octave: number;
  /** Desviación en cents: negativo por debajo, positivo por encima. */
  cents: number;
  /** Frecuencia exacta de la nota más cercana. */
  targetFrequency: number;
}

/** Nota más cercana a una frecuencia, con su desviación en cents. */
export function getNoteFromFrequency(
  frequency: number,
  a4 = DEFAULT_A4_REFERENCE,
): DetectedNote | null {
  if (!Number.isFinite(frequency) || frequency <= 0 || a4 <= 0) return null;

  const midi = Math.round(69 + 12 * Math.log2(frequency / a4));
  const targetFrequency = a4 * 2 ** ((midi - 69) / 12);
  const cents = Math.round(1200 * Math.log2(frequency / targetFrequency));
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;

  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    cents,
    targetFrequency,
  };
}

export interface PitchDetection {
  frequency: number;
  /** Correlación normalizada del pico: 1 es una señal muy periódica. */
  confidence: number;
}

export interface DetectPitchOptions {
  minFrequency?: number;
  maxFrequency?: number;
  /** Amplitud mínima (RMS) para considerar que hay señal. */
  threshold?: number;
}

/**
 * Detecta la frecuencia fundamental por autocorrelación normalizada. Devuelve
 * `null` en silencio o cuando la señal no es periódica, para que el afinador
 * muestre «sin señal» en vez de una nota inventada.
 */
export function detectPitch(
  samples: Float32Array | ArrayLike<number> | null | undefined,
  sampleRate: number,
  {
    minFrequency = 60,
    maxFrequency = 1400,
    threshold = 0.01,
  }: DetectPitchOptions = {},
): PitchDetection | null {
  if (!samples || samples.length < 32) return null;
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) return null;

  let energy = 0;
  for (let index = 0; index < samples.length; index += 1) {
    energy += samples[index] * samples[index];
  }
  if (Math.sqrt(energy / samples.length) < threshold) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / maxFrequency));
  const maxLag = Math.min(
    samples.length - 1,
    Math.ceil(sampleRate / minFrequency),
  );
  if (maxLag <= minLag) return null;

  const correlations = new Float64Array(maxLag + 1);
  let bestCorrelation = 0;
  let bestLag = -1;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    let energyA = 0;
    let energyB = 0;

    for (let index = 0; index + lag < samples.length; index += 1) {
      const a = samples[index];
      const b = samples[index + lag];
      correlation += a * b;
      energyA += a * a;
      energyB += b * b;
    }

    const norm = Math.sqrt(energyA * energyB);
    const normalized = norm > 0 ? correlation / norm : 0;
    correlations[lag] = normalized;
    if (normalized > bestCorrelation) {
      bestCorrelation = normalized;
      bestLag = lag;
    }
  }

  if (bestLag < 0 || bestCorrelation < 0.5) return null;

  // El primer máximo local casi tan alto como el máximo global evita saltar de
  // octava cuando el período fundamental y sus múltiplos correlacionan parecido.
  let chosenLag = bestLag;
  for (let lag = minLag + 1; lag < maxLag; lag += 1) {
    const value = correlations[lag];
    if (
      value >= bestCorrelation * 0.9 &&
      value >= (correlations[lag - 1] ?? 0) &&
      value >= (correlations[lag + 1] ?? 0)
    ) {
      chosenLag = lag;
      break;
    }
  }

  const left = correlations[chosenLag - 1] ?? 0;
  const centre = correlations[chosenLag];
  const right = correlations[chosenLag + 1] ?? 0;
  const denominator = left - 2 * centre + right;
  const offset =
    denominator !== 0 ? (0.5 * (left - right)) / denominator : 0;
  const refinedLag = chosenLag + Math.max(-0.5, Math.min(0.5, offset));

  return {
    frequency: sampleRate / refinedLag,
    confidence: bestCorrelation,
  };
}

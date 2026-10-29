/**
 * Avisos de práctica: madera y marimba, sintetizadas con Web Audio. Cada aviso
 * toca dos golpes al empezar un bloque y tres al terminar, y el último se deja
 * sonar lo que dura la nota. No hay archivos ni material de terceros.
 */

import {
  createVoiceRecipe,
  DEFAULT_ATTACK_SECONDS,
  type VoiceNoise,
  type VoiceRecipe,
} from "./voice-recipe.ts";

export const PRACTICE_SOUNDS = ["wood", "marimba"] as const;

export type PracticeSound = (typeof PRACTICE_SOUNDS)[number];

/** Un aviso suena al empezar un bloque o al terminar. */
export type PracticeMoment = "start" | "end";

export const DEFAULT_PRACTICE_START_SOUND: PracticeSound = "wood";
export const DEFAULT_PRACTICE_END_SOUND: PracticeSound = "marimba";

/** Clave de traducción de cada aviso. */
export const PRACTICE_SOUND_LABEL_KEYS = {
  wood: "soundWood",
  marimba: "soundMarimba",
} as const satisfies Record<PracticeSound, string>;

/** Un parcial con la frecuencia relativa a la nota del golpe. */
type StrikePartial = {
  type: OscillatorType;
  ratio: number;
  gain: number;
  decaySeconds: number;
};

/** Cómo suena un golpe, sin fijar todavía la nota. */
type Strike = {
  partials: readonly StrikePartial[];
  noise?: VoiceNoise;
};

type PracticeSoundInstrument = {
  strike: Strike;
  /** Notas de los dos golpes del inicio y de los tres del final, en hercios. */
  startNotes: readonly number[];
  endNotes: readonly number[];
  startGapSeconds: number;
  endGapSeconds: number;
  /** Tope de la cola al empezar: el aviso de inicio cabe en un segundo. */
  startTailSeconds: number;
  /** Ganancia de pico del aviso completo. */
  gain: number;
};

const INSTRUMENTS: Record<PracticeSound, PracticeSoundInstrument> = {
  // Modos inarmónicos cortos y un chasquido de ruido: ataque seco, sin cola.
  wood: {
    strike: {
      partials: [
        { type: "sine", ratio: 1, gain: 0.3, decaySeconds: 0.075 },
        { type: "sine", ratio: 1.5, gain: 0.16, decaySeconds: 0.05 },
        { type: "sine", ratio: 2.33, gain: 0.08, decaySeconds: 0.03 },
      ],
      noise: {
        filterType: "highpass",
        frequency: 5_000,
        q: 0.7,
        gain: 0.08,
        attackSeconds: 0.001,
        decaySeconds: 0.012,
      },
    },
    startNotes: [880, 1_320],
    endNotes: [880, 1_046.5, 1_320],
    startGapSeconds: 0.16,
    endGapSeconds: 0.3,
    startTailSeconds: 0.12,
    gain: 0.5,
  },
  // Modos de barra (1 / 3,93 / 9,24 / 16,7) con colas largas: el ataque de
  // mazo es corto y la barra sigue sonando.
  marimba: {
    strike: {
      partials: [
        { type: "sine", ratio: 1, gain: 0.5, decaySeconds: 0.9 },
        { type: "sine", ratio: 3.93, gain: 0.14, decaySeconds: 0.22 },
        { type: "sine", ratio: 9.24, gain: 0.05, decaySeconds: 0.09 },
        { type: "sine", ratio: 16.7, gain: 0.02, decaySeconds: 0.05 },
      ],
      noise: {
        filterType: "bandpass",
        frequency: 2_400,
        q: 1,
        gain: 0.04,
        attackSeconds: 0.002,
        decaySeconds: 0.012,
      },
    },
    startNotes: [440, 659.25],
    endNotes: [440, 554.37, 659.25],
    startGapSeconds: 0.3,
    endGapSeconds: 0.4,
    startTailSeconds: 0.4,
    gain: 0.55,
  },
};

export function isPracticeSound(value: unknown): value is PracticeSound {
  return (
    typeof value === "string" &&
    (PRACTICE_SOUNDS as readonly string[]).includes(value)
  );
}

/** Un valor desconocido o ausente vuelve al aviso por defecto. */
export function normalizePracticeSound(
  value: unknown,
  fallback: PracticeSound,
): PracticeSound {
  return isPracticeSound(value) ? value : fallback;
}

export function getPracticeSoundInstrument(
  sound: PracticeSound,
): PracticeSoundInstrument {
  return INSTRUMENTS[sound];
}

/** Lo que dura la cola natural de un golpe, sin recortar. */
function getStrikeTail(strike: Strike): number {
  const partials = strike.partials.map(({ decaySeconds }) => decaySeconds);
  const noise = strike.noise
    ? strike.noise.attackSeconds + strike.noise.decaySeconds
    : 0;

  return Math.max(...partials, noise);
}

function clampTail(value: number, tail: number | undefined): number {
  if (tail === undefined) return value;
  return Math.max(0.001, Math.min(value, tail));
}

/**
 * Receta de un golpe a una nota concreta. `tailSeconds` recorta la cola, que es
 * lo que mantiene el aviso de inicio por debajo de un segundo.
 */
export function getPracticeStrike(
  sound: PracticeSound,
  frequency: number,
  tailSeconds?: number,
): VoiceRecipe {
  const { strike } = INSTRUMENTS[sound];

  return createVoiceRecipe({
    partials: strike.partials.map((partial) => ({
      type: partial.type,
      frequency: frequency * partial.ratio,
      gain: partial.gain,
      decaySeconds: clampTail(partial.decaySeconds, tailSeconds),
    })),
    ...(strike.noise
      ? {
          noise: {
            ...strike.noise,
            decaySeconds: clampTail(strike.noise.decaySeconds, tailSeconds),
          },
        }
      : {}),
  });
}

/** Duración audible de un aviso, desde el primer golpe hasta que se apaga. */
export function getPracticeSoundDuration(
  sound: PracticeSound,
  moment: PracticeMoment,
): number {
  const instrument = INSTRUMENTS[sound];
  const notes =
    moment === "start" ? instrument.startNotes : instrument.endNotes;
  const gap =
    moment === "start" ? instrument.startGapSeconds : instrument.endGapSeconds;
  const tail = getStrikeTail(instrument.strike);
  const lastTail =
    moment === "start" ? Math.min(tail, instrument.startTailSeconds) : tail;

  return gap * (notes.length - 1) + DEFAULT_ATTACK_SECONDS + lastTail;
}

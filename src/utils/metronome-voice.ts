/**
 * Catálogo de sonidos del metrónomo. Cada voz es una receta declarativa que
 * `scheduleMetronomeClick` renderiza con Web Audio: osciladores, ruido filtrado
 * y envolventes. No hay archivos ni material de terceros.
 */

export const METRONOME_VOICES = [
  "studio",
  "wood",
  "bell",
  "hihat",
  "beep",
  "rimshot",
  "shaker",
] as const;

export type MetronomeVoice = (typeof METRONOME_VOICES)[number];

export const DEFAULT_METRONOME_VOICE: MetronomeVoice = "studio";

import {
  createVoiceRecipe as createRecipe,
  type VoiceRecipe,
} from "./voice-recipe.ts";

export type { VoiceNoise, VoicePartial, VoiceRecipe } from "./voice-recipe.ts";

type VoiceVariants = { normal: VoiceRecipe; accent: VoiceRecipe };

/**
 * Un resalte cerrado es el abierto ahogado y algo más agudo: misma voz, cola
 * cortada y la altura subida un 10 %. Así se distingue del abierto sin ser otro
 * instrumento.
 */
const CLOSED_ACCENT_DECAY_SECONDS = 0.04;
const CLOSED_ACCENT_PITCH_RATIO = 1.1;

export type MetronomeClickKind = "normal" | "accent" | "accentClosed";

function closeAccent(recipe: VoiceRecipe): VoiceRecipe {
  return createRecipe({
    partials: recipe.partials.map((partial) => ({
      ...partial,
      frequency: partial.frequency * CLOSED_ACCENT_PITCH_RATIO,
      decaySeconds: Math.min(
        partial.decaySeconds,
        CLOSED_ACCENT_DECAY_SECONDS,
      ),
    })),
    ...(recipe.noise
      ? {
          noise: {
            ...recipe.noise,
            frequency: recipe.noise.frequency * CLOSED_ACCENT_PITCH_RATIO,
            decaySeconds: Math.min(
              recipe.noise.decaySeconds,
              CLOSED_ACCENT_DECAY_SECONDS,
            ),
          },
        }
      : {}),
  });
}

/**
 * Los acentos conservan el timbre de la voz y suben el brillo y la ganancia:
 * nunca cambian de instrumento.
 */
const VOICE_RECIPES: Record<MetronomeVoice, VoiceVariants> = {
  studio: {
    normal: createRecipe({
      partials: [{ type: "sine", frequency: 760, gain: 0.66, decaySeconds: 0.075 }],
    }),
    accent: createRecipe({
      partials: [{ type: "sine", frequency: 1_000, gain: 1, decaySeconds: 0.075 }],
    }),
  },
  // Modos inarmónicos muy cortos y un chasquido de ruido: el ataque seco y la
  // ausencia de cola son lo que lo separa de un beep.
  wood: {
    normal: createRecipe({
      partials: [
        { type: "sine", frequency: 880, gain: 0.26, decaySeconds: 0.045 },
        { type: "sine", frequency: 1_320, gain: 0.15, decaySeconds: 0.035 },
        { type: "sine", frequency: 2_050, gain: 0.09, decaySeconds: 0.022 },
      ],
      noise: {
        filterType: "highpass",
        frequency: 5_000,
        q: 0.7,
        gain: 0.1,
        attackSeconds: 0.001,
        decaySeconds: 0.012,
      },
    }),
    accent: createRecipe({
      partials: [
        { type: "sine", frequency: 1_126.4, gain: 0.416, decaySeconds: 0.045 },
        { type: "sine", frequency: 1_689.6, gain: 0.24, decaySeconds: 0.035 },
        { type: "sine", frequency: 2_624, gain: 0.144, decaySeconds: 0.022 },
      ],
      noise: {
        filterType: "highpass",
        frequency: 6_400,
        q: 0.7,
        gain: 0.16,
        attackSeconds: 0.001,
        decaySeconds: 0.012,
      },
    }),
  },
  // Cinco parciales inarmónicos (1 / 2 / 2,4 / 3 / 4,2) con colas largas: los
  // ratios inarmónicos producen el "ding" metálico.
  bell: {
    normal: createRecipe({
      partials: [
        { type: "sine", frequency: 980, gain: 0.2, decaySeconds: 0.6 },
        { type: "sine", frequency: 1_960, gain: 0.11, decaySeconds: 0.5 },
        { type: "sine", frequency: 2_352, gain: 0.09, decaySeconds: 0.42 },
        { type: "sine", frequency: 2_940, gain: 0.06, decaySeconds: 0.34 },
        { type: "sine", frequency: 4_116, gain: 0.04, decaySeconds: 0.26 },
      ],
    }),
    accent: createRecipe({
      partials: [
        { type: "sine", frequency: 1_180, gain: 0.33, decaySeconds: 0.6 },
        { type: "sine", frequency: 2_360, gain: 0.1815, decaySeconds: 0.5 },
        { type: "sine", frequency: 2_832, gain: 0.1485, decaySeconds: 0.42 },
        { type: "sine", frequency: 3_540, gain: 0.099, decaySeconds: 0.34 },
        { type: "sine", frequency: 4_956, gain: 0.066, decaySeconds: 0.26 },
      ],
    }),
  },
  // Ruido muy corto más cuadradas inarmónicas agudas: el ruido da el soplido y
  // las cuadradas, el brillo metálico del charles.
  hihat: {
    normal: createRecipe({
      partials: [
        { type: "square", frequency: 7_400, gain: 0.05, decaySeconds: 0.04 },
        { type: "square", frequency: 8_230, gain: 0.05, decaySeconds: 0.04 },
        { type: "square", frequency: 9_560, gain: 0.05, decaySeconds: 0.04 },
        { type: "square", frequency: 11_020, gain: 0.05, decaySeconds: 0.04 },
        { type: "square", frequency: 12_700, gain: 0.05, decaySeconds: 0.04 },
      ],
      noise: {
        filterType: "highpass",
        frequency: 9_000,
        q: 0.9,
        gain: 0.2,
        attackSeconds: 0.001,
        decaySeconds: 0.05,
      },
    }),
    accent: createRecipe({
      partials: [
        { type: "square", frequency: 8_290, gain: 0.084, decaySeconds: 0.04 },
        { type: "square", frequency: 9_218, gain: 0.084, decaySeconds: 0.04 },
        { type: "square", frequency: 10_707, gain: 0.084, decaySeconds: 0.04 },
        { type: "square", frequency: 12_342, gain: 0.084, decaySeconds: 0.04 },
        { type: "square", frequency: 14_224, gain: 0.084, decaySeconds: 0.04 },
      ],
      noise: {
        filterType: "highpass",
        frequency: 10_500,
        q: 0.9,
        gain: 0.33,
        attackSeconds: 0.001,
        decaySeconds: 0.05,
      },
    }),
  },
  beep: {
    normal: createRecipe({
      partials: [
        { type: "square", frequency: 880, gain: 0.3, decaySeconds: 0.06 },
      ],
    }),
    accent: createRecipe({
      partials: [
        { type: "square", frequency: 1_046, gain: 0.5, decaySeconds: 0.06 },
      ],
    }),
  },
  rimshot: {
    normal: createRecipe({
      partials: [
        { type: "sine", frequency: 420, gain: 0.28, decaySeconds: 0.09 },
      ],
      noise: {
        filterType: "bandpass",
        frequency: 1_800,
        q: 3,
        gain: 0.27,
        attackSeconds: 0.001,
        decaySeconds: 0.05,
      },
    }),
    accent: createRecipe({
      partials: [
        { type: "sine", frequency: 520, gain: 0.46, decaySeconds: 0.09 },
      ],
      noise: {
        filterType: "bandpass",
        frequency: 2_200,
        q: 3,
        gain: 0.46,
        attackSeconds: 0.001,
        decaySeconds: 0.05,
      },
    }),
  },
  shaker: {
    normal: createRecipe({
      partials: [],
      noise: {
        filterType: "bandpass",
        frequency: 5_200,
        q: 1.2,
        gain: 0.45,
        attackSeconds: 0.006,
        decaySeconds: 0.11,
      },
    }),
    accent: createRecipe({
      partials: [],
      noise: {
        filterType: "bandpass",
        frequency: 6_200,
        q: 1.2,
        gain: 0.75,
        attackSeconds: 0.006,
        decaySeconds: 0.11,
      },
    }),
  },
};

export function isMetronomeVoice(value: unknown): value is MetronomeVoice {
  return (
    typeof value === "string" &&
    (METRONOME_VOICES as readonly string[]).includes(value)
  );
}

/** Una voz desconocida o ausente vuelve al clic limpio, sin romper el metrónomo. */
export function normalizeMetronomeVoice(value: unknown): MetronomeVoice {
  return isMetronomeVoice(value) ? value : DEFAULT_METRONOME_VOICE;
}

export function getVoiceRecipe(
  voice: MetronomeVoice,
  kind: MetronomeClickKind,
): VoiceRecipe {
  const variants = VOICE_RECIPES[voice];
  if (kind === "accentClosed") return closeAccent(variants.accent);

  return kind === "accent" ? variants.accent : variants.normal;
}

/**
 * Recetas de síntesis compartidas por el metrónomo y los avisos de práctica:
 * parciales con su envolvente y, opcionalmente, una capa de ruido filtrado.
 */

/** Ataque de la mayoría de los golpes: lo justo para evitar un chasquido. */
export const DEFAULT_ATTACK_SECONDS = 0.004;

export type VoicePartial = {
  type: OscillatorType;
  frequency: number;
  /** Ganancia de pico, relativa al volumen del sonido. */
  gain: number;
  attackSeconds?: number;
  decaySeconds: number;
  delaySeconds?: number;
};

export type VoiceNoise = {
  filterType: BiquadFilterType;
  frequency: number;
  q: number;
  gain: number;
  attackSeconds: number;
  decaySeconds: number;
};

export type VoiceRecipe = {
  durationSeconds: number;
  partials: VoicePartial[];
  noise?: VoiceNoise;
};

export type VoiceRecipeInput = Omit<VoiceRecipe, "durationSeconds">;

function getPartialDuration(partial: VoicePartial) {
  return (
    (partial.delaySeconds ?? 0) +
    (partial.attackSeconds ?? DEFAULT_ATTACK_SECONDS) +
    partial.decaySeconds
  );
}

/** Completa la duración total a partir de la capa más larga. */
export function createVoiceRecipe({
  partials,
  noise,
}: VoiceRecipeInput): VoiceRecipe {
  const durations = partials.map(getPartialDuration);
  if (noise) {
    durations.push(noise.attackSeconds + noise.decaySeconds);
  }

  return {
    durationSeconds: Math.max(...durations),
    partials,
    ...(noise ? { noise } : {}),
  };
}

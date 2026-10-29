import {
  DEFAULT_ATTACK_SECONDS,
  type VoiceNoise,
  type VoicePartial,
  type VoiceRecipe,
} from "../utils/voice-recipe.ts";

/** Duración del ruido compartido: cubre de sobra cualquier receta. */
const NOISE_BUFFER_SECONDS = 0.5;
/** Un valor positivo evita que la rampa exponencial reciba cero. */
const SILENCE_GAIN = 0.0001;

/**
 * Un buffer de ruido por contexto: el hi-hat, el shaker y el rimshot comparten
 * la misma muestra y cada golpe solo crea su fuente, su filtro y su ganancia.
 */
const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

function getNoiseBuffer(context: BaseAudioContext): AudioBuffer {
  const cached = noiseBuffers.get(context);
  if (cached) return cached;

  const length = Math.max(
    1,
    Math.ceil(context.sampleRate * NOISE_BUFFER_SECONDS),
  );
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  noiseBuffers.set(context, buffer);
  return buffer;
}

function connectEnvelope(
  gain: GainNode,
  scheduledAt: number,
  attackSeconds: number,
  decaySeconds: number,
  peakGain: number,
) {
  const peakAt = scheduledAt + attackSeconds;
  const endAt = peakAt + decaySeconds;

  gain.gain.setValueAtTime(SILENCE_GAIN, scheduledAt);
  gain.gain.linearRampToValueAtTime(Math.max(SILENCE_GAIN, peakGain), peakAt);
  gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, endAt);

  return endAt;
}

function startSource(
  source: AudioScheduledSourceNode,
  nodes: AudioNode[],
  activeSources: Set<AudioScheduledSourceNode> | undefined,
  startAt: number,
  stopAt: number,
) {
  activeSources?.add(source);
  source.addEventListener(
    "ended",
    () => {
      activeSources?.delete(source);
      source.disconnect();
      for (const node of nodes) node.disconnect();
    },
    { once: true },
  );
  source.start(startAt);
  source.stop(stopAt);
}

function schedulePartial(
  context: AudioContext,
  partial: VoicePartial,
  scheduledAt: number,
  volume: number,
  destination: AudioNode,
  activeSources: Set<AudioScheduledSourceNode> | undefined,
) {
  const startAt = scheduledAt + (partial.delaySeconds ?? 0);
  const attackSeconds = partial.attackSeconds ?? DEFAULT_ATTACK_SECONDS;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = partial.type;
  oscillator.frequency.setValueAtTime(partial.frequency, startAt);
  const endAt = connectEnvelope(
    gain,
    startAt,
    attackSeconds,
    partial.decaySeconds,
    partial.gain * volume,
  );

  oscillator.connect(gain);
  gain.connect(destination);
  startSource(oscillator, [gain], activeSources, startAt, endAt);
}

function scheduleNoise(
  context: AudioContext,
  noise: VoiceNoise,
  scheduledAt: number,
  volume: number,
  destination: AudioNode,
  activeSources: Set<AudioScheduledSourceNode> | undefined,
) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = getNoiseBuffer(context);
  filter.type = noise.filterType;
  filter.frequency.setValueAtTime(noise.frequency, scheduledAt);
  filter.Q.setValueAtTime(noise.q, scheduledAt);
  const endAt = connectEnvelope(
    gain,
    scheduledAt,
    noise.attackSeconds,
    noise.decaySeconds,
    noise.gain * volume,
  );

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  startSource(source, [filter, gain], activeSources, scheduledAt, endAt);
}

export interface ScheduleVoiceRecipeInput {
  context: AudioContext;
  recipe: VoiceRecipe;
  scheduledAt: number;
  volume: number;
  /** Por defecto, la salida del contexto. */
  destination?: AudioNode;
  /** Si se pasa, permite detener las fuentes vivas más tarde. */
  activeSources?: Set<AudioScheduledSourceNode>;
}

/**
 * Programa una receta completa: una fuente por parcial y, si la receta lo
 * pide, una capa de ruido filtrado.
 */
export function scheduleVoiceRecipe({
  context,
  recipe,
  scheduledAt,
  volume,
  destination = context.destination,
  activeSources,
}: ScheduleVoiceRecipeInput) {
  if (volume === 0) return;

  for (const partial of recipe.partials) {
    schedulePartial(
      context,
      partial,
      scheduledAt,
      volume,
      destination,
      activeSources,
    );
  }
  if (recipe.noise) {
    scheduleNoise(
      context,
      recipe.noise,
      scheduledAt,
      volume,
      destination,
      activeSources,
    );
  }
}

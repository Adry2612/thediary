import { enablePlaybackAudioSession } from "./audio-session.ts";
import { scheduleVoiceRecipe } from "./voice-synth.ts";
import {
  getPracticeSoundInstrument,
  getPracticeStrike,
  type PracticeMoment,
  type PracticeSound,
} from "../utils/practice-sounds.ts";

/** Pequeño margen para no programar en el pasado. */
const SCHEDULE_DELAY_SECONDS = 0.02;

export interface PracticeSoundScheduler {
  play: (sound: PracticeSound, moment: PracticeMoment) => void;
  /** Corta lo que esté sonando, por ejemplo al salir de la práctica. */
  stop: () => void;
}

type CreateSchedulerInput = {
  context: AudioContext;
  volume?: number;
};

export function createPracticeSoundScheduler({
  context,
  volume = 1,
}: CreateSchedulerInput): PracticeSoundScheduler {
  const activeSources = new Set<AudioScheduledSourceNode>();

  function stop() {
    for (const source of activeSources) source.stop();
    activeSources.clear();
  }

  function play(sound: PracticeSound, moment: PracticeMoment) {
    stop();

    const instrument = getPracticeSoundInstrument(sound);
    const notes =
      moment === "start" ? instrument.startNotes : instrument.endNotes;
    const gap =
      moment === "start"
        ? instrument.startGapSeconds
        : instrument.endGapSeconds;
    const tail =
      moment === "start" ? instrument.startTailSeconds : undefined;
    const scheduledAt = context.currentTime + SCHEDULE_DELAY_SECONDS;

    notes.forEach((frequency, index) => {
      scheduleVoiceRecipe({
        context,
        recipe: getPracticeStrike(sound, frequency, tail),
        scheduledAt: scheduledAt + index * gap,
        volume: instrument.gain * volume,
        activeSources,
      });
    });
  }

  return { play, stop };
}

let sharedContext: AudioContext | null = null;
let sharedScheduler: PracticeSoundScheduler | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioContextCtor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!sharedContext) sharedContext = new AudioContextCtor();
  return sharedContext;
}

/** Reproduce el aviso en el contexto compartido, creándolo si hace falta. */
export function playPracticeSound(
  sound: PracticeSound,
  moment: PracticeMoment,
): void {
  enablePlaybackAudioSession();

  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") void context.resume();
  if (!sharedScheduler) {
    sharedScheduler = createPracticeSoundScheduler({ context });
  }

  sharedScheduler.play(sound, moment);
}

/** Corta el aviso en curso, si lo hay. */
export function stopPracticeSounds(): void {
  sharedScheduler?.stop();
}

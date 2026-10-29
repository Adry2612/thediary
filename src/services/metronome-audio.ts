import {
  getVoiceRecipe,
  type MetronomeClickKind,
  type MetronomeVoice,
} from "../utils/metronome-voice.ts";
import { scheduleVoiceRecipe } from "./voice-synth.ts";

interface ScheduleMetronomeClickInput {
  context: AudioContext;
  scheduledAt: number;
  volume: number;
  /** Voz elegida en los ajustes; decide el timbre. */
  voice: MetronomeVoice;
  /** Normal, resalte abierto o resalte cerrado. */
  click: MetronomeClickKind;
  activeSources: Set<AudioScheduledSourceNode>;
}

export function scheduleMetronomeClick({
  context,
  scheduledAt,
  volume,
  voice,
  click,
  activeSources,
}: ScheduleMetronomeClickInput) {
  if (volume === 0) return;

  scheduleVoiceRecipe({
    context,
    recipe: getVoiceRecipe(voice, click),
    scheduledAt,
    volume,
    activeSources,
  });
}

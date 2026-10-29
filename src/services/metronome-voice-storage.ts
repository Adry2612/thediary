import {
  normalizeMetronomeVoice,
  type MetronomeVoice,
} from "@/utils/metronome-voice";

const STORAGE_KEY = "thediary.metronome-voice";

/** Voz elegida en el dispositivo; el clic limpio si falta o no se puede leer. */
export function readMetronomeVoice(): MetronomeVoice {
  if (typeof window === "undefined") return normalizeMetronomeVoice(null);

  try {
    return normalizeMetronomeVoice(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return normalizeMetronomeVoice(null);
  }
}

export function saveMetronomeVoice(voice: MetronomeVoice): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, normalizeMetronomeVoice(voice));
  } catch {
    // La preferencia es opcional: el metrónomo sigue sonando con esta voz.
  }
}

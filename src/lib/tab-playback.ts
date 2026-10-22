import { parseTuningNotes, STRING_COUNT } from "./chords.ts";
import type { RepertoireTab } from "@/types/practice";

/**
 * Altura MIDI de cada cuerda al aire en afinación estándar, de la 6ª a la 1ª.
 * Se usa como referencia para elegir la octava de afinaciones alternativas.
 */
const STANDARD_OPEN_MIDI = [40, 45, 50, 55, 59, 64];

const PITCH_CLASSES: Record<string, number> = {
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

export function pitchClassToMidi(pitchClass: number, referenceMidi: number) {
  const normalized = ((Math.round(pitchClass) % 12) + 12) % 12;
  const base = referenceMidi - 6;
  const candidate = base + ((normalized - (base % 12) + 12) % 12);
  const candidates = [candidate - 12, candidate, candidate + 12].filter(
    (midi) => midi >= 0 && midi <= 127,
  );
  return candidates.reduce((closest, midi) =>
    Math.abs(midi - referenceMidi) < Math.abs(closest - referenceMidi) ?
      midi
    : closest,
  );
}

/** Devuelve la altura MIDI de cada cuerda al aire, de la 6ª a la 1ª. */
export function getTabTuningMidi(tuning: string): number[] {
  const notes = parseTuningNotes(tuning);
  return Array.from({ length: STRING_COUNT }, (_, index) => {
    const pitchClass = PITCH_CLASSES[notes[index]];
    if (pitchClass === undefined) return STANDARD_OPEN_MIDI[index];
    return pitchClassToMidi(pitchClass, STANDARD_OPEN_MIDI[index]);
  });
}

/** Segundos que ocupa una columna de la rejilla para un tempo y resolución. */
export function getTabColumnSeconds(tab: RepertoireTab, bpm: number): number {
  const safeBpm = Number.isFinite(bpm) && bpm > 0 ? bpm : 90;
  return (60 / safeBpm) * (4 / tab.subdivision);
}

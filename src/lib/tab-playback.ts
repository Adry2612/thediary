import { parseTuningNotes, STRING_COUNT } from "./chords.ts";
import { getTabColumns } from "./repertoire-tab.ts";
import type { RepertoireTab, RepertoireTabNote } from "@/types/practice";

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

export interface TabPlaybackEvent {
  /** Momento del ataque, en segundos desde el inicio de la tablatura. */
  time: number;
  /** Columna rítmica de la nota. */
  column: number;
  /** Duración aproximada, en segundos. */
  duration: number;
  midi: number;
  string: number;
  note: RepertoireTabNote;
}

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

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Segundos que ocupa una columna de la rejilla para un tempo y resolución. */
export function getTabColumnSeconds(tab: RepertoireTab, bpm: number): number {
  const safeBpm = Number.isFinite(bpm) && bpm > 0 ? bpm : 90;
  return (60 / safeBpm) * (4 / tab.subdivision);
}

/**
 * Convierte la tablatura en una lista de ataques. La duración se corta en la
 * siguiente nota de la misma cuerda, para que las cuerdas puedan sonar juntas
 * sin solaparse indefinidamente.
 */
export function getTabPlaybackEvents(
  tab: RepertoireTab,
  bpm: number,
): TabPlaybackEvent[] {
  const columnSeconds = getTabColumnSeconds(tab, bpm);
  const totalColumns = getTabColumns(tab);
  const tuningMidi = getTabTuningMidi(tab.tuning);
  const notesByString = new Map<number, RepertoireTabNote[]>();

  for (const note of tab.notes) {
    const notes = notesByString.get(note.string) ?? [];
    notes.push(note);
    notesByString.set(note.string, notes);
  }
  for (const notes of notesByString.values()) {
    notes.sort((left, right) => left.column - right.column);
  }

  const events: TabPlaybackEvent[] = [];
  for (const note of tab.notes) {
    const stringNotes = notesByString.get(note.string) ?? [];
    const next = stringNotes.find(
      (candidate) => candidate.column > note.column,
    );
    const gapColumns = next ?
      next.column - note.column
    : Math.max(1, totalColumns - note.column);
    const maxSustainColumns = note.letRing ? 8 : 4;
    const durationColumns = Math.max(1, Math.min(gapColumns, maxSustainColumns));
    let duration = durationColumns * columnSeconds;
    if (note.palmMute) duration = Math.min(duration, columnSeconds * 0.9);
    if (note.dead) duration = Math.min(duration, 0.08);

    const harmonicOffset = note.harmonic ? 12 : 0;
    events.push({
      time: note.column * columnSeconds,
      column: note.column,
      duration: Math.max(0.05, duration),
      midi: tuningMidi[note.string] + note.fret + harmonicOffset,
      string: note.string,
      note,
    });
  }

  return events.sort(
    (left, right) =>
      left.time - right.time ||
      left.string - right.string ||
      left.column - right.column,
  );
}

export function getTabPlaybackDuration(
  tab: RepertoireTab,
  bpm: number,
): number {
  return getTabColumns(tab) * getTabColumnSeconds(tab, bpm);
}

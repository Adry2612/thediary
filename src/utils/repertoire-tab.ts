import type {
  RepertoireTab,
  RepertoireTabNote,
  TabBend,
  TabHarmonic,
  TabLegato,
  TabSlide,
  TabVibrato,
} from "../types/practice.ts";
import { parseTuningNotes, STRING_COUNT } from "./chords.ts";

/**
 * Lectura y normalización de la tablatura de rejilla. El editor de rejilla ya
 * no existe: este módulo se conserva para migrar los datos guardados a
 * partitura sin perder notas ni técnicas.
 */

export const MIN_MEASURES = 1;
export const MAX_MEASURES = 64;
export const MAX_FRET = 24;

export const TAB_SUBDIVISIONS = [4, 8, 16] as const;
export type TabSubdivision = (typeof TAB_SUBDIVISIONS)[number];

/** Semitonos admitidos en un bend. */
export const TAB_BEND_AMOUNTS = [0.25, 0.5, 1, 1.5, 2] as const;

export function isTabBendAmount(value: number): boolean {
  return TAB_BEND_AMOUNTS.some((amount) => amount === value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isTabSubdivision(value: number): value is TabSubdivision {
  return TAB_SUBDIVISIONS.some((subdivision) => subdivision === value);
}

export function createEmptyTab(tuning?: string): RepertoireTab {
  return {
    tuning: parseTuningNotes(tuning).join(""),
    measures: 2,
    subdivision: 16,
    notes: [],
  };
}

const TAB_LEGATOS: readonly TabLegato[] = ["hammer", "pull"];
const TAB_SLIDES: readonly TabSlide[] = ["up", "down", "position"];
const TAB_VIBRATOS: readonly TabVibrato[] = ["slight", "wide"];
const TAB_HARMONICS: readonly TabHarmonic[] = [
  "natural",
  "artificial",
  "pinch",
  "tap",
];
const TAB_FLAG_KEYS = [
  "palmMute",
  "letRing",
  "tapping",
  "dead",
  "tremoloPicking",
  "trill",
  "slap",
  "pop",
] as const;

/** Valida el bend de una nota guardada; devuelve `undefined` si no es utilizable. */
export function normalizeTabBend(value: unknown): TabBend | undefined {
  if (!value || typeof value !== "object") return undefined;
  const bend = value as Partial<TabBend>;
  if (typeof bend.semitones !== "number" || !isTabBendAmount(bend.semitones)) {
    return undefined;
  }
  const next: TabBend = { semitones: bend.semitones };
  if (bend.release === true) next.release = true;
  if (bend.prebend === true) next.prebend = true;
  return next;
}

/**
 * Conserva de una nota guardada su cuerda, traste y columna, y solo los valores
 * de técnica que entiende: un valor desconocido se descarta sin perder la nota.
 */
export function normalizeTabTechniques(
  note: RepertoireTabNote,
): RepertoireTabNote {
  const next: RepertoireTabNote = {
    string: note.string,
    fret: note.fret,
    column: note.column,
  };
  if (note.legato && TAB_LEGATOS.includes(note.legato)) {
    next.legato = note.legato;
  }
  if (note.slide && TAB_SLIDES.includes(note.slide)) {
    next.slide = note.slide;
  }
  if (note.vibrato && TAB_VIBRATOS.includes(note.vibrato)) {
    next.vibrato = note.vibrato;
  }
  if (note.harmonic && TAB_HARMONICS.includes(note.harmonic)) {
    next.harmonic = note.harmonic;
  }
  const bend = normalizeTabBend(note.bend);
  if (bend) next.bend = bend;
  for (const key of TAB_FLAG_KEYS) {
    if (note[key] === true) next[key] = true;
  }
  return next;
}

/** Nota anterior más cercana en la misma cuerda, si existe. */
function findPreviousTabNote(
  tab: RepertoireTab,
  string: number,
  column: number,
): RepertoireTabNote | undefined {
  let previous: RepertoireTabNote | undefined;
  for (const note of tab.notes) {
    if (note.string !== string || note.column >= column) continue;
    if (!previous || note.column > previous.column) previous = note;
  }
  return previous;
}

/** Quita los ligados y deslizamientos cuya nota de origen ya no existe. */
function pruneTabTransitions(tab: RepertoireTab): RepertoireTab {
  let changed = false;
  const notes = tab.notes.map((note) => {
    if (!note.legato && !note.slide) return note;
    if (findPreviousTabNote(tab, note.string, note.column)) return note;
    changed = true;
    const next = { ...note };
    delete next.legato;
    delete next.slide;
    return next;
  });
  return changed ? { ...tab, notes } : tab;
}

export function normalizeTab(
  value: RepertoireTab | undefined,
  tuning?: string,
): RepertoireTab {
  const fallbackTuning = parseTuningNotes(tuning).join("");
  if (!value) return { ...createEmptyTab(tuning), tuning: fallbackTuning };

  const measures = clamp(
    Math.round(value.measures) || 2,
    MIN_MEASURES,
    MAX_MEASURES,
  );
  const subdivision = isTabSubdivision(value.subdivision) ?
    value.subdivision
  : 16;
  const columns = measures * subdivision;

  const byCell = new Map<string, RepertoireTabNote>();
  for (const note of Array.isArray(value.notes) ? value.notes : []) {
    if (
      !note ||
      !Number.isFinite(note.string) ||
      !Number.isFinite(note.column) ||
      !Number.isFinite(note.fret)
    ) {
      continue;
    }
    const string = Math.round(note.string);
    if (string < 0 || string > STRING_COUNT - 1) continue;
    const column = clamp(Math.round(note.column), 0, columns - 1);
    byCell.set(
      `${string}:${column}`,
      normalizeTabTechniques({
        ...note,
        string,
        column,
        fret: clamp(Math.round(note.fret), 0, MAX_FRET),
      }),
    );
  }

  return pruneTabTransitions({
    tuning: value.tuning || fallbackTuning,
    measures,
    subdivision,
    notes: [...byCell.values()],
  });
}

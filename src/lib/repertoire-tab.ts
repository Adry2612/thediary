import type { RepertoireTab, RepertoireTabNote } from "@/types/practice";
import { parseTuningNotes, STRING_COUNT } from "./chords.ts";

export const MIN_MEASURES = 1;
export const MAX_MEASURES = 64;
export const MAX_FRET = 24;

export const TAB_SUBDIVISIONS = [4, 8, 16] as const;
export type TabSubdivision = (typeof TAB_SUBDIVISIONS)[number];

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

export function getTabColumns(tab: RepertoireTab): number {
  return tab.measures * tab.subdivision;
}

export function findTabNote(
  tab: RepertoireTab,
  string: number,
  column: number,
): RepertoireTabNote | undefined {
  return tab.notes.find(
    (note) => note.string === string && note.column === column,
  );
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
    byCell.set(`${string}:${column}`, {
      string,
      column,
      fret: clamp(Math.round(note.fret), 0, MAX_FRET),
    });
  }

  return {
    tuning: value.tuning || fallbackTuning,
    measures,
    subdivision,
    notes: [...byCell.values()],
  };
}

export function setTabNote(
  tab: RepertoireTab,
  string: number,
  column: number,
  fret: number,
): RepertoireTab {
  if (
    string < 0 ||
    string >= STRING_COUNT ||
    column < 0 ||
    column >= getTabColumns(tab) ||
    fret < 0 ||
    fret > MAX_FRET
  ) {
    return tab;
  }
  const notes = tab.notes.filter(
    (note) => !(note.string === string && note.column === column),
  );
  return {
    ...tab,
    notes: [...notes, { string, column, fret: Math.round(fret) }],
  };
}

export function clearTabNote(
  tab: RepertoireTab,
  string: number,
  column: number,
): RepertoireTab {
  return {
    ...tab,
    notes: tab.notes.filter(
      (note) => !(note.string === string && note.column === column),
    ),
  };
}

export function setTabMeasures(
  tab: RepertoireTab,
  measures: number,
): RepertoireTab {
  const next = clamp(Math.round(measures) || 1, MIN_MEASURES, MAX_MEASURES);
  const columns = next * tab.subdivision;
  return {
    ...tab,
    measures: next,
    notes: tab.notes.filter((note) => note.column < columns),
  };
}

/** Cambia la resolución conservando la posición temporal de las notas. */
export function setTabSubdivision(
  tab: RepertoireTab,
  subdivision: number,
): RepertoireTab {
  if (!isTabSubdivision(subdivision) || subdivision === tab.subdivision) {
    return tab;
  }
  const ratio = subdivision / tab.subdivision;
  const columns = tab.measures * subdivision;
  const byCell = new Map<string, RepertoireTabNote>();
  for (const note of tab.notes) {
    const column = clamp(Math.round(note.column * ratio), 0, columns - 1);
    byCell.set(`${note.string}:${column}`, { ...note, column });
  }
  return { ...tab, subdivision, notes: [...byCell.values()] };
}

export function isMeasureStart(tab: RepertoireTab, column: number): boolean {
  return column > 0 && column % tab.subdivision === 0;
}

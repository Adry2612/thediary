import type {
  RepertoireTab,
  RepertoireTabNote,
} from "../../types/practice.ts";
import type {
  TabBar,
  TabBeat,
  TabBeatDuration,
  TabNote,
  TabScore,
} from "../../types/tab-score.ts";
import { TAB_TICKS_PER_QUARTER } from "../../types/tab-score.ts";
import { normalizeTab } from "../repertoire-tab.ts";
import { createRestBeats, createTabId, createEmptyScore } from "./model.ts";
import { getTimeSignatureTicks } from "./ticks.ts";

type TickPiece = {
  duration: TabBeatDuration;
  ticks: number;
  dots?: 1;
};

const TICK_PIECES: TickPiece[] = [
  { duration: 1, ticks: 3840 },
  { duration: 2, ticks: 2880, dots: 1 },
  { duration: 2, ticks: 1920 },
  { duration: 4, ticks: 1440, dots: 1 },
  { duration: 4, ticks: 960 },
  { duration: 8, ticks: 720, dots: 1 },
  { duration: 8, ticks: 480 },
  { duration: 16, ticks: 360, dots: 1 },
  { duration: 16, ticks: 240 },
  { duration: 32, ticks: 180, dots: 1 },
  { duration: 32, ticks: 120 },
  { duration: 64, ticks: 90, dots: 1 },
  { duration: 64, ticks: 60 },
];

function decomposeTicks(ticks: number): TickPiece[] {
  const pieces: TickPiece[] = [];
  let remaining = ticks;

  while (remaining >= 60) {
    const piece =
      TICK_PIECES.find((entry) => entry.ticks <= remaining) ??
      TICK_PIECES[TICK_PIECES.length - 1];
    pieces.push(piece);
    remaining -= piece.ticks;
  }

  return pieces;
}

function toScoreNote(note: RepertoireTabNote): TabNote {
  const result: TabNote = { string: note.string, fret: note.fret };

  if (note.legato) result.legato = note.legato;
  if (note.slide) result.slide = note.slide;
  if (note.bend) result.bend = { ...note.bend };
  if (note.vibrato) result.vibrato = note.vibrato;
  if (note.palmMute) result.palmMute = true;
  if (note.letRing) result.letRing = true;
  if (note.tapping) result.tapping = true;
  if (note.harmonic) result.harmonic = note.harmonic;
  if (note.dead) result.dead = true;
  if (note.tremoloPicking) result.tremoloPicking = true;
  if (note.trill) result.trill = true;
  if (note.slap) result.slap = true;
  if (note.pop) result.pop = true;

  return result;
}

function pushPieces(
  beats: TabBeat[],
  pieces: TickPiece[],
  notes: TabNote[],
): void {
  pieces.forEach((piece, index) => {
    beats.push({
      id: createTabId("beat"),
      duration: piece.duration,
      ...(piece.dots ? { dots: piece.dots } : {}),
      rest: index > 0,
      notes: index === 0 ? notes : [],
    });
  });
}

/**
 * Convierte una tablatura de rejilla en partitura. Conserva la posición de cada
 * nota, agrupa las notas de una misma columna en un pulso y reparte el tiempo
 * hasta la siguiente nota o el final del compás.
 */
export function migrateGridTab(
  tab: RepertoireTab | undefined,
  tuning?: string,
): TabScore {
  if (!tab) return createEmptyScore(tuning ?? "EADGBE");

  const normalized = normalizeTab(tab, tuning);
  const measureTicks = getTimeSignatureTicks({
    numerator: 4,
    denominator: 4,
  });
  const columns = normalized.subdivision;
  const ticksPerColumn = measureTicks / columns;
  const bars: TabBar[] = [];

  for (let measure = 0; measure < normalized.measures; measure++) {
    const start = measure * columns;
    const end = start + columns;
    const byColumn = new Map<number, TabNote[]>();

    for (const note of normalized.notes) {
      if (note.column < start || note.column >= end) continue;
      const column = note.column - start;
      const notes = byColumn.get(column) ?? [];
      notes.push(toScoreNote(note));
      byColumn.set(column, notes);
    }

    const occupied = [...byColumn.keys()].sort((first, second) => first - second);
    const beats: TabBeat[] = [];

    if (occupied.length === 0) {
      beats.push(...createRestBeats(measureTicks));
    } else {
      const firstGap = occupied[0] * ticksPerColumn;
      beats.push(...createRestBeats(firstGap));

      occupied.forEach((column, index) => {
        const next = index + 1 < occupied.length ? occupied[index + 1] : columns;
        const ticks = Math.max(0, (next - column) * ticksPerColumn);
        const pieces = decomposeTicks(ticks);
        if (pieces.length === 0) return;
        pushPieces(beats, pieces, byColumn.get(column) ?? []);
      });
    }

    bars.push({
      id: createTabId("bar"),
      ...(measure === 0
        ? { timeSignature: { numerator: 4, denominator: 4 } }
        : {}),
      beats,
    });
  }

  return {
    version: 2,
    tuning: normalized.tuning || tuning || "EADGBE",
    tempo: 90,
    bars,
  };
}

/** Ticks que ocupa una columna de la rejilla, útil para las pruebas. */
export function getGridColumnTicks(subdivision: number): number {
  return (TAB_TICKS_PER_QUARTER * 4) / subdivision;
}

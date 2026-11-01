import type { TabBar, TabBeat, TabNote, TabScore } from "../../types/tab-score.ts";
import { getStringCount } from "./model.ts";

export type TabPosition = {
  bar: number;
  beat: number;
  string: number;
};

export type TabSelection = TabPosition & {
  anchor?: TabPosition;
};

export type TabMoveDirection = "left" | "right" | "up" | "down";

export function makeSelection(
  bar: number,
  beat: number,
  string: number,
): TabSelection {
  return { bar, beat, string };
}

export function clampPosition(
  score: Pick<TabScore, "bars" | "tuning">,
  position: TabPosition,
): TabPosition {
  const barIndex = Math.min(
    Math.max(0, position.bar),
    Math.max(0, score.bars.length - 1),
  );
  const bar = score.bars[barIndex];
  const beatIndex =
    bar && bar.beats.length > 0
      ? Math.min(Math.max(0, position.beat), bar.beats.length - 1)
      : 0;
  const stringIndex = Math.min(
    Math.max(0, position.string),
    getStringCount(score.tuning) - 1,
  );

  return { bar: barIndex, beat: beatIndex, string: stringIndex };
}

export function clampSelection(
  score: Pick<TabScore, "bars" | "tuning">,
  selection: TabSelection,
): TabSelection {
  const focus = clampPosition(score, selection);
  if (!selection.anchor) return focus;
  return { ...focus, anchor: clampPosition(score, selection.anchor) };
}

export function getBeatAt(
  score: Pick<TabScore, "bars">,
  barIndex: number,
  beatIndex: number,
): TabBeat | null {
  return score.bars[barIndex]?.beats[beatIndex] ?? null;
}

export function getNoteAt(beat: TabBeat | null, string: number): TabNote | null {
  return beat?.notes.find((note) => note.string === string) ?? null;
}

function comparePositions(a: TabPosition, b: TabPosition): number {
  if (a.bar !== b.bar) return a.bar - b.bar;
  if (a.beat !== b.beat) return a.beat - b.beat;
  return a.string - b.string;
}

/** Pulsos cubiertos por la selección, en orden y sin repetir. */
export function getRangeBeats(
  score: Pick<TabScore, "bars">,
  selection: TabSelection,
): { bar: number; beat: number }[] {
  const focus: TabPosition = {
    bar: selection.bar,
    beat: selection.beat,
    string: selection.string,
  };
  const other = selection.anchor ?? focus;
  const start = comparePositions(other, focus) <= 0 ? other : focus;
  const end = start === other ? focus : other;
  const positions: { bar: number; beat: number }[] = [];

  for (let barIndex = start.bar; barIndex <= end.bar; barIndex++) {
    const bar = score.bars[barIndex];
    if (!bar) continue;
    const first = barIndex === start.bar ? start.beat : 0;
    const last = barIndex === end.bar ? end.beat : bar.beats.length - 1;
    for (let beatIndex = first; beatIndex <= last; beatIndex++) {
      if (bar.beats[beatIndex]) positions.push({ bar: barIndex, beat: beatIndex });
    }
  }

  return positions;
}

/** Notas cubiertas por la selección: pulsos del tramo y cuerdas entre ancla y foco. */
export function getSelectedNotes(
  score: Pick<TabScore, "bars">,
  selection: TabSelection,
): { bar: number; beat: number; string: number }[] {
  const focus = {
    bar: selection.bar,
    beat: selection.beat,
    string: selection.string,
  };
  const other = selection.anchor ?? focus;
  // Un arrastre horizontal (misma cuerda) marca la frase completa, aunque las
  // notas salten de cuerda; uno diagonal marca solo el rectángulo.
  const horizontal = selection.anchor !== undefined && other.string === focus.string;
  const firstString = Math.min(other.string, focus.string);
  const lastString = Math.max(other.string, focus.string);
  const notes: { bar: number; beat: number; string: number }[] = [];

  for (const position of getRangeBeats(score, selection)) {
    const beat = getBeatAt(score, position.bar, position.beat);
    if (!beat) continue;
    for (const note of beat.notes) {
      if (
        horizontal ||
        (note.string >= firstString && note.string <= lastString)
      ) {
        notes.push({ ...position, string: note.string });
      }
    }
  }

  return notes;
}

function firstBeatBar(
  bars: TabBar[],
  from: number,
  direction: 1 | -1,
): number | null {
  for (let index = from; index >= 0 && index < bars.length; index += direction) {
    if (bars[index].beats.length > 0) return index;
  }
  return null;
}

export function moveSelection(
  score: Pick<TabScore, "bars" | "tuning">,
  selection: TabSelection,
  direction: TabMoveDirection,
  extend: boolean,
): TabSelection {
  const current = clampPosition(score, selection);
  let next: TabPosition = { ...current };

  if (direction === "up" || direction === "down") {
    const stringCount = getStringCount(score.tuning);
    const delta = direction === "up" ? -1 : 1;
    next.string = Math.min(Math.max(0, current.string + delta), stringCount - 1);
  } else if (direction === "right") {
    const bar = score.bars[current.bar];
    if (bar && current.beat + 1 < bar.beats.length) {
      next.beat = current.beat + 1;
    } else {
      const barIndex = firstBeatBar(score.bars, current.bar + 1, 1);
      if (barIndex !== null) {
        next.bar = barIndex;
        next.beat = 0;
      }
    }
  } else {
    const bar = score.bars[current.bar];
    if (bar && current.beat > 0) {
      next.beat = current.beat - 1;
    } else {
      const barIndex = firstBeatBar(score.bars, current.bar - 1, -1);
      if (barIndex !== null) {
        next.bar = barIndex;
        next.beat = score.bars[barIndex].beats.length - 1;
      }
    }
  }

  const result = clampPosition(score, next);
  const anchor = extend
    ? (selection.anchor ?? {
        bar: current.bar,
        beat: current.beat,
        string: current.string,
      })
    : undefined;

  return anchor ? { ...result, anchor } : result;
}

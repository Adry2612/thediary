import type {
  TabBar,
  TabBeat,
  TabNote,
  TabScore,
  TabTimeSignature,
} from "../../types/tab-score.ts";
import type { TabBend } from "../../types/practice.ts";
import {
  TAB_BEAT_DURATIONS,
  TAB_MAX_BARS,
  TAB_MAX_FRET,
  TAB_MAX_TEMPO,
  TAB_MIN_FRET,
  TAB_MIN_TEMPO,
  TAB_TIME_SIGNATURE_DENOMINATORS,
} from "../../types/tab-score.ts";
import {
  cloneTabBar,
  createRestBar,
  createRestBeats,
  createTabId,
  getStringCount,
} from "./model.ts";
import { getTimeSignatureTicks, resolveTimeSignature } from "./ticks.ts";
import {
  clampSelection,
  getBeatAt,
  getNoteAt,
  getRangeBeats,
  type TabSelection,
} from "./selection.ts";

export type TabOperationError =
  | "noSelection"
  | "needsPreviousNote"
  | "invalidFret"
  | "invalidBend"
  | "invalidDuration"
  | "invalidTempo"
  | "invalidTimeSignature"
  | "barLimit";

export type TabOperationResult =
  | { score: TabScore; selection: TabSelection }
  | { error: TabOperationError };

export type TabTechniquePatch = {
  legato?: TabNote["legato"];
  slide?: TabNote["slide"];
  vibrato?: TabNote["vibrato"];
  harmonic?: TabNote["harmonic"];
  accent?: TabNote["accent"];
  bend?: TabBend;
  palmMute?: boolean;
  letRing?: boolean;
  tapping?: boolean;
  tremoloPicking?: boolean;
  trill?: boolean;
  slap?: boolean;
  pop?: boolean;
  dead?: boolean;
  ghost?: boolean;
};

function replaceBeat(
  score: TabScore,
  barIndex: number,
  beatIndex: number,
  updater: (beat: TabBeat) => TabBeat,
): TabScore {
  const bar = score.bars[barIndex];
  const beat = bar?.beats[beatIndex];
  if (!bar || !beat) return score;

  const beats = bar.beats.slice();
  beats[beatIndex] = updater(beat);
  const bars = score.bars.slice();
  bars[barIndex] = { ...bar, beats };
  return { ...score, bars };
}

function replaceBar(
  score: TabScore,
  barIndex: number,
  updater: (bar: TabBar) => TabBar,
): TabScore {
  const bar = score.bars[barIndex];
  if (!bar) return score;
  const bars = score.bars.slice();
  bars[barIndex] = updater(bar);
  return { ...score, bars };
}

function applyToRange(
  score: TabScore,
  selection: TabSelection,
  updater: (beat: TabBeat) => TabBeat,
): TabScore {
  let next = score;
  for (const position of getRangeBeats(score, selection)) {
    next = replaceBeat(next, position.bar, position.beat, updater);
  }
  return next;
}

function previousBeat(
  score: TabScore,
  barIndex: number,
  beatIndex: number,
): { bar: number; beat: number } | null {
  if (beatIndex > 0) return { bar: barIndex, beat: beatIndex - 1 };
  for (let index = barIndex - 1; index >= 0; index--) {
    if (score.bars[index].beats.length > 0) {
      return { bar: index, beat: score.bars[index].beats.length - 1 };
    }
  }
  return null;
}

function nextBeatPosition(
  score: TabScore,
  barIndex: number,
  beatIndex: number,
): { bar: number; beat: number } | null {
  const bar = score.bars[barIndex];
  if (bar && beatIndex + 1 < bar.beats.length) {
    return { bar: barIndex, beat: beatIndex + 1 };
  }
  for (let index = barIndex + 1; index < score.bars.length; index++) {
    if (score.bars[index].beats.length > 0) return { bar: index, beat: 0 };
  }
  return null;
}

function hasPreviousNote(
  score: TabScore,
  barIndex: number,
  beatIndex: number,
  string: number,
): boolean {
  const previous = previousBeat(score, barIndex, beatIndex);
  if (!previous) return false;
  return getNoteAt(getBeatAt(score, previous.bar, previous.beat), string) !== null;
}

function clearTieAfter(
  score: TabScore,
  barIndex: number,
  beatIndex: number,
  string: number,
): TabScore {
  const next = nextBeatPosition(score, barIndex, beatIndex);
  if (!next) return score;
  const beat = getBeatAt(score, next.bar, next.beat);
  const note = getNoteAt(beat, string);
  if (!note?.tie) return score;

  return replaceBeat(score, next.bar, next.beat, (current) => ({
    ...current,
    notes: current.notes.map((entry) =>
      entry.string === string ? { ...entry, tie: undefined } : entry,
    ),
  }));
}

export function writeFret(
  score: TabScore,
  selection: TabSelection,
  fret: number,
): TabOperationResult {
  if (!Number.isInteger(fret) || fret < TAB_MIN_FRET || fret > TAB_MAX_FRET) {
    return { error: "invalidFret" };
  }
  if (
    selection.string < 0 ||
    selection.string >= getStringCount(score.tuning)
  ) {
    return { error: "noSelection" };
  }

  const beat = getBeatAt(score, selection.bar, selection.beat);
  if (!beat) return { error: "noSelection" };

  const notes = beat.notes.slice();
  const index = notes.findIndex((note) => note.string === selection.string);
  if (index >= 0) notes[index] = { ...notes[index], fret };
  else notes.push({ string: selection.string, fret });

  const next = replaceBeat(score, selection.bar, selection.beat, (current) => ({
    ...current,
    rest: false,
    notes,
  }));

  return { score: next, selection: clampSelection(next, selection) };
}

export function deleteNote(
  score: TabScore,
  selection: TabSelection,
): TabOperationResult {
  const beat = getBeatAt(score, selection.bar, selection.beat);
  if (!beat) return { error: "noSelection" };
  if (!getNoteAt(beat, selection.string)) return { error: "noSelection" };

  const notes = beat.notes.filter((note) => note.string !== selection.string);
  let next = replaceBeat(score, selection.bar, selection.beat, (current) => ({
    ...current,
    rest: notes.length === 0,
    notes,
  }));
  next = clearTieAfter(next, selection.bar, selection.beat, selection.string);

  return { score: next, selection: clampSelection(next, selection) };
}

export function deleteBeat(
  score: TabScore,
  selection: TabSelection,
): TabOperationResult {
  const bar = score.bars[selection.bar];
  if (!bar || !bar.beats[selection.beat]) return { error: "noSelection" };

  const beats = bar.beats.filter((_, index) => index !== selection.beat);
  const bars = score.bars.slice();
  bars[selection.bar] = { ...bar, beats };
  const next = { ...score, bars };
  const beat = Math.min(selection.beat, Math.max(0, beats.length - 1));

  return {
    score: next,
    selection: clampSelection(next, { ...selection, beat }),
  };
}

export function setRest(
  score: TabScore,
  selection: TabSelection,
): TabOperationResult {
  const next = applyToRange(score, selection, (beat) => ({
    ...beat,
    rest: true,
    notes: [],
  }));

  return { score: next, selection: clampSelection(next, selection) };
}

export function setDuration(
  score: TabScore,
  selection: TabSelection,
  duration: number,
): TabOperationResult {
  if (!(TAB_BEAT_DURATIONS as readonly number[]).includes(duration)) {
    return { error: "invalidDuration" };
  }

  const next = applyToRange(score, selection, (beat) => ({
    ...beat,
    duration: duration as TabBeat["duration"],
  }));

  return { score: next, selection: clampSelection(next, selection) };
}

export function setDots(
  score: TabScore,
  selection: TabSelection,
  dots: 0 | 1,
): TabOperationResult {
  const next = applyToRange(score, selection, (beat) => {
    const copy = { ...beat };
    if (dots === 1) copy.dots = 1;
    else delete copy.dots;
    return copy;
  });

  return { score: next, selection: clampSelection(next, selection) };
}

export function setTuplet(
  score: TabScore,
  selection: TabSelection,
  tuplet: 0 | 3,
): TabOperationResult {
  const next = applyToRange(score, selection, (beat) => {
    const copy = { ...beat };
    if (tuplet === 3) copy.tuplet = 3;
    else delete copy.tuplet;
    return copy;
  });

  return { score: next, selection: clampSelection(next, selection) };
}

function techniqueMatches(
  note: TabNote,
  key: keyof TabTechniquePatch,
  value: unknown,
): boolean {
  if (key === "bend") {
    const expected = value as TabBend;
    return (
      note.bend !== undefined &&
      note.bend.semitones === expected.semitones &&
      note.bend.release === expected.release &&
      note.bend.prebend === expected.prebend
    );
  }
  return (note as Record<string, unknown>)[key] === value;
}

export function applyTechnique(
  score: TabScore,
  selection: TabSelection,
  patch: TabTechniquePatch,
): TabOperationResult {
  const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return { error: "noSelection" };

  const targets = getRangeBeats(score, selection)
    .map((position) => ({
      ...position,
      note: getNoteAt(
        getBeatAt(score, position.bar, position.beat),
        selection.string,
      ),
    }))
    .filter(
      (target): target is { bar: number; beat: number; note: TabNote } =>
        target.note !== null,
    );

  if (targets.length === 0) return { error: "noSelection" };
  if (patch.legato !== undefined || patch.slide !== undefined) {
    for (const target of targets) {
      if (!hasPreviousNote(score, target.bar, target.beat, selection.string)) {
        return { error: "needsPreviousNote" };
      }
    }
  }

  const active = !targets.every((target) =>
    entries.every(([key, value]) =>
      techniqueMatches(target.note, key as keyof TabTechniquePatch, value),
    ),
  );

  let next = score;
  for (const target of targets) {
    next = replaceBeat(next, target.bar, target.beat, (beat) => ({
      ...beat,
      notes: beat.notes.map((note) => {
        if (note.string !== selection.string) return note;
        const copy = { ...note } as TabNote & Record<string, unknown>;
        for (const [key, value] of entries) {
          if (active) {
            if (key === "bend") copy.bend = { ...(value as TabBend) };
            else copy[key] = value;
          } else {
            if (key === "bend") delete copy.bend;
            else delete copy[key];
          }
        }
        return copy;
      }),
    }));
  }

  return { score: next, selection: clampSelection(next, selection) };
}

export function toggleTie(
  score: TabScore,
  selection: TabSelection,
): TabOperationResult {
  const targets = getRangeBeats(score, selection)
    .map((position) => ({
      ...position,
      note: getNoteAt(
        getBeatAt(score, position.bar, position.beat),
        selection.string,
      ),
    }))
    .filter(
      (target): target is { bar: number; beat: number; note: TabNote } =>
        target.note !== null,
    );

  if (targets.length === 0) return { error: "noSelection" };

  const allTied = targets.every((target) => target.note.tie === true);
  if (!allTied) {
    for (const target of targets) {
      if (!hasPreviousNote(score, target.bar, target.beat, selection.string)) {
        return { error: "needsPreviousNote" };
      }
    }
  }

  let next = score;
  for (const target of targets) {
    next = replaceBeat(next, target.bar, target.beat, (beat) => ({
      ...beat,
      notes: beat.notes.map((note) => {
        if (note.string !== selection.string) return note;
        const copy = { ...note };
        if (allTied) delete copy.tie;
        else copy.tie = true;
        return copy;
      }),
    }));
  }

  return { score: next, selection: clampSelection(next, selection) };
}

function insertBarAt(
  score: TabScore,
  index: number,
  string: number,
): TabOperationResult {
  if (score.bars.length >= TAB_MAX_BARS) return { error: "barLimit" };
  const timeSignature = resolveTimeSignature(score, Math.max(0, index));
  const bar: TabBar = {
    id: createTabId("bar"),
    beats: createRestBeats(getTimeSignatureTicks(timeSignature)),
  };
  const bars = score.bars.slice();
  bars.splice(index + 1, 0, bar);
  const next = { ...score, bars };

  return {
    score: next,
    selection: clampSelection(next, { bar: index + 1, beat: 0, string }),
  };
}

export function insertBarAfter(
  score: TabScore,
  selection: TabSelection,
): TabOperationResult {
  return insertBarAt(
    score,
    Math.min(Math.max(0, selection.bar), score.bars.length - 1),
    selection.string,
  );
}

export function addBar(
  score: TabScore,
  selection: TabSelection,
): TabOperationResult {
  return insertBarAt(score, score.bars.length - 1, selection.string);
}

export function duplicateBar(
  score: TabScore,
  selection: TabSelection,
): TabOperationResult {
  if (score.bars.length >= TAB_MAX_BARS) return { error: "barLimit" };
  const index = Math.min(Math.max(0, selection.bar), score.bars.length - 1);
  const bar = score.bars[index];
  if (!bar) return { error: "noSelection" };

  const bars = score.bars.slice();
  bars.splice(index + 1, 0, cloneTabBar(bar));
  const next = { ...score, bars };

  return {
    score: next,
    selection: clampSelection(next, { bar: index + 1, beat: 0, string: selection.string }),
  };
}

export function deleteBar(
  score: TabScore,
  selection: TabSelection,
): TabOperationResult {
  const index = Math.min(Math.max(0, selection.bar), score.bars.length - 1);
  if (!score.bars[index]) return { error: "noSelection" };

  let bars: TabBar[];
  if (score.bars.length <= 1) {
    bars = [createRestBar(resolveTimeSignature(score, index))];
  } else {
    bars = score.bars.filter((_, barIndex) => barIndex !== index);
  }

  const next = { ...score, bars };
  const bar = Math.min(index, bars.length - 1);

  return {
    score: next,
    selection: clampSelection(next, { bar, beat: 0, string: selection.string }),
  };
}

function isValidTimeSignature(
  timeSignature: TabTimeSignature,
): boolean {
  return (
    Number.isInteger(timeSignature.numerator) &&
    timeSignature.numerator >= 1 &&
    timeSignature.numerator <= 32 &&
    (TAB_TIME_SIGNATURE_DENOMINATORS as readonly number[]).includes(
      timeSignature.denominator,
    )
  );
}

export function setTimeSignature(
  score: TabScore,
  selection: TabSelection,
  timeSignature: TabTimeSignature,
): TabOperationResult {
  if (!isValidTimeSignature(timeSignature)) {
    return { error: "invalidTimeSignature" };
  }
  const index = Math.min(Math.max(0, selection.bar), score.bars.length - 1);
  if (!score.bars[index]) return { error: "noSelection" };

  const next = replaceBar(score, index, (bar) => ({
    ...bar,
    timeSignature: { ...timeSignature },
  }));

  return { score: next, selection: clampSelection(next, selection) };
}

export function setTempo(
  score: TabScore,
  selection: TabSelection,
  tempo: number,
): TabOperationResult {
  if (!Number.isInteger(tempo) || tempo < TAB_MIN_TEMPO || tempo > TAB_MAX_TEMPO) {
    return { error: "invalidTempo" };
  }
  const index = Math.min(Math.max(0, selection.bar), score.bars.length - 1);
  if (!score.bars[index]) return { error: "noSelection" };
  if (index === 0) return { score: { ...score, tempo }, selection };

  const next = replaceBar(score, index, (bar) => ({ ...bar, tempo }));
  return { score: next, selection: clampSelection(next, selection) };
}

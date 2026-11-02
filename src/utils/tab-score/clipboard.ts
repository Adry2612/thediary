import type { TabBar, TabBeat, TabScore } from "../../types/tab-score.ts";
import { TAB_MAX_BARS } from "../../types/tab-score.ts";
import { cloneTabBar, cloneTabBeat } from "./model.ts";
import type { TabOperationResult } from "./operations.ts";
import {
  clampSelection,
  getRangeBeats,
  type TabSelection,
} from "./selection.ts";

export type TabClipboard =
  | { kind: "beats"; beats: TabBeat[] }
  | { kind: "bars"; bars: TabBar[] };

let clipboard: TabClipboard | null = null;

export function getClipboard(): TabClipboard | null {
  return clipboard;
}

export function clearClipboard(): void {
  clipboard = null;
}

export function setClipboard(value: TabClipboard | null): void {
  clipboard = value;
}

function selectedBarRange(
  selection: TabSelection,
): { first: number; last: number } {
  const anchorBar = selection.anchor?.bar ?? selection.bar;
  return {
    first: Math.min(anchorBar, selection.bar),
    last: Math.max(anchorBar, selection.bar),
  };
}

export function copyBeats(
  score: TabScore,
  selection: TabSelection,
): TabClipboard | null {
  const beats = getRangeBeats(score, selection)
    .map(({ bar, beat }) => score.bars[bar]?.beats[beat])
    .filter((beat): beat is TabBeat => beat !== undefined)
    .map(cloneTabBeat);

  if (beats.length === 0) return null;

  clipboard = { kind: "beats", beats };
  return clipboard;
}

export function copyBars(
  score: TabScore,
  selection: TabSelection,
): TabClipboard | null {
  const { first, last } = selectedBarRange(selection);
  const bars = score.bars
    .slice(first, last + 1)
    .map(cloneTabBar);

  if (bars.length === 0) return null;

  clipboard = { kind: "bars", bars };
  return clipboard;
}

export function pasteBeats(
  score: TabScore,
  selection: TabSelection,
  source: TabClipboard | null = clipboard,
): TabOperationResult {
  if (!source || source.kind !== "beats") return { error: "noSelection" };
  const bar = score.bars[selection.bar];
  if (!bar) return { error: "noSelection" };

  const index = Math.min(Math.max(0, selection.beat), bar.beats.length);
  const beats = bar.beats.slice();
  const pasted = source.beats.map(cloneTabBeat);
  beats.splice(index, 0, ...pasted);

  const bars = score.bars.slice();
  bars[selection.bar] = { ...bar, beats };
  const next = { ...score, bars };

  return {
    score: next,
    selection: clampSelection(next, {
      ...selection,
      beat: index,
    }),
  };
}

export function pasteBars(
  score: TabScore,
  selection: TabSelection,
  source: TabClipboard | null = clipboard,
): TabOperationResult {
  if (!source || source.kind !== "bars") return { error: "noSelection" };
  if (score.bars.length + source.bars.length > TAB_MAX_BARS) {
    return { error: "barLimit" };
  }

  const index = Math.min(Math.max(0, selection.bar), score.bars.length - 1);
  const bars = score.bars.slice();
  bars.splice(index + 1, 0, ...source.bars.map(cloneTabBar));
  const next = { ...score, bars };

  return {
    score: next,
    selection: clampSelection(next, {
      ...selection,
      bar: index + 1,
      beat: 0,
    }),
  };
}

export function cutBeats(
  score: TabScore,
  selection: TabSelection,
): TabOperationResult {
  const positions = getRangeBeats(score, selection);
  if (positions.length === 0 || !copyBeats(score, selection)) {
    return { error: "noSelection" };
  }

  const byBar = new Map<number, Set<number>>();
  for (const position of positions) {
    const set = byBar.get(position.bar) ?? new Set<number>();
    set.add(position.beat);
    byBar.set(position.bar, set);
  }

  const bars = score.bars.map((bar, barIndex) => {
    const removed = byBar.get(barIndex);
    if (!removed) return bar;
    return {
      ...bar,
      beats: bar.beats.filter((_, beatIndex) => !removed.has(beatIndex)),
    };
  });
  const next = { ...score, bars };

  return {
    score: next,
    selection: clampSelection(next, {
      ...selection,
      beat: Math.min(
        selection.beat,
        Math.max(0, (bars[selection.bar]?.beats.length ?? 1) - 1),
      ),
      anchor: undefined,
    }),
  };
}

export function cutBars(
  score: TabScore,
  selection: TabSelection,
): TabOperationResult {
  if (!copyBars(score, selection)) return { error: "noSelection" };

  const { first, last } = selectedBarRange(selection);
  if (first === 0 && last === score.bars.length - 1) {
    return { error: "noSelection" };
  }

  const bars = score.bars.filter(
    (_, index) => index < first || index > last,
  );
  const next = { ...score, bars };
  const bar = Math.min(first, Math.max(0, bars.length - 1));

  return {
    score: next,
    selection: clampSelection(next, { bar, beat: 0, string: selection.string }),
  };
}

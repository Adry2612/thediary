import type {
  TabBar,
  TabBeat,
  TabScore,
  TabTimeSignature,
} from "../../types/tab-score.ts";
import { TAB_TICKS_PER_QUARTER } from "../../types/tab-score.ts";

export const DEFAULT_TIME_SIGNATURE: TabTimeSignature = {
  numerator: 4,
  denominator: 4,
};

export type TabBarFill = "under" | "exact" | "over";

/** Duración de un pulso en ticks enteros (960 por negra). */
export function getBeatTicks(
  beat: Pick<TabBeat, "duration" | "dots" | "tuplet">,
): number {
  const base = (TAB_TICKS_PER_QUARTER * 4) / beat.duration;
  const dotted = beat.dots === 1 ? (base * 3) / 2 : base;
  const tuplet = beat.tuplet === 3 ? (dotted * 2) / 3 : dotted;
  return Math.round(tuplet);
}

/** Duración total de un compás según su compás. */
export function getTimeSignatureTicks(timeSignature: TabTimeSignature): number {
  return Math.round(
    timeSignature.numerator *
      (TAB_TICKS_PER_QUARTER * 4) /
      timeSignature.denominator,
  );
}

/** Compás en vigor en un compás concreto, heredando del anterior. */
export function resolveTimeSignature(
  score: Pick<TabScore, "bars">,
  barIndex: number,
): TabTimeSignature {
  let current = DEFAULT_TIME_SIGNATURE;

  for (let index = 0; index <= barIndex && index < score.bars.length; index++) {
    const timeSignature = score.bars[index]?.timeSignature;
    if (timeSignature) current = timeSignature;
  }

  return current;
}

export function getBarTicks(bar: Pick<TabBar, "beats">): number {
  return bar.beats.reduce((total, beat) => total + getBeatTicks(beat), 0);
}

export function getBarFill(
  bar: Pick<TabBar, "beats">,
  timeSignature: TabTimeSignature = DEFAULT_TIME_SIGNATURE,
): TabBarFill {
  const expected = getTimeSignatureTicks(timeSignature);
  const actual = getBarTicks(bar);

  if (actual < expected) return "under";
  if (actual > expected) return "over";
  return "exact";
}

export function getScoreBarFill(
  score: Pick<TabScore, "bars">,
  barIndex: number,
): TabBarFill {
  const bar = score.bars[barIndex];
  if (!bar) return "exact";
  return getBarFill(bar, resolveTimeSignature(score, barIndex));
}

export function getScoreTicks(score: Pick<TabScore, "bars">): number {
  return score.bars.reduce((total, bar) => total + getBarTicks(bar), 0);
}

import type {
  TabBar,
  TabBeat,
  TabScore,
  TabTimeSignature,
} from "../../types/tab-score.ts";
import {
  TAB_TICKS_PER_QUARTER,
  TAB_TUPLET_IN_TIME,
} from "../../types/tab-score.ts";

export const DEFAULT_TIME_SIGNATURE: TabTimeSignature = {
  numerator: 4,
  denominator: 4,
};

export type TabBarFill = "under" | "exact" | "over";

/** Ticks de margen para las subdivisiones cuyo reparto no es entero (7 y 9). */
const TUPLET_TOLERANCE = 4;

/** Duración de un pulso en ticks enteros (960 por negra). */
export function getBeatTicks(
  beat: Pick<TabBeat, "duration" | "dots" | "tuplet">,
): number {
  const base = (TAB_TICKS_PER_QUARTER * 4) / beat.duration;
  const dotted = beat.dots === 1 ? (base * 3) / 2 : base;
  const tuplet = beat.tuplet
    ? (dotted * TAB_TUPLET_IN_TIME[beat.tuplet]) / beat.tuplet
    : dotted;
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

  // Las subdivisiones de 7 y 9 no reparten ticks enteros; el redondeo no
  // puede convertir un compás correcto en uno incompleto.
  const tolerance = bar.beats.some((beat) => beat.tuplet)
    ? TUPLET_TOLERANCE
    : 0;
  if (Math.abs(actual - expected) <= tolerance) return "exact";

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

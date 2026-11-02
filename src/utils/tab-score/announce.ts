import type {
  TabBeat,
  TabScore,
  TabTuplet,
} from "../../types/tab-score.ts";
import { getBeatAt, getNoteAt, type TabSelection } from "./selection.ts";

export type TabScoreAnnouncementLabels = {
  barLabel: string;
  beatLabel: string;
  stringLabel: string;
  fretLabel: string;
  restLabel: string;
  emptyLabel: string;
  noNoteLabel: string;
  noSelectionLabel: string;
  durationWhole: string;
  durationHalf: string;
  durationQuarter: string;
  durationEighth: string;
  durationSixteenth: string;
  durationThirtySecond: string;
  durationSixtyFourth: string;
  dottedSuffix: string;
  tupletSuffixes: Record<TabTuplet, string>;
};

const DURATION_LABELS: Record<
  TabBeat["duration"],
  keyof TabScoreAnnouncementLabels
> = {
  1: "durationWhole",
  2: "durationHalf",
  4: "durationQuarter",
  8: "durationEighth",
  16: "durationSixteenth",
  32: "durationThirtySecond",
  64: "durationSixtyFourth",
};

export function describeBeatDuration(
  beat: Pick<TabBeat, "duration" | "dots" | "tuplet">,
  labels: TabScoreAnnouncementLabels,
): string {
  const parts = [labels[DURATION_LABELS[beat.duration] ?? "durationQuarter"]];
  if (beat.dots === 1) parts.push(labels.dottedSuffix);
  if (beat.tuplet) parts.push(labels.tupletSuffixes[beat.tuplet]);
  return parts.join(" ");
}

/**
 * Texto que se anuncia al mover la selección: compás, pulso, cuerda, traste y
 * duración. Sin selección devuelve el aviso de que se ha limpiado.
 */
export function announceSelection({
  score,
  selection,
  stringCount,
  labels,
}: {
  score: Pick<TabScore, "bars">;
  selection: TabSelection | null;
  stringCount: number;
  labels: TabScoreAnnouncementLabels;
}): string {
  if (!selection) return labels.noSelectionLabel;

  const beat = getBeatAt(score, selection.bar, selection.beat);
  if (!beat) return labels.noSelectionLabel;

  const note = getNoteAt(beat, selection.string);
  const parts = [
    `${labels.barLabel} ${selection.bar + 1}`,
    `${labels.beatLabel} ${selection.beat + 1}`,
    `${labels.stringLabel} ${stringCount - selection.string}`,
    note
      ? `${labels.fretLabel} ${note.dead ? "x" : note.fret}`
      : beat.rest
        ? labels.restLabel
        : beat.empty
          ? labels.emptyLabel
          : labels.noNoteLabel,
    describeBeatDuration(beat, labels),
  ];

  const sentence = `${parts.join(", ")}.`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

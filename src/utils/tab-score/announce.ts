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
  dynamicLabel?: string;
  textLabel?: string;
  chordLabel?: string;
  strokeLabel?: string;
  fermataLabel?: string;
  graceLabel?: string;
  repeatStartLabel?: string;
  repeatEndLabel?: string;
  endingLabel?: string;
  sectionLabel?: string;
  pickupLabel?: string;
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

  if (beat.dynamic) parts.push(beat.dynamic);
  if (beat.hairpin) {
    parts.push(beat.hairpin === "crescendo" ? "crescendo" : "decrescendo");
  }
  if (beat.text) {
    parts.push(`${labels.textLabel ?? "texto"}: ${beat.text}`);
  }
  if (beat.chord) {
    parts.push(`${labels.chordLabel ?? "acorde"}: ${beat.chord}`);
  }
  if (beat.stroke) {
    parts.push(
      `${labels.strokeLabel ?? "púa"} ${
        beat.stroke === "down"
          ? "abajo"
          : beat.stroke === "up"
            ? "arriba"
            : "rasgueado"
      }`,
    );
  }
  if (beat.fermata) parts.push(labels.fermataLabel ?? "calderón");
  if (beat.grace) {
    parts.push(
      `${labels.graceLabel ?? "apoyatura"} ${beat.grace.fret} ${
        beat.grace.timing === "before" ? "antes" : "sobre"
      }`,
    );
  }

  const bar = score.bars[selection.bar];
  if (bar?.section) {
    parts.push(`${labels.sectionLabel ?? "sección"}: ${bar.section}`);
  }
  if (bar?.repeat?.start) {
    parts.push(labels.repeatStartLabel ?? "abre repetición");
  }
  if (bar?.repeat?.end !== undefined) {
    parts.push(
      `${labels.repeatEndLabel ?? "cierra repetición"} ${bar.repeat.end}`,
    );
  }
  if (bar?.endings && bar.endings.length > 0) {
    parts.push(`${labels.endingLabel ?? "final"} ${bar.endings.join(", ")}`);
  }
  if (bar?.pickup) parts.push(labels.pickupLabel ?? "anacrusa");

  const sentence = `${parts.join(", ")}.`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

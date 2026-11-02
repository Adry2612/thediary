import type {
  TabBar,
  TabBeat,
  TabNote,
  TabScore,
  TabTuplet,
} from "../../types/tab-score.ts";
import { resolveTimeSignature } from "./ticks.ts";

const BEND_LABELS: Record<number, string> = {
  0.25: "1/4 de tono",
  0.5: "1/2 tono",
  1: "1 tono",
  1.5: "1 tono y medio",
  2: "2 tonos",
};

const TUPLET_NAMES: Record<TabTuplet, string> = {
  3: "tresillo",
  5: "quintillo",
  6: "seisillo",
  7: "septillo",
  9: "nonillo",
  10: "decimillo",
  12: "doceavo",
};

function durationLabel(beat: Pick<TabBeat, "duration" | "dots" | "tuplet">) {
  const dots = beat.dots === 1 ? " con puntillo" : "";
  const tuplet = beat.tuplet ? ` (${TUPLET_NAMES[beat.tuplet]})` : "";
  return `1/${beat.duration}${dots}${tuplet}`;
}

function techniqueLabels(note: TabNote): string[] {
  const labels: string[] = [];

  if (note.tie) labels.push("ligada");
  if (note.legato === "hammer") labels.push("ligado (hammer-on)");
  if (note.legato === "pull") labels.push("ligado (pull-off)");
  if (note.slide === "up") labels.push("deslizamiento ascendente");
  if (note.slide === "down") labels.push("deslizamiento descendente");
  if (note.slide === "position") labels.push("deslizamiento de posición");
  if (note.bend) {
    const amount = BEND_LABELS[note.bend.semitones] ?? `${note.bend.semitones} semitonos`;
    const extras = [
      note.bend.prebend ? "prebend" : null,
      note.bend.release ? "con liberación" : null,
    ].filter(Boolean);
    labels.push(`bend de ${amount}${extras.length ? ` ${extras.join(" ")}` : ""}`);
  }
  if (note.vibrato === "slight") labels.push("vibrato suave");
  if (note.vibrato === "wide") labels.push("vibrato amplio");
  if (note.palmMute) labels.push("palm mute");
  if (note.letRing) labels.push("dejar sonar");
  if (note.tapping) labels.push("tapping");
  if (note.harmonic === "natural") labels.push("armónico natural");
  if (note.harmonic === "artificial") labels.push("armónico artificial");
  if (note.harmonic === "pinch") labels.push("armónico pinch");
  if (note.harmonic === "tap") labels.push("armónico pulsado");
  if (note.dead) labels.push("nota muerta");
  if (note.ghost) labels.push("nota fantasma");
  if (note.tremoloPicking) labels.push("trémolo");
  if (note.trill) labels.push("trino");
  if (note.slap) labels.push("slap");
  if (note.pop) labels.push("pop");
  if (note.accent === "normal") labels.push("acento normal");
  if (note.accent === "heavy") labels.push("acento fuerte");

  return labels;
}

function noteLabel(note: TabNote): string {
  const labels = techniqueLabels(note);
  const suffix = labels.length > 0 ? ` (${labels.join(", ")})` : "";
  return `cuerda ${note.string + 1} traste ${note.fret}${suffix}`;
}

function beatLabel(beat: TabBeat): string {
  const duration = durationLabel(beat);
  if (beat.rest) {
    return `${duration}, silencio`;
  }
  if (beat.notes.length === 0) {
    return `${duration}, vacío`;
  }
  return `${duration}, ${beat.notes.map(noteLabel).join(", ")}`;
}

function barHeader(bar: TabBar, index: number, score: Pick<TabScore, "bars">): string {
  const timeSignature = resolveTimeSignature(score, index);
  const tempo = bar.tempo !== undefined ? ` · tempo ${bar.tempo}` : "";
  return `Compás ${index + 1} (${timeSignature.numerator}/${timeSignature.denominator})${tempo}`;
}

/**
 * Alternativa textual de una partitura. No incluye ids: dos partituras con el
 * mismo contenido producen exactamente el mismo texto.
 */
export function scoreToText(score: Pick<TabScore, "bars">): string {
  const lines: string[] = [];

  score.bars.forEach((bar, barIndex) => {
    lines.push(barHeader(bar, barIndex, score));
    bar.beats.forEach((beat, beatIndex) => {
      lines.push(`  Pulso ${beatIndex + 1}: ${beatLabel(beat)}`);
    });
  });

  return lines.join("\n");
}

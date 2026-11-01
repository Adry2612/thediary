import type {
  TabBar,
  TabBeat,
  TabNote,
  TabScore,
} from "../../types/tab-score.ts";
import type { TabBend } from "../../types/practice.ts";
import { getStringCount } from "./model.ts";

type NoteToken = {
  base: string;
  effects: string[];
};

const STANDARD_TUNINGS: Record<number, string[]> = {
  4: ["E1", "A1", "D2", "G2"],
  5: ["B0", "E1", "A1", "D2", "G2"],
  6: ["E2", "A2", "D3", "G3", "B3", "E4"],
  7: ["B1", "E2", "A2", "D3", "G3", "B3", "E4"],
  8: ["F#1", "B1", "E2", "A2", "D3", "G3", "B3", "E4"],
};

const PITCH_CLASSES: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

function parseNoteName(value: string): { pitchClass: number; octave: number } | null {
  const match = /^([A-Ga-g])([#b]?)(\d)?$/.exec(value.trim());
  if (!match) return null;
  const letter = match[1].toUpperCase();
  const accidental = match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0;
  const octave = match[3] !== undefined ? Number(match[3]) : 4;
  return { pitchClass: (PITCH_CLASSES[letter] + accidental + 12) % 12, octave };
}

function toMidi(pitchClass: number, octave: number): number {
  return (octave + 1) * 12 + pitchClass;
}

function midiToName(midi: number): string {
  const pitchClass = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pitchClass]}${octave}`;
}

function closestOctave(pitchClass: number, referenceMidi: number): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let octave = 0; octave <= 8; octave++) {
    const distance = Math.abs(toMidi(pitchClass, octave) - referenceMidi);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = octave;
    }
  }
  return best;
}

/**
 * Convierte la afinación del modelo ("EADGBE") en notas con octava para
 * AlphaTex, de aguda a grave. Devuelve `null` si es la estándar de 6 cuerdas.
 */
export function tuningToAlphaTexNotes(
  tuning: string,
  stringCount: number,
): string[] | null {
  const letters = tuning
    .replace(/[\s-]/g, "")
    .match(/[A-Ga-g][#b]?/g);
  const standard = STANDARD_TUNINGS[stringCount];
  if (!letters || !standard || letters.length !== stringCount) return null;

  const lowToHigh = letters.map((letter, index) => {
    const parsed = parseNoteName(letter);
    if (!parsed) return null;
    const reference = parseNoteName(standard[index]);
    if (!reference) return null;
    const octave = closestOctave(
      parsed.pitchClass,
      toMidi(reference.pitchClass, reference.octave),
    );
    return midiToName(toMidi(parsed.pitchClass, octave));
  });
  if (lowToHigh.some((note) => note === null)) return null;

  const isStandard =
    stringCount === 6 &&
    lowToHigh.every((note, index) => note === standard[index]);
  if (isStandard) return null;

  return [...lowToHigh].reverse() as string[];
}

function bendTag(bend: TabBend): string {
  const quarterTones = bend.semitones * 2;
  if (bend.prebend && bend.release) {
    return `b (prebendRelease ${quarterTones} 0)`;
  }
  if (bend.prebend) return `b (prebend ${quarterTones})`;
  if (bend.release) return `b (0 ${quarterTones} 0)`;
  return `b (0 ${quarterTones})`;
}

function noteEffects(note: TabNote): string[] {
  const effects: string[] = [];

  if (note.ghost) effects.push("g");
  if (note.accent === "normal") effects.push("ac");
  if (note.accent === "heavy") effects.push("hac");
  if (note.bend) effects.push(bendTag(note.bend));
  if (note.vibrato === "slight") effects.push("v");
  if (note.vibrato === "wide") effects.push("vw");
  if (note.palmMute) effects.push("pm");
  if (note.letRing) effects.push("lr");
  if (note.tapping) effects.push("tt");
  if (note.harmonic === "natural") effects.push("nh");
  if (note.harmonic === "artificial") effects.push("ah 12");
  if (note.harmonic === "pinch") effects.push("ph 5");
  if (note.harmonic === "tap") effects.push("th");
  if (note.tremoloPicking) effects.push("tp 3");
  if (note.trill) effects.push(`tr ${Math.min(24, note.fret + 2)}`);
  if (note.slap) effects.push("s");
  if (note.pop) effects.push("p");

  return effects;
}

function noteToken(note: TabNote, stringCount: number): NoteToken {
  const alphaTexString = stringCount - note.string;
  return {
    base: note.dead ? `x.${alphaTexString}` : `${note.fret}.${alphaTexString}`,
    effects: noteEffects(note),
  };
}

function transitionTags(note: TabNote): string[] {
  const tags: string[] = [];
  if (note.tie) tags.push("t");
  if (note.legato) tags.push("h");
  if (note.slide === "position") tags.push("ss");
  else if (note.slide) tags.push("sl");
  return tags;
}

function renderToken(token: NoteToken): string {
  return token.effects.length > 0
    ? `${token.base}{${token.effects.join(" ")}}`
    : token.base;
}

function renderContent(tokens: NoteToken[], rest: boolean): string {
  if (rest || tokens.length === 0) return "r";
  if (tokens.length === 1) return renderToken(tokens[0]);
  return `(${tokens.map(renderToken).join(" ")})`;
}

function renderBeat(beat: TabBeat, tokens: NoteToken[]): string {
  const parts = [`:${beat.duration}`];
  if (beat.tuplet) parts.push(`{tu ${beat.tuplet}}`);
  parts.push(renderContent(tokens, beat.rest === true));
  if (beat.dots === 1) parts.push("{d}");
  return parts.join(" ");
}

function buildBar(bar: TabBar, stringCount: number): string {
  const parts: string[] = [];
  let previousBeat: TabBeat | null = null;
  let previousTokens: NoteToken[] = [];
  let previousByString = new Map<number, NoteToken>();

  for (const beat of bar.beats) {
    const tokens = beat.rest
      ? []
      : beat.notes.map((note) => noteToken(note, stringCount));
    const tokensByString = new Map<number, NoteToken>();
    if (!beat.rest) {
      beat.notes.forEach((note, index) => {
        tokensByString.set(note.string, tokens[index]);
      });
    }

    if (!beat.rest) {
      for (const note of beat.notes) {
        const tags = transitionTags(note);
        if (tags.length === 0) continue;
        const previous = previousByString.get(note.string);
        if (!previous) continue;
        for (const tag of tags) {
          if (!previous.effects.includes(tag)) previous.effects.push(tag);
        }
      }
    }

    if (previousBeat) parts.push(renderBeat(previousBeat, previousTokens));
    previousBeat = beat;
    previousTokens = tokens;
    previousByString = tokensByString;
  }

  if (previousBeat) parts.push(renderBeat(previousBeat, previousTokens));
  return `${parts.join(" ")} |`;
}

export function buildAlphaTex(
  score: TabScore,
  { standardNotation = false }: { standardNotation?: boolean } = {},
): string {
  const stringCount = getStringCount(score.tuning);
  const tuning = tuningToAlphaTexNotes(score.tuning, stringCount);
  const lines: string[] = [
    standardNotation ? "\\staff {score tabs}" : "\\staff {tabs}",
  ];

  if (tuning) lines.push(`\\tuning (${tuning.join(" ")})`);
  lines.push(`\\tempo ${score.tempo}`);
  lines.push(".");

  score.bars.forEach((bar) => {
    if (bar.timeSignature) {
      lines.push(
        `\\ts (${bar.timeSignature.numerator} ${bar.timeSignature.denominator})`,
      );
    }
    if (bar.tempo !== undefined) lines.push(`\\tempo ${bar.tempo}`);
    lines.push(buildBar(bar, stringCount));
  });

  return lines.join("\n");
}

import type {
  TabBar,
  TabBeat,
  TabNote,
  TabScore,
} from "../../types/tab-score.ts";
import type { TabBend } from "../../types/practice.ts";
import { getChordShape } from "../chords.ts";
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
 * Convierte la afinación del modelo ("EADGBE") en MIDI por cuerda, de grave a
 * aguda. Devuelve `null` si no encaja con ninguna afinación estándar.
 */
export function tuningToMidi(
  tuning: string,
  stringCount: number,
): number[] | null {
  const letters = tuning
    .replace(/[\s-]/g, "")
    .match(/[A-Ga-g][#b]?/g);
  const standard = STANDARD_TUNINGS[stringCount];
  if (!letters || !standard || letters.length !== stringCount) return null;

  const midi: number[] = [];
  for (let index = 0; index < stringCount; index += 1) {
    const parsed = parseNoteName(letters[index]);
    const reference = parseNoteName(standard[index]);
    if (!parsed || !reference) return null;
    const referenceMidi = toMidi(reference.pitchClass, reference.octave);
    midi.push(
      toMidi(parsed.pitchClass, closestOctave(parsed.pitchClass, referenceMidi)),
    );
  }
  return midi;
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

function renderContent(
  tokens: NoteToken[],
  beat: Pick<TabBeat, "rest" | "empty">,
): string {
  if (beat.rest) return "r";
  if (beat.empty || tokens.length === 0) return "()";
  if (tokens.length === 1) return renderToken(tokens[0]);
  return `(${tokens.map(renderToken).join(" ")})`;
}

function renderBeat(beat: TabBeat, tokens: NoteToken[]): string {
  const parts = [`:${beat.duration}`];
  if (beat.tuplet) parts.push(`{tu ${beat.tuplet}}`);
  parts.push(renderContent(tokens, beat));

  const properties: string[] = [];
  if (beat.dots === 1) properties.push("d");
  if (beat.dynamic) properties.push(`dy ${beat.dynamic}`);
  if (beat.hairpin === "crescendo") properties.push("cre");
  if (beat.hairpin === "decrescendo") properties.push("dec");
  if (beat.text) {
    properties.push(`txt "${escapeAlphaTexString(beat.text)}"`);
  }
  if (beat.chord) {
    properties.push(`ch "${escapeAlphaTexString(beat.chord)}"`);
  }
  if (beat.stroke === "down") properties.push("bd");
  if (beat.stroke === "up") properties.push("bu");
  if (beat.stroke === "rasgueado") properties.push("rasg ii");
  if (beat.fermata) properties.push("fermata medium 0");

  if (properties.length > 0) parts.push(`{${properties.join(" ")}}`);
  return parts.join(" ");
}

function escapeAlphaTexString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Apoyatura como pulso corto delante del pulso principal. */
function renderGrace(beat: TabBeat, stringCount: number): string | null {
  if (!beat.grace || beat.notes.length === 0) return null;
  const note = beat.notes[0];
  const token = noteToken({ string: note.string, fret: beat.grace.fret }, stringCount);
  const timing = beat.grace.timing === "before" ? "gr" : "gr ob";
  return `:32 ${renderToken(token)} {${timing}}`;
}

function buildBar(bar: TabBar, stringCount: number): string {
  const parts: string[] = [];
  let previousBeat: TabBeat | null = null;
  let previousTokens: NoteToken[] = [];
  let previousByString = new Map<number, NoteToken>();
  let previousGrace: string | null = null;

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

    if (previousBeat) {
      if (previousGrace) parts.push(previousGrace);
      parts.push(renderBeat(previousBeat, previousTokens));
    }
    previousGrace = renderGrace(beat, stringCount);
    previousBeat = beat;
    previousTokens = tokens;
    previousByString = tokensByString;
  }

  if (previousBeat) {
    if (previousGrace) parts.push(previousGrace);
    parts.push(renderBeat(previousBeat, previousTokens));
  }
  return `${parts.join(" ")} |`;
}

/** Nombres de acorde distintos de la partitura con su forma conocida. */
function collectChordDefinitions(score: TabScore): string[] {
  const names = new Set<string>();
  for (const bar of score.bars) {
    for (const beat of bar.beats) {
      if (beat.chord) names.add(beat.chord);
    }
  }

  return [...names].flatMap((name) => {
    const shape = getChordShape(name);
    if (!shape) return [];
    const frets = shape.frets
      .map((fret) => (fret === null ? "x" : String(fret)))
      .join(" ");
    return [`\\chord ("${escapeAlphaTexString(name)}" ${frets})`];
  });
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
  lines.push(...collectChordDefinitions(score));
  lines.push(".");

  score.bars.forEach((bar) => {
    if (bar.timeSignature) {
      lines.push(
        `\\ts (${bar.timeSignature.numerator} ${bar.timeSignature.denominator})`,
      );
    }
    if (bar.tempo !== undefined) lines.push(`\\tempo ${bar.tempo}`);
    if (bar.endings && bar.endings.length > 0) {
      lines.push(`\\ae (${bar.endings.join(" ")})`);
    }
    if (bar.repeat?.start) lines.push("\\ro");
    if (bar.repeat?.end !== undefined) lines.push(`\\rc ${bar.repeat.end}`);
    if (bar.section) {
      lines.push(`\\section "${escapeAlphaTexString(bar.section)}"`);
    }
    if (bar.pickup) lines.push("\\ac");
    lines.push(buildBar(bar, stringCount));
  });

  return lines.join("\n");
}

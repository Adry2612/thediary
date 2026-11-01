import type {
  TabAccent,
  TabBar,
  TabBeat,
  TabBeatDuration,
  TabNote,
  TabScore,
  TabTimeSignature,
} from "../../types/tab-score.ts";
import {
  TAB_BEAT_DURATIONS,
  TAB_MAX_BARS,
  TAB_MAX_FRET,
  TAB_MAX_TEMPO,
  TAB_MIN_FRET,
  TAB_MIN_TEMPO,
  TAB_TIME_SIGNATURE_DENOMINATORS,
} from "../../types/tab-score.ts";
import { DEFAULT_TIME_SIGNATURE, getTimeSignatureTicks } from "./ticks.ts";

const TECHNIQUE_VALUES = {
  legato: ["hammer", "pull"],
  slide: ["up", "down", "position"],
  vibrato: ["slight", "wide"],
  harmonic: ["natural", "artificial", "pinch", "tap"],
  accent: ["normal", "heavy"],
} as const;

const BEND_AMOUNTS = [0.25, 0.5, 1, 1.5, 2];

let idCounter = 0;

export function createTabId(prefix = "tab"): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

export function getStringCount(tuning: string): number {
  const normalized = tuning.replace(/[\s-]/g, "");
  if (/^[A-Ga-g#b]+$/.test(normalized) && normalized.length <= 8) {
    return normalized.length;
  }
  return 6;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeInteger(
  value: unknown,
  minimum: number,
  maximum: number,
): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < minimum || value > maximum) return null;
  return value;
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function normalizeBend(value: unknown) {
  if (!isRecord(value)) return undefined;
  const semitones = value.semitones;
  if (typeof semitones !== "number" || !BEND_AMOUNTS.includes(semitones)) {
    return undefined;
  }
  const bend: { semitones: number; release?: boolean; prebend?: boolean } = {
    semitones,
  };
  if (value.release === true) bend.release = true;
  if (value.prebend === true) bend.prebend = true;
  return bend;
}

function normalizeNote(
  value: unknown,
  stringCount: number,
): TabNote | null {
  if (!isRecord(value)) return null;

  const string = normalizeInteger(value.string, 0, stringCount - 1);
  const fret = normalizeInteger(value.fret, TAB_MIN_FRET, TAB_MAX_FRET);
  if (string === null || fret === null) return null;

  const note: TabNote = { string, fret };

  if (isOneOf(value.legato, TECHNIQUE_VALUES.legato)) note.legato = value.legato;
  if (isOneOf(value.slide, TECHNIQUE_VALUES.slide)) note.slide = value.slide;
  if (isOneOf(value.vibrato, TECHNIQUE_VALUES.vibrato)) {
    note.vibrato = value.vibrato;
  }
  if (isOneOf(value.harmonic, TECHNIQUE_VALUES.harmonic)) {
    note.harmonic = value.harmonic;
  }
  if (isOneOf(value.accent, TECHNIQUE_VALUES.accent)) {
    note.accent = value.accent as TabAccent;
  }

  const bend = normalizeBend(value.bend);
  if (bend) note.bend = bend;

  for (const key of [
    "palmMute",
    "letRing",
    "tapping",
    "tremoloPicking",
    "trill",
    "slap",
    "pop",
    "dead",
    "ghost",
    "tie",
  ] as const) {
    if (value[key] === true) note[key] = true;
  }

  return note;
}

function normalizeDuration(value: unknown): TabBeatDuration {
  return typeof value === "number" &&
    (TAB_BEAT_DURATIONS as readonly number[]).includes(value)
    ? (value as TabBeatDuration)
    : 4;
}

function normalizeBeat(value: unknown, stringCount: number): TabBeat {
  if (!isRecord(value)) {
    return createRestBeat(4);
  }

  const notes = Array.isArray(value.notes)
    ? value.notes
        .map((note) => normalizeNote(note, stringCount))
        .filter((note): note is TabNote => note !== null)
    : [];
  const rest = value.rest === true || notes.length === 0;

  const beat: TabBeat = {
    id:
      typeof value.id === "string" && value.id.trim() !== ""
        ? value.id
        : createTabId("beat"),
    duration: normalizeDuration(value.duration),
    rest,
    notes: rest ? [] : notes,
  };

  if (value.dots === 1) beat.dots = 1;
  if (value.tuplet === 3) beat.tuplet = 3;

  return beat;
}

function normalizeTimeSignature(value: unknown): TabTimeSignature | undefined {
  if (!isRecord(value)) return undefined;
  const numerator = normalizeInteger(value.numerator, 1, 32);
  const denominator = value.denominator;
  if (numerator === null) return undefined;
  if (
    typeof denominator !== "number" ||
    !(TAB_TIME_SIGNATURE_DENOMINATORS as readonly number[]).includes(denominator)
  ) {
    return undefined;
  }
  return {
    numerator,
    denominator: denominator as TabTimeSignature["denominator"],
  };
}

function normalizeBar(value: unknown, stringCount: number): TabBar {
  if (!isRecord(value)) {
    return createRestBar();
  }

  const beats = Array.isArray(value.beats)
    ? value.beats.map((beat) => normalizeBeat(beat, stringCount))
    : [];

  const bar: TabBar = {
    id:
      typeof value.id === "string" && value.id.trim() !== ""
        ? value.id
        : createTabId("bar"),
    beats: Array.isArray(value.beats) ? beats : [createRestBeat(1)],
  };

  const timeSignature = normalizeTimeSignature(value.timeSignature);
  if (timeSignature) bar.timeSignature = timeSignature;

  const tempo = normalizeTempo(value.tempo);
  if (tempo !== null) bar.tempo = tempo;

  return bar;
}

function normalizeTempo(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < TAB_MIN_TEMPO || rounded > TAB_MAX_TEMPO) return null;
  return rounded;
}

export function createRestBeat(duration: TabBeatDuration = 1): TabBeat {
  return {
    id: createTabId("beat"),
    duration,
    rest: true,
    notes: [],
  };
}

const REST_CANDIDATES: {
  duration: TabBeatDuration;
  ticks: number;
  dots?: 1;
}[] = [
  { duration: 1, ticks: 3840 },
  { duration: 2, dots: 1, ticks: 2880 },
  { duration: 2, ticks: 1920 },
  { duration: 4, dots: 1, ticks: 1440 },
  { duration: 4, ticks: 960 },
  { duration: 8, dots: 1, ticks: 720 },
  { duration: 8, ticks: 480 },
  { duration: 16, dots: 1, ticks: 360 },
  { duration: 16, ticks: 240 },
  { duration: 32, dots: 1, ticks: 180 },
  { duration: 32, ticks: 120 },
  { duration: 64, dots: 1, ticks: 90 },
  { duration: 64, ticks: 60 },
];

/** Reparte un total de ticks en silencios, de la mayor duración posible. */
export function createRestBeats(totalTicks: number): TabBeat[] {
  const beats: TabBeat[] = [];
  let remaining = totalTicks;

  while (remaining >= 60) {
    const candidate =
      REST_CANDIDATES.find((entry) => entry.ticks <= remaining) ??
      REST_CANDIDATES[REST_CANDIDATES.length - 1];
    const beat = createRestBeat(candidate.duration);
    if (candidate.dots === 1) beat.dots = 1;
    beats.push(beat);
    remaining -= candidate.ticks;
  }

  return beats;
}

export function createRestBar(
  timeSignature: TabTimeSignature = DEFAULT_TIME_SIGNATURE,
): TabBar {
  return {
    id: createTabId("bar"),
    timeSignature: { ...timeSignature },
    beats: createRestBeats(getTimeSignatureTicks(timeSignature)),
  };
}

export function cloneTabBeat(beat: TabBeat): TabBeat {
  return {
    ...beat,
    id: createTabId("beat"),
    notes: beat.notes.map((note) => ({
      ...note,
      ...(note.bend ? { bend: { ...note.bend } } : {}),
    })),
  };
}

export function cloneTabBar(bar: TabBar): TabBar {
  return {
    id: createTabId("bar"),
    ...(bar.timeSignature
      ? { timeSignature: { ...bar.timeSignature } }
      : {}),
    ...(bar.tempo !== undefined ? { tempo: bar.tempo } : {}),
    beats: bar.beats.map(cloneTabBeat),
  };
}

export function createEmptyScore(tuning = "EADGBE"): TabScore {
  return {
    version: 2,
    tuning,
    tempo: 90,
    bars: [createRestBar()],
  };
}

export function isTabScoreLike(value: unknown): value is TabScore {
  return (
    isRecord(value) &&
    value.version === 2 &&
    Array.isArray(value.bars) &&
    value.bars.length > 0
  );
}

/**
 * Normaliza una partitura guardada. Descarta notas imposibles y valores de
 * técnica desconocidos, pero conserva la nota cuando solo falla una técnica.
 */
export function normalizeTabScore(
  value: unknown,
  fallbackTuning = "EADGBE",
): TabScore {
  if (!isRecord(value) || value.version !== 2) {
    return createEmptyScore(fallbackTuning);
  }

  const tuning =
    typeof value.tuning === "string" && value.tuning.trim() !== ""
      ? value.tuning.trim()
      : fallbackTuning;
  const stringCount = getStringCount(tuning);
  const tempo =
    typeof value.tempo === "number" && Number.isFinite(value.tempo)
      ? Math.min(TAB_MAX_TEMPO, Math.max(TAB_MIN_TEMPO, Math.round(value.tempo)))
      : 90;
  const bars = Array.isArray(value.bars)
    ? value.bars
        .map((bar) => normalizeBar(bar, stringCount))
        .slice(0, TAB_MAX_BARS)
    : [];

  return {
    version: 2,
    tuning,
    tempo,
    bars: bars.length > 0 ? bars : [createRestBar()],
  };
}

import type { ChordShape, UserChord } from "@/types/practice";

export const STRING_COUNT = 6;

/** Afinación estándar, de la 6ª cuerda (grave) a la 1ª (aguda). */
export const DEFAULT_TUNING_NOTES = ["E", "A", "D", "G", "B", "E"] as const;

/**
 * Formas de acorde más usadas en afinación estándar. Cada valor tiene un traste
 * por cuerda, de la 6ª (grave) a la 1ª (aguda): `null` = muteada, `0` = al aire.
 */
const CHORD_SHAPES: Record<string, (number | null)[]> = {
  C: [null, 3, 2, 0, 1, 0],
  Cm: [null, 3, 5, 5, 4, 3],
  C7: [null, 3, 2, 3, 1, 0],
  Cmaj7: [null, 3, 2, 0, 0, 0],
  Cm7: [null, 3, 5, 3, 4, 3],
  Csus2: [null, 3, 0, 0, 3, 3],
  Csus4: [null, 3, 3, 0, 1, 1],
  "C#": [null, 4, 6, 6, 6, 4],
  "C#m": [null, 4, 6, 6, 5, 4],
  "C#7": [null, 4, 6, 4, 6, 4],
  D: [null, null, 0, 2, 3, 2],
  Dm: [null, null, 0, 2, 3, 1],
  D7: [null, null, 0, 2, 1, 2],
  Dmaj7: [null, null, 0, 2, 2, 2],
  Dm7: [null, null, 0, 2, 1, 1],
  Dsus2: [null, null, 0, 2, 3, 0],
  Dsus4: [null, null, 0, 2, 3, 3],
  Eb: [null, 6, 8, 8, 8, 6],
  Ebm: [null, 6, 8, 8, 7, 6],
  Eb7: [null, 6, 8, 6, 8, 6],
  E: [0, 2, 2, 1, 0, 0],
  Em: [0, 2, 2, 0, 0, 0],
  E7: [0, 2, 0, 1, 0, 0],
  Emaj7: [0, 2, 1, 1, 0, 0],
  Em7: [0, 2, 2, 0, 3, 0],
  Esus4: [0, 2, 2, 2, 0, 0],
  F: [1, 3, 3, 2, 1, 1],
  Fm: [1, 3, 3, 1, 1, 1],
  F7: [1, 3, 1, 2, 1, 1],
  Fmaj7: [null, null, 3, 2, 1, 0],
  Fm7: [1, 3, 1, 1, 1, 1],
  "F#": [2, 4, 4, 3, 2, 2],
  "F#m": [2, 4, 4, 2, 2, 2],
  "F#7": [2, 4, 2, 3, 2, 2],
  G: [3, 2, 0, 0, 0, 3],
  Gm: [3, 5, 5, 3, 3, 3],
  G7: [3, 2, 0, 0, 0, 1],
  Gmaj7: [3, 2, 0, 0, 0, 2],
  Gm7: [3, 5, 3, 3, 3, 3],
  Gsus4: [3, 3, 0, 0, 1, 3],
  Ab: [4, 6, 6, 5, 4, 4],
  Abm: [4, 6, 6, 4, 4, 4],
  A: [null, 0, 2, 2, 2, 0],
  Am: [null, 0, 2, 2, 1, 0],
  A7: [null, 0, 2, 0, 2, 0],
  Amaj7: [null, 0, 2, 1, 2, 0],
  Am7: [null, 0, 2, 0, 1, 0],
  Asus2: [null, 0, 2, 2, 0, 0],
  Asus4: [null, 0, 2, 2, 3, 0],
  Bb: [null, 1, 3, 3, 3, 1],
  Bbm: [null, 1, 3, 3, 2, 1],
  Bb7: [null, 1, 3, 1, 3, 1],
  B: [null, 2, 4, 4, 4, 2],
  Bm: [null, 2, 4, 4, 3, 2],
  B7: [null, 2, 1, 2, 0, 2],
  Bmaj7: [null, 2, 4, 3, 4, 2],
  Bm7: [null, 2, 4, 2, 3, 2],
};

const CHORD_ORDER = [
  "C", "Cm", "C7", "Cmaj7", "Cm7", "Csus2", "Csus4",
  "C#", "C#m", "C#7",
  "D", "Dm", "D7", "Dmaj7", "Dm7", "Dsus2", "Dsus4",
  "Eb", "Ebm", "Eb7",
  "E", "Em", "E7", "Emaj7", "Em7", "Esus4",
  "F", "Fm", "F7", "Fmaj7", "Fm7",
  "F#", "F#m", "F#7",
  "G", "Gm", "G7", "Gmaj7", "Gm7", "Gsus4",
  "Ab", "Abm",
  "A", "Am", "A7", "Amaj7", "Am7", "Asus2", "Asus4",
  "Bb", "Bbm", "Bb7",
  "B", "Bm", "B7", "Bmaj7", "Bm7",
];

function minPlayedFret(frets: (number | null)[]): number | null {
  const played = frets.filter(
    (fret): fret is number => typeof fret === "number" && fret > 0,
  );
  return played.length > 0 ? Math.min(...played) : null;
}

function hasOpenString(frets: (number | null)[]): boolean {
  return frets.some((fret) => fret === 0);
}

/** Fija la longitud a 6 cuerdas y calcula el traste base. */
export function normalizeChordShape(shape: ChordShape): ChordShape {
  const frets = Array.from({ length: STRING_COUNT }, (_, index) => {
    const value = shape.frets[index];
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ?
        Math.round(value)
      : null;
  });
  const baseFret =
    hasOpenString(frets) ? 1 : (minPlayedFret(frets) ?? 1);
  return { frets, baseFret };
}

export function getChordShape(name: string): ChordShape | undefined {
  const frets = CHORD_SHAPES[name.trim()];
  return frets ? normalizeChordShape({ frets }) : undefined;
}

export function getChordLibrary(): { name: string; shape: ChordShape }[] {
  return CHORD_ORDER.filter((name) => name in CHORD_SHAPES).map((name) => ({
    name,
    shape: normalizeChordShape({ frets: CHORD_SHAPES[name] }),
  }));
}

/**
 * Ventana de trastes a dibujar: solo los trastes usados más `context` arriba y
 * abajo, con un mínimo de 3 filas para que el diagrama tenga sentido.
 */
export function getFretWindow(
  shape: ChordShape,
  context = 1,
): { start: number; count: number } {
  const frets = shape.frets;
  const played = frets.filter(
    (fret): fret is number => typeof fret === "number" && fret > 0,
  );
  if (played.length === 0) return { start: 1, count: 4 };

  const hasOpen = hasOpenString(frets);
  const min = Math.min(...played);
  const max = Math.max(...played);
  const start = hasOpen ? 1 : Math.max(1, min - context);
  const end = Math.max(max + context, start + 2);
  return { start, count: end - start + 1 };
}

/** Filas de la ventana de trastes que se mueve al dibujar una forma. */
export const EDITING_WINDOW_SIZE = 5;

/** Traste más agudo al que llega la ventana de edición. */
export const MAX_EDITING_FRET = 15;

/** Traste inicial más alto de la ventana de edición. */
export function getMaxEditingWindowStart(): number {
  return Math.max(1, MAX_EDITING_FRET - EDITING_WINDOW_SIZE + 1);
}

/**
 * Traste inicial de una ventana de edición que encuadre la forma: la coloca
 * como la dibujaría el diagrama y, si la forma no cabe entera, baja lo justo
 * para que se vea su traste más agudo.
 */
export function getEditingWindowStart(shape: ChordShape): number {
  const played = shape.frets.filter(
    (fret): fret is number => typeof fret === "number" && fret > 0,
  );
  const highest = played.length > 0 ? Math.max(...played) : 0;
  const start = Math.max(
    getFretWindow(shape).start,
    highest - EDITING_WINDOW_SIZE + 1,
  );
  return Math.min(Math.max(1, start), getMaxEditingWindowStart());
}

export function setChordString(
  shape: ChordShape,
  stringIndex: number,
  value: number | null,
): ChordShape {
  const frets = [...shape.frets];
  frets[stringIndex] = value;
  return normalizeChordShape({ frets });
}

export function toggleChordFret(
  shape: ChordShape,
  stringIndex: number,
  fret: number,
): ChordShape {
  const next = shape.frets[stringIndex] === fret ? null : fret;
  return setChordString(shape, stringIndex, next);
}

/**
 * Extrae las 6 notas de una afinación escrita como "E Standard (EADGBE)",
 * "Drop D (DADGBE)" o "EADGBE". Si no se puede interpretar, usa la estándar.
 */
export function parseTuningNotes(tuning?: string): string[] {
  if (!tuning) return [...DEFAULT_TUNING_NOTES];
  const parenthesized = tuning.match(/\(([^)]+)\)/);
  const candidate = (parenthesized ? parenthesized[1] : tuning)
    .replace(/\s+/g, "")
    .trim();
  if (!/^([A-Ga-g][#b]?){6}$/.test(candidate)) {
    return [...DEFAULT_TUNING_NOTES];
  }
  const tokens = candidate.match(/[A-Ga-g][#b]?/g) ?? [];
  return tokens.map((token) => token[0].toUpperCase() + token.slice(1));
}

/** Tipos de acorde del vocabulario estructurado (uno por sufijo). */
export type ChordType =
  | "major"
  | "minor"
  | "7"
  | "maj7"
  | "m7"
  | "sus2"
  | "sus4";

export const CHORD_TYPES: { type: ChordType; suffix: string }[] = [
  { type: "major", suffix: "" },
  { type: "minor", suffix: "m" },
  { type: "7", suffix: "7" },
  { type: "maj7", suffix: "maj7" },
  { type: "m7", suffix: "m7" },
  { type: "sus2", suffix: "sus2" },
  { type: "sus4", suffix: "sus4" },
];

/** Fundamentales canónicas, una por semitono (0 = C). */
export const CHORD_ROOTS: { root: string; pitchClass: number }[] = [
  { root: "C", pitchClass: 0 },
  { root: "C#", pitchClass: 1 },
  { root: "D", pitchClass: 2 },
  { root: "Eb", pitchClass: 3 },
  { root: "E", pitchClass: 4 },
  { root: "F", pitchClass: 5 },
  { root: "F#", pitchClass: 6 },
  { root: "G", pitchClass: 7 },
  { root: "Ab", pitchClass: 8 },
  { root: "A", pitchClass: 9 },
  { root: "Bb", pitchClass: 10 },
  { root: "B", pitchClass: 11 },
];

const LETTER_PITCH: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

function normalizePitchClass(pitchClass: number): number {
  return ((Math.round(pitchClass) % 12) + 12) % 12;
}

/** Devuelve la grafía canónica de la librería para una clase de altura. */
export function getCanonicalRoot(pitchClass: number): string {
  const normalized = normalizePitchClass(pitchClass);
  return (
    CHORD_ROOTS.find((entry) => entry.pitchClass === normalized)?.root ?? "C"
  );
}

export function getChordSuffix(type: ChordType): string {
  return CHORD_TYPES.find((entry) => entry.type === type)?.suffix ?? "";
}

/** Acorde descompuesto en fundamental, tipo y clave de identidad. */
export interface ParsedChord {
  /** Fundamental tal como se escribió (letra en mayúscula). */
  root: string;
  type: ChordType;
  /** Clase de altura 0-11 (0 = C). */
  pitchClass: number;
  /** Clave que ignora la grafía: `Db7` y `C#7` comparten identidad. */
  identity: string;
}

/** Clave de identidad de un acorde: misma para la misma nota y tipo. */
export function chordIdentity(pitchClass: number, type: ChordType): string {
  return `${normalizePitchClass(pitchClass)}:${type}`;
}

function typeForSuffix(suffix: string): ChordType | undefined {
  return CHORD_TYPES.find((entry) => entry.suffix === suffix)?.type;
}

/**
 * Descompone un nombre de acorde en fundamental y tipo. Devuelve `null` si la
 * fundamental o el sufijo quedan fuera del vocabulario (p. ej. `Cadd9`), para
 * tratarlo como acorde propio. Conserva la grafía escrita y expone una clave
 * de identidad que ignora la grafía.
 */
export function parseChordName(name: string): ParsedChord | null {
  const match = name.trim().match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!match) return null;

  const [, letter, accidental, suffix] = match;
  const type = typeForSuffix(suffix);
  if (!type) return null;

  const letterPitch = LETTER_PITCH[letter.toUpperCase()];
  if (letterPitch === undefined) return null;

  const offset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  const pitchClass = normalizePitchClass(letterPitch + offset);
  return {
    root: letter.toUpperCase() + accidental,
    type,
    pitchClass,
    identity: chordIdentity(pitchClass, type),
  };
}

/** Compone un nombre a partir de una fundamental y un tipo. */
export function formatChordName(root: string, type: ChordType): string {
  return `${root}${getChordSuffix(type)}`;
}

/** Semitonos de cada calidad del vocabulario, relativos a su fundamental. */
const CHORD_INTERVALS: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  "7": [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

/**
 * Notas que no pueden faltar en cada calidad. La quinta es opcional, porque
 * muchas formas (p. ej. el Do7 abierto, x32310) la omiten.
 */
const CHORD_CORE: Record<ChordType, number[]> = {
  major: [0, 4],
  minor: [0, 3],
  "7": [0, 4, 10],
  maj7: [0, 4, 11],
  m7: [0, 3, 10],
  sus2: [0, 2],
  sus4: [0, 5],
};

/** Altura MIDI de cada cuerda al aire en afinación estándar, de la 6ª a la 1ª. */
const OPEN_MIDI = [40, 45, 50, 55, 59, 64];

/**
 * Nombra el acorde que forman los trastes dibujados en afinación estándar.
 * Devuelve `null` si las notas no forman ningún acorde del vocabulario. Cuando
 * las mismas notas admiten más de un nombre, gana el de la nota más grave.
 */
export function detectChordName(frets: (number | null)[]): string | null {
  const sounding = frets
    .map((fret, index) => {
      if (typeof fret !== "number") return null;
      const midi = OPEN_MIDI[index] + fret;
      return { pitchClass: normalizePitchClass(midi), midi };
    })
    .filter((note): note is { pitchClass: number; midi: number } => note !== null);
  if (sounding.length < 3) return null;

  const pitchClasses = [...new Set(sounding.map((note) => note.pitchClass))];
  if (pitchClasses.length < 3) return null;

  const bass = normalizePitchClass(
    Math.min(...sounding.map((note) => note.midi)),
  );

  const candidates: { name: string; root: number }[] = [];
  for (const root of pitchClasses) {
    const intervals = pitchClasses.map((pitchClass) =>
      normalizePitchClass(pitchClass - root),
    );
    for (const { type } of CHORD_TYPES) {
      const formula = CHORD_INTERVALS[type];
      const core = CHORD_CORE[type];
      const withinFormula = intervals.every((value) => formula.includes(value));
      const hasCore = core.every((value) => intervals.includes(value));
      if (withinFormula && hasCore) {
        candidates.push({
          name: formatChordName(getCanonicalRoot(root), type),
          root,
        });
      }
    }
  }

  if (candidates.length === 0) return null;
  const rootPosition = candidates.find((candidate) => candidate.root === bass);
  return (rootPosition ?? candidates[0]).name;
}

/**
 * Formas movibles con la raíz en la 6ª cuerda (forma de Mi). Los trastes son
 * desplazamientos respecto al traste de la raíz; `null` = muteada.
 */
const SIXTH_STRING_SHAPES: Record<ChordType, (number | null)[]> = {
  major: [0, 2, 2, 1, 0, 0],
  minor: [0, 2, 2, 0, 0, 0],
  "7": [0, 2, 0, 1, 0, 0],
  maj7: [0, 2, 1, 1, 0, 0],
  m7: [0, 2, 0, 0, 0, 0],
  sus2: [0, 2, 4, 4, 0, 0],
  sus4: [0, 2, 2, 2, 0, 0],
};

/**
 * Formas movibles con la raíz en la 5ª cuerda (forma de La). La 6ª va muteada.
 */
const FIFTH_STRING_SHAPES: Record<ChordType, (number | null)[]> = {
  major: [null, 0, 2, 2, 2, 0],
  minor: [null, 0, 2, 2, 1, 0],
  "7": [null, 0, 2, 0, 2, 0],
  maj7: [null, 0, 2, 1, 2, 0],
  m7: [null, 0, 2, 0, 1, 0],
  sus2: [null, 0, 2, 2, 0, 0],
  sus4: [null, 0, 2, 2, 3, 0],
};

/**
 * Formas movibles con la raíz en la 4ª cuerda (forma de Re). La 6ª y la 5ª van
 * muteadas.
 */
const FOURTH_STRING_SHAPES: Record<ChordType, (number | null)[]> = {
  major: [null, null, 0, 2, 3, 2],
  minor: [null, null, 0, 2, 3, 1],
  "7": [null, null, 0, 2, 1, 2],
  maj7: [null, null, 0, 2, 2, 2],
  m7: [null, null, 0, 2, 1, 1],
  sus2: [null, null, 0, 2, 3, 0],
  sus4: [null, null, 0, 2, 3, 3],
};

/** Afinación estándar de referencia para colocar las formas movibles. */
const OPEN_PITCH = { sixth: 4, fifth: 9, fourth: 2 };

/** Traste de referencia de una forma: el más grave que se pisa (0 si al aire). */
function shapePosition(shape: ChordShape): number {
  const played = shape.frets.filter(
    (fret): fret is number => typeof fret === "number" && fret > 0,
  );
  return played.length > 0 ? Math.min(...played) : 0;
}

function shapeKey(shape: ChordShape): string {
  return shape.frets.map((fret) => (fret === null ? "x" : fret)).join(",");
}

function dedupeShapes(shapes: ChordShape[]): ChordShape[] {
  const seen = new Set<string>();
  return shapes.filter((shape) => {
    const key = shapeKey(shape);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Formas tocables para una combinación de nota y tipo, con la raíz en la 6ª,
 * la 5ª o la 4ª cuerda, ordenadas de la posición más grave a la más aguda y
 * sin formas repetidas.
 */
export function getGeneratedChordVoicings(
  pitchClass: number,
  type: ChordType,
): ChordShape[] {
  const normalized = normalizePitchClass(pitchClass);
  const templates = [
    {
      rootFret: normalizePitchClass(normalized - OPEN_PITCH.sixth),
      template: SIXTH_STRING_SHAPES[type],
    },
    {
      rootFret: normalizePitchClass(normalized - OPEN_PITCH.fifth),
      template: FIFTH_STRING_SHAPES[type],
    },
    {
      rootFret: normalizePitchClass(normalized - OPEN_PITCH.fourth),
      template: FOURTH_STRING_SHAPES[type],
    },
  ];

  const voicings = templates.map(({ rootFret, template }) =>
    normalizeChordShape({
      frets: template.map((value) =>
        value === null ? null : rootFret + value,
      ),
    }),
  );
  voicings.sort((left, right) => shapePosition(left) - shapePosition(right));
  return dedupeShapes(voicings);
}

/**
 * Calcula una forma tocable para cualquier combinación de nota y tipo: la
 * primera posición de la lista de voicings.
 */
export function getGeneratedChordShape(
  pitchClass: number,
  type: ChordType,
): ChordShape {
  return getGeneratedChordVoicings(pitchClass, type)[0];
}

/**
 * Voicings de un acorde por prioridad: primero el acorde guardado por el
 * usuario, después la librería y el generador, ordenados por posición y sin
 * formas repetidas.
 */
export function getChordVoicings(
  name: string,
  saved: UserChord[] = [],
): ChordShape[] {
  const trimmed = name.trim();
  if (trimmed.length === 0) return [];

  const voicings: ChordShape[] = [];
  const savedMatch = findSavedChord(trimmed, saved);
  if (savedMatch) voicings.push(savedMatch.shape);

  const rest: ChordShape[] = [];
  const parsed = parseChordName(trimmed);
  if (!parsed) {
    const libraryShape = getChordShape(trimmed);
    if (libraryShape) rest.push(libraryShape);
  } else {
    const canonicalName = formatChordName(
      getCanonicalRoot(parsed.pitchClass),
      parsed.type,
    );
    const libraryShape = getChordShape(canonicalName);
    if (libraryShape) rest.push(libraryShape);
    rest.push(...getGeneratedChordVoicings(parsed.pitchClass, parsed.type));
  }

  rest.sort((left, right) => shapePosition(left) - shapePosition(right));
  voicings.push(...rest);
  return dedupeShapes(voicings);
}

/**
 * Índice de la posición que dibuja la misma forma, o `-1` si la forma es propia
 * del usuario y no coincide con ninguna. Compara los seis trastes: el traste
 * base es derivado.
 */
export function findVoicingIndex(
  shape: ChordShape | undefined,
  voicings: ChordShape[],
): number {
  if (!shape) return -1;
  const key = shapeKey(normalizeChordShape(shape));
  return voicings.findIndex(
    (voicing) => shapeKey(normalizeChordShape(voicing)) === key,
  );
}

/**
 * Busca un acorde guardado que corresponda al nombre, por nombre exacto o por
 * identidad (para que `Db7` encuentre el `C#7` guardado).
 */
export function findSavedChord(
  name: string,
  saved: UserChord[] = [],
): UserChord | undefined {
  const trimmed = name.trim();
  if (trimmed.length === 0) return undefined;

  const identity = parseChordName(trimmed)?.identity;
  return (
    saved.find((chord) => chord.name.trim() === trimmed) ??
    (identity ?
      saved.find(
        (chord) => parseChordName(chord.name)?.identity === identity,
      )
    : undefined)
  );
}

/**
 * ¿Los dos acordes guardados son el mismo? Por identidad si ambos se pueden
 * descomponer (para no duplicar `Db7` y `C#7`) y, si no, por nombre.
 */
export function isSameChord(left: UserChord, right: UserChord): boolean {
  const leftParsed = parseChordName(left.name);
  const rightParsed = parseChordName(right.name);
  if (leftParsed && rightParsed) {
    return leftParsed.identity === rightParsed.identity;
  }
  return left.name.trim() === right.name.trim();
}

/**
 * Resuelve la forma de un acorde por prioridad: primero los acordes guardados
 * por el usuario (por nombre o por identidad), después la librería y, si no
 * hay, una forma generada.
 */
export function resolveChordShape(
  name: string,
  saved: UserChord[] = [],
): ChordShape | undefined {
  return getChordVoicings(name, saved)[0];
}

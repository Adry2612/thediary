import type { model } from "@coderline/alphatab";
import type { MusicalKey } from "../../types/lick.ts";

const ROOT_NAMES = [
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
] as const;

/** Perfiles de Krumhansl-Schmuckler, en el orden de las 12 fundamentales. */
const MAJOR_PROFILE = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
];
const MINOR_PROFILE = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
];

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9];
const MINOR_PENTATONIC_INTERVALS = [0, 3, 5, 7, 10];
const MAJOR_BLUES_INTERVALS = [0, 2, 3, 4, 7, 9];
const MINOR_BLUES_INTERVALS = [0, 3, 5, 6, 7, 10];

export type GuitarProNoteTechniques = {
  hammerPullOrigin: boolean;
  slideIn: boolean;
  slideOut: boolean;
  bend: boolean;
  vibrato: boolean;
  rest: boolean;
  dead: boolean;
  percussion: boolean;
};

export type GuitarProNote = {
  /** Compás 1-based dentro del staff. */
  measure: number;
  /** Pulso 0-based dentro del compás, contando todas sus voces. */
  beatIndex: number;
  midiNote: number;
  noteName: string;
  /** Cuerda 1-based de alphaTab: 1 es la más grave. */
  string: number;
  fret: number;
  techniques: GuitarProNoteTechniques;
};

function correlation(histogram: number[], profile: number[]): number {
  const histogramMean =
    histogram.reduce((total, value) => total + value, 0) / 12;
  const profileMean = profile.reduce((total, value) => total + value, 0) / 12;
  let numerator = 0;
  let histogramVariance = 0;
  let profileVariance = 0;
  for (let index = 0; index < 12; index += 1) {
    const h = histogram[index] - histogramMean;
    const p = profile[index] - profileMean;
    numerator += h * p;
    histogramVariance += h * h;
    profileVariance += p * p;
  }
  const denominator = Math.sqrt(histogramVariance * profileVariance);
  return denominator === 0 ? 0 : numerator / denominator;
}

function keyFor(tonic: number, minor: boolean): MusicalKey {
  return `${ROOT_NAMES[tonic]}${minor ? "m" : ""}` as MusicalKey;
}

function coverageForIntervals(
  histogram: number[],
  intervals: number[],
  tonic: number,
): number {
  let inScale = 0;
  let total = 0;
  for (let pitchClass = 0; pitchClass < 12; pitchClass += 1) {
    total += histogram[pitchClass];
    if (intervals.includes((pitchClass - tonic + 12) % 12)) {
      inScale += histogram[pitchClass];
    }
  }
  return total === 0 ? 0 : inScale / total;
}

function keyParts(key: MusicalKey): { root: number; minor: boolean } {
  const minor = key.endsWith("m");
  const rootName = minor ? key.slice(0, -1) : key;
  return {
    root: ROOT_NAMES.indexOf(rootName as (typeof ROOT_NAMES)[number]),
    minor,
  };
}

function isRelativeMajorMinor(left: MusicalKey, right: MusicalKey): boolean {
  const leftParts = keyParts(left);
  const rightParts = keyParts(right);
  if (leftParts.minor === rightParts.minor) return false;
  const minor = leftParts.minor ? leftParts : rightParts;
  const major = leftParts.minor ? rightParts : leftParts;
  return (minor.root + 3) % 12 === major.root;
}

/**
 * Cuando el mayor y su relativo menor empatan, la primera o la última nota
 * deciden. Si la frase no toca ninguna de las dos tónicas, se prefiere el
 * menor, que es el caso habitual en licks de guitarra.
 */
function pickRelativeKey(
  left: MusicalKey,
  right: MusicalKey,
  firstPitchClass: number,
  lastPitchClass: number,
): MusicalKey {
  const leftParts = keyParts(left);
  const rightParts = keyParts(right);
  const minorKey = leftParts.minor ? left : right;
  const majorKey = leftParts.minor ? right : left;
  const minorRoot = keyParts(minorKey).root;
  const majorRoot = keyParts(majorKey).root;

  if (firstPitchClass === minorRoot) return minorKey;
  if (firstPitchClass === majorRoot) return majorKey;
  if (lastPitchClass === minorRoot) return minorKey;
  if (lastPitchClass === majorRoot) return majorKey;
  return minorKey;
}

/**
 * Puntúa cada tonalidad combinando el perfil de Krumhansl con la cobertura de
 * su escala y la nota final. En licks cortos el perfil solo se sesga hacia la
 * primera nota; la cobertura y la resolución de la frase lo corrigen.
 */
function scoreKeys(pitches: number[]) {
  const histogram = new Array<number>(12).fill(0);
  for (let index = 0; index < pitches.length; index += 1) {
    const pitchClass = ((pitches[index] % 12) + 12) % 12;
    const weight =
      index === 0 ? 3 : index === pitches.length - 1 ? 1.5 : 1;
    histogram[pitchClass] += weight;
  }

  const firstPitchClass = ((pitches[0] % 12) + 12) % 12;
  const lastPitchClass =
    ((pitches[pitches.length - 1] % 12) + 12) % 12;

  const candidates: Array<{
    key: MusicalKey;
    score: number;
    coverage: number;
  }> = [];

  for (let tonic = 0; tonic < 12; tonic += 1) {
    for (const minor of [false, true]) {
      const profile = (minor ? MINOR_PROFILE : MAJOR_PROFILE).map(
        (_, index) =>
          (minor ? MINOR_PROFILE : MAJOR_PROFILE)[
            (index - tonic + 12) % 12
          ],
      );
      const profileScore = (correlation(histogram, profile) + 1) / 2;
      const fullCoverage = coverageForIntervals(
        histogram,
        minor ? MINOR_INTERVALS : MAJOR_INTERVALS,
        tonic,
      );
      const pentatonicCoverage = coverageForIntervals(
        histogram,
        minor ? MINOR_PENTATONIC_INTERVALS : MAJOR_PENTATONIC_INTERVALS,
        tonic,
      );
      const bluesCoverage = coverageForIntervals(
        histogram,
        minor ? MINOR_BLUES_INTERVALS : MAJOR_BLUES_INTERVALS,
        tonic,
      );
      const coverage = Math.max(
        fullCoverage,
        pentatonicCoverage,
        bluesCoverage,
      );
      const fifth = (tonic + 7) % 12;
      const lastResolution =
        lastPitchClass === tonic ? 1 : lastPitchClass === fifth ? 0.5 : 0;
      const firstResolution =
        firstPitchClass === tonic ? 1 : firstPitchClass === fifth ? 0.5 : 0;
      const score =
        profileScore * 0.3 +
        coverage ** 3 * 0.65 +
        lastResolution * 0.05 +
        firstResolution * 0.025;

      candidates.push({ key: keyFor(tonic, minor), score, coverage });
    }
  }

  return candidates.sort((left, right) => right.score - left.score);
}

/**
 * Estima la tonalidad de una secuencia de alturas MIDI. La primera y la última
 * nota pesan más porque suelen apoyar la tónica; con pocas notas, demasiadas
 * clases o una escala poco cubierta devuelve `null` para no adivinar.
 */
export function estimateKey(pitches: number[]): MusicalKey | null {
  if (pitches.length < 3) return null;

  const distinctPitchClasses = new Set(
    pitches.map((pitch) => ((pitch % 12) + 12) % 12),
  ).size;
  if (distinctPitchClasses < 3 || distinctPitchClasses > 9) return null;

  const candidates = scoreKeys(pitches);
  const [best, second] = candidates;
  if (!best || best.score < 0.55 || best.coverage < 0.75) return null;

  const firstPitchClass = ((pitches[0] % 12) + 12) % 12;
  const lastPitchClass =
    ((pitches[pitches.length - 1] % 12) + 12) % 12;

  if (
    second &&
    isRelativeMajorMinor(best.key, second.key) &&
    best.score - second.score <= 0.08
  ) {
    return pickRelativeKey(
      best.key,
      second.key,
      firstPitchClass,
      lastPitchClass,
    );
  }

  return best.key;
}

/** Nombre científico de una altura MIDI, por ejemplo `E2` o `F#4`. */
export function midiNoteName(midiNote: number): string {
  const pitchClass = ((Math.round(midiNote) % 12) + 12) % 12;
  const octave = Math.floor(Math.round(midiNote) / 12) - 1;
  return `${ROOT_NAMES[pitchClass]}${octave}`;
}

function firstMelodicTrackIndex(score: model.Score): number {
  return score.tracks.findIndex((track) => !track.isPercussion);
}

/**
 * Extrae las notas reales de una pista de alphaTab siguiendo su modelo:
 * `staff.tuning` viene de la cuerda más aguda a la más grave y `note.string`
 * es 1-based desde la más grave, así que el índice es
 * `tuning.length - note.string`. Se suma el capo y se resta la transposición
 * del staff, igual que hace `Note.realValue` para instrumentos con trastes.
 */
export function extractGuitarProNotes(
  score: model.Score,
  trackIndex = firstMelodicTrackIndex(score),
): GuitarProNote[] {
  const track = score.tracks[trackIndex];
  const staff = track?.staves[0];
  if (!track || track.isPercussion || !staff) return [];

  const tuning = staff.tuning;
  const capo = staff.capo ?? 0;
  const transpositionPitch = staff.transpositionPitch ?? 0;
  const notes: GuitarProNote[] = [];

  for (const bar of staff.bars) {
    let beatIndex = 0;
    for (const voice of bar.voices) {
      for (const beat of voice.beats) {
        for (const note of beat.notes) {
          const tuningIndex = tuning.length - note.string;
          const openMidi =
            tuningIndex >= 0 && tuningIndex < tuning.length
              ? tuning[tuningIndex]
              : undefined;
          const midiNote =
            note.isStringed && openMidi !== undefined
              ? openMidi + capo + note.fret - transpositionPitch
              : Math.round(note.realValue);

          if (
            Number.isFinite(midiNote) &&
            midiNote >= 0 &&
            midiNote <= 127
          ) {
            notes.push({
              measure: bar.index + 1,
              beatIndex,
              midiNote,
              noteName: midiNoteName(midiNote),
              string: note.string,
              fret: note.fret,
              techniques: {
                hammerPullOrigin: note.isHammerPullOrigin,
                slideIn: note.slideInType !== 0,
                slideOut: note.slideOutType !== 0,
                bend: note.bendType !== 0,
                vibrato: note.vibrato !== 0,
                rest: beat.isRest,
                dead: note.isDead,
                percussion: note.isPercussion,
              },
            });
          }
        }
        beatIndex += 1;
      }
    }
  }

  return notes;
}

/** Alturas de la pista melódica indicada, sin notas muertas ni percusión. */
export function extractPitchesFromScore(
  score: model.Score,
  trackIndex = firstMelodicTrackIndex(score),
): number[] {
  return extractGuitarProNotes(score, trackIndex)
    .filter(
      (note) => !note.techniques.dead && !note.techniques.percussion,
    )
    .map((note) => note.midiNote);
}

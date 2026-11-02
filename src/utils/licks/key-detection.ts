import { getTabTuningMidi } from "../tab-playback.ts";
import { tuningToMidi } from "../tab-score/alphatex.ts";
import { getStringCount } from "../tab-score/model.ts";
import type { MusicalKey } from "../../types/lick.ts";
import type { TabScore } from "../../types/tab-score.ts";
import type { RepertoireTab } from "../../types/practice.ts";

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

/**
 * Estima la tonalidad de una secuencia de alturas MIDI. La primera y la última
 * nota pesan más porque suelen apoyar la tónica; con pocas notas o pocas
 * clases distintas devuelve `null` para no adivinar.
 */
export function estimateKey(pitches: number[]): MusicalKey | null {
  if (pitches.length < 3) return null;

  const histogram = new Array<number>(12).fill(0);
  for (let index = 0; index < pitches.length; index += 1) {
    const pitchClass = ((pitches[index] % 12) + 12) % 12;
    const weight =
      index === 0 ? 3 : index === pitches.length - 1 ? 1.5 : 1;
    histogram[pitchClass] += weight;
  }

  const distinctPitchClasses = histogram.reduce(
    (total, value) => total + (value > 0 ? 1 : 0),
    0,
  );
  if (distinctPitchClasses < 3) return null;

  let bestKey = keyFor(0, false);
  let bestScore = -Infinity;
  for (let tonic = 0; tonic < 12; tonic += 1) {
    for (const minor of [false, true]) {
      const profile = (minor ? MINOR_PROFILE : MAJOR_PROFILE).map(
        (_, index) =>
          (minor ? MINOR_PROFILE : MAJOR_PROFILE)[
            (index - tonic + 12) % 12
          ],
      );
      const score = correlation(histogram, profile);
      if (score > bestScore) {
        bestScore = score;
        bestKey = keyFor(tonic, minor);
      }
    }
  }

  return bestScore > 0.1 ? bestKey : null;
}

/**
 * Estima la tonalidad de una tablatura de rejilla a partir de sus alturas y del
 * peso que tienen en la frase.
 */
export function detectTabKey(tab: RepertoireTab): MusicalKey | null {
  const tuning = getTabTuningMidi(tab.tuning);
  const pitches: number[] = [];

  for (const note of tab.notes) {
    if (note.dead) continue;
    pitches.push(tuning[note.string] + note.fret);
  }

  return estimateKey(pitches);
}

/**
 * Estima la tonalidad de la partitura visual tal como se está editando, usando
 * su afinación y saltando las notas muertas.
 */
export function detectScoreKey(
  score: Pick<TabScore, "tuning" | "bars">,
): MusicalKey | null {
  const stringCount = getStringCount(score.tuning);
  const tuning = tuningToMidi(score.tuning, stringCount);
  if (!tuning) return null;

  const pitches: number[] = [];
  for (const bar of score.bars) {
    for (const beat of bar.beats) {
      for (const note of beat.notes) {
        if (note.dead) continue;
        const open = tuning[note.string];
        if (open === undefined) continue;
        pitches.push(open + note.fret);
      }
    }
  }

  return estimateKey(pitches);
}

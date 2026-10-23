export interface MetronomeBpmSample {
  elapsedSeconds: number;
  bpm: number;
}

/**
 * Añade una muestra al historial de BPM. Si ya hay una muestra en el mismo
 * segundo, la sustituye: el cambio más reciente manda y no se acumulan dos
 * valores para el mismo instante.
 */
export function addBpmSample(
  samples: MetronomeBpmSample[],
  elapsedSeconds: number,
  bpm: number,
): MetronomeBpmSample[] {
  const previousSample = samples.at(-1);
  if (previousSample?.elapsedSeconds === elapsedSeconds) {
    return [...samples.slice(0, -1), { elapsedSeconds, bpm }];
  }

  return [...samples, { elapsedSeconds, bpm }];
}

export function getTimeWeightedAverageBpm(
  samples: MetronomeBpmSample[],
  durationSeconds: number,
): number {
  if (durationSeconds <= 0 || samples.length === 0) return 0;

  const sortedSamples = [...samples].sort(
    (first, second) => first.elapsedSeconds - second.elapsedSeconds,
  );
  const timeline = sortedSamples.reduce<MetronomeBpmSample[]>(
    (result, sample) => {
      const elapsedSeconds = Math.min(
        durationSeconds,
        Math.max(0, sample.elapsedSeconds),
      );
      const previous = result.at(-1);
      if (previous?.elapsedSeconds === elapsedSeconds) {
        result[result.length - 1] = { ...sample, elapsedSeconds };
        return result;
      }

      result.push({ ...sample, elapsedSeconds });
      return result;
    },
    [],
  );

  let currentBpm = timeline[0].bpm;
  let previousElapsedSeconds = 0;
  let weightedBpm = 0;

  for (const sample of timeline) {
    weightedBpm +=
      (sample.elapsedSeconds - previousElapsedSeconds) * currentBpm;
    previousElapsedSeconds = sample.elapsedSeconds;
    currentBpm = sample.bpm;
  }

  weightedBpm += (durationSeconds - previousElapsedSeconds) * currentBpm;
  return Math.round(weightedBpm / durationSeconds);
}

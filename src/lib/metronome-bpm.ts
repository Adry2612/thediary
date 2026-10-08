export interface MetronomeBpmSample {
  elapsedSeconds: number;
  bpm: number;
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

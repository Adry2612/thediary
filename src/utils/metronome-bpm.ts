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

/**
 * BPM medio de cada bloque a partir de la línea temporal de la sesión.
 *
 * La línea temporal usa segundos de sesión; los bloques se separan por la suma
 * acumulada de sus duraciones. Un bloque de duración cero, o en el que el
 * metrónomo no llegó a sonar, devuelve `0` (sin BPM registrado).
 */
export function getBlockAverageBpms(
  samples: MetronomeBpmSample[],
  blockDurationsSeconds: number[],
  metronomeBlockIndexes?: Iterable<number>,
): number[] {
  const metronomeBlocks = metronomeBlockIndexes
    ? new Set(metronomeBlockIndexes)
    : null;
  const sortedSamples = [...samples].sort(
    (first, second) => first.elapsedSeconds - second.elapsedSeconds,
  );
  let blockStart = 0;

  return blockDurationsSeconds.map((duration, index) => {
    const safeDuration = Math.max(0, duration);
    const blockEnd = blockStart + safeDuration;
    const ranWithMetronome = metronomeBlocks
      ? metronomeBlocks.has(index)
      : true;
    let averageBpm = 0;

    if (safeDuration > 0 && ranWithMetronome) {
      let previousSample: MetronomeBpmSample | undefined;
      const blockSamples: MetronomeBpmSample[] = [];

      for (const sample of sortedSamples) {
        if (sample.elapsedSeconds <= blockStart) {
          previousSample = sample;
          continue;
        }
        if (sample.elapsedSeconds >= blockEnd) break;
        blockSamples.push({
          elapsedSeconds: sample.elapsedSeconds - blockStart,
          bpm: sample.bpm,
        });
      }

      if (previousSample) {
        blockSamples.unshift({
          elapsedSeconds: 0,
          bpm: previousSample.bpm,
        });
      }

      averageBpm = getTimeWeightedAverageBpm(blockSamples, safeDuration);
    }

    blockStart = blockEnd;
    return averageBpm;
  });
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

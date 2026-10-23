const BASELINE_HEIGHT = 0.08;

export function getWaveformLevels(
  samples: Uint8Array,
  barCount = 24,
): number[] {
  if (!Number.isInteger(barCount) || barCount < 1) {
    throw new RangeError("La forma de onda necesita al menos una barra.");
  }

  return Array.from({ length: barCount }, (_, index) => {
    if (samples.length === 0) return BASELINE_HEIGHT;

    const start = Math.min(
      samples.length - 1,
      Math.floor((index * samples.length) / barCount),
    );
    const end = Math.min(
      samples.length,
      Math.max(start + 1, Math.floor(((index + 1) * samples.length) / barCount)),
    );
    let peak = 0;

    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      peak = Math.max(peak, Math.abs(samples[sampleIndex] - 128) / 128);
    }

    return Math.max(BASELINE_HEIGHT, Math.min(1, peak * 4));
  });
}

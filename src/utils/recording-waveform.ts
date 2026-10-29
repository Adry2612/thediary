const BASELINE_HEIGHT = 0.08;

/** Altura mínima de una barra: una línea visible incluso en silencio. */
export const WAVEFORM_BASELINE_HEIGHT = BASELINE_HEIGHT;

/** Barras que caben en el marco de la pletina. */
export const WAVEFORM_BAR_COUNT = 64;

function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return BASELINE_HEIGHT;
  return Math.max(BASELINE_HEIGHT, Math.min(1, level));
}

/**
 * Añade un nivel al final del búfer y desplaza los antiguos fuera por la
 * izquierda. Devuelve siempre un array de `barCount` barras, rellenando el
 * principio con la línea base mientras la grabación empieza.
 */
export function appendWaveformLevel(
  levels: readonly number[],
  level: number,
  barCount = WAVEFORM_BAR_COUNT,
): number[] {
  if (!Number.isInteger(barCount) || barCount < 1) {
    throw new RangeError("La forma de onda necesita al menos una barra.");
  }

  const trimmed = [...levels, clampLevel(level)].slice(-barCount);
  const padding = Array.from(
    { length: Math.max(0, barCount - trimmed.length) },
    () => BASELINE_HEIGHT,
  );

  return [...padding, ...trimmed];
}

/**
 * Picos por barra de una señal ya decodificada, en el rango -1..1. Una señal
 * ausente o vacía devuelve la línea base: es el respaldo cuando el navegador
 * no puede decodificar el audio guardado.
 */
export function getWaveformPeaks(
  samples: ArrayLike<number> | null | undefined,
  barCount = WAVEFORM_BAR_COUNT,
): number[] {
  if (!Number.isInteger(barCount) || barCount < 1) {
    throw new RangeError("La forma de onda necesita al menos una barra.");
  }

  if (!samples || samples.length === 0) {
    return Array.from({ length: barCount }, () => BASELINE_HEIGHT);
  }

  return Array.from({ length: barCount }, (_, index) => {
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
      peak = Math.max(peak, Math.abs(samples[sampleIndex]));
    }

    return Math.max(BASELINE_HEIGHT, Math.min(1, peak * 4));
  });
}

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

const TOOLTIP_WIDTH = 208;
const TOOLTIP_HEIGHT = 112;
const TOOLTIP_INSET = 8;

/** A partir de una hora, la distancia a la mejor marca se cuenta en tiempo. */
const DURATION_GAP_SECONDS = 3_600;

export interface BucketComparison {
  /** La marca es la mejor del periodo. */
  isBest: boolean;
  gapSeconds: number;
  /** Proporción que falta respecto a la mejor marca, de 0 a 1. */
  gapRatio: number;
  /** Si la distancia se explica mejor como duración que como porcentaje. */
  useDuration: boolean;
}

/** Compara una barra con la mejor del periodo para el tooltip del gráfico. */
export function getBucketComparison(
  bucketSeconds: number,
  bestSeconds: number,
): BucketComparison {
  const gapSeconds = Math.max(0, bestSeconds - bucketSeconds);
  return {
    isBest: gapSeconds === 0,
    gapSeconds,
    gapRatio: bestSeconds > 0 ? gapSeconds / bestSeconds : 0,
    useDuration: gapSeconds >= DURATION_GAP_SECONDS,
  };
}

/** Indica si una clave `AAAA-MM-DD` cae dentro del intervalo de un bucket. */
export function isDateKeyInBucket(
  dateKey: string,
  bucket: { startDate: string; endDate: string },
): boolean {
  return bucket.startDate <= dateKey && dateKey <= bucket.endDate;
}

export function getContainedTooltipPosition(
  anchorX: number,
  anchorY: number,
  containerWidth: number,
  containerHeight: number,
) {
  const maximumLeft = Math.max(
    TOOLTIP_INSET,
    containerWidth - TOOLTIP_WIDTH - TOOLTIP_INSET,
  );
  const maximumTop = Math.max(
    TOOLTIP_INSET,
    containerHeight - TOOLTIP_HEIGHT - TOOLTIP_INSET,
  );

  return {
    left: Math.max(
      TOOLTIP_INSET,
      Math.min(anchorX - TOOLTIP_WIDTH / 2, maximumLeft),
    ),
    top: Math.max(
      TOOLTIP_INSET,
      Math.min(anchorY - TOOLTIP_HEIGHT - TOOLTIP_INSET, maximumTop),
    ),
  };
}

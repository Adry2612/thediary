import type {
  PracticeMetric,
  PracticeMetricValue,
  SessionRecord,
} from "../types/practice.ts";
import {
  getPracticeChartRanges,
  type PracticeChartPeriod,
} from "./practice-analytics.ts";
import { getLocalDateKey } from "./local-date.ts";

/** Escala única de las métricas de bienestar: de 1 a 5. */
export const PRACTICE_METRIC_VALUES: readonly PracticeMetricValue[] = [
  1, 2, 3, 4, 5,
];

/**
 * Acepta solo un entero de 1 a 5. Cualquier otro valor —incluidos los que
 * llegan de una sesión antigua o de un formulario— se descarta.
 */
export function normalizePracticeMetricValue(
  value: unknown,
): PracticeMetricValue | null {
  const numeric =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;

  if (
    typeof numeric !== "number" ||
    !Number.isInteger(numeric) ||
    numeric < 1 ||
    numeric > 5
  ) {
    return null;
  }

  return numeric as PracticeMetricValue;
}

/** Clave de la etiqueta en el diccionario, p. ej. `metricMood4`. */
export function getPracticeMetricLabelKey(
  metric: PracticeMetric,
  value: PracticeMetricValue,
): string {
  return `metric${metric === "mood" ? "Mood" : "Focus"}${value}`;
}

export interface PracticeMetricAverage {
  /** Media de los valores presentes, redondeada a un decimal. */
  average: number;
  /** Sesiones que respondieron la métrica; las demás no cuentan. */
  count: number;
}

export type PracticeMetricTrend = "up" | "down" | "flat";

/**
 * Media de una métrica entre las sesiones que la respondieron. Devuelve
 * `null` cuando ninguna la respondió, para no mostrar un cero falso.
 */
export function getPracticeMetricAverage(
  sessions: readonly SessionRecord[],
  metric: PracticeMetric,
): PracticeMetricAverage | null {
  const values: PracticeMetricValue[] = [];

  for (const session of sessions) {
    const value = normalizePracticeMetricValue(session[metric]);
    if (value !== null) values.push(value);
  }

  if (values.length === 0) return null;

  const average =
    values.reduce((total, value) => total + value, 0) / values.length;

  return {
    average: Math.round(average * 10) / 10,
    count: values.length,
  };
}

/** Dirección del cambio frente al periodo anterior; `null` sin comparación. */
export function getPracticeMetricTrend(
  current: PracticeMetricAverage | null,
  previous: PracticeMetricAverage | null,
): PracticeMetricTrend | null {
  if (!current || !previous) return null;

  const change = Math.round((current.average - previous.average) * 10) / 10;
  if (change === 0) return "flat";
  return change > 0 ? "up" : "down";
}

export interface PracticeMetricRange {
  startDate: string;
  endDate: string;
}

export interface PracticeMetricSummary extends PracticeMetricAverage {
  previousAverage: number | null;
  /** Diferencia con el periodo anterior, en puntos de la escala. */
  change: number | null;
  trend: PracticeMetricTrend | null;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getSessionDateKey(session: SessionRecord) {
  return toDateKey(new Date(session.startedAt));
}

function filterByRange(
  sessions: readonly SessionRecord[],
  range: PracticeMetricRange,
): SessionRecord[] {
  return sessions.filter((session) => {
    const dateKey = getSessionDateKey(session);
    return dateKey >= range.startDate && dateKey <= range.endDate;
  });
}

/**
 * Resumen de una métrica para un periodo y su comparación con el anterior.
 * Solo cuenta las sesiones que respondieron la métrica.
 */
export function getPracticeMetricSummary(
  sessions: readonly SessionRecord[],
  metric: PracticeMetric,
  range?: PracticeMetricRange,
  previousRange?: PracticeMetricRange,
): PracticeMetricSummary | null {
  const current = getPracticeMetricAverage(
    range ? filterByRange(sessions, range) : sessions,
    metric,
  );
  if (!current) return null;

  const previous = previousRange
    ? getPracticeMetricAverage(filterByRange(sessions, previousRange), metric)
    : null;
  const change =
    previous ?
      Math.round((current.average - previous.average) * 10) / 10
    : null;

  return {
    ...current,
    previousAverage: previous?.average ?? null,
    change,
    trend: getPracticeMetricTrend(current, previous),
  };
}

export interface PracticeWellbeingBucket {
  label: string;
  startDate: string;
  endDate: string;
  mood: PracticeMetricAverage | null;
  focus: PracticeMetricAverage | null;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getPreviousWellbeingRange(
  period: PracticeChartPeriod,
  today: Date,
): PracticeMetricRange {
  if (period === "week") {
    const ranges = getPracticeChartRanges("week", addDays(today, -7));
    return {
      startDate: ranges[0].startDate,
      endDate: ranges[ranges.length - 1].endDate,
    };
  }

  if (period === "month") {
    return {
      startDate: getLocalDateKey(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
      ),
      endDate: getLocalDateKey(
        new Date(today.getFullYear(), today.getMonth(), 0),
      ),
    };
  }

  return {
    startDate: `${today.getFullYear() - 1}-01-01`,
    endDate: `${today.getFullYear() - 1}-12-31`,
  };
}

/** Valores de ánimo y foco por intervalo del periodo elegido. */
export function getPracticeWellbeingSeries(
  sessions: readonly SessionRecord[],
  period: PracticeChartPeriod,
  today = new Date(),
): PracticeWellbeingBucket[] {
  return getPracticeChartRanges(period, today).map((range) => {
    const inRange = sessions.filter((session) => {
      const dateKey = getSessionDateKey(session);
      return dateKey >= range.startDate && dateKey <= range.endDate;
    });

    return {
      ...range,
      mood: getPracticeMetricAverage(inRange, "mood"),
      focus: getPracticeMetricAverage(inRange, "focus"),
    };
  });
}

export interface PracticeWellbeingSummary {
  mood: PracticeMetricSummary | null;
  focus: PracticeMetricSummary | null;
}

/** Medias del periodo y comparación con el periodo equivalente anterior. */
export function getPracticeWellbeingSummary(
  sessions: readonly SessionRecord[],
  period: PracticeChartPeriod,
  today = new Date(),
): PracticeWellbeingSummary {
  const ranges = getPracticeChartRanges(period, today);
  const currentRange: PracticeMetricRange = {
    startDate: ranges[0].startDate,
    endDate: ranges[ranges.length - 1].endDate,
  };
  const previousRange = getPreviousWellbeingRange(period, today);

  return {
    mood: getPracticeMetricSummary(
      sessions,
      "mood",
      currentRange,
      previousRange,
    ),
    focus: getPracticeMetricSummary(
      sessions,
      "focus",
      currentRange,
      previousRange,
    ),
  };
}

/** Si el historial tiene al menos un valor, aunque no sea del periodo actual. */
export function hasPracticeWellbeingData(
  sessions: readonly SessionRecord[],
): boolean {
  return sessions.some(
    (session) =>
      normalizePracticeMetricValue(session.mood) !== null ||
      normalizePracticeMetricValue(session.focus) !== null,
  );
}

import { getLocalDateKey } from "./local-date.ts";
import type { PracticeChartPeriod } from "./practice-analytics.ts";

/** Tramo inclusivo de días, con claves locales AAAA-MM-DD. */
export type ComparisonSpan = {
  startDate: string;
  endDate: string;
};

export type ComparisonSpans = {
  current: ComparisonSpan;
  previous: ComparisonSpan;
};

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function toSpan(startDate: Date, endDate: Date): ComparisonSpan {
  return {
    startDate: getLocalDateKey(startDate),
    endDate: getLocalDateKey(endDate),
  };
}

/**
 * El periodo en curso y el tramo inmediatamente anterior de la misma longitud.
 * La semana son los 7 días que terminan hoy, el mes los 30 días que terminan
 * hoy y el año los 12 meses naturales que terminan con el mes actual. El tramo
 * anterior termina siempre el día antes de que empiece el actual.
 */
export function getComparisonSpans(
  period: PracticeChartPeriod,
  today: Date,
): ComparisonSpans {
  if (period === "week") {
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = addDays(end, -6);
    const previousEnd = addDays(start, -1);
    const previousStart = addDays(previousEnd, -6);
    return {
      current: toSpan(start, end),
      previous: toSpan(previousStart, previousEnd),
    };
  }

  if (period === "month") {
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = addDays(end, -29);
    const previousEnd = addDays(start, -1);
    const previousStart = addDays(previousEnd, -29);
    return {
      current: toSpan(start, end),
      previous: toSpan(previousStart, previousEnd),
    };
  }

  const currentStart = new Date(
    today.getFullYear(),
    today.getMonth() - 11,
    1,
  );
  const currentEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const previousYear = today.getFullYear() - 1;
  return {
    current: toSpan(currentStart, currentEnd),
    previous: toSpan(
      new Date(currentStart.getFullYear() - 1, currentStart.getMonth(), 1),
      new Date(
        previousYear,
        today.getMonth(),
        Math.min(today.getDate(), daysInMonth(previousYear, today.getMonth())),
      ),
    ),
  };
}

/** Suma los segundos diarios que caen dentro de un tramo. */
export function sumSecondsInSpan(
  dailySeconds: ReadonlyMap<string, number>,
  span: ComparisonSpan,
) {
  let total = 0;
  for (const [dateKey, seconds] of dailySeconds) {
    if (dateKey >= span.startDate && dateKey <= span.endDate) total += seconds;
  }
  return total;
}

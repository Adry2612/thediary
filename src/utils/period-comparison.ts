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

function startOfWeek(date: Date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
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
 * El periodo en curso y el mismo tramo ya transcurrido del periodo anterior.
 * El día 15 se compara con los días 1–15 del mes anterior, y un periodo
 * anterior más corto se compara entero.
 */
export function getComparisonSpans(
  period: PracticeChartPeriod,
  today: Date,
): ComparisonSpans {
  if (period === "week") {
    const monday = startOfWeek(today);
    const elapsedDays = ((today.getDay() + 6) % 7) + 1;
    const previousStart = addDays(monday, -7);
    return {
      current: toSpan(monday, today),
      previous: toSpan(previousStart, addDays(previousStart, elapsedDays - 1)),
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

  const year = today.getFullYear();
  const previousYear = year - 1;
  return {
    current: toSpan(new Date(year, 0, 1), today),
    previous: toSpan(
      new Date(previousYear, 0, 1),
      new Date(
        previousYear,
        today.getMonth(),
        Math.min(
          today.getDate(),
          daysInMonth(previousYear, today.getMonth()),
        ),
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

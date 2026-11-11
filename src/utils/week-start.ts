import type { WeekStartsOn } from "../types/display.ts";

/** Índice de `Date#getDay` del primer día de la semana. */
const WEEK_START_DAY: Record<WeekStartsOn, number> = {
  sunday: 0,
  monday: 1,
};

/**
 * Días que hay que retroceder desde una fecha hasta el inicio de su semana.
 * Es la operación que comparten el calendario anual, el resumen semanal y los
 * intervalos semanales de los gráficos.
 */
export function getWeekStartOffset(
  date: Date,
  weekStartsOn: WeekStartsOn,
): number {
  return (date.getDay() - WEEK_START_DAY[weekStartsOn] + 7) % 7;
}

/** Fecha local del inicio de la semana que contiene `date`. */
export function getStartOfWeek(
  date: Date,
  weekStartsOn: WeekStartsOn,
): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - getWeekStartOffset(start, weekStartsOn));
  return start;
}

/** Índices de `Date#getDay` en el orden en que se pinta la semana. */
export function getWeekdayOrder(weekStartsOn: WeekStartsOn): number[] {
  const first = WEEK_START_DAY[weekStartsOn];
  return Array.from({ length: 7 }, (_, index) => (first + index) % 7);
}

/** Posición de la primera columna de la rejilla anual. */
export function getCalendarFirstWeekday(
  year: number,
  weekStartsOn: WeekStartsOn,
): number {
  return getWeekStartOffset(new Date(year, 0, 1), weekStartsOn);
}

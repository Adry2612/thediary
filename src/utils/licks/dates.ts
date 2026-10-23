/**
 * Días de calendario entre una fecha y hoy. Usa componentes locales, no
 * milisegundos, para que un cambio de horario no mueva la cuenta.
 */
export function getDaysBetween(from: Date, to: Date): number {
  const fromDay = Date.UTC(
    from.getFullYear(),
    from.getMonth(),
    from.getDate(),
  );
  const toDay = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((toDay - fromDay) / 86_400_000);
}

export function getDaysSince(isoDate: string, today: Date): number | undefined {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return getDaysBetween(parsed, today);
}

export function isSameLocalDay(first: Date, second: Date): boolean {
  return getDaysBetween(first, second) === 0;
}

/** "hace 3 días" / "3 days ago" sin fijar el idioma en la lógica. */
export function formatDaysAgo(
  text: { dayAgoPrefix: string; dayAgoSuffix: string; daysAgoPrefix: string; daysAgoSuffix: string },
  days: number,
): string {
  return days === 1
    ? `${text.dayAgoPrefix}${days}${text.dayAgoSuffix}`
    : `${text.daysAgoPrefix}${days}${text.daysAgoSuffix}`;
}

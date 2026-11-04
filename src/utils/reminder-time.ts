const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_KEY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DAY_MS = 24 * 60 * 60 * 1000;

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function parseDateKey(dateKey: string): [number, number, number] {
  const match = DATE_KEY_PATTERN.exec(dateKey);
  if (!match) throw new Error(`Fecha local no válida: ${dateKey}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function parseTimeKey(time: string): [number, number] {
  const match = TIME_KEY_PATTERN.exec(time);
  if (!match) throw new Error(`Hora local no válida: ${time}`);
  return [Number(match[1]), Number(match[2])];
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatters.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  formatters.set(timeZone, formatter);
  return formatter;
}

function getZonedParts(instant: Date, timeZone: string): ZonedParts & {
  second: number;
} {
  const parts = getFormatter(timeZone).formatToParts(instant);
  const values: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = part.value;
  }

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function toInstant(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Clave `YYYY-MM-DD` de un instante en la zona indicada. */
export function getZonedDateKey(
  instant: Date | string | number,
  timeZone: string,
): string {
  const parts = getZonedParts(toInstant(instant), timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day,
  ).padStart(2, "0")}`;
}

/** Hora local `HH:MM` de un instante en la zona indicada. */
export function getZonedTimeKey(
  instant: Date | string | number,
  timeZone: string,
): string {
  const parts = getZonedParts(toInstant(instant), timeZone);
  return `${String(parts.hour).padStart(2, "0")}:${String(
    parts.minute,
  ).padStart(2, "0")}`;
}

/** Diferencia de una zona respecto a UTC, en milisegundos, para un instante. */
function getOffsetMs(instant: Date, timeZone: string): number {
  const parts = getZonedParts(instant, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/**
 * Instante UTC de una fecha y hora de pared en la zona indicada. En los
 * cambios de hora se elige el desfase estable; una hora inexistente cae en el
 * siguiente instante válido.
 */
export function localDateTimeToUtc(
  dateKey: string,
  time: string,
  timeZone: string,
): Date {
  const [year, month, day] = parseDateKey(dateKey);
  const [hour, minute] = parseTimeKey(time);
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const firstOffset = getOffsetMs(new Date(wallAsUtc), timeZone);
  let candidate = wallAsUtc - firstOffset;
  const secondOffset = getOffsetMs(new Date(candidate), timeZone);
  if (secondOffset !== firstOffset) {
    candidate = wallAsUtc - secondOffset;
  }
  return new Date(candidate);
}

/** Suma días a una fecha local sin cruzar husos horarios. */
export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = parseDateKey(dateKey);
  const shifted = new Date(Date.UTC(year, month - 1, day) + days * DAY_MS);
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

/** Día de la semana de una fecha local: 0 es domingo. */
export function getDateKeyWeekday(dateKey: string): number {
  const [year, month, day] = parseDateKey(dateKey);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Días completos entre dos fechas locales (`b - a`). */
export function daysBetweenDateKeys(a: string, b: string): number {
  const [yearA, monthA, dayA] = parseDateKey(a);
  const [yearB, monthB, dayB] = parseDateKey(b);
  return Math.round(
    (Date.UTC(yearB, monthB - 1, dayB) - Date.UTC(yearA, monthA - 1, dayA)) /
      DAY_MS,
  );
}

/** Último instante de una fecha local en la zona indicada. */
export function getEndOfLocalDay(dateKey: string, timeZone: string): Date {
  const nextMidnight = localDateTimeToUtc(
    addDaysToDateKey(dateKey, 1),
    "00:00",
    timeZone,
  );
  return new Date(nextMidnight.getTime() - 1);
}

/** Zona horaria del dispositivo, con UTC como última red. */
export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

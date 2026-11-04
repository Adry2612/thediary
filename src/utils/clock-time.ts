/** Límite común para los tiempos introducidos a mano: menos de 24 horas. */
export const MAX_CLOCK_SECONDS = 24 * 60 * 60;

/**
 * Acepta `83`, `1:23` y `1:02:03` y devuelve segundos enteros. Rechaza vacíos,
 * negativos, decimales, partes de 60 o más y valores de 24 horas o más.
 */
export function parseClockInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+(:\d{1,2}){0,2}$/.test(trimmed)) return null;

  const parts = trimmed.split(":").map(Number);
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) return null;

  let seconds: number;
  if (parts.length === 1) {
    seconds = parts[0];
  } else if (parts.length === 2) {
    if (parts[1] >= 60) return null;
    seconds = parts[0] * 60 + parts[1];
  } else {
    if (parts[1] >= 60 || parts[2] >= 60) return null;
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return seconds < MAX_CLOCK_SECONDS ? seconds : null;
}

/** Devuelve `m:ss` o `h:mm:ss`. */
export function formatClockInput(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** Tiempo por encima de lo previsto, con signo: `+1:23`; vacío si no hay. */
export function formatOvertimeInput(seconds: number): string {
  return seconds > 0 ? `+${formatClockInput(seconds)}` : "";
}

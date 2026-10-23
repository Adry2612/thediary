import { parseDateKey } from "./practice-calendar.ts";

/** Duración de un reloj, en minutos y segundos. */
export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Tiempo que un bloque lleva por encima de su duración planificada. */
export function formatOvertime(seconds: number): string {
  return seconds > 0 ? `+${formatClock(seconds)}` : "";
}

/**
 * Duración en la forma corta del panel, desde minutos ("45 min", "1 h 5 min").
 * Los minutos se redondean, así que no vale para mostrar un cronómetro.
 */
export function formatPracticeDuration(totalMinutes: number): string {
  const roundedMinutes = Math.round(totalMinutes);
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

/** La misma forma corta, desde segundos. */
export function formatTotal(totalSeconds: number): string {
  return formatPracticeDuration(totalSeconds / 60);
}

/**
 * Duración exacta al segundo ("65 min 12 s"). Los segundos se truncan, no se
 * redondean: el tiempo ya transcurrido nunca debe aparecer aumentado.
 */
export function formatExactDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = Math.floor(totalSeconds % 60);
  return `${minutes} min ${remainingSeconds} s`;
}

/**
 * Fecha larga de una clave de día (`AAAA-MM-DD`), con el año solo cuando se
 * pide. La clave se interpreta como día local, no como instante UTC.
 */
export function formatDateLabel(
  dateKey: string,
  locale: string,
  includeYear = false,
): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(parseDateKey(dateKey));
}

/** Acción que ofrece el botón principal del temporizador. */
export type TimerAction = "pause" | "blockFinished" | "continue" | "start";

/** La acción depende de si corre, de si espera el siguiente bloque y del tiempo. */
export function getTimerAction(
  isRunning: boolean,
  awaitingPhaseAdvance: boolean,
  elapsedSeconds: number,
): TimerAction {
  if (isRunning) return "pause";
  if (awaitingPhaseAdvance) return "blockFinished";
  return elapsedSeconds > 0 ? "continue" : "start";
}

/** Segundos que muestra el reloj grande: los transcurridos o los que quedan. */
export function getTimerDisplaySeconds(
  isCountUp: boolean,
  elapsedSeconds: number,
  remainingSeconds: number,
): number {
  return isCountUp ? elapsedSeconds : remainingSeconds;
}

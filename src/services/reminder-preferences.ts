import {
  REMINDER_INACTIVITY_DAYS,
  type ReminderInactivityDays,
  type ReminderPreferences,
} from "../types/reminders.ts";

export const REMINDER_PREFERENCES_KEY = "thediary.reminders.v1";
/** Evento de la misma pestaña para que Ajustes e Inicio compartan el estado. */
export const REMINDER_PREFERENCES_EVENT = "thediary:reminders";

/** Hora de entrega por defecto, en la zona del dispositivo. */
export const DEFAULT_REMINDER_TIME = "19:00";

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  enabled: false,
  practice: true,
  strings: true,
  inactivity: true,
  time: DEFAULT_REMINDER_TIME,
  inactivityDays: 7,
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function normalizeReminderTime(value: unknown): string {
  return typeof value === "string" && TIME_PATTERN.test(value)
    ? value
    : DEFAULT_REMINDER_TIME;
}

export function normalizeReminderInactivityDays(
  value: unknown,
): ReminderInactivityDays {
  return REMINDER_INACTIVITY_DAYS.includes(value as ReminderInactivityDays)
    ? (value as ReminderInactivityDays)
    : DEFAULT_REMINDER_PREFERENCES.inactivityDays;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/**
 * Solo los valores admitidos cuentan; un campo inválido vuelve a su defecto sin
 * perder el resto de la configuración guardada.
 */
export function normalizeReminderPreferences(
  value: unknown,
): ReminderPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_REMINDER_PREFERENCES };
  }

  const candidate = value as Record<string, unknown>;
  return {
    enabled: readBoolean(
      candidate.enabled,
      DEFAULT_REMINDER_PREFERENCES.enabled,
    ),
    practice: readBoolean(
      candidate.practice,
      DEFAULT_REMINDER_PREFERENCES.practice,
    ),
    strings: readBoolean(
      candidate.strings,
      DEFAULT_REMINDER_PREFERENCES.strings,
    ),
    inactivity: readBoolean(
      candidate.inactivity,
      DEFAULT_REMINDER_PREFERENCES.inactivity,
    ),
    time: normalizeReminderTime(candidate.time),
    inactivityDays: normalizeReminderInactivityDays(candidate.inactivityDays),
  };
}

export function readReminderPreferences(): ReminderPreferences {
  if (typeof window === "undefined") {
    return { ...DEFAULT_REMINDER_PREFERENCES };
  }

  try {
    const stored = window.localStorage.getItem(REMINDER_PREFERENCES_KEY);
    return stored
      ? normalizeReminderPreferences(JSON.parse(stored))
      : { ...DEFAULT_REMINDER_PREFERENCES };
  } catch {
    return { ...DEFAULT_REMINDER_PREFERENCES };
  }
}

export function saveReminderPreferences(
  value: unknown,
): ReminderPreferences {
  const preferences = normalizeReminderPreferences(value);
  if (typeof window === "undefined") return preferences;

  try {
    window.localStorage.setItem(
      REMINDER_PREFERENCES_KEY,
      JSON.stringify(preferences),
    );
    window.dispatchEvent(new CustomEvent(REMINDER_PREFERENCES_EVENT));
  } catch {
    // Los recordatorios son opcionales: se mantiene el valor normalizado.
  }

  return preferences;
}

/** Descarte del aviso dentro de la app para una fecha local concreta. */
export function getReminderDismissedKey(dateKey: string): string {
  return `thediary.reminders.dismissed.${dateKey}`;
}

export function readReminderDismissed(dateKey: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(getReminderDismissedKey(dateKey)) !== null;
  } catch {
    return false;
  }
}

export function dismissReminderForDate(dateKey: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getReminderDismissedKey(dateKey), "1");
    window.dispatchEvent(new CustomEvent(REMINDER_PREFERENCES_EVENT));
  } catch {
    // Si no hay almacenamiento, la fila se oculta solo en esta sesión.
  }
}

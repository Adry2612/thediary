/** Motivos que puede incluir el aviso diario combinado. */
export const REMINDER_REASON_KINDS = [
  "practice",
  "strings",
  "inactivity",
] as const;

export type ReminderReasonKind = (typeof REMINDER_REASON_KINDS)[number];

/** Umbrales de inactividad admitidos, en días. */
export const REMINDER_INACTIVITY_DAYS = [3, 7, 14, 30] as const;

export type ReminderInactivityDays = (typeof REMINDER_INACTIVITY_DAYS)[number];

/** Preferencias de recordatorios guardadas en el dispositivo. */
export interface ReminderPreferences {
  enabled: boolean;
  practice: boolean;
  strings: boolean;
  inactivity: boolean;
  /** Hora local de entrega en formato `HH:MM`. */
  time: string;
  inactivityDays: ReminderInactivityDays;
}

/** Un motivo del aviso, con su texto ya localizado y su destino. */
export interface ReminderReason {
  kind: ReminderReasonKind;
  text: string;
  url: string;
  routineId?: string;
  guitarId?: string;
  /** Último cambio de cuerdas conocido al generar el plan. */
  lastChangeDate?: string;
  /** Última práctica conocida al generar el plan. */
  lastPracticeDate?: string;
}

/** Una entrada del plan: como mucho una por fecha local y suscripción. */
export interface ReminderPlanEntry {
  /** Fecha local `YYYY-MM-DD` en la zona del dispositivo. */
  localDate: string;
  /** Instante UTC ya resuelto para esa fecha y hora local. */
  scheduledAt: string;
  title: string;
  reasons: ReminderReason[];
}

/** Plantillas de texto que el cliente localiza al generar el plan. */
export interface ReminderTextTemplates {
  title: string;
  practice: string;
  strings: string;
  inactivity: string;
}

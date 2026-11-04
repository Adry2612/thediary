import type { Locale } from "../i18n/translations.ts";
import { getReminderTexts } from "../i18n/reminder-texts.ts";
import type {
  ReminderPlanEntry,
  ReminderPreferences,
} from "../types/reminders.ts";
import { buildReminderPlan } from "../utils/reminder-plan.ts";
import type { ReminderData } from "../utils/reminder-reasons.ts";

/** Etiqueta estable: una entrega repetida reemplaza la notificación. */
export const REMINDER_NOTIFICATION_TAG = "thediary-daily";

export interface ReminderPlanPayload {
  local_date: string;
  scheduled_at: string;
  title: string;
  url: string;
  reasons: ReminderPlanEntry["reasons"];
  tag: string;
}

export interface ReminderPlanSyncInput {
  userId: string | null;
  subscriptionId: string | null;
  preferences: ReminderPreferences;
  data: ReminderData;
  locale: Locale;
  timeZone: string;
  now?: Date;
  horizonDays?: number;
}

/** Sin cuenta, sin suscripción o con los avisos apagados no se escribe nada. */
export function canSyncReminderPlan({
  userId,
  subscriptionId,
  preferences,
}: Pick<
  ReminderPlanSyncInput,
  "userId" | "subscriptionId" | "preferences"
>): boolean {
  return Boolean(userId && subscriptionId && preferences.enabled);
}

export function buildReminderPlanPayload({
  preferences,
  data,
  locale,
  timeZone,
  now = new Date(),
  horizonDays,
}: ReminderPlanSyncInput): ReminderPlanPayload[] {
  return buildReminderPlan({
    preferences,
    data,
    texts: getReminderTexts(locale),
    timeZone,
    now,
    ...(horizonDays ? { horizonDays } : {}),
  }).map((entry) => ({
    local_date: entry.localDate,
    scheduled_at: entry.scheduledAt,
    title: entry.title,
    url: entry.reasons[0]?.url ?? "/",
    reasons: entry.reasons,
    tag: REMINDER_NOTIFICATION_TAG,
  }));
}

export type ReplaceReminderPlan = (
  subscriptionId: string,
  rows: ReminderPlanPayload[],
) => Promise<void>;

/**
 * Reemplaza el plan de la suscripción. El plan es opcional: un fallo de red se
 * ignora y se reintenta en el siguiente recálculo.
 */
export async function syncReminderPlan(
  replacePlan: ReplaceReminderPlan,
  input: ReminderPlanSyncInput,
): Promise<boolean> {
  if (!canSyncReminderPlan(input)) return false;

  const rows = buildReminderPlanPayload(input);
  try {
    await replacePlan(input.subscriptionId as string, rows);
    return true;
  } catch {
    return false;
  }
}

export interface ReminderPlanScheduler {
  /** Agrupa varias peticiones en una sola escritura. */
  request: (input: ReminderPlanSyncInput) => void;
  flush: () => Promise<boolean>;
  cancel: () => void;
}

/**
 * Agrupa los cambios seguidos (guardar una sesión, mover la hora, abrir la app)
 * en una única escritura del plan.
 */
export function createReminderPlanScheduler(
  replacePlan: ReplaceReminderPlan,
  delayMs = 1500,
): ReminderPlanScheduler {
  let pending: ReminderPlanSyncInput | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running: Promise<boolean> = Promise.resolve(false);

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  async function flush(): Promise<boolean> {
    clearTimer();
    if (!pending) return running;
    const input = pending;
    pending = null;
    running = syncReminderPlan(replacePlan, input);
    return running;
  }

  return {
    request(input) {
      pending = input;
      clearTimer();
      timer = setTimeout(() => {
        void flush();
      }, delayMs);
    },
    flush,
    cancel() {
      clearTimer();
      pending = null;
    },
  };
}

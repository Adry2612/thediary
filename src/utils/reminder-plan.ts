import type {
  ReminderPlanEntry,
  ReminderPreferences,
  ReminderReason,
  ReminderTextTemplates,
} from "../types/reminders.ts";
import {
  buildReminderContext,
  evaluateReminderReasons,
  getDueGuitar,
  type ReminderContext,
  type ReminderData,
} from "./reminder-reasons.ts";
import {
  addDaysToDateKey,
  daysBetweenDateKeys,
  getZonedDateKey,
  getZonedTimeKey,
  localDateTimeToUtc,
} from "./reminder-time.ts";

/** Días de plan que genera el dispositivo en cada recálculo. */
export const REMINDER_PLAN_HORIZON_DAYS = 90;
/** Repetición de los motivos que pueden durar varios días. */
export const REMINDER_REPEAT_DAYS = 7;

export interface BuildReminderPlanInput {
  preferences: ReminderPreferences;
  data: ReminderData;
  texts: ReminderTextTemplates;
  timeZone: string;
  now: Date;
  horizonDays?: number;
}

function repeatsOn(dateKey: string, anchor: string): boolean {
  const days = daysBetweenDateKeys(anchor, dateKey);
  return days >= 0 && days % REMINDER_REPEAT_DAYS === 0;
}

function keepRepeatingReason(
  reason: ReminderReason,
  dateKey: string,
  context: ReminderContext,
  preferences: ReminderPreferences,
): boolean {
  if (reason.kind === "practice") return true;
  if (reason.kind === "strings") {
    const guitar = getDueGuitar(context, dateKey);
    return guitar ? repeatsOn(dateKey, guitar.dueDate) : false;
  }
  if (!context.lastSessionDate) return false;
  return repeatsOn(
    dateKey,
    addDaysToDateKey(context.lastSessionDate, preferences.inactivityDays),
  );
}

/**
 * Plan del dispositivo: como mucho una entrada por fecha local, con los
 * motivos combinados y el instante UTC ya resuelto.
 */
export function buildReminderPlan({
  preferences,
  data,
  texts,
  timeZone,
  now,
  horizonDays = REMINDER_PLAN_HORIZON_DAYS,
}: BuildReminderPlanInput): ReminderPlanEntry[] {
  if (!preferences.enabled || horizonDays <= 0) return [];

  const context = buildReminderContext(data, { now, timeZone });
  const todayKey = getZonedDateKey(now, timeZone);
  const todayTime = getZonedTimeKey(now, timeZone);
  const firstDate =
    todayTime >= preferences.time ? addDaysToDateKey(todayKey, 1) : todayKey;

  const entries: ReminderPlanEntry[] = [];
  for (let index = 0; index < horizonDays; index += 1) {
    const localDate = addDaysToDateKey(firstDate, index);
    const reasons = evaluateForPlan(
      localDate,
      context,
      preferences,
      texts,
    );
    if (reasons.length === 0) continue;

    entries.push({
      localDate,
      scheduledAt: localDateTimeToUtc(
        localDate,
        preferences.time,
        timeZone,
      ).toISOString(),
      title: texts.title,
      reasons,
    });
  }

  return entries;
}

function evaluateForPlan(
  dateKey: string,
  context: ReminderContext,
  preferences: ReminderPreferences,
  texts: ReminderTextTemplates,
): ReminderReason[] {
  // La evaluación base ya respeta los interruptores de cada motivo.
  const reasons = evaluateReminderReasons(
    dateKey,
    context,
    preferences,
    texts,
  );
  return reasons.filter((reason) =>
    keepRepeatingReason(reason, dateKey, context, preferences),
  );
}

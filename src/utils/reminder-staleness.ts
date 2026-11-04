import type { ReminderPlanEntry, ReminderReason } from "../types/reminders.ts";
import { getLatestStringChange } from "./equipment.ts";
import type { ReminderData } from "./reminder-reasons.ts";
import { daysBetweenDateKeys, getZonedDateKey } from "./reminder-time.ts";

export interface ReminderStalenessInput {
  data: ReminderData;
  timeZone: string;
}

function getNewestSessionDate(
  data: ReminderData,
  timeZone: string,
): string | null {
  let newest: string | null = null;
  for (const session of data.history) {
    const time = Date.parse(session.startedAt);
    if (Number.isNaN(time)) continue;
    const dateKey = getZonedDateKey(time, timeZone);
    if (!newest || dateKey > newest) newest = dateKey;
  }
  return newest;
}

function isStale(
  reason: ReminderReason,
  localDate: string,
  { data, timeZone }: ReminderStalenessInput,
): boolean {
  if (reason.kind === "practice") {
    return data.history.some((session) => {
      const time = Date.parse(session.startedAt);
      return !Number.isNaN(time) && getZonedDateKey(time, timeZone) === localDate;
    });
  }

  if (reason.kind === "inactivity") {
    if (!reason.lastPracticeDate) return false;
    const newest = getNewestSessionDate(data, timeZone);
    return newest !== null && newest > reason.lastPracticeDate;
  }

  if (reason.kind === "strings") {
    if (!reason.guitarId || !reason.lastChangeDate) return false;
    const latest = getLatestStringChange(data.guitarEntries, reason.guitarId);
    return latest !== null && latest.date > reason.lastChangeDate;
  }

  return false;
}

/**
 * Motivos que siguen siendo ciertos contra los datos actuales. El emisor lo usa
 * para no enviar un aviso que otra sesión o un cambio de cuerdas ya resolvió.
 */
export function filterStaleReasons(
  entry: Pick<ReminderPlanEntry, "localDate" | "reasons">,
  input: ReminderStalenessInput,
): ReminderReason[] {
  return entry.reasons.filter(
    (reason) => !isStale(reason, entry.localDate, input),
  );
}

/** Entrada lista para enviar, o `null` si ya no queda ningún motivo. */
export function filterStaleEntry(
  entry: ReminderPlanEntry,
  input: ReminderStalenessInput,
): ReminderPlanEntry | null {
  const reasons = filterStaleReasons(entry, input);
  return reasons.length > 0 ? { ...entry, reasons } : null;
}

/** Días que la entrada conserva respecto a una fecha local, para depurar. */
export function getEntryAgeInDays(
  entry: Pick<ReminderPlanEntry, "localDate">,
  dateKey: string,
): number {
  return daysBetweenDateKeys(entry.localDate, dateKey);
}

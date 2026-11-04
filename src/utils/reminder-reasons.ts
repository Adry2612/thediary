import type { Guitar, GuitarEntry } from "../types/equipment.ts";
import type { PracticeTemplate, SessionRecord } from "../types/practice.ts";
import type {
  ReminderPreferences,
  ReminderReason,
  ReminderTextTemplates,
} from "../types/reminders.ts";
import { getGuitarMaintenance, getLatestStringChange } from "./equipment.ts";
import { interpolate } from "./interpolate.ts";
import {
  addDaysToDateKey,
  daysBetweenDateKeys,
  getDateKeyWeekday,
  getZonedDateKey,
} from "./reminder-time.ts";
import type { WeeklyRoutineSchedule } from "./weekly-routine-schedule.ts";

/** Destino de las razones que se resuelven desde la pantalla de inicio. */
export const PRACTICE_REMINDER_URL = "/";
/** Destino del aviso de cuerdas: el bloque de Cuerdas dentro de Herramientas. */
export const STRINGS_REMINDER_URL = "/tools#tools-strings";

/** Datos del usuario que necesitan los recordatorios. */
export interface ReminderData {
  history: readonly SessionRecord[];
  templates: readonly PracticeTemplate[];
  weeklySchedule: WeeklyRoutineSchedule;
  guitars: readonly Guitar[];
  guitarEntries: readonly GuitarEntry[];
}

export interface DueGuitar {
  guitarId: string;
  name: string;
  /** Fecha local a partir de la cual la guitarra está vencida. */
  dueDate: string;
  lastChangeDate: string;
  overdue: boolean;
}

/** Datos ya resueltos para evaluar un día concreto sin volver a recorrerlos. */
export interface ReminderContext {
  todayKey: string;
  templateNames: ReadonlyMap<string, string>;
  sessionDates: ReadonlySet<string>;
  lastSessionDate: string | null;
  lastPracticeInstant: string | null;
  dueGuitars: readonly DueGuitar[];
  weeklySchedule: WeeklyRoutineSchedule;
}

export interface ReminderContextOptions {
  now: Date;
  timeZone: string;
}

function getLatestSessionDate(
  history: readonly SessionRecord[],
  timeZone: string,
): { dateKey: string; instant: string } | null {
  let latest: { dateKey: string; instant: string; time: number } | null = null;

  for (const session of history) {
    const time = Date.parse(session.startedAt);
    if (Number.isNaN(time)) continue;
    if (latest && time <= latest.time) continue;
    latest = {
      dateKey: getZonedDateKey(session.startedAt, timeZone),
      instant: session.startedAt,
      time,
    };
  }

  return latest ? { dateKey: latest.dateKey, instant: latest.instant } : null;
}

function buildDueGuitars(
  data: ReminderData,
  { now, timeZone }: ReminderContextOptions,
): DueGuitar[] {
  const todayKey = getZonedDateKey(now, timeZone);
  const dueGuitars: DueGuitar[] = [];

  for (const guitar of data.guitars) {
    const latestChange = getLatestStringChange(data.guitarEntries, guitar.id);
    if (!latestChange) continue;
    if (!guitar.intervalDays && !guitar.intervalHours) continue;

    let dueDate: string | null = null;
    if (guitar.intervalDays) {
      dueDate = addDaysToDateKey(latestChange.date, guitar.intervalDays);
    }

    // El intervalo por horas no se puede proyectar al futuro: solo cuenta si
    // ya está vencido con el uso registrado hasta ahora.
    if (!dueDate && guitar.intervalHours) {
      const maintenance = getGuitarMaintenance(
        guitar,
        data.guitarEntries,
        data.history,
        now,
      );
      if (maintenance.state === "due") dueDate = todayKey;
    }

    if (!dueDate) continue;
    dueGuitars.push({
      guitarId: guitar.id,
      name: guitar.name,
      dueDate,
      lastChangeDate: latestChange.date,
      overdue: dueDate <= todayKey,
    });
  }

  return dueGuitars.sort((a, b) =>
    a.dueDate === b.dueDate
      ? a.name.localeCompare(b.name)
      : a.dueDate.localeCompare(b.dueDate),
  );
}

/** Resuelve los datos que comparten el plan, el aviso dentro de la app y el filtro. */
export function buildReminderContext(
  data: ReminderData,
  options: ReminderContextOptions,
): ReminderContext {
  const { timeZone } = options;
  const latestSession = getLatestSessionDate(data.history, timeZone);
  const sessionDates = new Set(
    data.history
      .map((session) => Date.parse(session.startedAt))
      .filter((time) => !Number.isNaN(time))
      .map((time) => getZonedDateKey(time, timeZone)),
  );

  return {
    todayKey: getZonedDateKey(options.now, timeZone),
    templateNames: new Map(
      data.templates.map((template) => [template.id, template.name]),
    ),
    sessionDates,
    lastSessionDate: latestSession?.dateKey ?? null,
    lastPracticeInstant: latestSession?.instant ?? null,
    dueGuitars: buildDueGuitars(data, options),
    weeklySchedule: data.weeklySchedule,
  };
}

/** Primera guitarra vencida en la fecha dada, la más urgente. */
export function getDueGuitar(
  context: ReminderContext,
  dateKey: string,
): DueGuitar | null {
  return (
    context.dueGuitars.find((guitar) => guitar.dueDate <= dateKey) ?? null
  );
}

/**
 * Motivos aplicables a una fecha local. No aplica la repetición semanal del
 * plan: eso lo decide `buildReminderPlan`.
 */
export function evaluateReminderReasons(
  dateKey: string,
  context: ReminderContext,
  preferences: ReminderPreferences,
  texts: ReminderTextTemplates,
): ReminderReason[] {
  if (!preferences.enabled) return [];

  const reasons: ReminderReason[] = [];

  if (preferences.practice) {
    const weekday = getDateKeyWeekday(dateKey);
    const routineId = context.weeklySchedule[weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6];
    const routineName = routineId
      ? context.templateNames.get(routineId)
      : undefined;
    if (routineId && routineName && !context.sessionDates.has(dateKey)) {
      reasons.push({
        kind: "practice",
        text: interpolate(texts.practice, { routine: routineName }),
        url: PRACTICE_REMINDER_URL,
        routineId,
      });
    }
  }

  if (preferences.strings) {
    const guitar = getDueGuitar(context, dateKey);
    if (guitar) {
      reasons.push({
        kind: "strings",
        text: interpolate(texts.strings, { guitar: guitar.name }),
        url: STRINGS_REMINDER_URL,
        guitarId: guitar.guitarId,
        lastChangeDate: guitar.lastChangeDate,
      });
    }
  }

  if (preferences.inactivity && context.lastSessionDate) {
    const days = daysBetweenDateKeys(context.lastSessionDate, dateKey);
    if (days >= preferences.inactivityDays) {
      reasons.push({
        kind: "inactivity",
        text: interpolate(texts.inactivity, { days }),
        url: PRACTICE_REMINDER_URL,
        lastPracticeDate: context.lastSessionDate,
      });
    }
  }

  return reasons;
}

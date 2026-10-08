export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeeklyRoutineSchedule = Record<WeekdayIndex, string | null>;

export const WEEKDAY_INDEXES: WeekdayIndex[] = [1, 2, 3, 4, 5, 6, 0];

export const WEEKDAY_LABELS: Record<WeekdayIndex, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const DEFAULT_WEEKLY_ROUTINE_SCHEDULE: WeeklyRoutineSchedule = {
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeWeeklyRoutineSchedule(
  value: unknown,
): WeeklyRoutineSchedule {
  if (!isRecord(value)) return { ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE };

  const normalized = { ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE };
  for (const weekday of WEEKDAY_INDEXES) {
    const key = String(weekday);
    const assignment = Object.hasOwn(value, key) ? value[key] : null;
    if (typeof assignment === "string" && assignment.trim().length > 0) {
      normalized[weekday] = assignment.trim();
    }
  }
  return normalized;
}

export function assignRoutineToWeekday(
  schedule: WeeklyRoutineSchedule,
  weekday: WeekdayIndex,
  routineId: string | null,
): WeeklyRoutineSchedule {
  const normalizedRoutineId = routineId?.trim() || null;
  if (schedule[weekday] === normalizedRoutineId) return schedule;
  return { ...schedule, [weekday]: normalizedRoutineId };
}

export function removeRoutineFromSchedule(
  schedule: WeeklyRoutineSchedule,
  routineId: string,
): WeeklyRoutineSchedule {
  const nextSchedule = { ...schedule };
  let changed = false;

  for (const weekday of WEEKDAY_INDEXES) {
    if (nextSchedule[weekday] !== routineId) continue;
    nextSchedule[weekday] = null;
    changed = true;
  }

  return changed ? nextSchedule : schedule;
}

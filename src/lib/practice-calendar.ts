import type {
  DailyStats,
  PracticeSkill,
  SessionRecord,
} from "../types/practice";

const PRACTICE_SKILLS: PracticeSkill[] = [
  "technique",
  "theory",
  "repertoire",
  "improvisation",
];

export type PracticeWeekDay = {
  dateKey: string;
  dayLabel: string;
  dayOfMonth: number;
  sessionCount: number;
  totalMinutes: number;
  hasPractice: boolean;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function emptySkillMinutes(): Record<PracticeSkill, number> {
  return { technique: 0, theory: 0, repertoire: 0, improvisation: 0 };
}

export function getYearlyHeatmapData(
  year: number,
  history: SessionRecord[],
): DailyStats[] {
  if (!Number.isInteger(year)) {
    throw new RangeError("El año debe ser un entero.");
  }

  const daysInYear =
    (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
  const days = Array.from({ length: daysInYear }, (_, index) => {
    const date = new Date(year, 0, index + 1);
    return {
      dateKey: toDateKey(date),
      sessionCount: 0,
      totalMinutes: 0,
      averageBpm: 0,
      skillMinutes: emptySkillMinutes(),
      bpmTotal: 0,
      bpmSessionCount: 0,
    };
  });
  const statsByDate = new Map(days.map((day) => [day.dateKey, day]));

  for (const session of history) {
    const dateKey = toDateKey(new Date(session.startedAt));
    const stats = statsByDate.get(dateKey);
    if (!stats) continue;

    stats.sessionCount += 1;
    stats.totalMinutes += session.durationSeconds / 60;
    if (session.averageBpm > 0) {
      stats.bpmTotal += session.averageBpm;
      stats.bpmSessionCount += 1;
    }
    for (const skill of PRACTICE_SKILLS) {
      stats.skillMinutes[skill] += session.skillSeconds[skill] / 60;
    }
  }

  return days.map(({ bpmTotal, bpmSessionCount, ...day }) => ({
    ...day,
    averageBpm: bpmSessionCount
      ? Math.round(bpmTotal / bpmSessionCount)
      : 0,
  }));
}

export function getSessionsForWeek(
  history: SessionRecord[],
  today = new Date(),
): SessionRecord[] {
  const weekStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const daysSinceMonday = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  const weekStartKey = toDateKey(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndKey = toDateKey(weekEnd);

  return history
    .filter((session) => {
      const sessionDateKey = toDateKey(new Date(session.startedAt));
      return sessionDateKey >= weekStartKey && sessionDateKey < weekEndKey;
    })
    .sort(
      (left, right) =>
        new Date(right.startedAt).getTime() -
        new Date(left.startedAt).getTime(),
    );
}

export function getPracticeWeekDays(
  history: SessionRecord[],
  today = new Date(),
): PracticeWeekDay[] {
  const sessionsByDate = new Map<string, SessionRecord[]>();
  for (const session of getSessionsForWeek(history, today)) {
    const dateKey = toDateKey(new Date(session.startedAt));
    sessionsByDate.set(dateKey, [
      ...(sessionsByDate.get(dateKey) ?? []),
      session,
    ]);
  }

  const weekStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const dateKey = toDateKey(date);
    const sessions = sessionsByDate.get(dateKey) ?? [];

    return {
      dateKey,
      dayLabel: new Intl.DateTimeFormat("es-ES", {
        weekday: "short",
      }).format(date),
      dayOfMonth: date.getDate(),
      sessionCount: sessions.length,
      totalMinutes: sessions.reduce(
        (total, session) => total + session.durationSeconds / 60,
        0,
      ),
      hasPractice: sessions.length > 0,
    };
  });
}

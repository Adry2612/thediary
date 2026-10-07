import type { PracticeSkill, SessionRecord } from "../types/practice";

const PRACTICE_SKILLS: PracticeSkill[] = [
  "technique",
  "theory",
  "repertoire",
  "improvisation",
];

export type PracticeChartPeriod = "week" | "month" | "year";

export type PracticeTimeBucket = {
  label: string;
  startDate: string;
  endDate: string;
  totalSeconds: number;
};

export type PracticeStatistics = {
  sessionCount: number;
  totalSeconds: number;
  mostPracticedSkill: PracticeSkill | null;
  mostPracticedSeconds: number;
};

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfWeek(date: Date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function getDailyPracticeSeconds(history: SessionRecord[]) {
  const dailySeconds = new Map<string, number>();
  for (const session of history) {
    const dateKey = toDateKey(new Date(session.startedAt));
    dailySeconds.set(
      dateKey,
      (dailySeconds.get(dateKey) ?? 0) + session.durationSeconds,
    );
  }

  return dailySeconds;
}

function createBucket(
  label: string,
  startDate: Date,
  endDate: Date,
  dailySeconds: Map<string, number>,
): PracticeTimeBucket {
  let totalSeconds = 0;
  for (
    let cursor = new Date(startDate);
    cursor <= endDate;
    cursor = addDays(cursor, 1)
  ) {
    totalSeconds += dailySeconds.get(toDateKey(cursor)) ?? 0;
  }

  return {
    label,
    startDate: toDateKey(startDate),
    endDate: toDateKey(endDate),
    totalSeconds,
  };
}

function getWeekBuckets(
  today: Date,
  dailySeconds: Map<string, number>,
): PracticeTimeBucket[] {
  const monday = startOfWeek(today);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    const label = new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
    }).format(date);
    return createBucket(
      `${label} ${date.getDate()}`,
      date,
      date,
      dailySeconds,
    );
  });
}

function getMonthBuckets(
  today: Date,
  dailySeconds: Map<string, number>,
): PracticeTimeBucket[] {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstWeek = startOfWeek(monthStart);
  const buckets: PracticeTimeBucket[] = [];

  for (
    let weekStart = firstWeek;
    weekStart <= monthEnd;
    weekStart = addDays(weekStart, 7)
  ) {
    const weekEnd = addDays(weekStart, 6);
    const bucketStart = weekStart < monthStart ? monthStart : weekStart;
    const bucketEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
    buckets.push(
      createBucket(
        `${bucketStart.getDate()}–${bucketEnd.getDate()}`,
        bucketStart,
        bucketEnd,
        dailySeconds,
      ),
    );
  }

  return buckets;
}

function getYearBuckets(
  today: Date,
  dailySeconds: Map<string, number>,
): PracticeTimeBucket[] {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const monthStart = new Date(today.getFullYear(), monthIndex, 1);
    const monthEnd = new Date(today.getFullYear(), monthIndex + 1, 0);
    const label = new Intl.DateTimeFormat("es-ES", {
      month: "short",
    })
      .format(monthStart)
      .replace(/\.$/, "");

    return createBucket(label, monthStart, monthEnd, dailySeconds);
  });
}

export function getPracticeTimeBuckets(
  history: SessionRecord[],
  period: PracticeChartPeriod,
  today = new Date(),
): PracticeTimeBucket[] {
  const dailySeconds = getDailyPracticeSeconds(history);
  if (period === "week") return getWeekBuckets(today, dailySeconds);
  if (period === "month") return getMonthBuckets(today, dailySeconds);
  return getYearBuckets(today, dailySeconds);
}

export function getPracticeStatistics(
  history: SessionRecord[],
): PracticeStatistics {
  const skillSeconds = Object.fromEntries(
    PRACTICE_SKILLS.map((skill) => [
      skill,
      history.reduce(
        (total, session) => total + session.skillSeconds[skill],
        0,
      ),
    ]),
  ) as Record<PracticeSkill, number>;

  let mostPracticedSkill: PracticeSkill | null = null;
  let mostPracticedSeconds = 0;
  for (const skill of PRACTICE_SKILLS) {
    if (skillSeconds[skill] <= mostPracticedSeconds) continue;
    mostPracticedSkill = skill;
    mostPracticedSeconds = skillSeconds[skill];
  }

  return {
    sessionCount: history.length,
    totalSeconds: history.reduce(
      (total, session) => total + session.durationSeconds,
      0,
    ),
    mostPracticedSkill,
    mostPracticedSeconds,
  };
}

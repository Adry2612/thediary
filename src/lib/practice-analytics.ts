import type {
  DailyStats,
  PracticeSkill,
  SessionRecord,
  SkillDistribution,
} from "../types/practice";

const PRACTICE_SKILLS: PracticeSkill[] = [
  "technique",
  "theory",
  "repertoire",
  "improvisation",
];

export type PracticeChartPeriod = "week" | "month" | "year";
export type PracticeTimeRange = {
  startDate: string;
  endDate: string;
};

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

function getSessionDateKey(session: SessionRecord) {
  return toDateKey(new Date(session.startedAt));
}

function emptySkillValues(): Record<PracticeSkill, number> {
  return { technique: 0, theory: 0, repertoire: 0, improvisation: 0 };
}

export function getStreakCount(
  history: SessionRecord[],
  today = new Date(),
): number {
  const practicedDates = new Set(history.map(getSessionDateKey));
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!practicedDates.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (practicedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getMonthlyHeatmapData(
  year: number,
  month: number,
  history: SessionRecord[],
): DailyStats[] {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError("El mes debe ser un entero entre 1 y 12.");
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => ({
    dateKey: toDateKey(new Date(year, month - 1, index + 1)),
    sessionCount: 0,
    totalMinutes: 0,
    averageBpm: 0,
    skillMinutes: emptySkillValues(),
    bpmTotal: 0,
    bpmSessionCount: 0,
  }));
  const statsByDate = new Map(days.map((day) => [day.dateKey, day]));

  for (const session of history) {
    const dailyStats = statsByDate.get(getSessionDateKey(session));
    if (!dailyStats) continue;

    dailyStats.sessionCount += 1;
    dailyStats.totalMinutes += session.durationSeconds / 60;
    if (session.averageBpm > 0) {
      dailyStats.bpmTotal += session.averageBpm;
      dailyStats.bpmSessionCount += 1;
    }
    for (const skill of PRACTICE_SKILLS) {
      dailyStats.skillMinutes[skill] += session.skillSeconds[skill] / 60;
    }
  }

  return days.map(({ bpmTotal, bpmSessionCount, ...day }) => ({
    ...day,
    averageBpm: bpmSessionCount
      ? Math.round(bpmTotal / bpmSessionCount)
      : 0,
  }));
}

export function getSkillDistribution(
  history: SessionRecord[],
  timeRange: PracticeTimeRange,
): SkillDistribution {
  const skillSeconds = emptySkillValues();

  for (const session of history) {
    const sessionDate = getSessionDateKey(session);
    if (sessionDate < timeRange.startDate || sessionDate > timeRange.endDate) {
      continue;
    }

    for (const skill of PRACTICE_SKILLS) {
      skillSeconds[skill] += session.skillSeconds[skill];
    }
  }

  const totalSeconds = Object.values(skillSeconds).reduce(
    (total, seconds) => total + seconds,
    0,
  );
  const percentages = PRACTICE_SKILLS.map((skill) => {
    const exactPercentage = totalSeconds
      ? (skillSeconds[skill] / totalSeconds) * 100
      : 0;
    return {
      skill,
      percentage: Math.floor(exactPercentage),
      remainder: exactPercentage % 1,
    };
  });
  const remainder =
    (totalSeconds ? 100 : 0) -
    percentages.reduce((total, item) => total + item.percentage, 0);

  percentages
    .slice()
    .sort((left, right) => right.remainder - left.remainder)
    .slice(0, remainder)
    .forEach(({ skill }) => {
      const item = percentages.find((candidate) => candidate.skill === skill);
      if (item) item.percentage += 1;
    });

  const categories = PRACTICE_SKILLS.reduce<SkillDistribution["categories"]>(
    (result, skill) => {
      result[skill] = {
        minutes: skillSeconds[skill] / 60,
        percentage:
          percentages.find((item) => item.skill === skill)?.percentage ?? 0,
      };
      return result;
    },
    {
      technique: { minutes: 0, percentage: 0 },
      theory: { minutes: 0, percentage: 0 },
      repertoire: { minutes: 0, percentage: 0 },
      improvisation: { minutes: 0, percentage: 0 },
    },
  );

  return { totalMinutes: totalSeconds / 60, categories };
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

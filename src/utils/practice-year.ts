import type {
  PracticeSkill,
  SessionRecord,
} from "../types/practice.ts";
import type { PracticeTimeRange } from "./practice-analytics.ts";
import { toDateKey } from "./practice-calendar.ts";

const PRACTICE_SKILLS: PracticeSkill[] = [
  "technique",
  "theory",
  "repertoire",
  "lick",
  "improvisation",
];

export type PracticeYearMonth = {
  /** Mes del año, de 0 a 11. */
  month: number;
  seconds: number;
  sessionCount: number;
};

export type PracticeYearSummary = {
  year: number;
  sessionCount: number;
  totalSeconds: number;
  practicedDays: number;
  daysInYear: number;
  monthsWithPractice: number;
  averageSessionSeconds: number;
  averageBpm: number;
  longestStreakDays: number;
  bestMonth: PracticeYearMonth | null;
  mostPracticedSkill: PracticeSkill | null;
  mostPracticedSeconds: number;
};

function emptySkillSeconds(): Record<PracticeSkill, number> {
  return {
    technique: 0,
    theory: 0,
    repertoire: 0,
    lick: 0,
    improvisation: 0,
  };
}

function countLongestStreak(dateKeys: string[]): number {
  if (dateKeys.length === 0) return 0;

  let best = 1;
  let current = 1;
  for (let index = 1; index < dateKeys.length; index += 1) {
    const previous = new Date(`${dateKeys[index - 1]}T00:00:00`);
    previous.setDate(previous.getDate() + 1);
    if (toDateKey(previous) === dateKeys[index]) {
      current += 1;
    } else {
      current = 1;
    }
    best = Math.max(best, current);
  }

  return best;
}

/** Año natural completo: del 1 de enero al 31 de diciembre. */
export function getCalendarYearRange(year: number): PracticeTimeRange {
  if (!Number.isInteger(year)) {
    throw new RangeError("El año debe ser un entero.");
  }

  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

/** Años con práctica, del más reciente al más antiguo, con el actual siempre. */
export function getPracticeYears(
  history: SessionRecord[],
  currentYear: number,
): number[] {
  const years = new Set<number>([currentYear]);

  for (const session of history) {
    const startedAt = Date.parse(session.startedAt);
    if (!Number.isFinite(startedAt)) continue;
    years.add(new Date(startedAt).getFullYear());
  }

  return [...years].sort((left, right) => right - left);
}

/** Totales y mejores marcas de un año natural, calculados sobre sus sesiones. */
export function getPracticeYearSummary(
  history: SessionRecord[],
  year: number,
): PracticeYearSummary {
  const range = getCalendarYearRange(year);
  const daysInYear =
    (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
  const skillSeconds = emptySkillSeconds();
  const months: PracticeYearMonth[] = Array.from({ length: 12 }, (_, month) => ({
    month,
    seconds: 0,
    sessionCount: 0,
  }));
  const practicedDateKeys = new Set<string>();
  let sessionCount = 0;
  let totalSeconds = 0;
  let bpmTotal = 0;
  let bpmSessionCount = 0;

  for (const session of history) {
    const startedAt = Date.parse(session.startedAt);
    if (!Number.isFinite(startedAt)) continue;

    const dateKey = toDateKey(new Date(startedAt));
    if (dateKey < range.startDate || dateKey > range.endDate) continue;

    sessionCount += 1;
    totalSeconds += session.durationSeconds;
    practicedDateKeys.add(dateKey);

    if (session.averageBpm > 0) {
      bpmTotal += session.averageBpm;
      bpmSessionCount += 1;
    }

    const month = Number(dateKey.slice(5, 7)) - 1;
    months[month].seconds += session.durationSeconds;
    months[month].sessionCount += 1;

    for (const skill of PRACTICE_SKILLS) {
      skillSeconds[skill] += session.skillSeconds[skill];
    }
  }

  const bestMonth =
    months
      .filter((month) => month.sessionCount > 0)
      .sort((left, right) => right.seconds - left.seconds)[0] ?? null;
  const mostPracticedSkill =
    PRACTICE_SKILLS.filter((skill) => skillSeconds[skill] > 0).sort(
      (left, right) => skillSeconds[right] - skillSeconds[left],
    )[0] ?? null;

  return {
    year,
    sessionCount,
    totalSeconds,
    practicedDays: practicedDateKeys.size,
    daysInYear,
    monthsWithPractice: months.filter((month) => month.sessionCount > 0).length,
    averageSessionSeconds: sessionCount ? totalSeconds / sessionCount : 0,
    averageBpm: bpmSessionCount ? Math.round(bpmTotal / bpmSessionCount) : 0,
    longestStreakDays: countLongestStreak(
      [...practicedDateKeys].sort((left, right) => left.localeCompare(right)),
    ),
    bestMonth,
    mostPracticedSkill,
    mostPracticedSeconds: mostPracticedSkill
      ? skillSeconds[mostPracticedSkill]
      : 0,
  };
}

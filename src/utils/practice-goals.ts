export type PracticeGoals = {
  dailyMinutes: number;
  weeklyDays: number;
};

export const DEFAULT_PRACTICE_GOALS: Readonly<PracticeGoals> = {
  dailyMinutes: 60,
  weeklyDays: 5,
};

export const PRACTICE_INTENSITY_CLASSES = [
  "bg-zinc-800/70",
  "bg-[#26372b]",
  "bg-[#3c5943]",
  "bg-[#5c8064]",
  "bg-[#89a78b]",
] as const;

const MIN_GOAL_MINUTES = 5;
const MAX_DAILY_GOAL_MINUTES = 720;
const MAX_WEEKLY_GOAL_MINUTES = 5_040;
const MIN_WEEKLY_GOAL_DAYS = 1;
const MAX_WEEKLY_GOAL_DAYS = 7;
const GOAL_ADJUSTMENT_STEP = 5;

export function adjustPracticeGoal(
  currentValue: number,
  direction: -1 | 1,
  maximumValue: number,
  step = GOAL_ADJUSTMENT_STEP,
  minimumValue = MIN_GOAL_MINUTES,
): number {
  return Math.max(
    minimumValue,
    Math.min(maximumValue, currentValue + direction * step),
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidGoal(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= minimum &&
    value <= maximum
  );
}

export function normalizePracticeGoals(value: unknown): PracticeGoals {
  const savedGoals = isObject(value) ? value : {};
  const dailyMinutes = isValidGoal(
    savedGoals.dailyMinutes,
    MIN_GOAL_MINUTES,
    MAX_DAILY_GOAL_MINUTES,
  )
    ? savedGoals.dailyMinutes
    : DEFAULT_PRACTICE_GOALS.dailyMinutes;
  const weeklyDays = Object.hasOwn(savedGoals, "weeklyDays")
    ? isValidGoal(
        savedGoals.weeklyDays,
        MIN_WEEKLY_GOAL_DAYS,
        MAX_WEEKLY_GOAL_DAYS,
      )
      ? savedGoals.weeklyDays
      : DEFAULT_PRACTICE_GOALS.weeklyDays
    : isValidGoal(
          savedGoals.weeklyMinutes,
          MIN_GOAL_MINUTES,
          MAX_WEEKLY_GOAL_MINUTES,
        )
      ? Math.max(
          MIN_WEEKLY_GOAL_DAYS,
          Math.min(
            MAX_WEEKLY_GOAL_DAYS,
            Math.ceil(savedGoals.weeklyMinutes / dailyMinutes),
          ),
        )
      : DEFAULT_PRACTICE_GOALS.weeklyDays;

  return {
    dailyMinutes,
    weeklyDays,
  };
}

export function getPracticeIntensityLevel(
  practiceMinutes: number,
  goalMinutes: number,
): number {
  if (
    !Number.isFinite(practiceMinutes) ||
    !Number.isFinite(goalMinutes) ||
    goalMinutes <= 0
  ) {
    throw new RangeError("Los minutos de práctica y el objetivo deben ser válidos.");
  }

  if (practiceMinutes <= 0) return 0;

  const progress = practiceMinutes / goalMinutes;
  if (progress < 0.25) return 1;
  if (progress < 0.5) return 2;
  if (progress < 1) return 3;
  return 4;
}

export function getPracticeIntensityClass(
  practiceMinutes: number,
  goalMinutes: number,
): string {
  return PRACTICE_INTENSITY_CLASSES[
    getPracticeIntensityLevel(practiceMinutes, goalMinutes)
  ];
}

"use client";

import { AdjustableNumber } from "@/components/ui/AdjustableNumber";
import { adjustPracticeGoal } from "@/lib/practice-goals";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { useI18nSection } from "@/i18n/I18nProvider";

type GoalControl = {
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  ariaLabel: string;
  adjust: (direction: -1 | 1) => void;
  onChange: (value: number) => void;
};

export function PracticeGoalsCard() {
  const dashboard = useI18nSection("dashboard");
  const goals = usePracticeStore((state) => state.practiceGoals);
  const setPracticeGoals = usePracticeStore((state) => state.setPracticeGoals);

  function setDailyGoal(dailyMinutes: number) {
    setPracticeGoals({ ...goals, dailyMinutes });
  }

  function setWeeklyGoal(weeklyDays: number) {
    setPracticeGoals({ ...goals, weeklyDays });
  }

  const goalControls: GoalControl[] = [
    {
      key: "daily",
       label: dashboard.dailyGoal,
      value: goals.dailyMinutes,
      min: 5,
      max: 720,
      step: 5,
      unit: "min",
       ariaLabel: dashboard.dailyGoalAria,
      adjust: (direction) =>
        setDailyGoal(adjustPracticeGoal(goals.dailyMinutes, direction, 720)),
      onChange: setDailyGoal,
    },
    {
      key: "weekly",
       label: dashboard.daysPerWeek,
      value: goals.weeklyDays,
      min: 1,
      max: 7,
      step: 1,
      unit: "días",
       ariaLabel: dashboard.weeklyGoalDaysAria,
      adjust: (direction) =>
        setWeeklyGoal(adjustPracticeGoal(goals.weeklyDays, direction, 7, 1, 1)),
      onChange: setWeeklyGoal,
    },
  ];

  return (
    <section className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
           {dashboard.goals}
        </p>
        <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
           {dashboard.practiceTime}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
           {dashboard.goalsDescription}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {goalControls.map((goal) => (
          <div
            key={goal.key}
            className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-5"
          >
            <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">
              {goal.label}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goal.adjust(-1)}
                disabled={goal.value <= goal.min}
               aria-label={`${dashboard.reduce} ${goal.label.toLowerCase()}`}
                className="flex size-11 shrink-0 items-center justify-center border border-zinc-800 text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>
              <AdjustableNumber
                value={goal.value}
                min={goal.min}
                max={goal.max}
                step={goal.step}
                unit={goal.unit}
                ariaLabel={goal.ariaLabel}
                onChange={goal.onChange}
                className="flex-1 text-5xl text-zinc-100"
              />
              <button
                type="button"
                onClick={() => goal.adjust(1)}
                disabled={goal.value >= goal.max}
               aria-label={`${dashboard.increase} ${goal.label.toLowerCase()}`}
                className="flex size-11 shrink-0 items-center justify-center border border-zinc-800 text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-zinc-600">
               {dashboard.editHint}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  getPracticeTooltipPosition,
  PracticeDayTooltip,
  type PracticeTooltipDay,
} from "@/components/dashboard/PracticeDayTooltip";
import type { SessionRecord } from "@/types/practice";
import { formatPracticeDuration } from "@/lib/dashboard-data";
import type { PracticeWeekDay } from "@/lib/practice-calendar";
import { getPracticeIntensityClass } from "@/lib/practice-goals";

type WeeklyPracticeSummaryProps = {
  sessions: SessionRecord[];
  days: PracticeWeekDay[];
  dailyGoalMinutes: number;
  weeklyGoalDays: number;
};

export function WeeklyPracticeSummary({
  sessions,
  days,
  dailyGoalMinutes,
  weeklyGoalDays,
}: WeeklyPracticeSummaryProps) {
  const router = useRouter();
  const [hoveredDay, setHoveredDay] = useState<PracticeTooltipDay | null>(null);
  const sessionsByDate = useMemo(() => {
    const grouped = new Map<string, SessionRecord[]>();
    for (const session of sessions) {
      const date = new Date(session.startedAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      grouped.set(dateKey, [...(grouped.get(dateKey) ?? []), session]);
    }
    return grouped;
  }, [sessions]);
  const totalSeconds = sessions.reduce(
    (total, session) => total + session.durationSeconds,
    0,
  );
  const totalMinutes = totalSeconds / 60;
  const practicedDays = days.filter((day) => day.hasPractice).length;
  const weeklyProgress = Math.min(
    (practicedDays / weeklyGoalDays) * 100,
    100,
  );
  const weeklyProgressClass = getPracticeIntensityClass(
    practicedDays,
    weeklyGoalDays,
  );

  function showTooltip(
    element: HTMLButtonElement,
    day: PracticeWeekDay,
  ) {
    if (!day.hasPractice) return;

    setHoveredDay({
      dateKey: day.dateKey,
      totalMinutes: day.totalMinutes,
      sessionCount: day.sessionCount,
      sessions: sessionsByDate.get(day.dateKey) ?? [],
      ...getPracticeTooltipPosition(element),
    });
  }

  return (
    <section
      data-tour-target="dashboard-summary"
      className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
            Lunes a domingo
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
            Esta semana
          </h2>
        </div>
        <div className="min-w-48">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="flex items-baseline gap-2">
              <span className="font-mono text-2xl leading-8 tracking-normal text-zinc-100 sm:text-3xl sm:leading-9">
                {sessions.length}
              </span>
              <span className="text-sm text-zinc-400">
                {sessions.length === 1 ? "sesión" : "sesiones"}
              </span>
            </p>
            <p className="font-mono text-sm leading-6 tracking-normal text-zinc-300 sm:text-base sm:leading-7">
              {formatPracticeDuration(totalMinutes)} practicados
            </p>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Objetivo semanal ·{" "}
            <span             className="font-mono text-sm text-zinc-300 sm:text-base">
              {practicedDays}/{weeklyGoalDays} días
            </span>
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden bg-zinc-800"
            role="progressbar"
            aria-label="Progreso del objetivo semanal de días"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(weeklyProgress)}
          >
            <div
              className={`h-full transition-[width] duration-300 ${weeklyProgressClass}`}
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-7">
        <ol
          aria-label="Días de práctica de esta semana"
          className="grid grid-cols-7 gap-1.5 sm:gap-3"
        >
          {days.map((day) => (
            <li
              key={day.dateKey}
              className="min-w-0"
            >
              <button
                type="button"
                aria-label={`${day.dayLabel} ${day.dayOfMonth}: ${day.sessionCount} ${day.sessionCount === 1 ? "sesión" : "sesiones"}${day.hasPractice ? `, ${formatPracticeDuration(day.totalMinutes)} practicados. Ver detalle de práctica` : ""}`}
                aria-describedby={
                  hoveredDay?.dateKey === day.dateKey
                    ? "practice-day-tooltip"
                    : undefined
                }
                onClick={() => {
                  if (day.hasPractice) {
                    router.push(`/dashboard/practice/${day.dateKey}`);
                  }
                }}
                onMouseEnter={(event) => showTooltip(event.currentTarget, day)}
                onMouseLeave={() => setHoveredDay(null)}
                onFocus={(event) => showTooltip(event.currentTarget, day)}
                onBlur={() => setHoveredDay(null)}
                className={`flex min-h-20 w-full flex-col justify-between rounded-lg p-1.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-200 sm:min-h-28 sm:p-3 ${day.hasPractice ? `${getPracticeIntensityClass(day.totalMinutes, dailyGoalMinutes)} hover:brightness-110` : "bg-zinc-950/40 hover:bg-zinc-900/70"}`}
              >
                <span className="flex min-w-0 flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.04em] text-zinc-400 sm:text-xs sm:tracking-[0.08em]">
                    {day.dayLabel.replace(/\.$/, "")}
                  </span>
                  <span className="font-mono text-sm leading-6 tabular-nums tracking-normal text-zinc-100 sm:text-base sm:leading-7">
                    {day.dayOfMonth}
                  </span>
                </span>
                <span
                  className={`truncate font-mono text-[9px] leading-4 tracking-normal sm:text-[10px] sm:leading-5 ${day.hasPractice ? "text-[#c1d2c2]" : "text-zinc-500"}`}
                >
                  {day.sessionCount} ses.
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      {hoveredDay &&
        createPortal(<PracticeDayTooltip day={hoveredDay} />, document.body)}
    </section>
  );
}

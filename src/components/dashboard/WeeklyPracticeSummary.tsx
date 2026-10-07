import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  getPracticeTooltipPosition,
  PracticeDayTooltip,
  type PracticeTooltipDay,
} from "@/components/dashboard/PracticeDayTooltip";
import type { SessionRecord } from "@/types/practice";
import { formatPracticeDuration } from "@/lib/dashboard-data";
import type { PracticeWeekDay } from "@/lib/practice-calendar";

type WeeklyPracticeSummaryProps = {
  sessions: SessionRecord[];
  days: PracticeWeekDay[];
};

export function WeeklyPracticeSummary({
  sessions,
  days,
}: WeeklyPracticeSummaryProps) {
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
    <section className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
            Lunes a domingo
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-zinc-100">
            Esta semana
          </h2>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <p className="flex items-baseline gap-2">
            <span className="font-mono text-4xl leading-none tracking-tight text-zinc-100 sm:text-5xl">
              {sessions.length}
            </span>
            <span className="text-sm text-zinc-400">
              {sessions.length === 1 ? "sesión" : "sesiones"}
            </span>
          </p>
          <p className="font-mono text-sm text-zinc-300 sm:text-base">
            {formatPracticeDuration(totalSeconds / 60)} practicados
          </p>
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
                aria-label={`${day.dayLabel} ${day.dayOfMonth}: ${day.sessionCount} ${day.sessionCount === 1 ? "sesión" : "sesiones"}${day.hasPractice ? `, ${formatPracticeDuration(day.totalMinutes)} practicados` : ""}`}
                aria-describedby={
                  hoveredDay?.dateKey === day.dateKey
                    ? "practice-day-tooltip"
                    : undefined
                }
                onMouseEnter={(event) => showTooltip(event.currentTarget, day)}
                onMouseLeave={() => setHoveredDay(null)}
                onFocus={(event) => showTooltip(event.currentTarget, day)}
                onBlur={() => setHoveredDay(null)}
                className={`flex min-h-20 w-full flex-col justify-between rounded-lg border p-1.5 text-left transition sm:min-h-28 sm:p-3 ${day.hasPractice ? "border-[#526e57] bg-[#26372b]/80 hover:border-[#89a78b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-200" : "border-zinc-800 bg-zinc-950/40"}`}
              >
                <span className="flex min-w-0 flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.04em] text-zinc-400 sm:text-xs sm:tracking-[0.08em]">
                    {day.dayLabel.replace(/\.$/, "")}
                  </span>
                  <span className="font-mono text-lg tabular-nums text-zinc-100 sm:text-2xl">
                    {day.dayOfMonth}
                  </span>
                </span>
                <span
                  className={`truncate font-mono text-[10px] sm:text-xs ${day.hasPractice ? "text-[#c1d2c2]" : "text-zinc-500"}`}
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

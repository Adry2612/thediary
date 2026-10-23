import { useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { PracticeDayTooltip } from "@/components/dashboard/PracticeDayTooltip";
import { usePracticeDayTooltip } from "@/hooks/usePracticeDayTooltip";
import type { SessionRecord } from "@/types/practice";
import { formatPracticeDuration } from "@/utils/dashboard-data";
import type { PracticeWeekDay } from "@/utils/practice-calendar";
import {
  getPracticeIntensityClass,
  getPracticeIntensityLevel,
} from "@/utils/practice-goals";
import { useI18nSection } from "@/i18n/I18nProvider";

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
  const dashboard = useI18nSection("dashboard");
  const weekdays = useI18nSection("weekdays");
  const router = useRouter();
  const { hoveredDay, showTooltip, hideTooltip } = usePracticeDayTooltip();
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

  function showDayTooltip(
    element: HTMLButtonElement,
    day: PracticeWeekDay,
  ) {
    if (!day.hasPractice) return;

    showTooltip(element, {
      dateKey: day.dateKey,
      totalMinutes: day.totalMinutes,
      sessionCount: day.sessionCount,
      sessions: sessionsByDate.get(day.dateKey) ?? [],
    });
  }

  return (
    <section
      data-tour-target="dashboard-summary"
      className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
             {dashboard.mondayToSunday}
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
             {dashboard.weekly}
          </h2>
        </div>
        <div className="min-w-48">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="flex items-baseline gap-2">
              <span className="font-mono text-2xl leading-8 tracking-normal text-zinc-100 sm:text-3xl sm:leading-9">
                {sessions.length}
              </span>
              <span className="text-sm text-zinc-400">
                 {sessions.length === 1 ? dashboard.session : dashboard.sessions}
              </span>
            </p>
            <p className="font-mono text-sm leading-6 tracking-normal text-zinc-300 sm:text-base sm:leading-7">
               {formatPracticeDuration(totalMinutes)} {dashboard.practiced}
            </p>
          </div>
          <p className="mt-2 text-xs text-muted">
             {dashboard.weeklyGoal} ·{" "}
            <span             className="font-mono text-sm text-zinc-300 sm:text-base">
               {practicedDays}/{weeklyGoalDays} {dashboard.days}
            </span>
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden bg-zinc-800"
            role="progressbar"
             aria-label={dashboard.weeklyGoalAria}
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
           aria-label={dashboard.weekDaysAria}
          className="grid grid-cols-7 gap-1.5 sm:gap-3"
        >
          {days.map((day) => {
            const weekdayLabel =
              weekdays.short[new Date(`${day.dateKey}T12:00:00`).getDay()];
            // La paleta cambia de oscura a clara. A partir del nivel 3 el
            // texto claro no llega a 4.5:1, así que el contenido pasa a negro.
            const intensityLevel = day.hasPractice
              ? getPracticeIntensityLevel(day.totalMinutes, dailyGoalMinutes)
              : -1;
            const usesDarkText = intensityLevel >= 3;
            const primaryTextClass = day.hasPractice
              ? usesDarkText
                ? "text-black"
                : "text-zinc-100"
              : "text-zinc-100";
            const secondaryTextClass = day.hasPractice
              ? usesDarkText
                ? "text-black"
                : intensityLevel === 2
                  ? "text-zinc-200"
                  : "text-zinc-300"
              : "text-zinc-400";
            // La casilla muestra la cifra con la abreviatura ("0 ses."), y el
            // nombre accesible tiene que contener ese mismo texto (WCAG 2.5.3),
            // así que la abreviatura se compone una sola vez y sirve a los dos.
            const sessionAbbreviation = `${day.sessionCount} ${dashboard.session.slice(0, 3)}.`;

            return (
              <li
                key={day.dateKey}
                className="min-w-0"
              >
                <button
                  type="button"
                  aria-label={`${weekdayLabel} ${day.dayOfMonth} ${sessionAbbreviation}${day.hasPractice ? ` ${formatPracticeDuration(day.totalMinutes)} ${dashboard.practiced}.` : ""}`}
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
                  onMouseEnter={(event) => showDayTooltip(event.currentTarget, day)}
                  onMouseLeave={() => hideTooltip}
                  onFocus={(event) => showDayTooltip(event.currentTarget, day)}
                  onBlur={() => hideTooltip}
                  className={`flex min-h-20 w-full flex-col justify-between rounded-lg p-1.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-200 sm:min-h-28 sm:p-3 ${day.hasPractice ? `${getPracticeIntensityClass(day.totalMinutes, dailyGoalMinutes)} hover:brightness-110` : "bg-zinc-950/40 hover:bg-zinc-900/70"}`}
                >
                  <span className="flex min-w-0 flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <span className={`truncate font-mono text-[10px] uppercase tracking-[0.04em] sm:text-xs sm:tracking-[0.08em] ${secondaryTextClass}`}>
                      {weekdayLabel}
                    </span>
                    {/* Los espacios explícitos mantienen el texto visible y el
                        nombre accesible alineados (WCAG 2.5.3). Un nodo de
                        texto en blanco no se pinta como item de flex, pero sí
                        cuenta como texto visible. */}
                    {" "}
                    <span className={`font-mono text-sm leading-6 tabular-nums tracking-normal sm:text-base sm:leading-7 ${primaryTextClass}`}>
                      {day.dayOfMonth}
                    </span>
                  </span>
                  {" "}
                  <span
                    className={`truncate font-mono text-[9px] leading-4 tracking-normal sm:text-[10px] sm:leading-5 ${day.hasPractice ? secondaryTextClass : "text-muted"}`}
                  >
                    {sessionAbbreviation}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      {hoveredDay &&
        createPortal(<PracticeDayTooltip day={hoveredDay} />, document.body)}
    </section>
  );
}

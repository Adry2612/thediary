"use client";

import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { PracticeDayTooltip } from "@/components/dashboard/PracticeDayTooltip";
import { usePracticeDayTooltip } from "@/hooks/usePracticeDayTooltip";
import { useLatestPracticeScroll } from "@/hooks/useLatestPracticeScroll";
import type { DailyStats, SessionRecord } from "@/types/practice";
import type { CalendarCell } from "@/types/dashboard";
import {
  createCalendarCells,
  getLatestPracticeDateKey,
  getMonthMarkers,
  PRACTICE_DAY_TARGET_SIZE,
  toDateKey,
} from "@/utils/practice-calendar";
import {
  getPracticeIntensityClass,
  PRACTICE_INTENSITY_CLASSES,
} from "@/utils/practice-goals";
import { formatDateLabel } from "@/utils/format";
import { useI18n, useI18nSection } from "@/i18n/I18nProvider";

type YearPracticeCalendarProps = {
  days: DailyStats[];
  history: SessionRecord[];
  todayKey: string;
  year: number;
  dailyGoalMinutes: number;
};

export function YearPracticeCalendar({
  days,
  history,
  todayKey,
  year,
  dailyGoalMinutes,
}: YearPracticeCalendarProps) {
  const router = useRouter();
  const { locale } = useI18n();
  const calendar = useI18nSection("calendar");
  const tooltip = useI18nSection("tooltip");
  const weekdays = useI18nSection("weekdays");
  const { hoveredDay, showTooltip, hideTooltip } = usePracticeDayTooltip();
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const statsByDate = useMemo(
    () => new Map(days.map((day) => [day.dateKey, day])),
    [days],
  );
  const sessionsByDate = useMemo(() => {
    const grouped = new Map<string, SessionRecord[]>();
    for (const session of history) {
      const dateKey = toDateKey(new Date(session.startedAt));
      if (!dateKey.startsWith(`${year}-`)) continue;
      grouped.set(dateKey, [...(grouped.get(dateKey) ?? []), session]);
    }
    return grouped;
  }, [history, year]);
  const yearStart = new Date(year, 0, 1);
  const firstWeekday = (yearStart.getDay() + 6) % 7;
  const weekCount = Math.ceil((firstWeekday + days.length) / 7);
  const monthMarkers = getMonthMarkers(year, weekCount, firstWeekday, locale);
  const cells = createCalendarCells(
    year,
    weekCount,
    firstWeekday,
    days,
    statsByDate,
    sessionsByDate,
  );
  const latestPracticeDateKey = getLatestPracticeDateKey(history, days, year);
  const yearLabel = new Intl.NumberFormat(locale, {
    useGrouping: false,
  }).format(year);

  useLatestPracticeScroll(calendarScrollRef, cells, latestPracticeDateKey);

  function showCellTooltip(
    element: HTMLButtonElement,
    cell: NonNullable<CalendarCell>,
  ) {
    showTooltip(element, {
      dateKey: cell.dateKey,
      totalMinutes: cell.stats?.totalMinutes ?? 0,
      sessionCount: cell.stats?.sessionCount ?? 0,
      sessions: cell.sessions,
    });
  }

  return (
    <section className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            {calendar.consistency}
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
            {calendar.title} · {yearLabel}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {calendar.description} {dailyGoalMinutes} min. {calendar.selectDay}.
          </p>
        </div>
        <div
          className="flex items-center gap-2 text-xs text-muted"
          aria-label={calendar.intensity}
        >
          <span>{calendar.less}</span>
          {PRACTICE_INTENSITY_CLASSES.map((intensityClass, index) => (
            <span
              key={intensityClass}
              aria-hidden="true"
              title={
                index === 0
                  ? calendar.noPractice
                  : index === 1
                    ? calendar.below25
                    : index === 2
                      ? calendar.between25and49
                      : index === 3
                        ? calendar.between50and99
                        : calendar.above100
              }
              className={`size-3 rounded-[2px] ${intensityClass}`}
            />
          ))}
          <span>{calendar.more}</span>
        </div>
      </div>

      <div ref={calendarScrollRef} className="mt-8 overflow-x-auto pb-3">
        <div className="min-w-max">
          <div
            aria-hidden="true"
            className="mb-2 grid gap-0 pl-8 font-mono text-xs capitalize text-muted"
            style={{ gridTemplateColumns: `repeat(${weekCount}, ${PRACTICE_DAY_TARGET_SIZE}px)` }}
          >
            {monthMarkers.map((month, index) => (
              <span key={index} className="whitespace-nowrap">
                {month}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <div
              aria-hidden="true"
              className="grid grid-rows-7 gap-0 font-mono text-[10px] leading-5 text-muted"
            >
              {weekdays.short.map((label, index) => (
                <span key={index} className="h-5 w-6">
                  {label}
                </span>
              ))}
            </div>
            <div
              role="group"
              aria-label={`${calendar.yearDays} ${yearLabel}`}
              className="grid grid-flow-col grid-rows-7 gap-0"
              style={{
                gridTemplateColumns: `repeat(${weekCount}, ${PRACTICE_DAY_TARGET_SIZE}px)`,
              }}
            >
              {cells.map((cell, index) => {
                if (!cell) {
                  return (
                    <span
                      key={`empty-${index}`}
                      className="size-5"
                      aria-hidden="true"
                    />
                  );
                }

                const minutes = cell.stats?.totalMinutes ?? 0;
                const isFuture = cell.dateKey > todayKey;

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    disabled={isFuture}
                    aria-label={`${formatDateLabel(cell.dateKey, locale, true)}: ${minutes ? `${Math.round(minutes)} minutos, ${cell.sessions.length} ${cell.sessions.length === 1 ? tooltip.session : tooltip.sessions}. ${tooltip.viewDetails}` : calendar.noPractice}`}
                    aria-describedby={
                      hoveredDay?.dateKey === cell.dateKey
                        ? "practice-day-tooltip"
                        : undefined
                    }
                    onMouseEnter={(event) =>
                      showCellTooltip(event.currentTarget, cell)
                    }
                    onMouseLeave={() => hideTooltip}
                    onFocus={(event) => showCellTooltip(event.currentTarget, cell)}
                    onBlur={() => hideTooltip}
                    onClick={() => {
                      if (cell.sessions.length > 0) {
                        router.push(`/dashboard/practice/${cell.dateKey}`);
                      }
                    }}
                    className={`group grid size-5 place-items-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-200 disabled:cursor-default disabled:opacity-30 ${cell.sessions.length > 0 ? "cursor-pointer" : ""}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`size-4 rounded-[3px] group-hover:outline group-hover:outline-1 group-hover:outline-zinc-400 ${getPracticeIntensityClass(minutes, dailyGoalMinutes)}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {hoveredDay &&
        createPortal(<PracticeDayTooltip day={hoveredDay} />, document.body)}
    </section>
  );
}

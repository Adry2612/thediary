"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  getPracticeTooltipPosition,
  PracticeDayTooltip,
  type PracticeTooltipDay,
} from "@/components/dashboard/PracticeDayTooltip";
import type { DailyStats, SessionRecord } from "@/types/practice";
import {
  getPracticeIntensityClass,
  PRACTICE_INTENSITY_CLASSES,
} from "@/lib/practice-goals";
import { useI18n, useI18nSection } from "@/i18n/I18nProvider";

type YearPracticeCalendarProps = {
  days: DailyStats[];
  history: SessionRecord[];
  todayKey: string;
  year: number;
  dailyGoalMinutes: number;
};

type CalendarCell = {
  dateKey: string;
  stats?: DailyStats;
  sessions: SessionRecord[];
} | null;

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateKey: string, locale: string, includeYear = false) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(parseDateKey(dateKey));
}

function getMonthMarkers(year: number, weekCount: number, firstWeekday: number, locale: string) {
  const markers = Array<string>(weekCount).fill("");
  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const dayOfYear =
      (Date.UTC(year, monthIndex, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
    const weekIndex = Math.floor((firstWeekday + dayOfYear) / 7);
    markers[weekIndex] = new Intl.DateTimeFormat(locale, {
      month: "short",
    })
      .format(new Date(year, monthIndex, 1))
      .replace(/\.$/, "");
  }

  return markers;
}

function createCalendarCells(
  year: number,
  weekCount: number,
  firstWeekday: number,
  daysInYear: DailyStats[],
  statsByDate: Map<string, DailyStats>,
  sessionsByDate: Map<string, SessionRecord[]>,
): CalendarCell[] {
  const yearStart = new Date(year, 0, 1);
  return Array.from({ length: weekCount * 7 }, (_, index) => {
    const weekIndex = Math.floor(index / 7);
    const weekdayIndex = index % 7;
    const dayOffset = weekIndex * 7 + weekdayIndex - firstWeekday;
    if (dayOffset < 0 || dayOffset >= daysInYear.length) return null;

    const date = new Date(yearStart);
    date.setDate(yearStart.getDate() + dayOffset);
    const dateKey = toDateKey(date);
    return {
      dateKey,
      stats: statsByDate.get(dateKey),
      sessions: sessionsByDate.get(dateKey) ?? [],
    };
  });
}

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
  const [hoveredDay, setHoveredDay] = useState<PracticeTooltipDay | null>(null);
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
  const yearLabel = new Intl.NumberFormat(locale, {
    useGrouping: false,
  }).format(year);

  function showTooltip(
    element: HTMLButtonElement,
    cell: NonNullable<CalendarCell>,
  ) {
    setHoveredDay({
      dateKey: cell.dateKey,
      totalMinutes: cell.stats?.totalMinutes ?? 0,
      sessionCount: cell.stats?.sessionCount ?? 0,
      sessions: cell.sessions,
      ...getPracticeTooltipPosition(element),
    });
  }

  return (
    <section className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
            {calendar.consistency}
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
            {calendar.title} · {yearLabel}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {calendar.description} {dailyGoalMinutes} min. {calendar.selectDay}.
          </p>
        </div>
        <div
          className="flex items-center gap-2 text-xs text-zinc-500"
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

      <div className="mt-8 overflow-x-auto pb-3">
        <div className="min-w-max">
          <div
            aria-hidden="true"
            className="mb-2 grid gap-1 pl-8 font-mono text-xs capitalize text-zinc-500"
            style={{ gridTemplateColumns: `repeat(${weekCount}, 16px)` }}
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
              className="grid grid-rows-7 gap-1 pt-0.5 font-mono text-[10px] leading-4 text-zinc-500"
            >
              {weekdays.short.map((label, index) => (
                <span key={index} className="h-4 w-6">
                  {label}
                </span>
              ))}
            </div>
            <div
              role="group"
              aria-label={`${calendar.yearDays} ${yearLabel}`}
              className="grid grid-flow-col grid-rows-7 gap-1"
              style={{
                gridTemplateColumns: `repeat(${weekCount}, 16px)`,
              }}
            >
              {cells.map((cell, index) => {
                if (!cell) {
                  return (
                    <span
                      key={`empty-${index}`}
                      className="size-4"
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
                    aria-label={`${formatDate(cell.dateKey, locale, true)}: ${minutes ? `${Math.round(minutes)} minutos, ${cell.sessions.length} ${cell.sessions.length === 1 ? tooltip.session : tooltip.sessions}. ${tooltip.viewDetails}` : calendar.noPractice}`}
                    aria-describedby={
                      hoveredDay?.dateKey === cell.dateKey
                        ? "practice-day-tooltip"
                        : undefined
                    }
                    onMouseEnter={(event) =>
                      showTooltip(event.currentTarget, cell)
                    }
                    onMouseLeave={() => setHoveredDay(null)}
                    onFocus={(event) => showTooltip(event.currentTarget, cell)}
                    onBlur={() => setHoveredDay(null)}
                    onClick={() => {
                      if (cell.sessions.length > 0) {
                        router.push(`/dashboard/practice/${cell.dateKey}`);
                      }
                    }}
                    className={`size-4 rounded-[3px] ${getPracticeIntensityClass(minutes, dailyGoalMinutes)} transition hover:outline hover:outline-1 hover:outline-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-200 disabled:cursor-default disabled:opacity-30 ${cell.sessions.length > 0 ? "cursor-pointer" : ""}`}
                  />
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

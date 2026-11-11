"use client";

import { formatPracticeDuration } from "@/utils/dashboard-data";
import type { PracticeYearSummary as PracticeYearSummaryData } from "@/utils/practice-year";
import { getPracticeIntensityClass } from "@/utils/practice-goals";
import { useI18n, useI18nSection } from "@/i18n/I18nProvider";

export function YearPracticeSummary({
  summary,
}: {
  summary: PracticeYearSummaryData;
}) {
  const dashboard = useI18nSection("dashboard");
  const { locale } = useI18n();
  const yearLabel = new Intl.NumberFormat(locale, {
    useGrouping: false,
  }).format(summary.year);
  const bestMonthLabel =
    summary.bestMonth ?
      new Intl.DateTimeFormat(locale, { month: "long" }).format(
        new Date(summary.year, summary.bestMonth.month, 1),
      )
    : null;
  const daysProgress = summary.daysInYear
    ? (summary.practicedDays / summary.daysInYear) * 100
    : 0;

  return (
    <section className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            {dashboard.yearSummaryEyebrow} · {yearLabel}
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
            {dashboard.yearSummaryTitle}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {dashboard.yearSummaryDescription}
          </p>
        </div>
        <div className="min-w-48">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="flex items-baseline gap-2">
              <span className="font-mono text-2xl leading-8 tracking-normal text-zinc-100 sm:text-3xl sm:leading-9">
                {summary.sessionCount}
              </span>
              <span className="text-sm text-zinc-400">
                {summary.sessionCount === 1
                  ? dashboard.session
                  : dashboard.sessions}
              </span>
            </p>
            <p className="font-mono text-sm leading-6 tracking-normal text-zinc-300 sm:text-base sm:leading-7">
              {formatPracticeDuration(summary.totalSeconds / 60)}{" "}
              {dashboard.practiced}
            </p>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-3 text-xs text-muted">
              <span>{dashboard.yearDaysPracticed}</span>
              <span className="font-mono text-zinc-300">
                {summary.practicedDays} / {summary.daysInYear}
              </span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden bg-zinc-800"
              role="progressbar"
              aria-label={dashboard.yearDaysPracticed}
              aria-valuemin={0}
              aria-valuemax={summary.daysInYear}
              aria-valuenow={summary.practicedDays}
            >
              <div
                className={`h-full transition-[width] duration-300 ${getPracticeIntensityClass(
                  summary.practicedDays,
                  summary.daysInYear,
                )}`}
                style={{ width: `${daysProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <dl className="mt-7 grid gap-4 border-t border-zinc-800 pt-5 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-[0.08em] text-muted">
            {dashboard.yearBestMonth}
          </dt>
          <dd className="mt-1 font-mono text-sm text-zinc-200">
            {summary.bestMonth && bestMonthLabel
              ? `${bestMonthLabel} · ${formatPracticeDuration(summary.bestMonth.seconds / 60)}`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.08em] text-muted">
            {dashboard.yearAverageSession}
          </dt>
          <dd className="mt-1 font-mono text-sm text-zinc-200">
            {summary.sessionCount
              ? formatPracticeDuration(summary.averageSessionSeconds / 60)
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.08em] text-muted">
            {dashboard.yearMonthsPracticed}
          </dt>
          <dd className="mt-1 font-mono text-sm text-zinc-200">
            {summary.monthsWithPractice} / 12
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.08em] text-muted">
            {dashboard.yearLongestStreak}
          </dt>
          <dd className="mt-1 font-mono text-sm text-zinc-200">
            {summary.longestStreakDays}{" "}
            {summary.longestStreakDays === 1
              ? dashboard.day
              : dashboard.days}
          </dd>
        </div>
      </dl>
    </section>
  );
}

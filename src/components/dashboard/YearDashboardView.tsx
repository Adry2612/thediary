'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageShell } from '@/components/ui/PageShell';
import { GuitarBalance } from '@/components/dashboard/GuitarBalance';
import { PracticeTimeChart } from '@/components/dashboard/PracticeTimeChart';
import { PracticeWellbeing } from '@/components/dashboard/PracticeWellbeing';
import { SkillBalance } from '@/components/dashboard/SkillBalance';
import { TempoProgress } from '@/components/dashboard/TempoProgress';
import { TopPracticeContent } from '@/components/dashboard/TopPracticeContent';
import { YearPracticeCalendar } from '@/components/dashboard/YearPracticeCalendar';
import { YearPracticeSummary } from '@/components/dashboard/YearPracticeSummary';
import { useDisplayPreferences } from '@/hooks/useDisplayPreferences';
import { usePracticeFeedbackPreference } from '@/hooks/usePracticeFeedbackPreference';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { useI18n, useI18nSection } from '@/i18n/I18nProvider';
import { formatPracticeDuration, PRACTICE_SKILL_LABELS } from '@/utils/dashboard-data';
import { interpolate } from '@/utils/interpolate';
import {
  getGuitarBalance,
  getPracticeContentRankings,
  getSkillDistribution,
} from '@/utils/practice-analytics';
import { getYearlyHeatmapData, toDateKey } from '@/utils/practice-calendar';
import {
  getCalendarYearRange,
  getPracticeYearSummary,
} from '@/utils/practice-year';
import { normalizePracticeMetricValue } from '@/utils/practice-metrics';

export function YearDashboardView({
  year,
  years,
  currentYear,
  onYearChange,
}: {
  year: number;
  years: number[];
  currentYear: number;
  onYearChange: (year: number) => void;
}) {
  const dashboard = useI18nSection('dashboard');
  const { locale } = useI18n();
  const history = usePracticeStore((state) => state.history);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const practiceGoals = usePracticeStore((state) => state.practiceGoals);
  const persistenceError = usePracticeStore((state) => state.persistenceError);
  const { weekStartsOn } = useDisplayPreferences();
  const { isMoodEnabled, isFocusEnabled } = usePracticeFeedbackPreference();
  const yearRange = useMemo(() => getCalendarYearRange(year), [year]);
  const yearEnd = useMemo(() => new Date(year, 11, 31), [year]);
  const yearTodayKey = `${year}-12-31`;
  const yearLabel = new Intl.NumberFormat(locale, {
    useGrouping: false,
  }).format(year);
  const currentYearLabel = new Intl.NumberFormat(locale, {
    useGrouping: false,
  }).format(currentYear);
  const yearlyDays = useMemo(
    () => getYearlyHeatmapData(year, history),
    [history, year],
  );
  const summary = useMemo(
    () => getPracticeYearSummary(history, year),
    [history, year],
  );
  const yearSessions = useMemo(
    () =>
      history.filter((session) => {
        const dateKey = toDateKey(new Date(session.startedAt));
        return (
          dateKey >= yearRange.startDate && dateKey <= yearRange.endDate
        );
      }),
    [history, yearRange],
  );
  const skillDistribution = useMemo(
    () => getSkillDistribution(history, yearRange),
    [history, yearRange],
  );
  const guitarBalance = useMemo(
    () => getGuitarBalance(history, yearRange),
    [history, yearRange],
  );
  const contentRankings = useMemo(
    () => getPracticeContentRankings(history, repertoireItems, yearRange),
    [history, repertoireItems, yearRange],
  );
  const showWellbeing = yearSessions.some(
    (session) =>
      (isMoodEnabled && normalizePracticeMetricValue(session.mood) !== null) ||
      (isFocusEnabled && normalizePracticeMetricValue(session.focus) !== null),
  );
  const totalHours = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  }).format(summary.totalSeconds / 3600);
  const metricCards = [
    {
      label: dashboard.monthTime,
      value: formatPracticeDuration(summary.totalSeconds / 60),
      description: dashboard.recordedTime,
    },
    {
      label: dashboard.recordedSessions,
      value: String(summary.sessionCount),
      description: dashboard.completedPractices,
    },
    {
      label: dashboard.yearDaysPracticed,
      value: `${summary.practicedDays} / ${summary.daysInYear}`,
      description: dashboard.yearDaysPracticedDescription,
    },
    {
      label: dashboard.averageBpm,
      value: summary.averageBpm ? `${summary.averageBpm} bpm` : '—',
      description: summary.averageBpm
        ? dashboard.averageTempo
        : dashboard.noBpm,
    },
    {
      label: dashboard.mostPracticed,
      value:
        summary.mostPracticedSkill ?
          PRACTICE_SKILL_LABELS[summary.mostPracticedSkill]
        : '—',
      description:
        summary.mostPracticedSkill ?
          `${formatPracticeDuration(summary.mostPracticedSeconds / 60)} ${dashboard.accumulated}`
        : dashboard.noPractice,
    },
    {
      label: dashboard.practiceHours,
      value: `${totalHours} h`,
      description: dashboard.historyTime,
    },
    {
      label: dashboard.yearLongestStreak,
      value: `${summary.longestStreakDays} ${
        summary.longestStreakDays === 1 ? dashboard.day : dashboard.days
      }`,
      description: dashboard.yearLongestStreakDescription,
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title={`${dashboard.title} · ${yearLabel}`}
        description={interpolate(dashboard.yearViewDescription, {
          year: yearLabel,
        })}
        actions={
          <Button
            type='button'
            variant='ghost'
            size='field'
            onClick={() => onYearChange(currentYear)}
          >
            {interpolate(dashboard.yearBackToCurrent, {
              year: currentYearLabel,
            })}
          </Button>
        }
      />

      <div className='mb-5'>
        <YearPracticeSummary summary={summary} />
      </div>

      <div className='mt-5'>
        <YearPracticeCalendar
          days={yearlyDays}
          history={history}
          todayKey={yearTodayKey}
          year={year}
          years={years}
          weekStartsOn={weekStartsOn}
          onYearChange={onYearChange}
          dailyGoalMinutes={practiceGoals.dailyMinutes}
        />
      </div>

      <div className='mt-5 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2'>
        <PracticeTimeChart
          history={history}
          today={yearEnd}
          period='year'
          weekStartsOn={weekStartsOn}
          showPeriodSelector={false}
          onPeriodChange={() => undefined}
        />
        <SkillBalance
          distribution={skillDistribution}
          period='year'
          showPeriodSelector={false}
          onPeriodChange={() => undefined}
        />
      </div>

      <div className='mt-5 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2'>
        <GuitarBalance
          balance={guitarBalance}
          period='year'
          showPeriodSelector={false}
          onPeriodChange={() => undefined}
        />
        <div className='min-w-0'>
          <TempoProgress
            history={history}
            today={yearEnd}
            repertoireItems={repertoireItems}
            periods={['year']}
            initialPeriod='year'
          />
        </div>
      </div>

      <div className='mt-5'>
        <TopPracticeContent
          rankings={contentRankings}
          period='year'
          showPeriodSelector={false}
          onPeriodChange={() => undefined}
        />
      </div>

      {showWellbeing && (
        <div className='mt-5'>
          <PracticeWellbeing
            history={history}
            today={yearEnd}
            weekStartsOn={weekStartsOn}
            moodEnabled={isMoodEnabled}
            focusEnabled={isFocusEnabled}
            initialPeriod='year'
            showPeriodSelector={false}
          />
        </div>
      )}

      <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4'>
        {metricCards.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} index={index} />
        ))}
      </div>

      <p className='mt-8 text-center text-xs text-muted'>
        {dashboard.calendarNote} {yearLabel}.
      </p>
      {persistenceError && (
        <p className='mt-4 text-center text-sm text-red-300' role='alert'>
          {dashboard.persistenceError ?? dashboard.recordedTime}:{' '}
          {persistenceError}
        </p>
      )}
    </PageShell>
  );
}

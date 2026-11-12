'use client';

import { useMemo, useState } from 'react';
import { GuitarBalance } from '@/components/dashboard/GuitarBalance';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ManualPracticeEntry } from '@/components/dashboard/ManualPracticeEntry';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageShell } from '@/components/ui/PageShell';
import { PracticeTimeChart } from '@/components/dashboard/PracticeTimeChart';
import { PracticeWellbeing } from '@/components/dashboard/PracticeWellbeing';
import { SkillBalance } from '@/components/dashboard/SkillBalance';
import { StreakFlame } from '@/components/dashboard/StreakFlame';
import { StreakRecord } from '@/components/dashboard/StreakRecord';
import { TempoProgress } from '@/components/dashboard/TempoProgress';
import { TopPracticeContent } from '@/components/dashboard/TopPracticeContent';
import { WeeklyPracticeSummary } from '@/components/dashboard/WeeklyPracticeSummary';
import { YearDashboardView } from '@/components/dashboard/YearDashboardView';
import { YearPracticeCalendar } from '@/components/dashboard/YearPracticeCalendar';
import {
  formatPracticeDuration,
  PRACTICE_SKILL_LABELS,
} from '@/utils/dashboard-data';
import {
  getGuitarBalance,
  getLongestStreak,
  getPracticeContentRankings,
  getPracticeStatistics,
  getSkillDistribution,
  getStreakCount,
  isStreakOnFire,
  type PracticeChartPeriod,
} from '@/utils/practice-analytics';
import { getComparisonSpans } from '@/utils/period-comparison';
import { getLocalDateKey } from '@/utils/local-date';
import { normalizePracticeMetricValue } from '@/utils/practice-metrics';
import {
  getPracticeWeekDays,
  getSessionsForWeek,
  getYearlyHeatmapData,
  parseDateKey,
} from '@/utils/practice-calendar';
import { getPracticeDayCounts, getPracticeYears } from '@/utils/practice-year';
import { interpolate } from '@/utils/interpolate';
import { usePracticeFeedbackPreference } from '@/hooks/usePracticeFeedbackPreference';
import { useDisplayPreferences } from '@/hooks/useDisplayPreferences';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { useAppData } from '@/components/providers/AppDataProvider';
import { useI18n, useI18nSection } from '@/i18n/I18nProvider';
import { DashboardSkeleton } from '@/components/ui/Skeletons';

type DashboardViewProps = {
  todayKey: string;
};

export function DashboardView({ todayKey }: DashboardViewProps) {
  const dashboard = useI18nSection('dashboard');
  const { locale } = useI18n();
  const { user } = useAppData();
  const history = usePracticeStore((state) => state.history);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const practiceGoals = usePracticeStore((state) => state.practiceGoals);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const persistenceError = usePracticeStore((state) => state.persistenceError);
  const today = useMemo(() => parseDateKey(todayKey), [todayKey]);
  const todayYear = today.getFullYear();
  const [selectedYear, setSelectedYear] = useState(todayYear);
  const years = useMemo(
    () => getPracticeYears(history, todayYear),
    [history, todayYear],
  );
  const { isMoodEnabled, isFocusEnabled } = usePracticeFeedbackPreference();

  const [rhythmPeriod, setRhythmPeriod] =
    useState<PracticeChartPeriod>('week');
  const [summaryPeriod, setSummaryPeriod] =
    useState<PracticeChartPeriod>('month');
  const [skillPeriod, setSkillPeriod] = useState<PracticeChartPeriod>('month');
  const [guitarPeriod, setGuitarPeriod] =
    useState<PracticeChartPeriod>('month');
  const [rankingPeriod, setRankingPeriod] =
    useState<PracticeChartPeriod>('month');
  const { weekStartsOn } = useDisplayPreferences();
  const summaryRange = useMemo(
    () => getComparisonSpans(summaryPeriod, today).current,
    [summaryPeriod, today],
  );
  const skillRange = useMemo(
    () => getComparisonSpans(skillPeriod, today).current,
    [skillPeriod, today],
  );
  const guitarRange = useMemo(
    () => getComparisonSpans(guitarPeriod, today).current,
    [guitarPeriod, today],
  );
  const rankingRange = useMemo(
    () => getComparisonSpans(rankingPeriod, today).current,
    [rankingPeriod, today],
  );
  const yearlyDays = useMemo(
    () => getYearlyHeatmapData(todayYear, history),
    [history, todayYear],
  );
  const weeklySessions = useMemo(
    () => getSessionsForWeek(history, today, weekStartsOn),
    [history, today, weekStartsOn],
  );
  const practiceWeekDays = useMemo(
    () => getPracticeWeekDays(history, today, weekStartsOn),
    [history, today, weekStartsOn],
  );
  const summarySessions = useMemo(
    () =>
      history.filter((session) => {
        const dateKey = getLocalDateKey(new Date(session.startedAt));
        return (
          dateKey >= summaryRange.startDate && dateKey <= summaryRange.endDate
        );
      }),
    [history, summaryRange],
  );
  const skillDistribution = useMemo(
    () => getSkillDistribution(history, skillRange),
    [history, skillRange],
  );
  const totalMinutes = Math.round(
    summarySessions.reduce(
      (total, session) => total + session.durationSeconds,
      0,
    ) / 60,
  );
  const sessionsWithBpm = summarySessions.filter(
    (session) => session.averageBpm > 0,
  );
  const averageBpm =
    sessionsWithBpm.length ?
      Math.round(
        sessionsWithBpm.reduce(
          (total, session) => total + session.averageBpm,
          0,
        ) / sessionsWithBpm.length,
      )
    : 0;
  const guitarBalance = useMemo(
    () => getGuitarBalance(history, guitarRange),
    [guitarRange, history],
  );
  const contentRankings = useMemo(
    () => getPracticeContentRankings(history, repertoireItems, rankingRange),
    [history, repertoireItems, rankingRange],
  );
  const summaryStatistics = useMemo(
    () => getPracticeStatistics(history, summaryRange),
    [history, summaryRange],
  );
  /**
   * Las sesiones registradas y las horas de práctica son totales del
   * historial: no se mueven con el periodo del ritmo.
   */
  const historyStatistics = useMemo(
    () => getPracticeStatistics(history),
    [history],
  );
  /**
   * El gráfico de bienestar solo aparece cuando alguno de sus interruptores
   * está activo y hay datos de esa métrica; si no, la tarjeta no se muestra.
   */
  const showWellbeing = useMemo(
    () =>
      history.some(
        (session) =>
          (isMoodEnabled &&
            normalizePracticeMetricValue(session.mood) !== null) ||
          (isFocusEnabled &&
            normalizePracticeMetricValue(session.focus) !== null),
      ),
    [history, isFocusEnabled, isMoodEnabled],
  );
  const mostPracticedSkill = summaryStatistics.mostPracticedSkill;
  const practiceDayCounts = useMemo(
    () => getPracticeDayCounts(history, todayYear),
    [history, todayYear],
  );
  const totalHours = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  }).format(historyStatistics.totalSeconds / 3600);
  const streak = getStreakCount(history, today);
  const longestStreak = getLongestStreak(history);
  const isCurrentStreakRecord = streak > 0 && streak === longestStreak;
  const dayUnit = (count: number) =>
    count === 1 ? dashboard.day : dashboard.days;
  const practiceDaysDescription =
    practiceDayCounts.total === 0
      ? dashboard.noPractice
      : interpolate(dashboard.practiceDaysBreakdown, {
          currentYear: practiceDayCounts.currentYear,
          previousYears: practiceDayCounts.previousYears,
        });
  const historyCards = [
    {
      label: dashboard.practiceDays,
      value: `${practiceDayCounts.total} ${dayUnit(practiceDayCounts.total)}`,
      description: practiceDaysDescription,
    },
    {
      label: dashboard.streak,
      value: `${streak} ${dayUnit(streak)}`,
      description: isCurrentStreakRecord
        ? dashboard.streakRecord
        : `${dashboard.longestStreak}: ${longestStreak} ${dayUnit(longestStreak)}`,
      highlight: isCurrentStreakRecord ? (
        <StreakRecord />
      ) : isStreakOnFire(streak) ? (
        <StreakFlame />
      ) : undefined,
    },
    {
      label: dashboard.recordedSessions,
      value: String(historyStatistics.sessionCount),
      description: dashboard.sessionsHistoryDescription,
    },
    {
      label: dashboard.practiceHours,
      value: `${totalHours} h`,
      description: dashboard.historyTimeTotal,
    },
  ];
  const periodCards = [
    {
      label: dashboard.monthTime,
      value: formatPracticeDuration(Math.round(totalMinutes)),
      description: dashboard.recordedTime,
    },
    {
      label: dashboard.averageBpm,
      value: averageBpm ? `${averageBpm} bpm` : '—',
      description:
        averageBpm ? dashboard.averageTempo : dashboard.noBpm,
    },
    {
      label: dashboard.mostPracticed,
      value:
        mostPracticedSkill ? PRACTICE_SKILL_LABELS[mostPracticedSkill] : '—',
      description:
        mostPracticedSkill
          ? `${formatPracticeDuration(summaryStatistics.mostPracticedSeconds / 60)} ${dashboard.accumulated}`
          : dashboard.noPractice,
    },
  ];

  if (!hasHydrated) {
    return <DashboardSkeleton />;
  }

  if (selectedYear !== todayYear) {
    return (
      <YearDashboardView
        year={selectedYear}
        years={years}
        currentYear={todayYear}
        onYearChange={setSelectedYear}
      />
    );
  }

  return (
    <PageShell>
      <PageHeader
        title={dashboard.title}
        description={dashboard.description}
        actions={<ManualPracticeEntry />}
      />

      <div className='mb-5'>
        <WeeklyPracticeSummary
          sessions={weeklySessions}
          days={practiceWeekDays}
          weekStartsOn={weekStartsOn}
          dailyGoalMinutes={practiceGoals.dailyMinutes}
          weeklyGoalDays={practiceGoals.weeklyDays}
        />
      </div>

      <div className='mt-5'>
        <YearPracticeCalendar
          years={years}
          onYearChange={setSelectedYear}
          days={yearlyDays}
          history={history}
          todayKey={todayKey}
          year={todayYear}
          currentYear={todayYear}
          weekStartsOn={weekStartsOn}
          dailyGoalMinutes={practiceGoals.dailyMinutes}
        />
      </div>

      <div className='mt-5 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2'>
        <PracticeTimeChart
          history={history}
          today={today}
          period={rhythmPeriod}
          weekStartsOn={weekStartsOn}
          onPeriodChange={setRhythmPeriod}
        />
        <SkillBalance
          distribution={skillDistribution}
          period={skillPeriod}
          onPeriodChange={setSkillPeriod}
        />
      </div>

      <div className='mt-5 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2'>
        <GuitarBalance
          balance={guitarBalance}
          period={guitarPeriod}
          onPeriodChange={setGuitarPeriod}
        />
        <div className='min-w-0'>
          <TempoProgress
            history={history}
            today={today}
            repertoireItems={repertoireItems}
          />
        </div>
      </div>

      <div className='mt-5'>
        <TopPracticeContent
          rankings={contentRankings}
          period={rankingPeriod}
          onPeriodChange={setRankingPeriod}
        />
      </div>

      {showWellbeing && (
        <div className='mt-5'>
          <PracticeWellbeing
            history={history}
            today={today}
            weekStartsOn={weekStartsOn}
            moodEnabled={isMoodEnabled}
            focusEnabled={isFocusEnabled}
          />
        </div>
      )}

      <section className='mt-8'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='max-w-2xl'>
            <h2 className='font-sans text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl'>
              {dashboard.summaryPeriod}
            </h2>
            <p className='mt-1 text-sm text-muted'>
              {dashboard.summaryPeriodDescription}
            </p>
          </div>
          <PeriodSelector
            period={summaryPeriod}
            onChange={setSummaryPeriod}
            ariaLabel={dashboard.summaryPeriodAria}
          />
        </div>
        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3'>
          {periodCards.map((metric, index) => (
            <MetricCard
              key={metric.label}
              {...metric}
              index={index}
            />
          ))}
        </div>
      </section>

      <section className='mt-8'>
        <div className='max-w-2xl'>
          <h2 className='font-sans text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl'>
            {dashboard.summaryHistory}
          </h2>
          <p className='mt-1 text-sm text-muted'>
            {dashboard.summaryHistoryDescription}
          </p>
        </div>
        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4'>
          {historyCards.map((metric, index) => (
            <MetricCard
              key={metric.label}
              {...metric}
              index={index}
            />
          ))}
        </div>
      </section>

      <p className='mt-8 text-center text-xs text-muted'>
         {dashboard.calendarNote} {todayYear}.
      </p>
      {persistenceError && (
        <p
          className='mt-4 text-center text-sm text-red-300'
          role='alert'
        >
           {dashboard.persistenceError ?? dashboard.recordedTime}: {persistenceError}
        </p>
      )}
    </PageShell>
  );
}

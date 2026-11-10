'use client';

import { useMemo, useState } from 'react';
import { GuitarBalance } from '@/components/dashboard/GuitarBalance';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ManualPracticeEntry } from '@/components/dashboard/ManualPracticeEntry';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageShell } from '@/components/ui/PageShell';
import { PracticeTimeChart } from '@/components/dashboard/PracticeTimeChart';
import { PracticeWellbeing } from '@/components/dashboard/PracticeWellbeing';
import { SkillBalance } from '@/components/dashboard/SkillBalance';
import { StreakFlame } from '@/components/dashboard/StreakFlame';
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
import { getPracticeYears } from '@/utils/practice-year';
import { usePracticeFeedbackPreference } from '@/hooks/usePracticeFeedbackPreference';
import { useDisplayPreferences } from '@/hooks/useDisplayPreferences';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { useAppData } from '@/components/providers/AppDataProvider';
import { useI18nSection } from '@/i18n/I18nProvider';
import { DashboardSkeleton } from '@/components/ui/Skeletons';

type DashboardViewProps = {
  todayKey: string;
};

export function DashboardView({ todayKey }: DashboardViewProps) {
  const dashboard = useI18nSection('dashboard');
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
  const [skillPeriod, setSkillPeriod] = useState<PracticeChartPeriod>('month');
  const [guitarPeriod, setGuitarPeriod] =
    useState<PracticeChartPeriod>('month');
  const [rankingPeriod, setRankingPeriod] =
    useState<PracticeChartPeriod>('month');
  const { weekStartsOn } = useDisplayPreferences();
  const rhythmRange = useMemo(
    () => getComparisonSpans(rhythmPeriod, today).current,
    [rhythmPeriod, today],
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
  const periodSessions = useMemo(
    () =>
      history.filter((session) => {
        const dateKey = getLocalDateKey(new Date(session.startedAt));
        return (
          dateKey >= rhythmRange.startDate && dateKey <= rhythmRange.endDate
        );
      }),
    [history, rhythmRange],
  );
  const skillDistribution = useMemo(
    () => getSkillDistribution(history, skillRange),
    [history, skillRange],
  );
  const totalMinutes = Math.round(
    periodSessions.reduce(
      (total, session) => total + session.durationSeconds,
      0,
    ) / 60,
  );
  const sessionsWithBpm = periodSessions.filter(
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
  const practiceStatistics = useMemo(
    () => getPracticeStatistics(history, rhythmRange),
    [history, rhythmRange],
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
  const mostPracticedSkill = practiceStatistics.mostPracticedSkill;
  const totalHours = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 1,
  }).format(practiceStatistics.totalSeconds / 3600);
  const streak = getStreakCount(history, today);
  const longestStreak = getLongestStreak(history);
  const metricCards = [
    {
      label: dashboard.streak,
      value: `${streak} ${dashboard.days}`,
      description: dashboard.daysPracticed,
      highlight: isStreakOnFire(streak) ? <StreakFlame /> : undefined,
    },
    {
      label: dashboard.longestStreak,
      value: `${longestStreak} ${dashboard.days}`,
      description: dashboard.longestStreakDescription,
      highlight: (
        <p className='mt-2 text-xs uppercase tracking-[0.08em] text-muted'>
          {dashboard.longestStreakRecord}
        </p>
      ),
    },
    {
      label: dashboard.monthTime,
      value: formatPracticeDuration(Math.round(totalMinutes)),
      description: dashboard.recordedTime,
    },
    {
      label: dashboard.averageBpm,
      value: averageBpm ? `${averageBpm} bpm` : '—',
      description:
        averageBpm ?
          dashboard.averageTempo
        : dashboard.noBpm,
    },
    {
      label: dashboard.recordedSessions,
      value: String(practiceStatistics.sessionCount),
      description: dashboard.completedPractices,
    },
    {
      label: dashboard.mostPracticed,
      value:
        mostPracticedSkill ? PRACTICE_SKILL_LABELS[mostPracticedSkill] : '—',
      description:
        mostPracticedSkill ?
          `${formatPracticeDuration(practiceStatistics.mostPracticedSeconds / 60)} ${dashboard.accumulated}`
        : dashboard.noPractice,
    },
    {
      label: dashboard.practiceHours,
      value: `${totalHours} h`,
      description: dashboard.historyTime,
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

      <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4'>
        {metricCards.map((metric, index) => (
          <MetricCard
            key={metric.label}
            {...metric}
            index={index}
          />
        ))}
      </div>

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

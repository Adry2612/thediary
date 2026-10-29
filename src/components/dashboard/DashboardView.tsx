'use client';

import { useMemo } from 'react';
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
import { YearPracticeCalendar } from '@/components/dashboard/YearPracticeCalendar';
import {
  formatPracticeDuration,
  makeDateKey,
  PRACTICE_SKILL_LABELS,
} from '@/utils/dashboard-data';
import {
  getGuitarBalance,
  getMonthlyHeatmapData,
  getPracticeContentRankings,
  getPracticeStatistics,
  getSkillDistribution,
  getStreakCount,
  isStreakOnFire,
} from '@/utils/practice-analytics';
import { hasPracticeWellbeingData } from '@/utils/practice-metrics';
import {
  getPracticeWeekDays,
  getSessionsForWeek,
  getYearlyHeatmapData,
  parseDateKey,
} from '@/utils/practice-calendar';
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

  const currentMonthDays = useMemo(
    () =>
      getMonthlyHeatmapData(today.getFullYear(), today.getMonth() + 1, history),
    [history, today],
  );
  const yearlyDays = useMemo(
    () => getYearlyHeatmapData(todayYear, history),
    [history, todayYear],
  );
  const weeklySessions = useMemo(
    () => getSessionsForWeek(history, today),
    [history, today],
  );
  const practiceWeekDays = useMemo(
    () => getPracticeWeekDays(history, today),
    [history, today],
  );
  const currentMonthRange = useMemo(
    () => ({
      startDate: makeDateKey(today.getFullYear(), today.getMonth(), 1),
      endDate: todayKey,
    }),
    [today, todayKey],
  );
  const skillDistribution = useMemo(
    () => getSkillDistribution(history, currentMonthRange),
    [currentMonthRange, history],
  );
  const currentMonthSessions = useMemo(
    () =>
      history.filter((session) => {
        const sessionDate = new Date(session.startedAt);
        return (
          sessionDate.getFullYear() === today.getFullYear() &&
          sessionDate.getMonth() === today.getMonth()
        );
      }),
    [history, today],
  );
  const totalMinutes = currentMonthDays.reduce(
    (total, day) => total + day.totalMinutes,
    0,
  );
  const sessionsWithBpm = currentMonthSessions.filter(
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
    () => getGuitarBalance(history, currentMonthRange),
    [currentMonthRange, history],
  );
  const contentRankings = useMemo(
    () => getPracticeContentRankings(history, repertoireItems),
    [history, repertoireItems],
  );
  const practiceStatistics = useMemo(
    () => getPracticeStatistics(history),
    [history],
  );
  const hasWellbeing = useMemo(
    () => hasPracticeWellbeingData(history),
    [history],
  );
  const mostPracticedSkill = practiceStatistics.mostPracticedSkill;
  const totalHours = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 1,
  }).format(practiceStatistics.totalSeconds / 3600);
  const streak = getStreakCount(history, today);
  const metricCards = [
    {
      label: dashboard.streak,
      value: `${streak} ${dashboard.days}`,
      description: dashboard.daysPracticed,
      highlight: isStreakOnFire(streak) ? <StreakFlame /> : undefined,
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
          dailyGoalMinutes={practiceGoals.dailyMinutes}
          weeklyGoalDays={practiceGoals.weeklyDays}
        />
      </div>

      <div className='mt-5'>
        <YearPracticeCalendar
          days={yearlyDays}
          history={history}
          todayKey={todayKey}
          year={todayYear}
          dailyGoalMinutes={practiceGoals.dailyMinutes}
        />
      </div>

      <div className='mt-5 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2'>
        <PracticeTimeChart
          history={history}
          today={today}
        />
        <SkillBalance distribution={skillDistribution} />
      </div>

      <div className='mt-5 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2'>
        <GuitarBalance balance={guitarBalance} />
        <div className='min-w-0'>
          <TempoProgress
            history={history}
            today={today}
            repertoireItems={repertoireItems}
          />
        </div>
      </div>

      <div className='mt-5'>
        <TopPracticeContent rankings={contentRankings} />
      </div>

      {hasWellbeing && (
        <div className='mt-5'>
          <PracticeWellbeing history={history} today={today} />
        </div>
      )}

      <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3'>
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

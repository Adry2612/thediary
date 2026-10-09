'use client';

import { useMemo } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ManualPracticeEntry } from '@/components/dashboard/ManualPracticeEntry';
import { PracticeTimeChart } from '@/components/dashboard/PracticeTimeChart';
import { SkillBalance } from '@/components/dashboard/SkillBalance';
import { SuggestedPractice } from '@/components/dashboard/SuggestedPractice';
import { WeeklyPracticeSummary } from '@/components/dashboard/WeeklyPracticeSummary';
import { YearPracticeCalendar } from '@/components/dashboard/YearPracticeCalendar';
import {
  formatPracticeDuration,
  makeDateKey,
  PRACTICE_SKILL_LABELS,
} from '@/lib/dashboard-data';
import {
  getMonthlyHeatmapData,
  getPracticeStatistics,
  getSkillDistribution,
  getStreakCount,
} from '@/lib/practice-analytics';
import {
  getPracticeWeekDays,
  getSessionsForWeek,
  getYearlyHeatmapData,
} from '@/lib/practice-calendar';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { useAppData } from '@/components/providers/AppDataProvider';

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

type DashboardViewProps = {
  todayKey: string;
};

export function DashboardView({ todayKey }: DashboardViewProps) {
  const { user } = useAppData();
  const history = usePracticeStore((state) => state.history);
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
  const skillTotals = {
    technique: skillDistribution.categories.technique.minutes,
    theory: skillDistribution.categories.theory.minutes,
    repertoire: skillDistribution.categories.repertoire.minutes,
    improvisation: skillDistribution.categories.improvisation.minutes,
  };
  const practiceStatistics = useMemo(
    () => getPracticeStatistics(history),
    [history],
  );
  const mostPracticedSkill = practiceStatistics.mostPracticedSkill;
  const totalHours = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 1,
  }).format(practiceStatistics.totalSeconds / 3600);
  const metricCards = [
    {
      label: 'Racha actual',
      value: `${getStreakCount(history, today)} días`,
      description: 'días seguidos con práctica',
    },
    {
      label: 'Tiempo este mes',
      value: formatPracticeDuration(Math.round(totalMinutes)),
      description: 'tiempo total registrado',
    },
    {
      label: 'BPM promedio',
      value: averageBpm ? `${averageBpm} bpm` : '—',
      description:
        averageBpm ?
          'tempo medio de tus sesiones con BPM'
        : 'sin BPM registrado este mes',
    },
    {
      label: 'Sesiones registradas',
      value: String(practiceStatistics.sessionCount),
      description: 'prácticas completadas',
    },
    {
      label: 'Apartado más practicado',
      value:
        mostPracticedSkill ? PRACTICE_SKILL_LABELS[mostPracticedSkill] : '—',
      description:
        mostPracticedSkill ?
          `${formatPracticeDuration(practiceStatistics.mostPracticedSeconds / 60)} acumulados`
        : 'aún no hay práctica registrada',
    },
    {
      label: 'Horas de práctica',
      value: `${totalHours} h`,
      description: 'tiempo total del historial',
    },
  ];

  return (
    <main className='mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8 sm:py-16'>
      <header className='enter mb-10 flex flex-wrap items-end justify-between gap-6'>
        <div>
          <p className='font-mono text-xs uppercase tracking-[0.14em] text-zinc-500'>
            Diario de guitarra · resumen
          </p>
          <h1 className='mt-3 font-sans text-3xl leading-tight font-semibold tracking-tight text-zinc-100 sm:text-4xl'>
            Tu práctica, en contexto.
          </h1>
          <p className='mt-4 max-w-xl text-base font-medium text-zinc-400 sm:text-lg'>
            Una vista clara de la constancia, el tiempo y las habilidades que
            estás trabajando.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <ManualPracticeEntry />
        </div>
      </header>

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
        <SkillBalance totals={skillTotals} />
      </div>

      <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3'>
        {metricCards.map((metric, index) => (
          <MetricCard
            key={metric.label}
            {...metric}
            index={index}
          />
        ))}
      </div>

      <div className='mt-5'>
        <SuggestedPractice />
      </div>
      <p className='mt-8 text-center text-xs text-zinc-600'>
        El calendario muestra todo {todayYear}.
      </p>
      {persistenceError && (
        <p
          className='mt-4 text-center text-sm text-red-300'
          role='alert'
        >
          No se pudo cargar el historial guardado: {persistenceError}
        </p>
      )}
    </main>
  );
}

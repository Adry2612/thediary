'use client';

import { useMemo } from 'react';
import { RecentRepertoire } from '@/components/home/RecentRepertoire';
import { SavedRoutines } from '@/components/dashboard/SavedRoutines';
import { TodaysRoutinePlan } from '@/components/dashboard/TodaysRoutinePlan';
import { WeeklyRoutinePlanner } from '@/components/dashboard/WeeklyRoutinePlanner';
import { PracticeGoalsCard } from '@/components/dashboard/PracticeGoalsCard';
import { usePracticeStore } from '@/stores/usePracticeStore';
import type { WeekdayIndex } from '@/lib/weekly-routine-schedule';
import { useI18nSection } from '@/i18n/I18nProvider';
import { useAppData } from '@/components/providers/AppDataProvider';
import { HomeSkeleton } from '@/components/ui/Skeletons';

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function HomeView({ todayKey }: { todayKey: string }) {
  const home = useI18nSection('home');
  const weekdays = useI18nSection('weekdays');
  const { isReady } = useAppData();
  const templates = usePracticeStore((state) => state.templates);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const weeklySchedule = usePracticeStore((state) => state.weeklySchedule);
  const setRoutineForWeekday = usePracticeStore(
    (state) => state.setRoutineForWeekday,
  );
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const today = useMemo(() => parseDateKey(todayKey), [todayKey]);
  const todayWeekday = today.getDay() as WeekdayIndex;
  const todaysRoutine = templates.find(
    (template) => template.id === weeklySchedule[todayWeekday],
  );

  if (!isReady || !hasHydrated) {
    return <HomeSkeleton />;
  }

  return (
    <main className='mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8 sm:py-16'>
      <header className='enter mb-8'>
        <h1 className='mt-3 font-sans text-3xl leading-tight font-semibold tracking-tight text-zinc-100 sm:text-4xl'>
          {home.title}
        </h1>
        <p className='mt-4 max-w-2xl text-base font-medium text-zinc-400 sm:text-lg'>
          {home.description}
        </p>
      </header>

      <TodaysRoutinePlan
        routine={todaysRoutine}
        weekdayLabel={weekdays.long[todayWeekday]}
        repertoireItems={repertoireItems}
        hasHydrated={hasHydrated}
      />

      <div className='mt-5'>
        <PracticeGoalsCard />
      </div>

      <div className='mt-5'>
        <WeeklyRoutinePlanner
          routines={templates}
          schedule={weeklySchedule}
          hasHydrated={hasHydrated}
          onScheduleChange={setRoutineForWeekday}
        />
      </div>

      <div className='mt-5 grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]'>
        <SavedRoutines
          routines={templates}
          hasHydrated={hasHydrated}
        />
        <RecentRepertoire
          items={repertoireItems}
          hasHydrated={hasHydrated}
        />
      </div>
    </main>
  );
}

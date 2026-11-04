'use client';

import { useMemo } from 'react';
import { RecentRepertoire } from '@/components/home/RecentRepertoire';
import { SavedRoutines } from '@/components/dashboard/SavedRoutines';
import { TodaysRoutinePlan } from '@/components/dashboard/TodaysRoutinePlan';
import { WeeklyRoutinePlanner } from '@/components/dashboard/WeeklyRoutinePlanner';
import { PracticeGoalsCard } from '@/components/dashboard/PracticeGoalsCard';
import { StringsReminder } from '@/components/home/StringsReminder';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { parseDateKey } from '@/utils/practice-calendar';
import type { WeekdayIndex } from '@/utils/weekly-routine-schedule';
import { useI18nSection } from '@/i18n/I18nProvider';
import { useAppData } from '@/components/providers/AppDataProvider';
import { HomeSkeleton } from '@/components/ui/Skeletons';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageShell } from '@/components/ui/PageShell';

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
    <PageShell>
      <PageHeader title={home.title} description={home.description} />

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
        <StringsReminder today={today} />
      </div>

      <div className='mt-5'>
        <WeeklyRoutinePlanner
          routines={templates}
          schedule={weeklySchedule}
          hasHydrated={hasHydrated}
          onScheduleChange={setRoutineForWeekday}
        />
      </div>

      <div className='mt-5'>
        <SavedRoutines
          routines={templates}
          hasHydrated={hasHydrated}
        />
      </div>

      <div className='mt-5'>
        <RecentRepertoire
          items={repertoireItems}
          hasHydrated={hasHydrated}
        />
      </div>
    </PageShell>
  );
}

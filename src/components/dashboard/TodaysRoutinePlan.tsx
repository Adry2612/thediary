import Link from 'next/link';
import { PracticePlanTable } from '@/components/practice/PracticePlanTable';
import type { PracticeTemplate, RepertoireItem } from '@/types/practice';
import { useI18nSection } from '@/i18n/I18nProvider';

export function TodaysRoutinePlan({
  routine,
  weekdayLabel,
  repertoireItems,
  hasHydrated,
}: {
  routine: PracticeTemplate | undefined;
  weekdayLabel: string;
  repertoireItems: RepertoireItem[];
  hasHydrated: boolean;
}) {
  const home = useI18nSection('home');
  if (!hasHydrated) {
    return (
      <section className='enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8'>
        <p className='text-xs uppercase tracking-[0.12em] text-zinc-500'>
           {weekdayLabel} · {home.todayPlan}
        </p>
        <p className='mt-4 text-sm text-zinc-500'>
           {home.loadingRoutine}
        </p>
      </section>
    );
  }

  if (!routine) {
    return (
      <section className='enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8'>
        <p className='text-xs uppercase tracking-[0.12em] text-zinc-500'>
           {weekdayLabel} · {home.todayPlan}
        </p>
        <div className='mt-3 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8'>
               {home.noRoutine}
            </h2>
            <p className='mt-2 text-sm text-zinc-500'>
               {home.noRoutineDescription}
            </p>
          </div>
          <Link
            href='/practice'
            className='inline-flex h-11 items-center justify-center border border-zinc-700 px-4 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800/50'
          >
             {home.preparePractice}
          </Link>
        </div>
      </section>
    );
  }

  const sessionUrl = `/practice?template=${encodeURIComponent(routine.id)}&start=1`;

  return (
    <section className='enter rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6'>
      <div className='mb-4 flex flex-wrap items-end justify-between gap-3 mb-8'>
        <div>
          <p className='text-xs uppercase tracking-[0.12em] text-zinc-500'>
             {weekdayLabel} · {home.todayPlan}
          </p>
          <h2 className='mt-2 break-words font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8'>
            {routine.name}
          </h2>
        </div>
        <Link
          href={sessionUrl}
          className='inline-flex h-11 items-center justify-center bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition hover:bg-white active:scale-[0.98]'
        >
           {home.startRoutine}
        </Link>
      </div>
      <PracticePlanTable
        phases={routine.phases}
        repertoireItems={repertoireItems}
      />
    </section>
  );
}

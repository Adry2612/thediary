import Link from "next/link";
import { formatPracticeDuration } from "@/lib/dashboard-data";
import { getPracticePlanDuration } from "@/lib/practice-plan";
import type { PracticeTemplate } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

type SavedRoutinesProps = {
  routines: PracticeTemplate[];
  hasHydrated: boolean;
};

export function SavedRoutines({ routines, hasHydrated }: SavedRoutinesProps) {
  const home = useI18nSection("home");
  return (
    <section className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
             {home.quickStart}
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
             {home.routines}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
             {home.routinesDescription}
          </p>
        </div>
        <Link
          href="/practice"
          className="text-sm text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition hover:text-zinc-100"
        >
           {home.createRoutines}
        </Link>
      </div>

      {!hasHydrated ? (
         <p className="mt-5 text-sm text-zinc-500">{home.loadingRoutines}</p>
      ) : routines.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-400">
           {home.saveRoutine}
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {routines.map((routine) => {
            const durationMinutes = getPracticePlanDuration(routine.phases);
            const sessionUrl = `/practice?template=${encodeURIComponent(routine.id)}&start=1`;

            return (
              <li key={routine.id}>
                <Link
                  href={sessionUrl}
                   aria-label={`${home.startPractice} ${routine.name}`}
                  className="group flex h-full min-h-28 items-center justify-between gap-4 rounded-lg border border-zinc-800 p-4 transition hover:border-zinc-600 hover:bg-zinc-800/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-zinc-100">
                      {routine.name}
                    </span>
                    <span className="mt-2 block font-mono text-xs text-zinc-500">
                      {routine.phases.length} bloques ·{" "}
                      {formatPracticeDuration(durationMinutes)}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-2 text-xs text-zinc-300">
                       {home.startPractice}
                      <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

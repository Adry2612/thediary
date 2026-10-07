import Link from "next/link";
import { formatPracticeDuration } from "@/lib/dashboard-data";
import type { PracticeTemplate } from "@/types/practice";

type SavedRoutinesProps = {
  routines: PracticeTemplate[];
  hasHydrated: boolean;
};

export function SavedRoutines({ routines, hasHydrated }: SavedRoutinesProps) {
  return (
    <section className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
            Inicio rápido
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-zinc-100">
            Tus rutinas
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Pulsa una rutina para iniciar una nueva práctica con ella.
          </p>
        </div>
        <Link
          href="/practice"
          className="text-sm text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition hover:text-zinc-100"
        >
          Crear o editar rutinas
        </Link>
      </div>

      {!hasHydrated ? (
        <p className="mt-5 text-sm text-zinc-500">Cargando rutinas guardadas…</p>
      ) : routines.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-400">
          Guarda una rutina desde la pantalla de práctica y aparecerá aquí.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {routines.map((routine) => {
            const durationMinutes = routine.phases.reduce(
              (total, phase) => total + phase.durationMinutes,
              0,
            );
            const sessionUrl = `/practice?template=${encodeURIComponent(routine.id)}&start=1`;

            return (
              <li key={routine.id}>
                <Link
                  href={sessionUrl}
                  aria-label={`Iniciar la rutina ${routine.name}`}
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
                      Iniciar práctica
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

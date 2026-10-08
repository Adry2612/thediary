"use client";

import Link from "next/link";
import { SelectField } from "@/components/ui/SelectField";
import {
  WEEKDAY_INDEXES,
  WEEKDAY_LABELS,
} from "@/lib/weekly-routine-schedule";
import type {
  WeekdayIndex,
  WeeklyRoutineSchedule,
} from "@/lib/weekly-routine-schedule";
import type { PracticeTemplate } from "@/types/practice";

export function WeeklyRoutinePlanner({
  routines,
  schedule,
  hasHydrated,
  onScheduleChange,
}: {
  routines: PracticeTemplate[];
  schedule: WeeklyRoutineSchedule;
  hasHydrated: boolean;
  onScheduleChange: (
    weekday: WeekdayIndex,
    templateId: string | null,
  ) => void;
}) {
  const routineOptions = routines.map((routine) => ({
    value: routine.id,
    label: routine.name,
  }));

  return (
    <section className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
          Organización semanal
        </p>
        <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
          Rutina por día
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Asigna una rutina a cada día. Puedes repetirla o dejar días sin plan.
        </p>
      </div>

      {!hasHydrated ? (
        <p className="mt-5 text-sm text-zinc-500">
          Cargando planificación semanal…
        </p>
      ) : routines.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-400">
          Guarda una rutina desde{" "}
          <Link
            href="/practice"
            className="text-zinc-200 underline decoration-zinc-700 underline-offset-4 hover:text-white"
          >
            la pantalla de práctica
          </Link>{" "}
          para planificarla aquí.
        </p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {WEEKDAY_INDEXES.map((weekday) => {
            const assignedRoutineId = schedule[weekday];
            const hasUnavailableRoutine =
              assignedRoutineId !== null &&
              !routineOptions.some(
                (routine) => routine.value === assignedRoutineId,
              );

            return (
              <div
                key={weekday}
                className="min-w-0 bg-transparent p-3"
              >
                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-zinc-300">
                  {WEEKDAY_LABELS[weekday]}
                </p>
                <SelectField
                  value={assignedRoutineId ?? ""}
                  ariaLabel={`Rutina para ${WEEKDAY_LABELS[weekday]}`}
                  onChange={(templateId) =>
                    onScheduleChange(
                      weekday,
                      templateId.length > 0 ? templateId : null,
                    )
                  }
                  options={[
                    { value: "", label: "Sin rutina asignada" },
                    ...(hasUnavailableRoutine
                      ? [
                          {
                            value: assignedRoutineId,
                            label: "Rutina no disponible",
                            disabled: true,
                          },
                        ]
                      : []),
                    ...routineOptions,
                  ]}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

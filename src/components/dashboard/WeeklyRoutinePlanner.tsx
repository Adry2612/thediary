"use client";

import Link from "next/link";
import { SelectField } from "@/components/ui/SelectField";
import {
  WEEKDAY_INDEXES,
} from "@/lib/weekly-routine-schedule";
import type {
  WeekdayIndex,
  WeeklyRoutineSchedule,
} from "@/lib/weekly-routine-schedule";
import type { PracticeTemplate } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

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
  const home = useI18nSection("home");
  const weekdays = useI18nSection("weekdays");
  const routineOptions = routines.map((routine) => ({
    value: routine.id,
    label: routine.name,
  }));

  return (
    <section className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
           {home.weeklyOrganization}
        </p>
        <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
           {home.routineByDay}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
           {home.routineByDayDescription}
        </p>
      </div>

      {!hasHydrated ? (
        <p className="mt-5 text-sm text-zinc-500">
           {home.loadingWeekly}
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
                   {weekdays.long[weekday]}
                </p>
                <SelectField
                  value={assignedRoutineId ?? ""}
                   ariaLabel={`${home.routineByDay}: ${weekdays.long[weekday]}`}
                  onChange={(templateId) =>
                    onScheduleChange(
                      weekday,
                      templateId.length > 0 ? templateId : null,
                    )
                  }
                  options={[
                     { value: "", label: home.noRoutineAssigned },
                    ...(hasUnavailableRoutine
                      ? [
                          {
                            value: assignedRoutineId,
                             label: home.unavailableRoutine,
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

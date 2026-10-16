"use client";

import { Button } from "@/components/ui/Button";
import { EditIcon } from "@/components/ui/icons";
import { getPracticePlanDuration } from "@/lib/practice-plan";
import type { PracticeTemplate } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

interface SavedPracticeRoutinesProps {
  routines: PracticeTemplate[];
  onStart: (routineId: string) => void;
  onEdit: (routineId: string) => void;
}

export function SavedPracticeRoutines({
  routines,
  onStart,
  onEdit,
}: SavedPracticeRoutinesProps) {
  const text = useI18nSection("practice");

  return (
    <section aria-labelledby="saved-routines-title" className="enter">
      <h2
        id="saved-routines-title"
        className="font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8"
      >
        {text.savedRoutinesTitle}
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        {text.savedRoutinesDescription}
      </p>

      {routines.length === 0 ? (
        <p className="mt-5 rounded-xl border border-line bg-surface p-5 text-sm text-muted">
          {text.noRoutinesDescription}
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {routines.map((routine) => (
            <li
              key={routine.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-surface p-5"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{routine.name}</p>
                <p className="mt-2 font-mono text-xs text-muted">
                  {routine.phases.length} {text.blocksCount} ·{" "}
                  {getPracticePlanDuration(routine.phases)} {text.total}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => onStart(routine.id)}
                  aria-label={`${text.startRoutine} ${routine.name}`}
                >
                  {text.startRoutine}
                </Button>
                <Button
                  type="button"
                  onClick={() => onEdit(routine.id)}
                  aria-label={`${text.editRoutine} ${routine.name}`}
                >
                  <EditIcon className="size-4" />
                  {text.editRoutine}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

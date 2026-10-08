"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { formatClock } from "@/lib/format";
import type { PracticeTimerResult } from "@/types/practice";

interface PracticeCompletionDialogProps {
  result: PracticeTimerResult | null;
  isVisible: boolean;
  onSave: (
    sessionNotes: string,
    phaseNotes: Record<number, string>,
  ) => void;
}

export function PracticeCompletionDialog({
  result,
  isVisible,
  onSave,
}: PracticeCompletionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [phaseNotes, setPhaseNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (result && isVisible && !dialog.open) dialog.showModal();
    if ((!result || !isVisible) && dialog.open) dialog.close();
  }, [isVisible, result]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => event.preventDefault()}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
    >
      <div className="p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.05em] text-muted">
          {result?.completed ? "Sesión completada" : "Práctica finalizada"}
        </p>
        <h2 className="mt-3 font-sans text-3xl font-semibold">
          {result?.completed
            ? "Has terminado tu rutina"
            : "Tu práctica está lista"}
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted">
          {result?.completed
            ? `Has registrado ${formatClock(result.elapsedSeconds)} de práctica. ¡Buen trabajo!`
            : `Has registrado ${formatClock(result?.elapsedSeconds ?? 0)} de práctica.`}
        </p>
        <label className="mt-5 block text-sm text-ink">
          Notas de la sesión
          <TextArea
            className="mt-2"
            value={sessionNotes}
            onChange={(event) => setSessionNotes(event.target.value)}
            placeholder="Sensaciones, objetivos o ideas para la próxima práctica…"
            rows={3}
          />
        </label>
        {result && result.phases.length > 0 && (
          <section
            aria-labelledby="completion-phase-notes"
            className="mt-6 border-t border-line pt-5"
          >
            <h3
              id="completion-phase-notes"
              className="text-sm font-medium text-ink"
            >
              Notas por bloque
            </h3>
            <div className="mt-4 space-y-4">
              {result.phases.map((phase, index) => (
                <label
                  key={`${phase.id}-${index}`}
                  className="block text-sm text-ink"
                >
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span>{phase.name}</span>
                    <span className="font-mono text-xs tabular-nums text-muted">
                      {formatClock(phase.elapsedSeconds)}
                    </span>
                  </span>
                  <TextArea
                    className="mt-2"
                    value={phaseNotes[index] ?? ""}
                    onChange={(event) =>
                      setPhaseNotes((current) => ({
                        ...current,
                        [index]: event.target.value,
                      }))
                    }
                    placeholder={`Notas para ${phase.name.toLowerCase()}…`}
                    rows={2}
                  />
                </label>
              ))}
            </div>
          </section>
        )}
        <Button
          variant="primary"
          className="mt-6 w-full"
          onClick={() => onSave(sessionNotes, phaseNotes)}
        >
          Guardar práctica
        </Button>
      </div>
    </dialog>
  );
}

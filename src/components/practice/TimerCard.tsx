"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { PracticeTimerController } from "@/hooks/usePracticeTimer";
import { formatClock } from "@/lib/format";

type TimerCardProps = {
  timer: PracticeTimerController;
  isCompleted: boolean;
};

export function TimerCard({ timer, isCompleted }: TimerCardProps) {
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const finishDialogRef = useRef<HTMLDialogElement>(null);
  const {
    currentPhase,
    awaitingPhaseAdvance,
    elapsedSeconds,
    finish,
    isRunning,
    remainingSeconds,
    pause,
    reset,
    resume,
    skip,
  } = timer;

  useEffect(() => {
    const dialog = finishDialogRef.current;
    if (!dialog) return;

    if (isCompleted || !isFinishDialogOpen) {
      if (dialog.open) dialog.close();
      return;
    }

    if (!dialog.open) dialog.showModal();
  }, [isCompleted, isFinishDialogOpen]);

  return (
    <>
      <Card className="enter flex flex-col items-center text-center">
        <span className="rounded-full bg-accent-green-bg px-3 py-1 font-sans text-xs uppercase tracking-[0.05em] text-accent-green-fg">
          {currentPhase ? "Bloque actual" : "Sesión completada"}
        </span>

        <h2 className="mt-6 font-sans text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
          {currentPhase?.name ?? "Fin de la práctica"}
        </h2>
        {currentPhase?.exercises && currentPhase.exercises.length > 0 && (
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {currentPhase.exercises.map((exercise, index) => (
              <li
                key={`${exercise}-${index}`}
                className="border border-line px-3 py-1 font-mono text-xs text-muted"
              >
                {exercise}
              </li>
            ))}
          </ul>
        )}

        <p
          role="timer"
          aria-live="off"
          className="my-14 font-mono text-5xl leading-[1.5] tabular-nums tracking-normal sm:text-7xl"
        >
          {formatClock(remainingSeconds)}
        </p>
        <p className="-mt-10 mb-10 font-mono text-xs uppercase tracking-[0.05em] text-muted">
          Tiempo total {formatClock(elapsedSeconds)}
        </p>

        {awaitingPhaseAdvance && (
          <p
            className="mb-5 border border-accent-green-fg/30 bg-accent-green-bg px-4 py-3 text-sm text-accent-green-fg"
            role="status"
            aria-live="polite"
          >
            Tiempo cumplido. Pulsa «Saltar bloque» para continuar.
          </p>
        )}

        <div className="flex w-full flex-wrap justify-center gap-3">
          <Button
            variant="primary"
            onClick={isRunning ? pause : resume}
            disabled={!currentPhase || isCompleted || awaitingPhaseAdvance}
            className="flex-1"
          >
            {isRunning
              ? "Pausar"
              : awaitingPhaseAdvance
                ? "Bloque terminado"
                : elapsedSeconds > 0
                  ? "Continuar"
                  : "Iniciar"}
          </Button>
          <Button
            variant={awaitingPhaseAdvance ? "primary" : "ghost"}
            onClick={skip}
            disabled={!currentPhase || isCompleted}
          >
            Saltar bloque
          </Button>
          <Button onClick={reset} disabled={isCompleted}>
            Reiniciar
          </Button>
        </div>

        {currentPhase && !isCompleted && (
          <Button
            className="mt-4 w-full border-red-400/40 text-red-300 hover:border-red-400/70 hover:bg-red-500/10 focus-visible:outline-red-400"
            onClick={() => setIsFinishDialogOpen(true)}
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <rect x="3" y="3" width="10" height="10" />
            </svg>
            Terminar práctica
          </Button>
        )}
      </Card>

      <dialog
        ref={finishDialogRef}
        onClose={() => setIsFinishDialogOpen(false)}
        onCancel={() => setIsFinishDialogOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-md border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
      >
        <div className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.05em] text-muted">
            Finalizar sesión
          </p>
          <h2 className="mt-3 font-sans text-3xl font-semibold">¿Terminar práctica?</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            Guardaremos el tiempo registrado hasta ahora. Si terminas, no podrás
            reanudar esta sesión.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={() => setIsFinishDialogOpen(false)}>
              Seguir practicando
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsFinishDialogOpen(false);
                finish();
              }}
            >
              Terminar y guardar
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}

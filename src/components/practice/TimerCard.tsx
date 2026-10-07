"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePracticeTimer } from "@/hooks/usePracticeTimer";
import { formatClock } from "@/lib/format";
import type {
  PracticePhase,
  PracticeTimerResult,
} from "@/types/practice";

type TimerCardProps = {
  phases: PracticePhase[];
  onComplete: (result: PracticeTimerResult) => void;
};

export function TimerCard({ phases, onComplete }: TimerCardProps) {
  const {
    currentPhase,
    elapsedSeconds,
    isRunning,
    remainingSeconds,
    pause,
    reset,
    resume,
    skip,
  } = usePracticeTimer(phases, undefined, onComplete);

  return (
    <Card className="enter flex flex-col items-center text-center">
      <span className="rounded-full bg-accent-green-bg px-3 py-1 font-sans text-xs uppercase tracking-[0.05em] text-accent-green-fg">
        {currentPhase ? "Bloque actual" : "Sesión completada"}
      </span>

      <h2 className="mt-6 font-serif text-4xl leading-[1.1] tracking-[-0.02em]">
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
        className="my-14 font-mono text-8xl font-light tabular-nums tracking-tight sm:text-9xl"
      >
        {formatClock(remainingSeconds)}
      </p>
      <p className="-mt-10 mb-10 font-mono text-xs uppercase tracking-[0.05em] text-muted">
        Tiempo total {formatClock(elapsedSeconds)}
      </p>

      <div className="flex w-full flex-wrap justify-center gap-3">
        <Button
          variant="primary"
          onClick={isRunning ? pause : resume}
          disabled={!currentPhase}
          className="flex-1"
        >
          {isRunning ? "Pausar" : elapsedSeconds > 0 ? "Continuar" : "Iniciar"}
        </Button>
        <Button onClick={skip} disabled={!currentPhase}>
          Saltar etapa
        </Button>
        <Button onClick={reset}>Reiniciar</Button>
      </div>
    </Card>
  );
}

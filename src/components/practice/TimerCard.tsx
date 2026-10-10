"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { PracticeTimerController } from "@/hooks/usePracticeTimer";
import { formatClock } from "@/lib/format";
import { useI18nSection } from "@/i18n/I18nProvider";

type TimerCardProps = {
  timer: PracticeTimerController;
  isCompleted: boolean;
  isPracticeRoute: boolean;
  onDiscard: () => void;
  compact?: boolean;
};

export function TimerCard({
  timer,
  isCompleted,
  isPracticeRoute,
  onDiscard,
  compact = false,
}: TimerCardProps) {
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const finishDialogRef = useRef<HTMLDialogElement>(null);
  const timerText = useI18nSection("timer");
  const skills = useI18nSection("skills");
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
    isCountUp,
  } = timer;

  useEffect(() => {
    const dialog = finishDialogRef.current;
    if (!dialog) return;

    if (!isPracticeRoute || isCompleted || !isFinishDialogOpen) {
      if (dialog.open) dialog.close();
      return;
    }

    if (!dialog.open) dialog.showModal();
  }, [isCompleted, isFinishDialogOpen, isPracticeRoute]);

  return (
    <>
      <Card className={`enter flex flex-col items-center text-center ${compact ? "p-5 sm:p-6" : ""}`}>
        <span className="rounded-full bg-accent-green-bg px-3 py-1 font-sans text-xs uppercase tracking-[0.05em] text-accent-green-fg">
          {currentPhase
            ? skills[currentPhase.skill]
            : timerText.completedSession}
        </span>

        <h2 className="mt-6 font-sans text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
          {currentPhase?.name ?? timerText.endPractice}
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
          className={`${compact ? "my-8 text-4xl sm:text-6xl" : "my-14 text-5xl sm:text-7xl"} font-mono leading-[1.5] tabular-nums tracking-normal`}
        >
          {formatClock(isCountUp ? elapsedSeconds : remainingSeconds)}
        </p>
        {!isCountUp && (
          <p className="-mt-10 mb-10 font-mono text-xs uppercase tracking-[0.05em] text-muted">
            {timerText.totalTime} {formatClock(elapsedSeconds)}
          </p>
        )}

        {awaitingPhaseAdvance && (
          <p
            className="mb-5 border border-accent-green-fg/30 bg-accent-green-bg px-4 py-3 text-sm text-accent-green-fg"
            role="status"
            aria-live="polite"
          >
            {timerText.completeBlockNotice}
          </p>
        )}

        <div className="mt-auto flex w-full justify-center gap-3 pt-6">
          <Button
            variant="primary"
            onClick={isRunning ? pause : resume}
            disabled={!currentPhase || isCompleted || awaitingPhaseAdvance}
            className={`${compact ? "h-12 px-4" : ""} min-w-0 flex-1 px-3 text-xs sm:px-4 sm:text-sm`}
          >
            {isRunning
              ? timerText.pause
              : awaitingPhaseAdvance
                ? timerText.blockFinished
                : elapsedSeconds > 0
                  ? timerText.continue
                  : timerText.start}
          </Button>
          {!isCountUp && (
          <Button
            variant={awaitingPhaseAdvance ? "primary" : "ghost"}
            onClick={skip}
            disabled={!currentPhase || isCompleted}
            className="min-w-0 flex-1 px-3 text-xs sm:px-4 sm:text-sm"
          >
              {timerText.skipBlock}
            </Button>
          )}
          <Button
            onClick={reset}
            disabled={isCompleted}
            className="min-w-0 flex-1 px-3 text-xs sm:px-4 sm:text-sm"
          >
            {timerText.reset}
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
            {timerText.finishSession}
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
            {timerText.finishSession}
          </p>
          <h2 className="mt-3 font-sans text-3xl font-semibold">{timerText.finishPracticeTitle}</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            {timerText.finishPracticeDescription}
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={() => setIsFinishDialogOpen(false)}>
              {timerText.keepPracticing}
            </Button>
            <Button onClick={onDiscard}>
              {timerText.exitWithoutSaving}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsFinishDialogOpen(false);
                finish();
              }}
            >
              {timerText.finishAndSave}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}

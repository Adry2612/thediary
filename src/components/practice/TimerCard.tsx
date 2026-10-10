"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectField } from "@/components/ui/SelectField";
import { PRACTICE_SOUND_OPTIONS, type PracticeSound } from "@/lib/practice-sounds";
import type { PracticeTimerController } from "@/hooks/usePracticeTimer";
import { formatClock } from "@/lib/format";
import { useI18nSection } from "@/i18n/I18nProvider";

type TimerCardProps = {
  timer: PracticeTimerController;
  isCompleted: boolean;
  isPracticeRoute: boolean;
  onDiscard: () => void;
  compact?: boolean;
  practiceStartSound: PracticeSound;
  setPracticeStartSound: (sound: PracticeSound) => void;
  practiceEndSound: PracticeSound;
  setPracticeEndSound: (sound: PracticeSound) => void;
};

export function TimerCard({
  timer,
  isCompleted,
  isPracticeRoute,
  onDiscard,
  compact = false,
  practiceStartSound,
  setPracticeStartSound,
  practiceEndSound,
  setPracticeEndSound,
}: TimerCardProps) {
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const finishDialogRef = useRef<HTMLDialogElement>(null);
  const optionsDialogRef = useRef<HTMLDialogElement>(null);
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
    autoAdvance,
    setAutoAdvance,
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

  useEffect(() => {
    const dialog = optionsDialogRef.current;
    if (!dialog) return;
    if (isOptionsDialogOpen && !dialog.open) dialog.showModal();
    if (!isOptionsDialogOpen && dialog.open) dialog.close();
  }, [isOptionsDialogOpen]);

  useEffect(() => {
    if (!isFinishDialogOpen && !isOptionsDialogOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFinishDialogOpen, isOptionsDialogOpen]);

  return (
    <>
      <Card className={`enter flex flex-col items-center text-center ${compact ? "p-5 sm:p-6" : ""}`}>
        <div className="relative flex w-full items-center justify-center">
          <span className="rounded-full bg-accent-green-bg px-3 py-1 font-sans text-xs uppercase tracking-[0.05em] text-accent-green-fg">
            {currentPhase
              ? skills[currentPhase.skill]
              : timerText.completedSession}
          </span>
          {!isCountUp && currentPhase && !isCompleted && (
            <button
              type="button"
              onClick={() => setIsOptionsDialogOpen(true)}
              aria-label={timerText.soundOptions}
              title={timerText.soundOptions}
              className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center border border-line text-muted transition hover:bg-white/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/60"
            >
              <SettingsIcon />
            </button>
          )}
        </div>

        <div className="mt-6 grid w-full place-items-center">
          <h2 className="w-full text-center font-sans text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
            {currentPhase?.name ?? timerText.endPractice}
          </h2>
        </div>
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

        <dialog
          ref={optionsDialogRef}
          onCancel={(event) => {
            event.preventDefault();
            setIsOptionsDialogOpen(false);
          }}
          onClose={() => setIsOptionsDialogOpen(false)}
          className="m-auto w-[calc(100%-2rem)] max-w-md border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-sans text-xl font-semibold">{timerText.soundOptions}</h2>
              <button
                type="button"
                onClick={() => setIsOptionsDialogOpen(false)}
                className="flex size-9 items-center justify-center border border-line text-muted"
                aria-label={timerText.soundOptions}
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-sm text-muted">{timerText.autoAdvanceDescription}</p>
            <label className="mt-5 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(event) => setAutoAdvance(event.target.checked)}
                className="size-4 accent-accent-green-fg"
              />
              {timerText.autoAdvance}
            </label>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-muted">
                <span className="mb-1 block">{timerText.startSound}</span>
                <SelectField
                  ariaLabel={timerText.startSound}
                  value={practiceStartSound}
                  onChange={(value) => setPracticeStartSound(value as PracticeSound)}
                  options={[...PRACTICE_SOUND_OPTIONS]}
                />
              </label>
              <label className="text-sm text-muted">
                <span className="mb-1 block">{timerText.endSound}</span>
                <SelectField
                  ariaLabel={timerText.endSound}
                  value={practiceEndSound}
                  onChange={(value) => setPracticeEndSound(value as PracticeSound)}
                  options={[...PRACTICE_SOUND_OPTIONS]}
                />
              </label>
            </div>
          </div>
        </dialog>

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

function SettingsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
      <path
        d="M10.4 3.5h3.2l.5 2.1a6.9 6.9 0 0 1 1.5.9l2.1-.6 1.6 2.8-1.6 1.5a7 7 0 0 1 0 1.8l1.6 1.5-1.6 2.8-2.1-.6a6.9 6.9 0 0 1-1.5.9l-.5 2.1h-3.2l-.5-2.1a6.9 6.9 0 0 1-1.5-.9l-2.1.6-1.6-2.8 1.6-1.5a7 7 0 0 1 0-1.8L4.7 8.7l1.6-2.8 2.1.6a6.9 6.9 0 0 1 1.5-.9l.5-2.1Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="11.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

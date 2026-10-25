"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { SearchIcon, SettingsIcon } from "@/components/ui/icons";
import { SongPickerDialog } from "@/components/practice/SongPickerDialog";
import { useDialogModal } from "@/hooks/useDialogModal";
import { PRACTICE_SOUND_OPTIONS, type PracticeSound } from "@/utils/practice-sounds";
import type { PracticeTimerController } from "@/hooks/usePracticeTimer";
import type { RepertoireItem } from "@/types/practice";
import {
  formatClock,
  formatOvertime,
  getTimerAction,
  getTimerDisplaySeconds,
} from "@/utils/format";
import { useI18nSection } from "@/i18n/I18nProvider";

type TimerCardProps = {
  timer: PracticeTimerController;
  isCompleted: boolean;
  /** Abre la confirmación de fin, compartida con la barra flotante. */
  onRequestFinish: () => void;
  compact?: boolean;
  practiceStartSound: PracticeSound;
  setPracticeStartSound: (sound: PracticeSound) => void;
  practiceEndSound: PracticeSound;
  setPracticeEndSound: (sound: PracticeSound) => void;
  /** Artista del bloque de repertorio que se está practicando, si lo tiene. */
  artist?: string;
  /** Título resuelto del bloque; en repertorio es siempre el de la canción. */
  title?: string;
  /** Canciones disponibles para cambiar el bloque de repertorio en curso. */
  repertoireSongs?: RepertoireItem[];
  onChangeRepertoireSong?: (songId: string) => void;
};

export function TimerCard({
  timer,
  isCompleted,
  onRequestFinish,
  compact = false,
  practiceStartSound,
  setPracticeStartSound,
  practiceEndSound,
  setPracticeEndSound,
  artist,
  title,
  repertoireSongs,
  onChangeRepertoireSong,
}: TimerCardProps) {
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [isSongPickerOpen, setIsSongPickerOpen] = useState(false);
  const optionsTitleId = useId();
  const { dialogRef: optionsDialogRef, handleCancel: handleOptionsCancel } =
    useDialogModal(isOptionsDialogOpen, () => setIsOptionsDialogOpen(false));
  const timerText = useI18nSection("timer");
  const practiceText = useI18nSection("practice");
  const skills = useI18nSection("skills");
  const {
    currentPhase,
    awaitingPhaseAdvance,
    elapsedSeconds,
    isRunning,
    remainingSeconds,
    pause,
    reset,
    resume,
    skip,
    autoAdvance,
    setAutoAdvance,
    continueAfterBlockTime,
    setContinueAfterBlockTime,
    phaseElapsedSeconds,
    phasePlannedSeconds,
    isCountUp,
  } = timer;

  const overtimeSeconds = Math.max(
    0,
    phaseElapsedSeconds - phasePlannedSeconds,
  );

  const timerAction = getTimerAction(
    isRunning,
    awaitingPhaseAdvance,
    elapsedSeconds,
  );
  const timerActionLabel =
    timerAction === "pause" ? timerText.pause
    : timerAction === "blockFinished" ?
      continueAfterBlockTime ? timerText.continue : timerText.blockFinished
    : timerAction === "continue" ? timerText.continue
    : timerText.start;
  const canChangeSong =
    currentPhase?.skill === "repertoire" &&
    !isCompleted &&
    Boolean(repertoireSongs?.length) &&
    Boolean(onChangeRepertoireSong);

  return (
    <>
      <Card
        className={`enter flex h-full flex-col items-center text-center ${compact ? "p-5 sm:p-6" : ""}`}
      >
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
          <div className="grid w-full grid-cols-[minmax(3rem,1fr)_minmax(0,auto)_minmax(3rem,1fr)] items-center">
            <span aria-hidden="true" />
            <h2 className="min-w-0 break-words text-center font-sans text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
              {title ?? currentPhase?.name ?? timerText.endPractice}
            </h2>
            {canChangeSong ? (
              <button
                type="button"
                onClick={() => setIsSongPickerOpen(true)}
                aria-label={practiceText.changeSong}
                title={practiceText.changeSong}
                className="ml-3 flex size-9 shrink-0 items-center justify-center justify-self-start rounded-md border border-line text-muted transition hover:border-white/20 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
              >
                <SearchIcon className="size-4" />
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
          {currentPhase && artist?.trim() && (
            <p className="mt-2 w-full text-center text-sm text-muted">
              {artist.trim()}
            </p>
          )}
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
          {formatClock(
            getTimerDisplaySeconds(
              isCountUp,
              elapsedSeconds,
              remainingSeconds,
            ),
          )}
        </p>
        {!isCountUp && (
          <p className="-mt-10 mb-10 font-mono text-xs uppercase tracking-[0.05em] text-muted">
            {timerText.totalTime} {formatClock(elapsedSeconds)}
          </p>
        )}
        {!isCountUp && overtimeSeconds > 0 && (
          <p className="-mt-8 mb-8 font-mono text-xs uppercase tracking-[0.05em] text-accent-green-fg">
            {timerText.overtime} {formatOvertime(overtimeSeconds)}
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

        <ModalDialog
          dialogRef={optionsDialogRef}
          labelledBy={optionsTitleId}
          onCancel={handleOptionsCancel}
          onClose={() => setIsOptionsDialogOpen(false)}
          variant="lg"
        >
          <div className="p-5 text-left sm:p-6">
            <DialogHeader
              eyebrow={timerText.soundOptions}
              titleId={optionsTitleId}
              title={timerText.practiceSettingsTitle}
              description={timerText.practiceSettingsDescription}
              onClose={() => setIsOptionsDialogOpen(false)}
              closeLabel={timerText.closeSettings}
            />

            <section className="mt-6 border-t border-line pt-5">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {timerText.flowSection}
              </h3>
              <div className="mt-3 divide-y divide-line rounded-lg border border-line">
                <div className="p-3.5">
                  <CheckboxField
                    checked={autoAdvance}
                    onChange={(event) => setAutoAdvance(event.target.checked)}
                    label={timerText.autoAdvance}
                    className="text-sm text-ink"
                  />
                  <p className="mt-1.5 pl-6 text-xs leading-5 text-muted">
                    {timerText.autoAdvanceDescription}
                  </p>
                </div>
                <div className="p-3.5">
                  <CheckboxField
                    checked={continueAfterBlockTime}
                    onChange={(event) =>
                      setContinueAfterBlockTime(event.target.checked)
                    }
                    label={timerText.continueAfterBlockTime}
                    className="text-sm text-ink"
                  />
                  <p className="mt-1.5 pl-6 text-xs leading-5 text-muted">
                    {timerText.continueAfterBlockTimeDescription}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 border-t border-line pt-5">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {timerText.soundSection}
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                {timerText.soundSectionDescription}
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-line p-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {timerText.startSound}
                  </p>
                  <ToggleGroup
                    aria-label={timerText.startSound}
                    className="mt-2 gap-1.5"
                  >
                    {PRACTICE_SOUND_OPTIONS.map((option) => (
                      <ToggleChip
                        key={option.value}
                        selected={practiceStartSound === option.value}
                        size="sm"
                        onClick={() => setPracticeStartSound(option.value)}
                      >
                        {option.label}
                      </ToggleChip>
                    ))}
                  </ToggleGroup>
                </div>
                <div className="rounded-lg border border-line p-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {timerText.endSound}
                  </p>
                  <ToggleGroup
                    aria-label={timerText.endSound}
                    className="mt-2 gap-1.5"
                  >
                    {PRACTICE_SOUND_OPTIONS.map((option) => (
                      <ToggleChip
                        key={option.value}
                        selected={practiceEndSound === option.value}
                        size="sm"
                        onClick={() => setPracticeEndSound(option.value)}
                      >
                        {option.label}
                      </ToggleChip>
                    ))}
                  </ToggleGroup>
                </div>
              </div>
            </section>
          </div>
        </ModalDialog>

        <div className="mt-auto flex w-full justify-center gap-3 pt-6">
          <Button
            variant="primary"
            onClick={isRunning ? pause : resume}
            disabled={
              !currentPhase ||
              isCompleted ||
              (awaitingPhaseAdvance &&
                !isRunning &&
                !continueAfterBlockTime)
            }
            className={`${compact ? "h-12 px-4" : ""} min-w-0 flex-1 px-3 text-xs sm:px-4 sm:text-sm`}
          >
            {timerActionLabel}
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
            onClick={onRequestFinish}
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

      <SongPickerDialog
        open={isSongPickerOpen}
        songs={repertoireSongs ?? []}
        selectedSongId={currentPhase?.repertoireItemId}
        onSelect={(song) => onChangeRepertoireSong?.(song.id)}
        onClose={() => setIsSongPickerOpen(false)}
      />
    </>
  );
}

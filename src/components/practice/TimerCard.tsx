"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { Field, TextField } from "@/components/ui/Field";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Toast } from "@/components/ui/Toast";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { SearchIcon, SettingsIcon } from "@/components/ui/icons";
import { SongPickerDialog } from "@/components/practice/SongPickerDialog";
import { useDialogModal } from "@/hooks/useDialogModal";
import {
  PRACTICE_SOUND_LABEL_KEYS,
  PRACTICE_SOUNDS,
  type PracticeSound,
} from "@/utils/practice-sounds";
import { playPracticeSound } from "@/services/practice-sound";
import { normalizeTargetMinutes } from "@/utils/practice-target";
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
  /** Objetivo de la sesión en minutos; sin valor si no hay. */
  targetMinutes?: number;
  onChangeTargetMinutes: (value: number | null) => void;
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
  targetMinutes,
  onChangeTargetMinutes,
  artist,
  title,
  repertoireSongs,
  onChangeRepertoireSong,
}: TimerCardProps) {
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [isSongPickerOpen, setIsSongPickerOpen] = useState(false);
  const [targetEnabled, setTargetEnabled] = useState(Boolean(targetMinutes));
  const [targetValue, setTargetValue] = useState(String(targetMinutes ?? 30));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const optionsTitleId = useId();
  const targetInputId = useId();
  const {
    dialogRef: optionsDialogRef,
    handleCancel: handleOptionsCancel,
    isClosing: isOptionsClosing,
  } = useDialogModal(isOptionsDialogOpen, () => setIsOptionsDialogOpen(false));
  const timerText = useI18nSection("timer");
  const practiceText = useI18nSection("practice");
  const skills = useI18nSection("skills");
  const {
    currentPhase,
    awaitingPhaseAdvance,
    elapsedSeconds,
    isRunning,
    isTargetReached,
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
  const parsedTarget = normalizeTargetMinutes(targetValue);
  const targetInvalid = targetEnabled && parsedTarget === undefined;

  /**
   * El bloque terminado se sigue con el estado real del temporizador, no con el
   * derivado que oculta la espera cuando el reloj continúa en overtime. Así el
   * aviso aparece también en ese modo.
   */
  const blockFinished = timer.awaitingPhaseAdvance && !isCompleted;

  useEffect(() => {
    if (!isTargetReached) return;
    setToastMessage(
      targetMinutes
        ? `${timerText.targetReachedToast} · ${targetMinutes} min`
        : timerText.targetReachedToast,
    );
  }, [isTargetReached, targetMinutes, timerText.targetReachedToast]);

  useEffect(() => {
    if (!blockFinished || isTargetReached) return;
    setToastMessage(timerText.blockFinishedToast);
  }, [blockFinished, isTargetReached, timerText.blockFinishedToast]);

  useEffect(() => {
    if (!isTargetReached && !blockFinished) setToastMessage(null);
  }, [blockFinished, isTargetReached]);

  /**
   * Si el bloque termina con la pestaña en segundo plano, el aviso de cinco
   * segundos pasa desapercibido. Al volver a la pestaña se recuerda mientras
   * siga pendiente avanzar.
   */
  useEffect(() => {
    if (!blockFinished || isTargetReached) return;
    function reshownOnReturn() {
      if (document.visibilityState === "visible") {
        setToastMessage(timerText.blockFinishedToast);
      }
    }
    document.addEventListener("visibilitychange", reshownOnReturn);
    window.addEventListener("focus", reshownOnReturn);
    return () => {
      document.removeEventListener("visibilitychange", reshownOnReturn);
      window.removeEventListener("focus", reshownOnReturn);
    };
  }, [blockFinished, isTargetReached, timerText.blockFinishedToast]);

  function handleTargetEnabled(enabled: boolean) {
    setTargetEnabled(enabled);
    onChangeTargetMinutes(enabled ? (parsedTarget ?? null) : null);
  }

  function handleTargetValue(value: string) {
    setTargetValue(value);
    onChangeTargetMinutes(normalizeTargetMinutes(value) ?? null);
  }

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
          {currentPhase && !isCompleted && (
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


        <ModalDialog
          dialogRef={optionsDialogRef}
          isClosing={isOptionsClosing}
          labelledBy={optionsTitleId}
          onCancel={handleOptionsCancel}
          onClose={() => setIsOptionsDialogOpen(false)}
          variant="lg"
        >
          <div className="p-5 text-left sm:p-6">
            <DialogHeader
              titleId={optionsTitleId}
              title={timerText.practiceSettingsTitle}
              description={timerText.practiceSettingsDescription}
              onClose={() => setIsOptionsDialogOpen(false)}
              closeLabel={timerText.closeSettings}
            />

            <section className="mt-6 border-t border-line pt-5">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {timerText.targetSection}
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                {timerText.targetSectionDescription}
              </p>
              <div className="mt-3 rounded-lg border border-line p-3.5">
                <CheckboxField
                  checked={targetEnabled}
                  onChange={(event) => handleTargetEnabled(event.target.checked)}
                  label={timerText.targetEnable}
                  className="text-sm text-ink"
                />
                {targetEnabled && (
                  <Field
                    label={timerText.targetMinutes}
                    htmlFor={targetInputId}
                    error={targetInvalid ? timerText.targetInvalid : null}
                    className="mt-3 max-w-40"
                  >
                    <TextField
                      id={targetInputId}
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      value={targetValue}
                      onChange={(event) => handleTargetValue(event.target.value)}
                    />
                  </Field>
                )}
              </div>
            </section>

            {!isCountUp && (
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
            )}

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
                    {PRACTICE_SOUNDS.map((sound) => (
                      <ToggleChip
                        key={sound}
                        selected={practiceStartSound === sound}
                        size="sm"
                        onClick={() => {
                          setPracticeStartSound(sound);
                          playPracticeSound(sound, "start");
                        }}
                      >
                        {timerText[PRACTICE_SOUND_LABEL_KEYS[sound]]}
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
                    {PRACTICE_SOUNDS.map((sound) => (
                      <ToggleChip
                        key={sound}
                        selected={practiceEndSound === sound}
                        size="sm"
                        onClick={() => {
                          setPracticeEndSound(sound);
                          playPracticeSound(sound, "end");
                        }}
                      >
                        {timerText[PRACTICE_SOUND_LABEL_KEYS[sound]]}
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
      <Toast
        message={toastMessage ?? ""}
        open={Boolean(toastMessage)}
        durationMs={8000}
        onDismiss={() => setToastMessage(null)}
      />
    </>
  );
}

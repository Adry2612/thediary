"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { PracticeMetricScale } from "@/components/practice/PracticeMetricScale";
import { formatClock } from "@/utils/format";
import { usePracticeFeedbackPreference } from "@/hooks/usePracticeFeedbackPreference";
import { useDialogMotion } from "@/hooks/useDialogMotion";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  PRACTICE_SKILLS,
  type PracticeMetricValue,
  type PracticeTimerResult,
} from "@/types/practice";

interface PracticeCompletionDialogProps {
  result: PracticeTimerResult | null;
  isVisible: boolean;
  routineName?: string;
  canUpdateRoutine?: boolean;
  onSave: (
    sessionNotes: string,
    phaseNotes: Record<number, string>,
    updateRoutine: boolean,
    metrics: { mood?: PracticeMetricValue; focus?: PracticeMetricValue },
  ) => void;
  onDiscard: () => void;
}

export function PracticeCompletionDialog({
  result,
  isVisible,
  routineName,
  canUpdateRoutine = false,
  onSave,
  onDiscard,
}: PracticeCompletionDialogProps) {
  const text = useI18nSection("practice");
  const skills = useI18nSection("skills");
  const { isMoodEnabled, isFocusEnabled, refresh } =
    usePracticeFeedbackPreference();
  const { dialogRef, isClosing } = useDialogMotion(
    Boolean(result) && isVisible,
  );
  const [sessionNotes, setSessionNotes] = useState("");
  const [phaseNotes, setPhaseNotes] = useState<Record<number, string>>({});
  const [updateRoutine, setUpdateRoutine] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [mood, setMood] = useState<PracticeMetricValue | null>(null);
  const [focus, setFocus] = useState<PracticeMetricValue | null>(null);

  useEffect(() => {
    if (!result || !isVisible) return;

    refresh();
    setSessionNotes("");
    setPhaseNotes({});
    setUpdateRoutine(true);
    setIsNotesOpen(false);
    setMood(null);
    setFocus(null);
  }, [isVisible, refresh, result]);

  const practicedSkills = result
    ? PRACTICE_SKILLS.filter(
        (skill) => (result.skillSeconds[skill] ?? 0) > 0,
      )
    : [];
  const hasMetricQuestions = isMoodEnabled || isFocusEnabled;

  function handleSave() {
    onSave(sessionNotes, phaseNotes, updateRoutine, {
      ...(mood ? { mood } : {}),
      ...(focus ? { focus } : {}),
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="practice-completion-title"
      data-closing={isClosing ? "true" : undefined}
      onCancel={(event) => event.preventDefault()}
      className="overlay-motion m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
    >
      <div className="p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.05em] text-muted">
          {result?.completed ? text.completeTitle : text.finishedTitle}
        </p>
        <h2
          id="practice-completion-title"
          className="mt-3 font-sans text-3xl font-semibold"
        >
          {result?.completed ? text.finishedRoutine : text.practiceReady}
        </h2>

        <section
          aria-label={text.completionSummary}
          className="mt-5 rounded-xl border border-line bg-canvas/50 p-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-xs uppercase tracking-[0.08em] text-muted">
              {text.completionTime}
            </span>
            <span className="font-mono text-2xl tabular-nums text-ink">
              {formatClock(result?.elapsedSeconds ?? 0)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {result?.phases.length
              ? `${result.phases.length} ${result.phases.length === 1 ? text.blockSingular : text.blocksCount} · ${text.completionRecorded}`
              : text.completionRecorded}
          </p>
          {practicedSkills.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3">
              {practicedSkills.map((skill) => (
                <li
                  key={skill}
                  className="flex items-baseline gap-2 text-xs text-muted"
                >
                  <span className="text-ink">{skills[skill]}</span>
                  <span className="font-mono tabular-nums">
                    {formatClock(result?.skillSeconds[skill] ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {hasMetricQuestions && (
          <section
            aria-label={text.completionWellbeing}
            className="mt-6 border-t border-line pt-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium text-ink">
                {text.completionWellbeing}
              </h3>
              <span className="text-xs text-muted">{text.metricOptional}</span>
            </div>

            {isMoodEnabled && (
              <div className="mt-4">
                <p id="completion-mood-question" className="text-sm text-muted">
                  {text.moodQuestion}
                </p>
                <PracticeMetricScale
                  metric="mood"
                  value={mood}
                  onChange={setMood}
                  labelledBy="completion-mood-question"
                />
              </div>
            )}

            {isFocusEnabled && (
              <div className="mt-5">
                <p
                  id="completion-focus-question"
                  className="text-sm text-muted"
                >
                  {text.focusQuestion}
                </p>
                <PracticeMetricScale
                  metric="focus"
                  value={focus}
                  onChange={setFocus}
                  labelledBy="completion-focus-question"
                />
              </div>
            )}
          </section>
        )}

        <div className="mt-6 border-t border-line pt-5">
          <button
            type="button"
            aria-expanded={isNotesOpen}
            aria-controls="completion-notes"
            onClick={() => setIsNotesOpen((current) => !current)}
            className="inline-flex min-h-9 items-center gap-2 text-sm text-muted underline underline-offset-4 hover:text-ink"
          >
            {isNotesOpen ? text.hideNotes : text.addNotes}
          </button>

          {isNotesOpen && (
            <div id="completion-notes" className="mt-4">
              <label className="block text-sm text-ink">
                {text.notes}
                <TextArea
                  className="mt-2"
                  value={sessionNotes}
                  onChange={(event) => setSessionNotes(event.target.value)}
                  placeholder={text.notesPlaceholder}
                  rows={3}
                />
              </label>
              {result && result.phases.length > 0 && (
                <section
                  aria-labelledby="completion-phase-notes"
                  className="mt-5"
                >
                  <h3
                    id="completion-phase-notes"
                    className="text-sm font-medium text-ink"
                  >
                    {text.phaseNotes}
                  </h3>
                  <div className="mt-3 space-y-3">
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
                          placeholder={`${text.notes} ${phase.name.toLowerCase()}…`}
                          rows={2}
                        />
                      </label>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {canUpdateRoutine && routineName && (
          <label className="mt-6 flex items-start gap-2 rounded-lg border border-line bg-canvas/50 p-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={updateRoutine}
              onChange={(event) => setUpdateRoutine(event.target.checked)}
              className="mt-0.5 size-4 accent-accent-green-fg"
            />
            <span>
              <span className="block font-medium">
                {text.updateRoutine} «{routineName}»
              </span>
              <span className="mt-1 block text-xs text-muted">
                {text.updateRoutineDescription}
              </span>
            </span>
          </label>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3">
          <button
            type="button"
            onClick={onDiscard}
            className="min-h-10 text-sm text-muted underline underline-offset-4 hover:text-ink"
          >
            {text.exitWithoutSaving}
          </button>
          <Button variant="primary" size="field" onClick={handleSave}>
            {text.saveCompletion}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

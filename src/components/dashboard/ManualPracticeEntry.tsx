"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextArea, TextField } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { createManualPracticeRecord } from "@/utils/manual-practice";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { usePracticeGuitar } from "@/hooks/usePracticeGuitar";
import { PRACTICE_SKILLS, type GuitarType, type PracticeSkill } from "@/types/practice";
import { useGuitarPreference } from "@/hooks/useGuitarPreference";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  changeManualPracticeSkill,
  createManualPracticeBlockDraft,
  manualPracticeBlocksFromDrafts,
  toLocalDateTimeInputValue,
  type ManualPracticeBlockDraft,
} from "@/utils/manual-practice";
import { PracticeBlockLinkFields } from "@/components/practice/PracticeBlockLinkFields";
import { PracticeBlockNotesField } from "@/components/practice/PracticeBlockNotesField";
import { useDialogMotion } from "@/hooks/useDialogMotion";

export function ManualPracticeEntry() {
  const manual = useI18nSection("manualPractice");
  const skills = useI18nSection("skills");
  const practiceText = useI18nSection("practice");
  const { lastGuitarType, rememberGuitarType } = useGuitarPreference();
  const [isOpen, setIsOpen] = useState(false);
  const { dialogRef, isClosing } = useDialogMotion(isOpen);
  const addSession = usePracticeStore((state) => state.addSession);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const guitars = usePracticeStore((state) => state.guitars);
  const licks = usePracticeStore((state) => state.licks);
  const songs = repertoireItems.filter((item) => item.kind === "song");
  const [title, setTitle] = useState("");
  const [startedAtLocal, setStartedAtLocal] = useState(() =>
    toLocalDateTimeInputValue(new Date()),
  );
  const [blocks, setBlocks] = useState(() => [createManualPracticeBlockDraft()]);
  const [notes, setNotes] = useState("");
  const [guitarType, setGuitarType] = useState<GuitarType | "">("");
  const {
    guitarId,
    setGuitarId,
    rememberGuitar,
    showSelector: showGuitarSelector,
  } = usePracticeGuitar({ guitars });
  const [error, setError] = useState<string | null>(null);
  const totalMinutes = blocks.reduce((total, block) => {
    const duration = Number(block.durationMinutes);
    return Number.isSafeInteger(duration) && duration > 0
      ? total + duration
      : total;
  }, 0);

  function openDialog() {
    setStartedAtLocal(toLocalDateTimeInputValue(new Date()));
    setGuitarType(lastGuitarType ?? "");
    setError(null);
    setIsOpen(true);
  }

  function updateBlock(
    blockId: string,
    changes: Partial<Omit<ManualPracticeBlockDraft, "id">>,
  ) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId ? { ...block, ...changes } : block,
      ),
    );
  }

  function changeBlockSkill(blockId: string, skill: PracticeSkill) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId ? changeManualPracticeSkill(block, skill) : block,
      ),
    );
  }

  function saveManualPractice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      addSession(
        createManualPracticeRecord({
          title,
          startedAtLocal,
          blocks: manualPracticeBlocksFromDrafts(blocks, songs),
          notes,
          guitarType: guitarType || undefined,
          guitarId,
        }),
      );
      if (guitarType) rememberGuitarType(guitarType);
      rememberGuitar();
      setTitle("");
      setBlocks([createManualPracticeBlockDraft()]);
      setNotes("");
      setIsOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
           ? saveError.message
           : manual.error,
      );
    }
  }

  return (
    <>
      <Button type="button" onClick={openDialog} disabled={!hasHydrated}>
           {manual.add}
      </Button>
      <dialog
        ref={dialogRef}
        data-closing={isClosing ? "true" : undefined}
        onCancel={(event) => {
          event.preventDefault();
          setIsOpen(false);
        }}
        className="overlay-motion m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
      >
        <form onSubmit={saveManualPractice} className="p-6 sm:p-8">
          <h2 className="font-sans text-2xl font-semibold">
             {manual.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
             {manual.description}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-ink sm:col-span-2">
               {manual.practiceName}
              <TextField
                className="mt-2"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                 placeholder={manual.placeholder}
                maxLength={100}
              />
            </label>
            <label className="block text-sm text-ink sm:col-span-2">
               {manual.dateTime}
              <TextField
                className="mt-2 font-mono"
                type="datetime-local"
                value={startedAtLocal}
                onChange={(event) => setStartedAtLocal(event.target.value)}
                required
              />
            </label>
            <div className="block text-sm text-ink sm:col-span-2">
              {practiceText.guitarType}
              <SelectField
                className="mt-2"
                ariaLabel={practiceText.guitarTypeAria}
                value={guitarType || "unspecified"}
                onChange={(value) =>
                  setGuitarType(
                    value === "electric" || value === "acoustic" ? value : "",
                  )
                }
                options={[
                  { value: "unspecified", label: practiceText.guitarUnspecified },
                  { value: "electric", label: practiceText.guitarElectric },
                  { value: "acoustic", label: practiceText.guitarAcoustic },
                ]}
              />
            </div>
            {showGuitarSelector && (
              <div className="block text-sm text-ink sm:col-span-2">
                {practiceText.guitar}
                <SelectField
                  className="mt-2"
                  ariaLabel={practiceText.guitarAria}
                  value={guitarId ?? "none"}
                  onChange={(value) => setGuitarId(value === "none" ? undefined : value)}
                  options={[
                    { value: "none", label: practiceText.guitarNone },
                    ...guitars.map((guitar) => ({
                      value: guitar.id,
                      label: guitar.name,
                    })),
                  ]}
                />
              </div>
            )}
            <section className="sm:col-span-2">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-medium text-ink">
                   {manual.blocks}
                </h3>
                <p className="font-mono text-xs tabular-nums text-muted">
                   {manual.total} · {totalMinutes} min
                </p>
              </div>
              <div className="space-y-3">
                {blocks.map((block, index) => (
                  <fieldset
                    key={block.id}
                    className="border border-line bg-canvas/60 p-4"
                  >
                    <legend className="sr-only">
                      {manual.block} {index + 1} de práctica
                    </legend>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
                        {manual.block} {String(index + 1).padStart(2, "0")}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setBlocks((current) =>
                            current.filter((candidate) => candidate.id !== block.id),
                          )
                        }
                        disabled={blocks.length === 1}
                        aria-label={`Quitar bloque ${index + 1}`}
                        className="text-xs text-muted underline underline-offset-4 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {manual.remove}
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <PracticeBlockLinkFields
                        index={index}
                        value={block}
                        songs={songs}
                        licks={licks}
                        onChange={(changes) => updateBlock(block.id, changes)}
                      />
                      <label className="block text-sm text-ink">
                        {manual.duration}
                        <TextField
                          className="mt-2"
                          type="number"
                          min="1"
                          max="240"
                          step="1"
                          value={block.durationMinutes}
                          onChange={(event) =>
                            updateBlock(block.id, {
                              durationMinutes: event.target.value,
                            })
                          }
                          required
                        />
                      </label>
                      <div className="block text-sm text-ink">
                        {manual.practiceType}
                        <SelectField
                          className="mt-2"
                          value={block.skill}
                          onChange={(value) => {
                            const selectedSkill = PRACTICE_SKILLS.find(
                              (candidate) => candidate === value,
                            );
                            if (selectedSkill) {
                              changeBlockSkill(block.id, selectedSkill);
                            }
                          }}
                          ariaLabel={`${manual.practiceType} ${manual.block} ${index + 1}`}
                          options={PRACTICE_SKILLS.map((skill) => ({
                            value: skill,
                            label: skills[skill],
                          }))}
                        />
                      </div>
                    </div>
                    <PracticeBlockNotesField
                      value={block.notes}
                      ariaLabelSuffix={`${manual.block} ${index + 1}`}
                      onChange={(notes) => updateBlock(block.id, { notes })}
                    />
                  </fieldset>
                ))}
              </div>
              <Button
                type="button"
                onClick={() => setBlocks((current) => [...current, createManualPracticeBlockDraft()])}
                className="mt-3 h-11 px-4"
              >
                 {manual.addBlock}
              </Button>
            </section>
            <label className="block text-sm text-ink sm:col-span-2">
               {manual.notes}
              <TextArea
                className="mt-2"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                 placeholder={manual.notesPlaceholder}
                rows={3}
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-300" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
           <Button
              type="button"
              onClick={() => setIsOpen(false)}
            >
              {manual.cancel}
            </Button>
            <Button type="submit" variant="primary">
               {manual.save}
            </Button>
          </div>
        </form>

      </dialog>
    </>
  );
}

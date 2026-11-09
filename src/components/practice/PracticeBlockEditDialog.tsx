"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { FormMessage, TextArea, TextField } from "@/components/ui/Field";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { SearchIcon } from "@/components/ui/icons";
import { SelectField } from "@/components/ui/SelectField";
import { PracticeExerciseEditor } from "@/components/practice/PracticeExerciseEditor";
import { SongPickerDialog } from "@/components/practice/SongPickerDialog";
import { TechniquePickerDialog } from "@/components/practice/TechniquePickerDialog";
import { TheoryPickerDialog } from "@/components/practice/TheoryPickerDialog";
import { useDialogModal } from "@/hooks/useDialogModal";
import { useDisplayPreferences } from "@/hooks/useDisplayPreferences";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  PRACTICE_SKILLS,
  type PracticePhase,
  type RepertoireItem,
} from "@/types/practice";
import type { GuitarLick } from "@/types/lick";
import type { CatalogCandidate } from "@/types/catalog";
import { getTheoryName } from "@/utils/catalogs/theory";
import { getTechniqueName } from "@/utils/catalogs/techniques";
import {
  applySkillChange,
  getCatalogSongChanges,
  getLickOptions,
  getRepertoirePartOptions,
  getRepertoireSongChanges,
  shouldAdoptLinkedTitle,
} from "@/utils/practice-block-editor";

const pickerTriggerClass =
  "mt-1 flex h-auto min-h-12 w-full items-center justify-between gap-3 border border-line bg-canvas px-4 py-3 text-left font-mono text-sm leading-tight text-ink transition hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg";

type PickerKind = "song" | "technique" | "theory" | null;

interface PracticeBlockEditDialogProps {
  open: boolean;
  phase: PracticePhase;
  repertoireItems: RepertoireItem[];
  licks: GuitarLick[];
  onSave: (changes: Partial<PracticePhase>) => void;
  onClose: () => void;
}

function clonePhase(phase: PracticePhase): PracticePhase {
  return {
    ...phase,
    exercises: [...(phase.exercises ?? [])],
    resources: (phase.resources ?? []).map((resource) => ({ ...resource })),
    ...(phase.catalogSong ? { catalogSong: { ...phase.catalogSong } } : {}),
  };
}

/**
 * Edita el bloque en curso de una práctica activa. El borrador es local: solo
 * al guardar se aplica al bloque, y el temporizador no se detiene ni se reinicia.
 */
export function PracticeBlockEditDialog({
  open,
  phase,
  repertoireItems,
  licks,
  onSave,
  onClose,
}: PracticeBlockEditDialogProps) {
  const text = useI18nSection("practice");
  const skills = useI18nSection("skills");
  const { techniqueNameLanguage } = useDisplayPreferences();
  const titleId = useId();
  const { dialogRef, handleCancel, isClosing } = useDialogModal(open, onClose);
  const [draft, setDraft] = useState(() => clonePhase(phase));
  const [durationValue, setDurationValue] = useState(
    String(phase.durationMinutes),
  );
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerKind>(null);
  const openedPhaseRef = useRef<PracticePhase["id"] | null>(null);

  useEffect(() => {
    if (!open) {
      openedPhaseRef.current = null;
      return;
    }
    if (openedPhaseRef.current === phase.id) return;

    openedPhaseRef.current = phase.id;
    setDraft(clonePhase(phase));
    setDurationValue(String(phase.durationMinutes));
    setError(null);
    setPicker(null);
  }, [open, phase]);

  const songs = repertoireItems.filter((item) => item.kind === "song");
  const selectedSong = repertoireItems.find(
    (item) => item.id === draft.repertoireItemId && item.kind === "song",
  );
  const selectedLick = licks.find((lick) => lick.id === draft.lickId);
  const songTriggerLabel =
    selectedSong?.title ?? draft.catalogSong?.title ?? text.selectSong;
  const techniqueTriggerLabel = draft.name.trim()
    ? getTechniqueName(draft.name, techniqueNameLanguage)
    : text.selectTechnique;
  const theoryTriggerLabel = draft.name.trim()
    ? getTheoryName(draft.name, techniqueNameLanguage)
    : text.selectTheoryTopic;
  const partOptions = getRepertoirePartOptions(
    selectedSong,
    text.noPart,
    draft.repertoirePartId,
    text.missingReference,
  );
  const lickOptions = getLickOptions(
    licks,
    text.selectLick,
    draft.lickId,
    text.missingReference,
  );

  function updateDraft(changes: Partial<PracticePhase>) {
    setDraft((current) => ({ ...current, ...changes }));
    setError(null);
  }

  function changeSkill(value: string) {
    const skill = PRACTICE_SKILLS.find((candidate) => candidate === value);
    if (!skill) return;
    setDraft((current) => applySkillChange(current, skill));
    setError(null);
  }

  function changeSong(song: RepertoireItem) {
    updateDraft(getRepertoireSongChanges(song));
  }

  function changeCatalogSong(candidate: CatalogCandidate) {
    updateDraft(getCatalogSongChanges(candidate));
  }

  function changeLick(lickId: string) {
    const nextLick = licks.find((lick) => lick.id === lickId);
    const changes: Partial<PracticePhase> = { lickId: nextLick?.id };
    if (nextLick && shouldAdoptLinkedTitle(draft.name, selectedLick?.title)) {
      changes.name = nextLick.title;
    }
    updateDraft(changes);
  }

  function validate(): string | null {
    const minutes = Number(durationValue);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) {
      return text.invalidBlockDuration;
    }

    if (draft.skill === "repertoire" && !selectedSong && !draft.catalogSong) {
      return draft.repertoireItemId
        ? text.missingReference
        : text.missingSongLink;
    }
    if (draft.skill === "technique" && !draft.name.trim()) {
      return text.missingTechnique;
    }
    if (draft.skill === "theory" && !draft.name.trim()) {
      return text.missingTheoryTopic;
    }
    if (draft.skill === "lick" && !selectedLick) {
      return text.missingLickLink;
    }
    if (!draft.name.trim()) return text.blockNameRequired;

    return null;
  }

  function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const minutes = Number(durationValue);
    onSave({
      ...draft,
      name:
        draft.skill === "repertoire"
          ? (selectedSong?.title ?? draft.catalogSong?.title ?? draft.name.trim())
          : draft.name.trim(),
      durationMinutes: minutes,
      exercises: [...(draft.exercises ?? [])],
      notes: draft.notes?.trim() ? draft.notes : undefined,
    });
    onClose();
  }

  function renderContentField() {
    if (draft.skill === "repertoire") {
      return (
        <div className="text-xs text-muted">
          <span className="block">{text.repertoireSong}</span>
          <button
            type="button"
            onClick={() => setPicker("song")}
            aria-label={`${text.repertoireSong}: ${songTriggerLabel}`}
            className={pickerTriggerClass}
          >
            <span className="min-w-0 whitespace-normal break-words">
              {songTriggerLabel}
            </span>
            <SearchIcon className="size-4 shrink-0 text-muted" />
          </button>
          {draft.catalogSong && (
            <span className="mt-1 block text-[11px] text-muted">
              {draft.catalogSong.artist}
            </span>
          )}
          {!selectedSong && !draft.catalogSong && (
            <span className="mt-2 block text-xs text-red-300" role="status">
              {draft.repertoireItemId
                ? text.missingReference
                : text.missingSongLink}
            </span>
          )}
          {selectedSong && (
            <div className="mt-4">
              <span className="block">{text.repertoirePart}</span>
              <SelectField
                className="mt-1"
                value={draft.repertoirePartId ?? ""}
                ariaLabel={text.repertoirePart}
                options={partOptions}
                onChange={(partId) =>
                  updateDraft({ repertoirePartId: partId || undefined })
                }
              />
            </div>
          )}
        </div>
      );
    }

    if (draft.skill === "technique") {
      return (
        <div className="text-xs text-muted">
          <span className="block">{text.techniqueName}</span>
          <button
            type="button"
            onClick={() => setPicker("technique")}
            aria-label={`${text.techniqueName}: ${
              draft.name.trim() || text.selectTechnique
            }`}
            className={pickerTriggerClass}
          >
            <span className="min-w-0 whitespace-normal break-words">
              {techniqueTriggerLabel}
            </span>
            <SearchIcon className="size-4 shrink-0 text-muted" />
          </button>
          {!draft.name.trim() && (
            <span className="mt-2 block text-xs text-red-300" role="status">
              {text.missingTechnique}
            </span>
          )}
        </div>
      );
    }

    if (draft.skill === "theory") {
      return (
        <div className="text-xs text-muted">
          <span className="block">{text.theoryTopic}</span>
          <button
            type="button"
            onClick={() => setPicker("theory")}
            aria-label={`${text.theoryTopic}: ${
              draft.name.trim() || text.selectTheoryTopic
            }`}
            className={pickerTriggerClass}
          >
            <span className="min-w-0 whitespace-normal break-words">
              {theoryTriggerLabel}
            </span>
            <SearchIcon className="size-4 shrink-0 text-muted" />
          </button>
          {!draft.name.trim() && (
            <span className="mt-2 block text-xs text-red-300" role="status">
              {text.missingTheoryTopic}
            </span>
          )}
        </div>
      );
    }

    if (draft.skill === "lick") {
      return (
        <div className="text-xs text-muted">
          <span className="block">{text.lick}</span>
          <SelectField
            className="mt-1"
            value={draft.lickId ?? ""}
            ariaLabel={text.lick}
            options={lickOptions}
            onChange={changeLick}
          />
          {!selectedLick && (
            <span className="mt-2 block text-xs text-red-300" role="status">
              {draft.lickId ? text.missingReference : text.missingLickLink}
            </span>
          )}
        </div>
      );
    }

    return (
      <label className="block text-xs text-muted">
        {text.phaseName}
        <TextField
          value={draft.name}
          maxLength={80}
          onChange={(event) => updateDraft({ name: event.target.value })}
          placeholder={skills.technique}
          className="mt-1"
        />
      </label>
    );
  }

  return (
    <>
      <ModalDialog
        dialogRef={dialogRef}
        labelledBy={titleId}
        onCancel={handleCancel}
        isClosing={isClosing}
        variant="lg"
      >
        <div className="p-5 sm:p-6">
          <DialogHeader
            titleId={titleId}
            title={text.editBlockTitle}
            description={text.editBlockDescription}
            onClose={onClose}
            closeLabel={text.closeEditBlock}
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="text-xs text-muted">
              <span className="block">{text.category}</span>
              <SelectField
                className="mt-1"
                value={draft.skill}
                ariaLabel={text.category}
                options={PRACTICE_SKILLS.map((skill) => ({
                  value: skill,
                  label: skills[skill],
                }))}
                onChange={changeSkill}
              />
            </div>
            <label className="block text-xs text-muted">
              {text.duration}
              <TextField
                type="number"
                min={1}
                max={240}
                step={1}
                inputMode="numeric"
                value={durationValue}
                onChange={(event) => {
                  setDurationValue(event.target.value);
                  setError(null);
                }}
                className="mt-1"
              />
            </label>
          </div>

          <div className="mt-4">{renderContentField()}</div>

          <div className="mt-5">
            <PracticeExerciseEditor
              exercises={draft.exercises ?? []}
              onChange={(exercises) => updateDraft({ exercises })}
            />
          </div>

          <label className="mt-5 block text-xs text-muted">
            {text.blockNotes}
            <TextArea
              value={draft.notes ?? ""}
              onChange={(event) => updateDraft({ notes: event.target.value })}
              placeholder={text.notesPlaceholder}
              className="mt-1"
            />
          </label>

          {error && (
            <FormMessage className="mt-4" aria-live="polite">
              {error}
            </FormMessage>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5">
            <Button type="button" onClick={onClose}>
              {text.cancel}
            </Button>
            <Button type="button" variant="primary" onClick={handleSubmit}>
              {text.saveBlock}
            </Button>
          </div>
        </div>
      </ModalDialog>

      <SongPickerDialog
        open={picker === "song"}
        songs={songs}
        selectedSongId={draft.repertoireItemId}
        onSelect={changeSong}
        onSelectCatalog={changeCatalogSong}
        onClose={() => setPicker(null)}
      />
      <TechniquePickerDialog
        open={picker === "technique"}
        selectedTechnique={draft.name.trim()}
        onSelect={(technique) => updateDraft({ name: technique })}
        onClose={() => setPicker(null)}
      />
      <TheoryPickerDialog
        open={picker === "theory"}
        selectedTheory={draft.name.trim()}
        onSelect={(theory) => updateDraft({ name: theory })}
        onClose={() => setPicker(null)}
      />
    </>
  );
}

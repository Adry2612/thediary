"use client";

import { memo } from "react";
import Link from "next/link";
import { PracticeExerciseEditor } from "@/components/practice/PracticeExerciseEditor";
import { PracticeBlockLinkFields } from "@/components/practice/PracticeBlockLinkFields";
import { PracticeResourceEditor } from "@/components/practice/PracticeResourceEditor";
import { Button } from "@/components/ui/Button";
import { Block } from "@/components/ui/Block";
import { TextField } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import {
  PRACTICE_SKILLS,
  type PracticePhase,
  type RepertoireItem,
} from "@/types/practice";
import type { GuitarLick } from "@/types/lick";
import { applySkillChange } from "@/utils/practice-block-editor";
import { useI18nSection } from "@/i18n/I18nProvider";

interface PracticePhaseEditorProps {
  phase: PracticePhase;
  index: number;
  repertoireItems: RepertoireItem[];
  licks: GuitarLick[];
  onChange: (
    phaseId: PracticePhase["id"],
    changes: Partial<PracticePhase>,
  ) => void;
  onRemove: (phaseId: PracticePhase["id"]) => void;
}

export const PracticePhaseEditor = memo(function PracticePhaseEditor({
  phase,
  index,
  repertoireItems,
  licks,
  onChange,
  onRemove,
}: PracticePhaseEditorProps) {
  const text = useI18nSection("practice");
  const skills = useI18nSection("skills");
  const songs = repertoireItems.filter((item) => item.kind === "song");
  const selectedSong = repertoireItems.find(
    (item) => item.id === phase.repertoireItemId && item.kind === "song",
  );

  function changeSkill(value: string) {
    const skill = PRACTICE_SKILLS.find((candidate) => candidate === value);
    if (skill) onChange(phase.id, applySkillChange(phase, skill));
  }

  return (
    <Block as="fieldset">
      <legend className="sr-only">
        {selectedSong?.title || phase.name || text.phase} de práctica
      </legend>
      <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
        <p className="text-xs uppercase tracking-[0.12em] text-muted">
          {text.currentBlock} {String(index + 1).padStart(2, "0")}
        </p>
        <span className="font-mono text-xs text-accent-green-fg">
          {phase.durationMinutes} min
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <PracticeBlockLinkFields
          index={index}
          value={phase}
          songs={songs}
          licks={licks}
          onChange={(changes) => onChange(phase.id, changes)}
        />
        <label className="text-xs text-muted">
          {text.duration}
          <TextField
            type="number"
            min={1}
            max={240}
            step={1}
            value={phase.durationMinutes}
            onChange={(event) =>
              onChange(phase.id, {
                durationMinutes: Number(event.target.value),
              })
            }
            className="mt-1 font-mono"
          />
        </label>
        <div className="text-xs text-muted">
          <span className="block">{text.category}</span>
          <SelectField
            className="mt-1"
            value={phase.skill}
            ariaLabel={`${text.category} ${index + 1}`}
            onChange={changeSkill}
            options={PRACTICE_SKILLS.map((skill) => ({
              value: skill,
              label: skills[skill],
            }))}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            onClick={() => onRemove(phase.id)}
            aria-label={`${text.removeBlock} ${
              selectedSong?.title || phase.name || text.phase
            }`}
            size="field"
            className="px-3"
          >
            {text.removeBlock}
          </Button>
        </div>
      </div>

      {phase.skill === "lick" && licks.length === 0 ? (
        <span className="mt-3 block text-xs leading-relaxed text-muted">
          {text.noLicksHelp}{" "}
          <Link
            href="/licks"
            className="text-ink underline decoration-line underline-offset-4"
          >
            {text.lick}
          </Link>{" "}
          {text.linkHelpSuffix}
        </span>
      ) : null}

      <div className="mt-5">
        <PracticeExerciseEditor
          exercises={phase.exercises ?? []}
          onChange={(exercises) => onChange(phase.id, { exercises })}
        />
      </div>

      <div className="mt-5">
        <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
          <PracticeResourceEditor
            phaseId={phase.id}
            resources={phase.resources ?? []}
            onChange={onChange}
          />
        </div>
      </div>
    </Block>
  );
});

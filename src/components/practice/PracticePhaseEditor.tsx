'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { PracticeExerciseEditor } from '@/components/practice/PracticeExerciseEditor';
import { PracticeResourceEditor } from '@/components/practice/PracticeResourceEditor';
import { SongPickerDialog } from '@/components/practice/SongPickerDialog';
import { TechniquePickerDialog } from '@/components/practice/TechniquePickerDialog';
import { Button } from '@/components/ui/Button';
import { Block } from '@/components/ui/Block';
import { TextField } from '@/components/ui/Field';
import { SelectField } from '@/components/ui/SelectField';
import { SearchIcon } from '@/components/ui/icons';
import {
  PRACTICE_SKILLS,
  type PracticePhase,
  type PracticeSkill,
  type RepertoireItem,
} from '@/types/practice';
import type { GuitarLick } from '@/types/lick';
import { LICK_TECHNIQUES } from '@/utils/licks/techniques';
import {
  applySkillChange,
  getLickOptions,
  getRepertoirePartOptions,
  getRepertoireSongChanges,
  getTechniqueNames,
  shouldAdoptLinkedTitle,
} from '@/utils/practice-block-editor';
import { useI18nSection } from '@/i18n/I18nProvider';

interface PracticePhaseEditorProps {
  phase: PracticePhase;
  index: number;
  repertoireItems: RepertoireItem[];
  licks: GuitarLick[];
  onChange: (
    phaseId: PracticePhase['id'],
    changes: Partial<PracticePhase>,
  ) => void;
  onRemove: (phaseId: PracticePhase['id']) => void;
}

const pickerTriggerClass =
  'mt-1 flex h-auto min-h-12 w-full items-center justify-between gap-3 border border-line bg-canvas px-4 py-3 text-left font-mono text-sm leading-tight text-ink transition hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg';

export const PracticePhaseEditor = memo(function PracticePhaseEditor({
  phase,
  index,
  repertoireItems,
  licks,
  onChange,
  onRemove,
}: PracticePhaseEditorProps) {
  const text = useI18nSection('practice');
  const skills = useI18nSection('skills');
  const licksText = useI18nSection('licks');
  const [isSongPickerOpen, setIsSongPickerOpen] = useState(false);
  const [isTechniquePickerOpen, setIsTechniquePickerOpen] = useState(false);
  const selectedSong = repertoireItems.find(
    (item) => item.id === phase.repertoireItemId && item.kind === 'song',
  );
  const selectedLick = licks.find((lick) => lick.id === phase.lickId);
  const songs = repertoireItems.filter((item) => item.kind === 'song');
  const songTriggerLabel = selectedSong?.title ?? text.selectSong;
  const techniqueLabels = LICK_TECHNIQUES.map(
    (technique) => licksText[technique.labelKey],
  ).filter(Boolean);

  const partOptions = getRepertoirePartOptions(
    selectedSong,
    text.noPart,
    phase.repertoirePartId,
    text.missingReference,
  );
  const lickOptions = getLickOptions(
    licks,
    text.selectLick,
    phase.lickId,
    text.missingReference,
  );
  const techniqueNames = getTechniqueNames(techniqueLabels, phase.name);

  function changeSkill(value: string) {
    const skill = PRACTICE_SKILLS.find((candidate) => candidate === value);
    if (skill) onChange(phase.id, applySkillChange(phase, skill));
  }

  function changeSong(song: RepertoireItem) {
    onChange(phase.id, getRepertoireSongChanges(song));
  }

  function changeLick(lickId: string) {
    const nextLick = licks.find((lick) => lick.id === lickId);
    const changes: Partial<PracticePhase> = { lickId: nextLick?.id };
    if (nextLick && shouldAdoptLinkedTitle(phase.name, selectedLick?.title)) {
      changes.name = nextLick.title;
    }
    onChange(phase.id, changes);
  }

  return (
    <>
      <Block as='fieldset'>
        <legend className='sr-only'>
          {selectedSong?.title || phase.name || text.phase} de práctica
        </legend>
        <div className='mb-5 flex items-center justify-between border-b border-line pb-3'>
          <p className='text-xs uppercase tracking-[0.12em] text-muted'>
            {text.currentBlock} {String(index + 1).padStart(2, '0')}
          </p>
          <span className='font-mono text-xs text-accent-green-fg'>
            {phase.durationMinutes} min
          </span>
        </div>
        <div className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_11rem_auto]'>
          {phase.skill === 'technique' ? (
            <div className='text-xs text-muted'>
              <span className='block'>{text.techniqueName}</span>
              <button
                type='button'
                onClick={() => setIsTechniquePickerOpen(true)}
                aria-label={`${text.techniqueName} ${index + 1}: ${phase.name.trim() || text.selectTechnique}`}
                className={pickerTriggerClass}
              >
                <span className='min-w-0 whitespace-normal break-words'>
                  {phase.name.trim() || text.selectTechnique}
                </span>
                <SearchIcon className='size-4 shrink-0 text-muted' />
              </button>
              {!phase.name.trim() && (
                <span
                  className='mt-2 block text-xs text-red-300'
                  role='status'
                  aria-live='polite'
                >
                  {text.missingTechnique}
                </span>
              )}
            </div>
          ) : phase.skill === 'repertoire' ? (
            <div className='text-xs text-muted'>
              <span className='block'>{text.repertoireSong}</span>
              <button
                type='button'
                onClick={() => setIsSongPickerOpen(true)}
                aria-label={`${text.repertoireSong} ${index + 1}: ${songTriggerLabel}`}
                className={pickerTriggerClass}
              >
                <span className='min-w-0 whitespace-normal break-words'>
                  {songTriggerLabel}
                </span>
                <SearchIcon className='size-4 shrink-0 text-muted' />
              </button>
              {!selectedSong && (
                <span
                  className='mt-2 block text-xs text-red-300'
                  role='status'
                  aria-live='polite'
                >
                  {phase.repertoireItemId
                    ? text.missingReference
                    : text.missingSongLink}
                </span>
              )}
              {songs.length === 0 && (
                <span className='mt-2 block leading-relaxed'>
                  {text.noSongsHelp}{' '}
                  <Link
                    href='/repertoire'
                    className='text-ink underline decoration-line underline-offset-4'
                  >
                    {text.repertoireLink}
                  </Link>{' '}
                  {text.linkHelpSuffix}
                </span>
              )}
            </div>
          ) : (
            <label className='text-xs text-muted'>
              {text.phaseName}
              <TextField
                value={phase.name}
                onChange={(event) =>
                  onChange(phase.id, { name: event.target.value })
                }
                placeholder={skills.technique}
                className='mt-1'
              />
            </label>
          )}
        <label className='text-xs text-muted'>
          {text.duration}
          <TextField
            type='number'
            min={1}
            max={240}
            step={1}
            value={phase.durationMinutes}
            onChange={(event) =>
              onChange(phase.id, {
                durationMinutes: Number(event.target.value),
              })
            }
            className='mt-1 font-mono'
          />
        </label>
        <div className='text-xs text-muted'>
          <span className='block'>{text.category}</span>
          <SelectField
            className='mt-1'
            value={phase.skill}
            ariaLabel={`${text.category} ${index + 1}`}
            onChange={changeSkill}
            options={PRACTICE_SKILLS.map((skill) => ({
              value: skill,
              label: skills[skill],
            }))}
          />
        </div>
        <div className='flex items-end'>
          <Button
            type='button'
            onClick={() => onRemove(phase.id)}
            aria-label={`${text.removeBlock} ${selectedSong?.title || phase.name || text.phase}`}
            size='field'
            className='px-3'
          >
            {text.removeBlock}
          </Button>
        </div>
      </div>

      {phase.skill === 'repertoire' && (
        <div className='mt-4 max-w-sm text-xs text-muted'>
          <span className='block'>{text.repertoirePart}</span>
          <SelectField
            className='mt-1'
            value={phase.repertoirePartId ?? ''}
            ariaLabel={`${text.repertoirePart} ${index + 1}`}
            onChange={(partId) =>
              onChange(phase.id, {
                repertoirePartId: partId || undefined,
              })
            }
            options={partOptions}
            disabled={!selectedSong}
          />
        </div>
      )}

      {phase.skill === 'lick' && (
        <div className='mt-4 text-xs text-muted'>
          <span className='block'>{text.lick}</span>
          <SelectField
            className='mt-1'
            value={phase.lickId ?? ''}
            ariaLabel={`${text.lick} ${index + 1}`}
            onChange={changeLick}
            options={lickOptions}
          />
          {!selectedLick && (
            <span
              className='mt-2 block text-xs text-red-300'
              role='status'
              aria-live='polite'
            >
              {phase.lickId ? text.missingReference : text.missingLickLink}
            </span>
          )}
          {licks.length === 0 && (
            <span className='mt-2 block leading-relaxed'>
              {text.noLicksHelp}{' '}
              <Link
                href='/licks'
                className='text-ink underline decoration-line underline-offset-4'
              >
                {text.lick}
              </Link>{' '}
              {text.linkHelpSuffix}
            </span>
          )}
        </div>
      )}

      <div className='mt-5'>
        <PracticeExerciseEditor
          exercises={phase.exercises ?? []}
          onChange={(exercises) => onChange(phase.id, { exercises })}
        />
      </div>

      <div className='mt-5'>
        <div className='mt-3 animate-in slide-in-from-top-2 duration-200'>
          <PracticeResourceEditor
            phaseId={phase.id}
            resources={phase.resources ?? []}
            onChange={onChange}
          />
        </div>
      </div>
      </Block>
      <SongPickerDialog
        open={isSongPickerOpen}
        songs={songs}
        selectedSongId={phase.repertoireItemId}
        onSelect={changeSong}
        onClose={() => setIsSongPickerOpen(false)}
      />
      <TechniquePickerDialog
        open={isTechniquePickerOpen}
        techniques={techniqueNames}
        selectedTechnique={phase.name.trim()}
        onSelect={(technique) => onChange(phase.id, { name: technique })}
        onClose={() => setIsTechniquePickerOpen(false)}
      />
    </>
  );
});

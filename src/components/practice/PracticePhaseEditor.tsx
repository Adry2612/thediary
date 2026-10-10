'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { PracticeExerciseEditor } from '@/components/practice/PracticeExerciseEditor';
import { PracticeResourceEditor } from '@/components/practice/PracticeResourceEditor';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { SelectField } from '@/components/ui/SelectField';
import {
  PRACTICE_SKILLS,
  type PracticePhase,
  type PracticeSkill,
  type RepertoireItem,
} from '@/types/practice';
import { useI18nSection } from '@/i18n/I18nProvider';

interface PracticePhaseEditorProps {
  phase: PracticePhase;
  index: number;
  repertoireItems: RepertoireItem[];
  onChange: (
    phaseId: PracticePhase['id'],
    changes: Partial<PracticePhase>,
  ) => void;
  onRemove: (phaseId: PracticePhase['id']) => void;
}

export const PracticePhaseEditor = memo(function PracticePhaseEditor({
  phase,
  index,
  repertoireItems,
  onChange,
  onRemove,
}: PracticePhaseEditorProps) {
  const text = useI18nSection('practice');
  const skills = useI18nSection('skills');
  const selectedPartExists = repertoireItems.some(
    (item) =>
      item.id === phase.repertoireItemId &&
      item.parts.some((part) => part.id === phase.repertoirePartId),
  );
  const [showMaterials, setShowMaterials] = useState(false);

  return (
    <fieldset className='rounded-lg border border-line bg-canvas/70 p-4 sm:p-6'>
       <legend className='sr-only'>{phase.name || text.phase} de práctica</legend>
      <div className='mb-5 flex items-center justify-between border-b border-line pb-3'>
        <p className='text-xs uppercase tracking-[0.12em] text-muted'>
           {text.currentBlock} {String(index + 1).padStart(2, '0')}
        </p>
        <span className='font-mono text-xs text-accent-green-fg'>
          {phase.durationMinutes} min
        </span>
      </div>
      <div className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_11rem_auto]'>
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
            onChange={(value) => {
              const skill = PRACTICE_SKILLS.find(
                (candidate) => candidate === value,
              );
              if (skill) onChange(phase.id, { skill });
            }}
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
             aria-label={`${text.removeBlock} ${phase.name || text.phase}`}
             size='field'
             className='px-3'
          >
             {text.removeBlock}
          </Button>
        </div>
      </div>

      <div className='mt-4 block text-xs text-muted'>
         <span className='block'>{text.repertoirePart}</span>
        <SelectField
          className='mt-1'
          value={phase.repertoirePartId ?? ''}
           ariaLabel={`${text.repertoirePart} ${index + 1}`}
          onChange={(selectedPartId) => {
            const item = repertoireItems.find((candidate) =>
              candidate.parts.some((part) => part.id === selectedPartId),
            );
            const part = item?.parts.find(
              (candidate) => candidate.id === selectedPartId,
            );
            onChange(phase.id, {
              repertoireItemId: item?.id,
              repertoirePartId: part?.id,
            });
          }}
          options={[
             { value: '', label: text.unlinked },
            ...(phase.repertoirePartId && !selectedPartExists ?
              [
                {
                  value: phase.repertoirePartId,
                   label: text.missingReference,
                  disabled: true,
                },
              ]
            : []),
            ...repertoireItems.flatMap((item) =>
              item.parts.map((part) => ({
                value: part.id,
                label: `${item.title} · ${part.name}`,
              })),
            ),
          ]}
        />
        {repertoireItems.length === 0 && (
          <span className='mt-2 block leading-relaxed'>
            Añade canciones o licks desde{' '}
            <Link
              href='/repertoire'
              className='text-ink underline decoration-line underline-offset-4'
            >
               {text.repertoirePart}
            </Link>{' '}
            para poder registrar el tiempo por parte.
          </span>
        )}
      </div>

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
    </fieldset>
  );
});

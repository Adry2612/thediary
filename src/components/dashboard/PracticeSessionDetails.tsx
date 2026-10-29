'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EditIcon, TrashIcon } from '@/components/ui/icons';
import { PracticeRecordingItem } from '@/components/practice/PracticeRecordingItem';
import { PracticeSessionPhases } from '@/components/dashboard/PracticeSessionPhases';
import { formatClock } from '@/utils/format';
import { getPracticeMetricLabelKey } from '@/utils/practice-metrics';
import { useI18nSection } from '@/i18n/I18nProvider';
import type { PracticeAudioRecording } from "@/types/practice-library";
import type { RepertoireItem, SessionRecord } from '@/types/practice';
import type { GuitarLick } from '@/types/lick';

interface PracticeSessionDetailsProps {
  session: SessionRecord;
  sessionRecordings: PracticeAudioRecording[];
  recordingsLoading?: boolean;
  repertoireItems: RepertoireItem[];
  licks: GuitarLick[];
  onDeleteRecording: (recordingId: string) => void;
  onEdit?: (session: SessionRecord) => void;
  onDelete?: (sessionId: string) => void;
}

function formatSessionTime(startedAt: string) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(startedAt));
}

export function PracticeSessionDetails({
  session,
  sessionRecordings,
  recordingsLoading = false,
  repertoireItems,
  licks,
  onDeleteRecording,
  onEdit,
  onDelete,
}: PracticeSessionDetailsProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const text = useI18nSection('practice');
  const metrics = [
    session.mood ?
      {
        metric: 'mood' as const,
        title: text.metricMood,
        value: session.mood,
        label: text[getPracticeMetricLabelKey('mood', session.mood)],
      }
    : null,
    session.focus ?
      {
        metric: 'focus' as const,
        title: text.metricFocus,
        value: session.focus,
        label: text[getPracticeMetricLabelKey('focus', session.focus)],
      }
    : null,
  ].filter((metric) => metric !== null);
  const status =
    session.completed === undefined ? text.statusRegistered
    : session.completed ? text.statusCompleted
    : text.statusFinishedEarly;

  return (
    <article className='rounded-xl border border-line bg-surface p-6 sm:p-8'>
      <header className='flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5'>
        <div>
          <p className='font-mono text-xs uppercase tracking-[0.08em] text-muted'>
            {formatSessionTime(session.startedAt)} · {status}
          </p>
          <h2 className='mt-2 text-xl font-semibold text-ink sm:text-2xl'>
            {session.title || 'Sesión de práctica'}
          </h2>
        </div>
        <div className='flex flex-col items-start gap-3 sm:items-end'>
          <div className='text-left sm:text-right'>
            <p className='text-xs uppercase tracking-[0.1em] text-muted'>
              Tiempo real
            </p>
            <p className='mt-1 font-mono text-xl tabular-nums text-ink sm:text-2xl'>
              {formatClock(session.durationSeconds)}
            </p>
          </div>
          {(onEdit || onDelete) && (
            <div className='flex flex-wrap items-center gap-2'>
              {onEdit && (
                <button
                  type='button'
                  onClick={() => onEdit(session)}
                  className='inline-flex min-h-9 items-center gap-2 rounded-md border border-line px-3 text-xs text-ink transition hover:bg-white/5'
                >
                  <EditIcon className='size-4' />
                  Editar
                </button>
              )}
              {onDelete &&
                (isConfirmingDelete ? (
                  <>
                    <button
                      type='button'
                      onClick={() => onDelete(session.id)}
                      className='inline-flex min-h-9 items-center gap-2 rounded-md border border-red-400/40 px-3 text-xs text-red-200 transition hover:bg-red-400/10'
                    >
                      <TrashIcon className='size-4' />
                      Confirmar borrado
                    </button>
                    <button
                      type='button'
                      onClick={() => setIsConfirmingDelete(false)}
                      className='inline-flex min-h-9 items-center rounded-md border border-line px-3 text-xs text-muted transition hover:bg-white/5'
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type='button'
                    onClick={() => setIsConfirmingDelete(true)}
                    className='inline-flex min-h-9 items-center gap-2 rounded-md border border-line px-3 text-xs text-red-300 transition hover:bg-red-400/10'
                  >
                    <TrashIcon className='size-4' />
                    Eliminar
                  </button>
                ))}
            </div>
          )}
        </div>
      </header>

      {metrics.length > 0 && (
        <section
          aria-label={text.completionWellbeing}
          className='mt-5 flex flex-wrap gap-2'
        >
          {metrics.map((metric) => (
            <p
              key={metric.metric}
              className='inline-flex items-center gap-2 rounded-full border border-line bg-canvas/50 px-3 py-1.5 text-sm text-ink'
            >
              <span className='text-[10px] uppercase tracking-[0.08em] text-muted'>
                {metric.title}
              </span>
              <span>{metric.label}</span>
              <span className='font-mono text-xs tabular-nums text-muted'>
                {metric.value}/5
              </span>
            </p>
          ))}
        </section>
      )}

      <PracticeSessionPhases
        sessionId={session.id}
        phases={session.phases}
        repertoireItems={repertoireItems}
        licks={licks}
      />

      <section
        aria-labelledby={`session-recordings-${session.id}`}
        className='mt-8'
      >
        <div className='flex flex-wrap items-baseline justify-between gap-3'>
          <h3
            id={`session-recordings-${session.id}`}
            className='text-base font-semibold text-ink'
          >
            Grabaciones
          </h3>
          <Link
            href='/recordings'
            className='text-xs text-muted underline underline-offset-4 hover:text-ink'
          >
            Ver todas
          </Link>
        </div>
        {recordingsLoading ?
          <div className='mt-3 space-y-3' aria-busy='true' aria-label='Cargando grabaciones'>
            {Array.from({ length: 1 }, (_, index) => (
              <div key={index} className='rounded-lg border border-line bg-canvas/60 p-4'>
                <span className='block h-4 w-44 max-w-full animate-pulse rounded-md bg-white/[0.08]' />
                <span className='mt-2 block h-3 w-56 max-w-full animate-pulse rounded-md bg-white/[0.08]' />
                <span className='mt-4 block h-10 w-full animate-pulse rounded-md bg-white/[0.08]' />
              </div>
            ))}
          </div>
        : sessionRecordings.length > 0 ?
          <ul className='mt-3 space-y-3'>
            {sessionRecordings.map((recording) => (
              <PracticeRecordingItem
                key={recording.id}
                recording={recording}
                onDelete={onDeleteRecording}
              />
            ))}
          </ul>
        : <p className='mt-3 text-sm text-muted'>
            No hay grabaciones asociadas a esta sesión.
          </p>
        }
      </section>

      <section
        aria-labelledby={`session-notes-${session.id}`}
        className='mt-8 border-t border-line pt-6'
      >
        <h3
          id={`session-notes-${session.id}`}
          className='text-base font-semibold text-ink'
        >
          Notas de la sesión
        </h3>
        {session.notes ?
          <p className='mt-3 whitespace-pre-wrap border border-line bg-canvas/70 px-4 py-4 text-sm leading-7 text-ink'>
            {session.notes}
          </p>
        : <p className='mt-2 text-sm leading-relaxed text-muted'>
            No se añadieron notas a esta sesión.
          </p>
        }
      </section>
    </article>
  );
}

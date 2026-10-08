'use client';

import Link from 'next/link';
import { PracticeRecordingItem } from '@/components/practice/PracticeRecordingItem';
import { PracticeSessionPhases } from '@/components/dashboard/PracticeSessionPhases';
import { formatClock } from '@/lib/format';
import type { PracticeAudioRecording } from '@/lib/practice-library';
import type { RepertoireItem, SessionRecord } from '@/types/practice';

interface PracticeSessionDetailsProps {
  session: SessionRecord;
  sessionRecordings: PracticeAudioRecording[];
  repertoireItems: RepertoireItem[];
  onDeleteRecording: (recordingId: string) => void;
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
  repertoireItems,
  onDeleteRecording,
}: PracticeSessionDetailsProps) {
  const status =
    session.completed === undefined ? 'Registrada'
    : session.completed ? 'Completada'
    : 'Finalizada antes de completar la rutina';

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
        <div className='text-left sm:text-right'>
          <p className='text-xs uppercase tracking-[0.1em] text-muted'>
            Tiempo real
          </p>
          <p className='mt-1 font-mono text-xl tabular-nums text-ink sm:text-2xl'>
            {formatClock(session.durationSeconds)}
          </p>
        </div>
      </header>

      <PracticeSessionPhases
        sessionId={session.id}
        phases={session.phases}
        repertoireItems={repertoireItems}
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
        {sessionRecordings.length > 0 ?
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

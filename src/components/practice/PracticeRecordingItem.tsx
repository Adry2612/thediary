'use client';

import { useEffect, useState } from 'react';
import { PracticeAudioPlayer } from '@/components/practice/PracticeAudioPlayer';
import { PRACTICE_SKILL_LABELS } from '@/lib/dashboard-data';
import type { PracticeAudioRecording } from '@/lib/practice-library';
import { useI18n, useI18nSection } from '@/i18n/I18nProvider';

interface PracticeRecordingItemProps {
  recording: PracticeAudioRecording;
  onDelete: (recordingId: string) => void;
}

function useRecordingUrl(recording: PracticeAudioRecording) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (recording.playbackUrl) {
      setUrl(recording.playbackUrl);
      return;
    }
    if (!recording.blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(recording.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [recording.blob, recording.playbackUrl]);

  return url;
}

export function PracticeRecordingItem({
  recording,
  onDelete,
}: PracticeRecordingItemProps) {
  const audioUrl = useRecordingUrl(recording);
  const { locale } = useI18n();
  const text = useI18nSection('recordings');
  const date = new Date(recording.createdAt).toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <li className='rounded-lg border border-line bg-canvas/60 p-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>{recording.title}</p>
          <p className='mt-1 text-xs text-muted'>
            {recording.sessionName} · {date}
          </p>
          <p className='mt-1 text-xs text-muted'>
            {recording.phaseOrder ? `${recording.phaseOrder} · ` : ''}
            {recording.phaseName ?? text.unassignedBlock}
          </p>
          <p className='mt-1 text-xs text-muted'>
            {recording.practiceSkill ?
              PRACTICE_SKILL_LABELS[recording.practiceSkill]
            : text.unassignedType}
          </p>
        </div>
        <button
          type='button'
          onClick={() => onDelete(recording.id)}
          aria-label={`${text.delete} ${recording.title}`}
          title={text.delete}
          className='inline-flex size-10 shrink-0 items-center justify-center rounded-md text-red-300 transition hover:bg-red-400/10 hover:text-red-200focus-visible:outline-red-300'
        >
          <svg
            aria-hidden='true'
            className='size-5'
            viewBox='0 0 20 20'
            fill='none'
          >
            <path
              d='M4.5 6h11m-9.5 0 .6 10h7.8l.6-10M8 6V4h4v2m-3 3v4m2-4v4'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.5'
            />
          </svg>
        </button>
      </div>
      {audioUrl && (
        <div className='mt-4 border-t border-line pt-4'>
          <PracticeAudioPlayer
            src={audioUrl}
            title={recording.title}
            durationSeconds={recording.durationSeconds}
          />
        </div>
      )}
    </li>
  );
}

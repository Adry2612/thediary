'use client';

import { useState } from 'react';
import { PracticeAudioPlayer } from '@/components/practice/PracticeAudioPlayer';
import { useRecordingUrl } from '@/hooks/useRecordingUrl';
import { useRecordingPeaks } from '@/hooks/useRecordingPeaks';
import { PRACTICE_SKILL_LABELS } from '@/utils/dashboard-data';
import type { PracticeAudioRecording } from "@/types/practice-library";
import { createCloudSyncReference, type CloudSyncProvider } from '@/types/cloud-sync';
import { useCloudRecordingSync } from '@/hooks/useCloudRecordingSync';
import { CloudSyncProviderIcon, TrashIcon } from '@/components/ui/icons';
import { useI18n, useI18nSection } from '@/i18n/I18nProvider';

interface PracticeRecordingItemProps {
  recording: PracticeAudioRecording;
  onDelete: (recordingId: string) => void;
  onUpdate?: (recording: PracticeAudioRecording) => void;
}

export function PracticeRecordingItem({
  recording,
  onDelete,
  onUpdate,
}: PracticeRecordingItemProps) {
  const audioUrl = useRecordingUrl(recording);
  const peaks = useRecordingPeaks(recording.id, recording.blob);
  const { locale } = useI18n();
  const text = useI18nSection('recordings');
  const { statuses, isLoading: isLoadingProviders, connect, syncRecording } =
    useCloudRecordingSync();
  const [isSyncMenuOpen, setIsSyncMenuOpen] = useState(false);
  const [syncingProvider, setSyncingProvider] = useState<CloudSyncProvider | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [connectionFeedback, setConnectionFeedback] = useState<
    'success' | 'error' | null
  >(null);
  const date = new Date(recording.createdAt).toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  async function handleSync(provider: CloudSyncProvider) {
    const status = statuses.find((item) => item.provider === provider);
    if (!status?.enabled) {
      setSyncError(text.providerUnavailable);
      setConnectionFeedback('error');
      return;
    }
    if (!status.connected) {
      try {
        await connect(provider);
        setConnectionFeedback('success');
      } catch (error) {
        setConnectionFeedback('error');
        setSyncError(
          `${text.connectionFailed} ${provider === 'google-drive' ? text.googleDrive : text.onedrive}. ${error instanceof Error ? error.message : ''}`,
        );
        return;
      }
    }
    setSyncingProvider(provider);
    setSyncError(null);
    try {
      const result = await syncRecording(provider, recording);
      onUpdate?.({
        ...recording,
        cloudSync: {
          ...recording.cloudSync,
          [provider]: {
            ...(recording.cloudSync?.[provider] ??
              createCloudSyncReference(provider, true)),
            status: 'synced',
            remoteFileId: result.remoteFileId,
            remoteManifestId: result.remoteManifestId,
            updatedAt: new Date().toISOString(),
            errorCode: undefined,
            errorMessage: undefined,
          },
        },
      });
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : text.syncError);
    } finally {
      setSyncingProvider(null);
    }
  }

  function syncStatus(provider: CloudSyncProvider): string {
    const providerStatus = statuses.find((item) => item.provider === provider);
    if (!providerStatus?.enabled) return text.providerUnavailable;
    if (!providerStatus.connected) return text.syncNotConnected;
    const status = recording.cloudSync?.[provider]?.status ?? 'not-synced';
    if (syncingProvider === provider || status === 'uploading') return text.syncInProgress;
    if (status === 'synced') return text.syncComplete;
    if (status === 'error') return text.syncError;
    return text.syncNotSynced;
  }

  return (
    <li className='rounded-lg border border-line bg-canvas/60 p-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>{recording.title}</p>
          <p className='mt-1 text-xs text-muted'>
            {recording.sessionName} · {date}
          </p>
          <div className='mt-2 flex flex-wrap gap-1.5'>
            <span className='rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-muted'>
              {recording.phaseOrder ? `${recording.phaseOrder} · ` : ''}
              {recording.phaseName ?? text.unassignedBlock}
            </span>
            <span className='rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-muted'>
              {recording.practiceSkill ?
                PRACTICE_SKILL_LABELS[recording.practiceSkill]
              : text.unassignedType}
            </span>
          </div>
        </div>
        <div className='flex shrink-0 items-center gap-1'>
          <button
            type='button'
            onClick={() => {
              setSyncError(null);
              setConnectionFeedback(null);
              setIsSyncMenuOpen((current) => !current);
            }}
            aria-expanded={isSyncMenuOpen}
            aria-haspopup='menu'
            aria-label={`${text.sync} ${recording.title}`}
            title={text.sync}
            className='inline-flex size-10 items-center justify-center rounded-md text-ink transition hover:bg-white/10 focus-visible:outline-ink'
          >
            <svg aria-hidden='true' className='size-5' viewBox='0 0 20 20' fill='none'>
              <path d='M5 7.5A6 6 0 0 1 15.5 6L17 7.5M15 12.5A6 6 0 0 1 4.5 14L3 12.5' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' />
              <path d='M17 4.5v3h-3M3 15.5v-3h3' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' />
            </svg>
          </button>
          <button
            type='button'
            onClick={() => onDelete(recording.id)}
            aria-label={`${text.delete} ${recording.title}`}
            title={text.delete}
            className='inline-flex size-10 items-center justify-center rounded-md text-red-300 transition hover:bg-red-400/10 hover:text-red-200 focus-visible:outline-red-300'
          >
            <TrashIcon className='size-5' />
          </button>
        </div>
      </div>
      {isSyncMenuOpen && (
        <div className='mt-4 rounded-md border border-line bg-canvas p-3' role='menu' aria-label={text.syncOptions}>
          <p className='text-xs font-medium text-muted'>{text.syncOptions}</p>
          <div className='mt-2 grid gap-2 sm:grid-cols-2'>
            {(['google-drive', 'onedrive'] as const).map((provider) => {
              const label = provider === 'google-drive' ? text.googleDrive : text.onedrive;
              return (
                <button
                  key={provider}
                  type='button'
                  role='menuitem'
                  disabled={isLoadingProviders || syncingProvider !== null}
                  onClick={() => void handleSync(provider)}
                  className='flex min-h-11 items-center justify-between rounded-md border border-line px-3 text-left text-sm text-ink transition hover:bg-white/5 disabled:opacity-50'
                >
                  <span className='flex items-center gap-2'>
                    <CloudSyncProviderIcon provider={provider} className='size-5' />
                    {label}
                  </span>
                  <span className='ml-3 text-xs text-muted'>{syncStatus(provider)}</span>                </button>
              );
            })}
          </div>
          {syncError && <p className='mt-2 text-xs text-accent-red-fg' role='alert'>{syncError}</p>}
          {connectionFeedback === 'success' && (
            <p className='mt-2 text-xs text-accent-green-fg' role='status'>
              {text.connectionSuccess}
            </p>
          )}
        </div>
      )}
      {audioUrl && (
        <div className='mt-4 min-w-0 border-t border-line pt-4'>
          <PracticeAudioPlayer
            src={audioUrl}
            title={recording.title}
            durationSeconds={recording.durationSeconds}
            peaks={peaks ?? undefined}
            seekStepSeconds={5}
          />
        </div>
      )}
    </li>
  );
}

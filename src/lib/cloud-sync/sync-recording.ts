import {
  savePracticeRecording,
  type PracticeAudioRecording,
} from '../practice-library.ts';
import {
  normalizeCloudProviderError,
  type CloudProviderAdapter,
} from './provider.ts';
import { createCloudSyncReference, type CloudSyncProvider } from './types.ts';
import { updateCloudSyncReference } from './state.ts';

export type PersistRecording = (
  recording: PracticeAudioRecording,
) => Promise<unknown>;

function withReference(
  recording: PracticeAudioRecording,
  provider: CloudSyncProvider,
  connected: boolean,
): PracticeAudioRecording {
  const existing = recording.cloudSync?.[provider];
  const reference =
    existing && connected && existing.status === 'not-connected' ?
      { ...existing, status: 'not-synced' as const }
    : existing;
  return {
    ...recording,
    cloudSync: {
      ...(recording.cloudSync ?? {}),
      [provider]:
        reference ??
        createCloudSyncReference(provider, connected, recording.createdAt),
    },
  };
}

export async function synchronizePracticeRecording(
  recording: PracticeAudioRecording,
  adapter: CloudProviderAdapter,
  persist: PersistRecording = savePracticeRecording,
): Promise<PracticeAudioRecording> {
  if (!recording.blob || recording.blob.size === 0) {
    const failed = withReference(recording, adapter.provider, true);
    failed.cloudSync = {
      ...failed.cloudSync,
      [adapter.provider]: updateCloudSyncReference(
        failed.cloudSync![adapter.provider]!,
        {
          status: 'error',
          errorCode: 'missing-audio',
          errorMessage: 'No se encontró el archivo de audio de esta grabación.',
        },
      ),
    };
    await persist(failed);
    throw new Error('No se encontró el archivo de audio de esta grabación.');
  }

  let current = withReference(recording, adapter.provider, true);
  const reference = current.cloudSync![adapter.provider]!;
  current = {
    ...current,
    cloudSync: {
      ...current.cloudSync,
      [adapter.provider]: updateCloudSyncReference(reference, {
        status: 'uploading',
        progress: 0,
      }),
    },
  };
  await persist(current);

  try {
    const result = await adapter.uploadRecording({
      recording: current,
      blob: recording.blob,
      existingRemoteFileId: reference.remoteFileId,
      existingRemoteManifestId: reference.remoteManifestId,
      onProgress: ({ uploadedBytes, totalBytes }) => {
        const progress =
          totalBytes > 0 ? (uploadedBytes / totalBytes) * 100 : 100;
        current = {
          ...current,
          cloudSync: {
            ...current.cloudSync,
            [adapter.provider]: updateCloudSyncReference(
              current.cloudSync![adapter.provider]!,
              { status: 'uploading', progress },
            ),
          },
        };
        void persist(current);
      },
    });
    current = {
      ...current,
      cloudSync: {
        ...current.cloudSync,
        [adapter.provider]: updateCloudSyncReference(
          current.cloudSync![adapter.provider]!,
          {
            status: 'synced',
            remoteFileId: result.remoteFileId,
            remoteManifestId: result.remoteManifestId,
          },
        ),
      },
    };
    await persist(current);
    return current;
  } catch (error) {
    const providerError = normalizeCloudProviderError(error);
    current = {
      ...current,
      cloudSync: {
        ...current.cloudSync,
        [adapter.provider]: updateCloudSyncReference(
          current.cloudSync![adapter.provider]!,
          {
            status: 'error',
            errorCode: providerError.code,
            errorMessage: providerError.message,
          },
        ),
      },
    };
    await persist(current);
    throw providerError;
  }
}

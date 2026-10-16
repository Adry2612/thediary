import type { PracticeAudioRecording } from "../practice-library.ts";
import type { CloudProviderAdapter, RemoteCloudRecording } from "./provider.ts";
import { createCloudSyncReference } from "./types.ts";
import { updateCloudSyncReference } from "./state.ts";
import type { CloudSyncProvider } from "./types.ts";

export async function reconcileCloudRecordings(
  localRecordings: PracticeAudioRecording[],
  adapter: CloudProviderAdapter,
  persist?: (recording: PracticeAudioRecording) => Promise<unknown>,
): Promise<PracticeAudioRecording[]> {
  const remoteRecordings = await adapter.listManagedRecordings();
  const localById = new Map(localRecordings.map((recording) => [recording.id, recording]));
  const reconciled = [...localRecordings];

  for (const remote of remoteRecordings) {
    const existing = localById.get(remote.metadata.id);
    const currentReference = existing?.cloudSync?.[adapter.provider] ??
      createCloudSyncReference(adapter.provider, true, remote.metadata.createdAt);
    const reference = updateCloudSyncReference(currentReference, {
      status: "synced",
      remoteFileId: remote.remoteFileId,
      remoteManifestId: remote.remoteManifestId,
    });

    if (existing) {
      const updated = {
        ...existing,
        cloudSync: { ...existing.cloudSync, [adapter.provider]: reference },
      };
      const index = reconciled.findIndex((recording) => recording.id === existing.id);
      reconciled[index] = updated;
      if (persist) await persist(updated);
      continue;
    }

    const remoteOnly: PracticeAudioRecording = {
      ...remote.metadata,
      playbackUrl: remote.downloadUrl,
      cloudSync: { [adapter.provider]: reference },
    };
    reconciled.push(remoteOnly);
    if (persist) await persist(remoteOnly);
  }

  return reconciled;
}

export async function reconcileCloudRecordingsSafely(
  localRecordings: PracticeAudioRecording[],
  adapter: CloudProviderAdapter,
  persist?: (recording: PracticeAudioRecording) => Promise<unknown>,
): Promise<{ recordings: PracticeAudioRecording[]; unavailable: boolean }> {
  try {
    return {
      recordings: await reconcileCloudRecordings(localRecordings, adapter, persist),
      unavailable: false,
    };
  } catch {
    return { recordings: localRecordings, unavailable: true };
  }
}

export function isRemoteRecording(recording: PracticeAudioRecording): boolean {
  return !recording.blob && Boolean(recording.playbackUrl);
}

export function mergeRemoteCatalog(
  localRecordings: PracticeAudioRecording[],
  provider: CloudSyncProvider,
  remoteRecordings: RemoteCloudRecording[],
): PracticeAudioRecording[] {
  const merged = [...localRecordings];
  const byId = new Map(merged.map((recording) => [recording.id, recording]));
  for (const remote of remoteRecordings) {
    const existing = byId.get(remote.metadata.id);
    const reference = {
      ...(existing?.cloudSync?.[provider] ??
        createCloudSyncReference(provider, true, remote.metadata.createdAt)),
      status: "synced" as const,
      remoteFileId: remote.remoteFileId,
      remoteManifestId: remote.remoteManifestId,
      updatedAt: new Date().toISOString(),
    };
    if (existing) {
      const updated = { ...existing, cloudSync: { ...existing.cloudSync, [provider]: reference } };
      merged[merged.findIndex((recording) => recording.id === existing.id)] = updated;
      byId.set(existing.id, updated);
    } else {
      const remoteOnly: PracticeAudioRecording = {
        ...remote.metadata,
        playbackUrl: remote.downloadUrl,
        cloudSync: { [provider]: reference },
      };
      merged.push(remoteOnly);
      byId.set(remoteOnly.id, remoteOnly);
    }
  }
  return merged;
}

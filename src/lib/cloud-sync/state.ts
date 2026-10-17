import type {
  CloudSyncErrorCode,
  CloudSyncReference,
  CloudSyncStatus,
} from "./types";

interface StateUpdate {
  status: CloudSyncStatus;
  now?: string;
  progress?: number;
  remoteFileId?: string;
  remoteManifestId?: string;
  errorCode?: CloudSyncErrorCode;
  errorMessage?: string;
}

const ALLOWED_TRANSITIONS: Record<CloudSyncStatus, CloudSyncStatus[]> = {
  "not-connected": ["not-connected", "not-synced", "synced"],
  "not-synced": ["not-synced", "uploading", "synced", "error", "not-connected"],
  uploading: ["uploading", "synced", "error", "not-synced"],
  synced: ["synced", "uploading", "not-synced", "not-connected", "error"],
  error: ["error", "uploading", "not-synced", "not-connected"],
};

export function updateCloudSyncReference(
  current: CloudSyncReference,
  update: StateUpdate,
): CloudSyncReference {
  if (!ALLOWED_TRANSITIONS[current.status].includes(update.status)) {
    throw new Error(
      `Transición de sincronización no válida: ${current.status} → ${update.status}`,
    );
  }

  const next: CloudSyncReference = {
    ...current,
    status: update.status,
    updatedAt: update.now ?? new Date().toISOString(),
  };

  if (update.progress !== undefined) {
    next.progress = Math.max(0, Math.min(100, update.progress));
  } else if (update.status !== "uploading") {
    delete next.progress;
  }

  if (update.remoteFileId !== undefined) next.remoteFileId = update.remoteFileId;
  if (update.remoteManifestId !== undefined) {
    next.remoteManifestId = update.remoteManifestId;
  }

  if (update.status === "error") {
    next.errorCode = update.errorCode ?? "unknown";
    next.errorMessage = update.errorMessage;
  } else {
    delete next.errorCode;
    delete next.errorMessage;
  }

  return next;
}

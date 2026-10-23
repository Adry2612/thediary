export const CLOUD_SYNC_PROVIDERS = ["google-drive", "onedrive"] as const;

export type CloudSyncProvider = (typeof CLOUD_SYNC_PROVIDERS)[number];

export type CloudSyncStatus =
  | "not-connected"
  | "not-synced"
  | "uploading"
  | "synced"
  | "error";

export type CloudSyncErrorCode =
  | "authorization-cancelled"
  | "provider-disabled"
  | "not-authorized"
  | "missing-audio"
  | "network"
  | "permission-denied"
  | "quota-exceeded"
  | "token-expired"
  | "provider-unavailable"
  | "unknown";

export interface CloudSyncReference {
  provider: CloudSyncProvider;
  status: CloudSyncStatus;
  remoteFileId?: string;
  remoteManifestId?: string;
  errorCode?: CloudSyncErrorCode;
  errorMessage?: string;
  progress?: number;
  updatedAt: string;
}

export type CloudSyncMap = Partial<
  Record<CloudSyncProvider, CloudSyncReference>
>;

export interface CloudRecordingMetadata {
  id: string;
  title: string;
  sessionName: string;
  sessionId?: string;
  practiceDate?: string;
  phaseId?: string | number;
  phaseOrder?: number;
  phaseName?: string;
  practiceSkill?: PracticeSkill;
  createdAt: string;
  durationSeconds?: number;
  mimeType: string;
}

export function createCloudSyncReference(
  provider: CloudSyncProvider,
  connected: boolean,
  now = new Date().toISOString(),
): CloudSyncReference {
  return {
    provider,
    status: connected ? "not-synced" : "not-connected",
    updatedAt: now,
  };
}
import type { PracticeSkill } from "./practice.ts";

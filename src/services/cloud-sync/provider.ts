import type {
  CloudRecordingMetadata,
  CloudSyncProvider,
} from "../../types/cloud-sync.ts";

export interface CloudProviderConnection {
  provider: CloudSyncProvider;
  connected: boolean;
  accountLabel?: string;
  connectedAt?: string;
}

export interface RemoteCloudRecording {
  provider: CloudSyncProvider;
  remoteFileId: string;
  remoteManifestId?: string;
  metadata: CloudRecordingMetadata;
  downloadUrl?: string;
}

export interface CloudUploadProgress {
  uploadedBytes: number;
  totalBytes: number;
}

export interface CloudUploadInput {
  recording: CloudRecordingMetadata;
  blob: Blob;
  existingRemoteFileId?: string;
  existingRemoteManifestId?: string;
  onProgress?: (progress: CloudUploadProgress) => void;
}

export interface CloudUploadResult {
  remoteFileId: string;
  remoteManifestId?: string;
}

export interface CloudDownloadResponse {
  status: number;
  body: ReadableStream<Uint8Array>;
  contentType: string;
  contentLength: string | null;
  contentRange: string | null;
}

export interface CloudProviderAdapter {
  readonly provider: CloudSyncProvider;
  getConnection(): Promise<CloudProviderConnection>;
  beginAuthorization(returnTo?: string): Promise<string>;
  disconnect(): Promise<void>;
  listManagedRecordings(): Promise<RemoteCloudRecording[]>;
  uploadRecording(input: CloudUploadInput): Promise<CloudUploadResult>;
  /**
   * Descarga el audio gestionado. Solo lo implementan los proveedores cuyos
   * archivos no se pueden servir con una URL preautenticada al navegador.
   */
  downloadRecording?(
    remoteFileId: string,
    range?: string,
  ): Promise<CloudDownloadResponse>;
}

export class CloudProviderError extends Error {
  readonly code:
    | "authorization-cancelled"
    | "not-authorized"
    | "permission-denied"
    | "quota-exceeded"
    | "token-expired"
    | "provider-unavailable"
    | "network"
    | "unknown";
  readonly retryable: boolean;

  constructor(
    code:
    | "authorization-cancelled"
    | "not-authorized"
    | "permission-denied"
    | "quota-exceeded"
    | "token-expired"
    | "provider-unavailable"
    | "network"
    | "unknown",
    message: string,
    retryable = false,
  ) {
    super(message);
    this.name = "CloudProviderError";
    this.code = code;
    this.retryable = retryable;
  }
}

export function normalizeCloudProviderError(error: unknown): CloudProviderError {
  if (error instanceof CloudProviderError) return error;
  if (error instanceof TypeError) {
    return new CloudProviderError("network", "No se pudo conectar con el proveedor.", true);
  }
  return new CloudProviderError(
    "unknown",
    error instanceof Error ? error.message : "No se pudo completar la operación.",
  );
}

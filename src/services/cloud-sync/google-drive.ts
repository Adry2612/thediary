import type { CloudSyncProvider } from "../../types/cloud-sync.ts";
import {
  CloudProviderError,
  type CloudDownloadResponse,
  type CloudProviderAdapter,
  type CloudProviderConnection,
  type CloudUploadInput,
  type CloudUploadResult,
  type RemoteCloudRecording,
} from "./provider.ts";
import { getCloudProviderConfigurations } from "./config.ts";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files";
const ROOT_FOLDER = "TheDiary";
const RECORDINGS_FOLDER = "Recordings";

/**
 * Los archivos gestionados solo son visibles para la app, así que el navegador
 * no puede servirlos con una URL de Drive. La reproducción pasa por un endpoint
 * de la propia app que añade el token en el servidor.
 */
function proxiedDownloadUrl(fileId: string): string {
  return `/api/cloud-sync/google-drive/recordings/audio?fileId=${encodeURIComponent(fileId)}`;
}

type FetchLike = typeof fetch;

function extensionFor(mimeType: string): string {
  if (mimeType === "audio/mp4") return "mp4";
  if (mimeType === "audio/mpeg") return "mp3";
  if (mimeType === "audio/ogg") return "ogg";
  if (mimeType === "audio/wav" || mimeType === "audio/x-wav") return "wav";
  return "webm";
}

function manifestFor(input: CloudUploadInput): string {
  return JSON.stringify({
    version: 1,
    recording: input.recording,
    audioFileId: input.existingRemoteFileId ?? null,
  });
}

async function parseResponse(response: Response): Promise<any> {
  if (response.ok) return response.status === 204 ? null : response.json();
  const body = await response.text();
  if (response.status === 401) {
    throw new CloudProviderError("token-expired", "La sesión de Google Drive ha expirado.", true);
  }
  if (response.status === 403) {
    throw new CloudProviderError("permission-denied", "Google Drive no permite esta operación.");
  }
  if (response.status === 429) {
    throw new CloudProviderError("quota-exceeded", "Google Drive ha limitado temporalmente la operación.", true);
  }
  throw new CloudProviderError("provider-unavailable", body || "Google Drive no está disponible.", true);
}

export class GoogleDriveAdapter implements CloudProviderAdapter {
  readonly provider: CloudSyncProvider = "google-drive";
  private readonly accessToken: string;
  private readonly fetchImpl: FetchLike;

  constructor(
    accessToken: string,
    fetchImpl: FetchLike = fetch,
  ) {
    this.accessToken = accessToken;
    this.fetchImpl = fetchImpl;
  }

  private async request(path: string, init: RequestInit = {}): Promise<any> {
    const response = await this.fetchImpl(`${DRIVE_API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...(init.headers ?? {}),
      },
    });
    return parseResponse(response);
  }

  async getConnection(): Promise<CloudProviderConnection> {
    const about = await this.request("/about?fields=user(displayName,emailAddress)");
    return {
      provider: this.provider,
      connected: true,
      accountLabel: about.user?.emailAddress ?? about.user?.displayName,
    };
  }

  async beginAuthorization(returnTo = "/recordings"): Promise<string> {
    const configuration = getCloudProviderConfigurations().find(
      (item) => item.provider === this.provider,
    );
    if (!configuration?.enabled || !configuration.clientId || !configuration.redirectUri) {
      throw new CloudProviderError("provider-unavailable", "Google Drive no está configurado.");
    }
    const params = new URLSearchParams({
      client_id: configuration.clientId,
      redirect_uri: configuration.redirectUri,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope: "https://www.googleapis.com/auth/drive.file",
      state: returnTo,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async disconnect(): Promise<void> {
    const response = await this.fetchImpl(
      `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(this.accessToken)}`,
      { method: "POST" },
    );
    if (!response.ok && response.status !== 400) {
      throw new CloudProviderError("provider-unavailable", "No se pudo desconectar Google Drive.");
    }
  }

  private async findOrCreateFolder(name: string, parentId?: string): Promise<string> {
    const parentClause = parentId ? ` and '${parentId}' in parents` : "";
    const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentClause}`;
    const found = await this.request(`/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=1`);
    if (found.files?.[0]?.id) return found.files[0].id;
    const created = await this.request("/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        mimeType: "application/vnd.google-apps.folder",
        ...(parentId ? { parents: [parentId] } : {}),
      }),
    });
    return created.id;
  }

  private async recordingsFolder(): Promise<string> {
    const root = await this.findOrCreateFolder(ROOT_FOLDER);
    return this.findOrCreateFolder(RECORDINGS_FOLDER, root);
  }

  private async uploadFile(
    metadata: Record<string, unknown>,
    body: Blob | string,
    mimeType: string,
    existingId?: string,
  ): Promise<any> {
    const boundary = `thediary-${crypto.randomUUID()}`;
    const content = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      JSON.stringify(metadata),
      `\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
      body,
      `\r\n--${boundary}--`,
    ]);
    const url = existingId
      ? `${DRIVE_UPLOAD_API}/${existingId}?uploadType=multipart&fields=id,appProperties,name`
      : `${DRIVE_UPLOAD_API}?uploadType=multipart&fields=id,appProperties,name`;
    return this.fetchImpl(url, {
      method: existingId ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: content,
    }).then(parseResponse);
  }

  async uploadRecording(input: CloudUploadInput): Promise<CloudUploadResult> {
    const folderId = await this.recordingsFolder();
    const extension = extensionFor(input.recording.mimeType);
    const file = await this.uploadFile(
      {
        name: `${input.recording.id}.${extension}`,
        parents: [folderId],
        appProperties: { theDiaryRecordingId: input.recording.id },
      },
      input.blob,
      input.recording.mimeType || "application/octet-stream",
      input.existingRemoteFileId,
    );
    input.onProgress?.({ uploadedBytes: input.blob.size, totalBytes: input.blob.size });
    const manifest = await this.uploadFile(
      {
        name: `${input.recording.id}.json`,
        parents: [folderId],
        appProperties: { theDiaryManifestId: input.recording.id },
      },
      manifestFor({ ...input, existingRemoteFileId: file.id }),
      "application/json",
      input.existingRemoteManifestId,
    );
    return { remoteFileId: file.id, remoteManifestId: manifest.id };
  }

  async listManagedRecordings(): Promise<RemoteCloudRecording[]> {
    const folderId = await this.recordingsFolder();
    const query = `'${folderId}' in parents and trashed=false and name contains '.json'`;
    const result = await this.request(`/files?q=${encodeURIComponent(query)}&fields=files(id,name,appProperties)&pageSize=1000`);
    const recordings: RemoteCloudRecording[] = [];
    for (const file of result.files ?? []) {
      const manifest = await this.request(`/files/${file.id}?alt=media`);
      if (!manifest?.recording?.id) continue;
      recordings.push({
        provider: this.provider,
        remoteFileId: manifest.audioFileId,
        remoteManifestId: file.id,
        downloadUrl: manifest.audioFileId
          ? proxiedDownloadUrl(manifest.audioFileId)
          : undefined,
        metadata: manifest.recording,
      });
    }
    return recordings;
  }

  async downloadRecording(
    remoteFileId: string,
    range?: string,
  ): Promise<CloudDownloadResponse> {
    const response = await this.fetchImpl(
      `${DRIVE_API}/files/${encodeURIComponent(remoteFileId)}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          ...(range ? { Range: range } : {}),
        },
      },
    );
    if (!response.ok) await parseResponse(response);
    if (!response.body) {
      throw new CloudProviderError(
        "provider-unavailable",
        "Google Drive no devolvió el audio solicitado.",
      );
    }
    return {
      status: response.status,
      body: response.body,
      contentType:
        response.headers.get("content-type") ?? "application/octet-stream",
      contentLength: response.headers.get("content-length"),
      contentRange: response.headers.get("content-range"),
    };
  }
}

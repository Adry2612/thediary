import type { CloudSyncProvider } from "./types.ts";
import {
  CloudProviderError,
  type CloudProviderAdapter,
  type CloudProviderConnection,
  type CloudUploadInput,
  type CloudUploadResult,
  type RemoteCloudRecording,
} from "./provider.ts";
import { getCloudProviderConfigurations } from "./config.ts";

const GRAPH_API = "https://graph.microsoft.com/v1.0";
const RECORDINGS_PATH = "TheDiary/Recordings";
type FetchLike = typeof fetch;

function extensionFor(mimeType: string): string {
  if (mimeType === "audio/mp4") return "mp4";
  if (mimeType === "audio/mpeg") return "mp3";
  if (mimeType === "audio/ogg") return "ogg";
  if (mimeType === "audio/wav" || mimeType === "audio/x-wav") return "wav";
  return "webm";
}

async function parseResponse(response: Response): Promise<any> {
  if (response.ok) return response.status === 204 ? null : response.json();
  const body = await response.text();
  if (response.status === 401) {
    throw new CloudProviderError("token-expired", "La sesión de OneDrive ha expirado.", true);
  }
  if (response.status === 403) {
    throw new CloudProviderError("permission-denied", "OneDrive no permite esta operación.");
  }
  if (response.status === 429 || response.status === 507) {
    throw new CloudProviderError("quota-exceeded", "OneDrive ha limitado el almacenamiento o la operación.", true);
  }
  throw new CloudProviderError("provider-unavailable", body || "OneDrive no está disponible.", true);
}

export class OneDriveAdapter implements CloudProviderAdapter {
  readonly provider: CloudSyncProvider = "onedrive";
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
    const response = await this.fetchImpl(`${GRAPH_API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...(init.headers ?? {}),
      },
    });
    return parseResponse(response);
  }

  async getConnection(): Promise<CloudProviderConnection> {
    const user = await this.request("/me?$select=displayName,mail,userPrincipalName");
    return {
      provider: this.provider,
      connected: true,
      accountLabel: user.mail ?? user.userPrincipalName ?? user.displayName,
    };
  }

  async beginAuthorization(returnTo = "/recordings"): Promise<string> {
    const configuration = getCloudProviderConfigurations().find(
      (item) => item.provider === this.provider,
    );
    if (!configuration?.enabled || !configuration.clientId || !configuration.redirectUri) {
      throw new CloudProviderError("provider-unavailable", "OneDrive no está configurado.");
    }
    const params = new URLSearchParams({
      client_id: configuration.clientId,
      redirect_uri: configuration.redirectUri,
      response_type: "code",
      response_mode: "query",
      scope: "offline_access Files.ReadWrite User.Read",
      state: returnTo,
    });
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
  }

  async disconnect(): Promise<void> {
    // Microsoft Graph has no user-facing token revocation endpoint for this
    // delegated flow. Removing the server-side session is the safe operation.
  }

  private async uploadPath(path: string, body: Blob, contentType: string): Promise<any> {
    return this.request(`/me/drive/root:/${encodeURIComponent(path)}:/content`, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body,
    });
  }

  async uploadRecording(input: CloudUploadInput): Promise<CloudUploadResult> {
    const extension = extensionFor(input.recording.mimeType);
    const audio = await this.uploadPath(
      `${RECORDINGS_PATH}/${input.recording.id}.${extension}`,
      input.blob,
      input.recording.mimeType || "application/octet-stream",
    );
    input.onProgress?.({ uploadedBytes: input.blob.size, totalBytes: input.blob.size });

    const manifest = new Blob(
      [
        JSON.stringify({
          version: 1,
          recording: input.recording,
          audioFileId: audio.id,
        }),
      ],
      { type: "application/json" },
    );
    const manifestFile = await this.uploadPath(
      `${RECORDINGS_PATH}/${input.recording.id}.json`,
      manifest,
      "application/json",
    );
    return { remoteFileId: audio.id, remoteManifestId: manifestFile.id };
  }

  async listManagedRecordings(): Promise<RemoteCloudRecording[]> {
    const result = await this.request(
      `/me/drive/root:/${encodeURI(RECORDINGS_PATH)}:/children?$select=id,name,@microsoft.graph.downloadUrl`,
    );
    const recordings: RemoteCloudRecording[] = [];
    for (const file of result.value ?? []) {
      if (!file.name?.endsWith(".json") || !file["@microsoft.graph.downloadUrl"]) continue;
      const manifestResponse = await this.fetchImpl(file["@microsoft.graph.downloadUrl"]);
      if (!manifestResponse.ok) continue;
      const manifest = await manifestResponse.json();
      if (!manifest?.recording?.id || !manifest.audioFileId) continue;
      recordings.push({
        provider: this.provider,
        remoteFileId: manifest.audioFileId,
        remoteManifestId: file.id,
        metadata: manifest.recording,
      });
    }
    return recordings;
  }
}

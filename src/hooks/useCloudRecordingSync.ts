"use client";

import { useCallback, useEffect, useState } from "react";
import { listPracticeRecordings } from "@/services/practice-library";
import type { PracticeAudioRecording } from "@/types/practice-library";
import {
  CLOUD_SYNC_PROVIDERS,
  type CloudSyncErrorCode,
  type CloudSyncProvider,
} from "@/types/cloud-sync";
import type { RemoteCloudRecording } from "@/services/cloud-sync/provider";
import {
  syncPendingRecordings as syncPendingBatch,
  type SyncBatchResult,
} from "@/services/cloud-sync/sync-batch";

export interface CloudProviderStatus {
  provider: CloudSyncProvider;
  enabled: boolean;
  connected: boolean;
  accountLabel?: string;
}

export interface PendingSyncSummary extends SyncBatchResult {}

export class CloudSyncRequestError extends Error {
  readonly code?: CloudSyncErrorCode;

  constructor(message: string, code?: CloudSyncErrorCode) {
    super(message);
    this.name = "CloudSyncRequestError";
    this.code = code;
  }
}

const AUTHORIZATION_ERROR_CODES: readonly CloudSyncErrorCode[] = [
  "token-expired",
  "not-authorized",
  "permission-denied",
];

/**
 * Un error de autorización invalida el resto del lote: seguir subiendo solo
 * generaría más fallos idénticos.
 */
export function isCloudAuthorizationError(error: unknown): boolean {
  return (
    error instanceof CloudSyncRequestError &&
    error.code !== undefined &&
    AUTHORIZATION_ERROR_CODES.includes(error.code)
  );
}

interface ProviderDetailsPayload {
  enabled: boolean;
}

function emptyStatus(provider: CloudSyncProvider): CloudProviderStatus {
  return {
    provider,
    enabled: false,
    connected: false,
  };
}

export function useCloudRecordingSync() {
  const [statuses, setStatuses] = useState<CloudProviderStatus[]>(
    CLOUD_SYNC_PROVIDERS.map(emptyStatus),
  );
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const configResponse = await fetch("/api/cloud-sync/config");
      const config = (await configResponse.json()) as {
        providers?: Record<CloudSyncProvider, ProviderDetailsPayload>;
      };
      const details = config.providers;

      const next = await Promise.all(
        CLOUD_SYNC_PROVIDERS.map(async (provider) => {
          if (!details?.[provider]?.enabled) {
            return emptyStatus(provider);
          }
          const response = await fetch(`/api/cloud-sync/${provider}/status`);
          const status = (await response.json()) as {
            connected?: boolean;
            accountLabel?: string;
          };
          return {
            provider,
            enabled: true,
            connected: status.connected === true,
            accountLabel: status.accountLabel,
          };
        }),
      );
      setStatuses(next);
    } catch {
      setStatuses(CLOUD_SYNC_PROVIDERS.map(emptyStatus));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connect = useCallback((provider: CloudSyncProvider): Promise<void> => {
    return new Promise((resolve, reject) => {
      const popup = window.open(
        `/api/cloud-sync/${provider}/authorize?popup=1&returnTo=${encodeURIComponent(window.location.pathname)}`,
        `thediary-${provider}-oauth`,
        "popup,width=520,height=700,resizable=yes,scrollbars=yes",
      );
      if (!popup) {
        reject(new Error("El navegador bloqueó la ventana de inicio de sesión."));
        return;
      }

      let settled = false;
      const finish = (action: () => void) => {
        if (settled) return;
        settled = true;
        if (timeout) clearTimeout(timeout);
        timeout = null;
        window.removeEventListener("message", handleMessage);
        if (poll) clearInterval(poll);
        action();
      };

      let timeout: ReturnType<typeof setTimeout> | null = null;
      let poll: ReturnType<typeof setInterval> | null = null;
      timeout = setTimeout(() => {
        finish(() => {
          popup.close();
          reject(new Error("La ventana de inicio de sesión no respondió."));
        });
      }, 120_000);
      poll = setInterval(() => {
        if (!popup.closed) return;
        finish(() => reject(new Error("Se cerró la ventana sin completar la conexión.")));
      }, 500);

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        const message = event.data as {
          type?: string;
          provider?: string;
          result?: "connected" | "cancelled" | "error";
          message?: string;
        };
        if (message.type !== "thediary-cloud-sync" || message.provider !== provider) return;
        finish(() => {
          popup.close();
          void refresh().catch(() => undefined).finally(() => {
            if (message.result === "connected") {
              resolve();
              return;
            }
            reject(new Error(message.message ?? "No se pudo conectar el proveedor."));
          });
        });
      };
      window.addEventListener("message", handleMessage);
    });
  }, [refresh]);

  async function disconnect(provider: CloudSyncProvider) {
    await fetch(`/api/cloud-sync/${provider}/status`, { method: "DELETE" });
    await refresh();
  }

  const syncRecording = useCallback(
    async (
      provider: CloudSyncProvider,
      recording: PracticeAudioRecording,
    ): Promise<{ remoteFileId: string; remoteManifestId?: string }> => {
      if (!recording.blob) throw new Error("No se encontró el archivo de audio.");
      const form = new FormData();
      const metadata = { ...recording };
      delete metadata.blob;
      delete metadata.playbackUrl;
      form.set("recording", JSON.stringify(metadata));
      form.set("audio", recording.blob, `${recording.id}.${recording.mimeType.split("/")[1] ?? "webm"}`);
      const response = await fetch(`/api/cloud-sync/${provider}/recordings`, {
        method: "POST",
        body: form,
      });
      const result = (await response.json()) as {
        error?: string;
        code?: CloudSyncErrorCode;
        remoteFileId?: string;
        remoteManifestId?: string;
      };
      if (!response.ok || !result.remoteFileId) {
        throw new CloudSyncRequestError(
          result.error ?? "No se pudo sincronizar la grabación.",
          result.code,
        );
      }
      return { remoteFileId: result.remoteFileId, remoteManifestId: result.remoteManifestId };
    },
    [],
  );

  const listRemoteRecordings = useCallback(async (provider: CloudSyncProvider): Promise<RemoteCloudRecording[]> => {
    const response = await fetch(`/api/cloud-sync/${provider}/recordings`);
    if (!response.ok) throw new Error("No se pudo cargar el catálogo remoto.");
    const result = (await response.json()) as { recordings?: RemoteCloudRecording[] };
    return result.recordings ?? [];
  }, []);

  /**
   * Sube al proveedor las grabaciones locales que aún no están en su catálogo.
   * El catálogo remoto es la fuente de verdad, así que no depende de ningún
   * estado de sincronización local persistido.
   */
  const syncPendingRecordings = useCallback(
    (provider: CloudSyncProvider): Promise<PendingSyncSummary> =>
      syncPendingBatch({
        listRemoteIds: async () => {
          const remoteRecordings = await listRemoteRecordings(provider);
          return new Set(
            remoteRecordings
              .map((remote) => remote.metadata?.id)
              .filter((id): id is string => Boolean(id)),
          );
        },
        listLocal: listPracticeRecordings,
        upload: (recording) => syncRecording(provider, recording),
        isAuthorizationError: isCloudAuthorizationError,
      }),
    [listRemoteRecordings, syncRecording],
  );

  return {
    statuses,
    isLoading,
    refresh,
    connect,
    disconnect,
    syncRecording,
    syncPendingRecordings,
    listRemoteRecordings,
  };
}

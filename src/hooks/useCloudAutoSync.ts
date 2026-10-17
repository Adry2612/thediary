"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useCloudRecordingSync,
  type CloudProviderStatus,
} from "@/hooks/useCloudRecordingSync";
import { readAutoSyncPreference } from "@/lib/cloud-sync/auto-sync-preference";
import type { CloudSyncProvider } from "@/lib/cloud-sync/types";

const AUTO_SYNC_LOCK_NAME = "thediary-cloud-auto-sync";

export type AutoSyncPhase =
  | "idle"
  | "disabled"
  | "syncing"
  | "complete"
  | "error";

export interface AutoSyncState {
  phase: AutoSyncPhase;
  provider: CloudSyncProvider | null;
  uploaded: number;
  pending: number;
  error: string | null;
}

const INITIAL_STATE: AutoSyncState = {
  phase: "idle",
  provider: null,
  uploaded: 0,
  pending: 0,
  error: null,
};

/**
 * Serializa la ejecución entre pestañas para que dos pestañas abiertas no suban
 * el mismo archivo a la vez. Si el navegador no expone la API, se ejecuta igual.
 */
async function withAutoSyncLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  if (!locks) return task();
  return locks.request(AUTO_SYNC_LOCK_NAME, task) as Promise<T>;
}

/**
 * Sincroniza las grabaciones pendientes una vez por carga de la aplicación,
 * solo si el usuario activó la sincronización automática y hay un proveedor ya
 * conectado. Nunca inicia la autorización de un proveedor por su cuenta.
 */
export function useCloudAutoSync(): AutoSyncState {
  const { statuses, isLoading, syncPendingRecordings } =
    useCloudRecordingSync();
  const [state, setState] = useState<AutoSyncState>(INITIAL_STATE);
  const hasStarted = useRef(false);

  const run = useCallback(
    async (connectedProviders: CloudProviderStatus[]) => {
      setState({
        phase: "syncing",
        provider: null,
        uploaded: 0,
        pending: 0,
        error: null,
      });
      let uploaded = 0;
      let pending = 0;
      try {
        for (const status of connectedProviders) {
          setState((current) => ({ ...current, provider: status.provider }));
          const summary = await withAutoSyncLock(() =>
            syncPendingRecordings(status.provider),
          );
          uploaded += summary.uploaded;
          pending += summary.pending;
          setState((current) => ({ ...current, uploaded, pending }));
        }
        setState({
          phase: "complete",
          provider: null,
          uploaded,
          pending,
          error: null,
        });
      } catch (error) {
        setState({
          phase: "error",
          provider: null,
          uploaded,
          pending,
          error:
            error instanceof Error
              ? error.message
              : "No se pudo completar la sincronización automática.",
        });
      }
    },
    [syncPendingRecordings],
  );

  useEffect(() => {
    if (isLoading || hasStarted.current) return;

    if (!readAutoSyncPreference()) {
      setState((current) =>
        current.phase === "idle" ? { ...current, phase: "disabled" } : current,
      );
      return;
    }

    const connected = statuses.filter(
      (status) => status.enabled && status.connected,
    );
    if (connected.length === 0) return;

    hasStarted.current = true;
    void run(connected);
  }, [isLoading, statuses, run]);

  return state;
}

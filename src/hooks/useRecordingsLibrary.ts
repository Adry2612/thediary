"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCloudRecordingSync } from "@/hooks/useCloudRecordingSync";
import {
  deletePracticeRecording,
  listPracticeRecordings,
} from "@/services/practice-library";
import { mergeRemoteCatalog } from "@/services/cloud-sync/catalog";
import { RECORDING_SAVED_EVENT } from "@/services/practice-events";
import {
  getFilteredPracticeRecordings,
  getRecordingBlockOptions,
  groupPracticeRecordingsByDate,
  INITIAL_PRACTICE_RECORDING_FILTERS,
  type PracticeRecordingFilters,
} from "@/utils/practice-recording-filtering";
import type { PracticeAudioRecording } from "@/types/practice-library";

/**
 * Grabaciones de la biblioteca: carga local, catálogo de la nube, filtros y las
 * mutaciones que la lista ofrece (borrar y actualizar).
 */
export function useRecordingsLibrary(blockLabel: string) {
  const [recordings, setRecordings] = useState<PracticeAudioRecording[]>([]);
  const [filters, setFilters] = useState<PracticeRecordingFilters>(
    INITIAL_PRACTICE_RECORDING_FILTERS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCatalogLoaded, setIsCatalogLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const {
    statuses: cloudStatuses,
    isLoading: isLoadingProviders,
    listRemoteRecordings,
  } = useCloudRecordingSync();

  const loadRecordings = useCallback(async (): Promise<
    PracticeAudioRecording[]
  > => {
    const savedRecordings = await listPracticeRecordings();
    setRecordings(savedRecordings);
    setLoadError(null);
    return savedRecordings;
  }, []);

  useEffect(() => {
    let isActive = true;
    void loadRecordings()
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las grabaciones.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [loadRecordings]);

  useEffect(() => {
    function reload() {
      void loadRecordings().catch(() => undefined);
    }
    function reloadWhenVisible() {
      if (document.visibilityState === "visible") reload();
    }

    window.addEventListener(RECORDING_SAVED_EVENT, reload);
    window.addEventListener("focus", reload);
    document.addEventListener("visibilitychange", reloadWhenVisible);
    return () => {
      window.removeEventListener(RECORDING_SAVED_EVENT, reload);
      window.removeEventListener("focus", reload);
      document.removeEventListener("visibilitychange", reloadWhenVisible);
    };
  }, [loadRecordings]);

  useEffect(() => {
    const connectedProviders = cloudStatuses.filter(
      (status) => status.connected,
    );
    if (connectedProviders.length === 0 || isLoading) return;
    let active = true;
    void Promise.all(
      connectedProviders.map(async ({ provider }) => {
        try {
          return { provider, recordings: await listRemoteRecordings(provider) };
        } catch {
          return { provider, recordings: [] };
        }
      }),
    )
      .then((catalogs) => {
        if (!active) return;
        setRecordings((current) =>
          catalogs.reduce(
            (merged, catalog) =>
              mergeRemoteCatalog(
                merged,
                catalog.provider,
                catalog.recordings,
              ),
            current,
          ),
        );
      })
      .finally(() => {
        if (active) setIsCatalogLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [cloudStatuses, isLoading, listRemoteRecordings]);

  const blockOptions = useMemo(
    () => getRecordingBlockOptions(recordings, blockLabel),
    [blockLabel, recordings],
  );
  const filteredRecordings = useMemo(
    () => getFilteredPracticeRecordings(recordings, filters),
    [filters, recordings],
  );
  const recordingGroups = useMemo(
    () =>
      groupPracticeRecordingsByDate(
        filteredRecordings,
        filters.sort === "oldest" ? "oldest" : "newest",
      ),
    [filteredRecordings, filters.sort],
  );

  function updateFilter<Key extends keyof PracticeRecordingFilters>(
    key: Key,
    value: PracticeRecordingFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(INITIAL_PRACTICE_RECORDING_FILTERS);
  }

  async function removeRecording(recordingId: string) {
    try {
      await deletePracticeRecording(recordingId);
      setRecordings((current) =>
        current.filter((recording) => recording.id !== recordingId),
      );
      setDeleteError(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la grabación.",
      );
    }
  }

  function updateRecording(updatedRecording: PracticeAudioRecording) {
    setRecordings((current) =>
      current.map((recording) =>
        recording.id === updatedRecording.id ? updatedRecording : recording,
      ),
    );
  }

  // Solo esperamos a la nube si hay algún proveedor conectado; así el skeleton
  // de la lista no bloquea toda la pantalla mientras llega el catálogo remoto.
  const isCloudPending =
    isLoadingProviders ||
    (cloudStatuses.some((status) => status.connected) && !isCatalogLoaded);

  return {
    recordings,
    filters,
    updateFilter,
    clearFilters,
    blockOptions,
    filteredRecordings,
    recordingGroups,
    isLoading,
    loadError,
    deleteError,
    removeRecording,
    updateRecording,
    isCloudPending,
  };
}

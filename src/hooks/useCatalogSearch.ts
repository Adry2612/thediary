"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalogCandidate } from "@/types/catalog";
import { searchCatalogApi } from "@/services/catalog-api";

export type CatalogSearchStatus =
  | "idle"
  | "loading"
  | "ready"
  | "empty"
  | "unavailable";

interface UseCatalogSearchOptions {
  limit?: number;
}

/**
 * Estado de la búsqueda en el catálogo. Los resultados anteriores se mantienen
 * mientras llega una búsqueda nueva, para que la lista no parpadee. Al
 * desmontar se cancela la petición en curso.
 */
export function useCatalogSearch({ limit = 5 }: UseCatalogSearchOptions = {}) {
  const [status, setStatus] = useState<CatalogSearchStatus>("idle");
  const [results, setResults] = useState<CatalogCandidate[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

  const search = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length < 2) return;

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setStatus("loading");

      try {
        const outcome = await searchCatalogApi(trimmed, {
          limit,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        setResults(outcome.results);
        if (outcome.degraded) setStatus("unavailable");
        else setStatus(outcome.results.length > 0 ? "ready" : "empty");
      } catch {
        if (controller.signal.aborted) return;
        setStatus("unavailable");
      }
    },
    [limit],
  );

  /** Vacía el estado: lo usa el buscador reactivo al borrar la consulta. */
  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setResults([]);
    setStatus("idle");
  }, []);

  return { status, results, search, reset };
}

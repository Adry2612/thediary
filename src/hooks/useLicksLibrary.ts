"use client";

import { useMemo, useState } from "react";
import { getForgottenLick } from "@/lib/licks/forgotten";
import {
  getLicksSummary,
  getSortedLicks,
  getVisibleLicks,
} from "@/lib/licks/library";
import { parseDateKey } from "@/lib/practice-calendar";
import { usePracticeStore } from "@/stores/usePracticeStore";

/**
 * Estado de la biblioteca que no es de un solo componente: búsqueda, lick
 * seleccionado para el gráfico, resumen, propuesta de rescate y canciones
 * enlazables. Las cuentas viven en `lib/licks`.
 */
export function useLicksLibrary(todayKey: string) {
  const licks = usePracticeStore((state) => state.licks);
  const items = usePracticeStore((state) => state.repertoireItems);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const persistenceError = usePracticeStore((state) => state.persistenceError);
  const [query, setQuery] = useState("");
  const [selectedLickId, setSelectedLickId] = useState<string | null>(null);

  const sorted = useMemo(() => getSortedLicks(licks), [licks]);
  const visible = useMemo(() => getVisibleLicks(licks, query), [licks, query]);
  const summary = useMemo(() => getLicksSummary(licks), [licks]);
  const songs = useMemo(
    () => items.filter((item) => item.kind === "song"),
    [items],
  );
  const today = useMemo(() => parseDateKey(todayKey), [todayKey]);
  const forgotten = useMemo(
    () => getForgottenLick(licks, today),
    [licks, today],
  );
  const selectedLick = useMemo(
    () =>
      sorted.find((lick) => lick.id === selectedLickId) ?? sorted[0] ?? null,
    [selectedLickId, sorted],
  );

  return {
    licks,
    sorted,
    visible,
    summary,
    songs,
    forgotten,
    selectedLick,
    selectedLickId: selectedLick?.id ?? "",
    setSelectedLickId,
    query,
    setQuery,
    hasHydrated,
    persistenceError,
    today,
  };
}

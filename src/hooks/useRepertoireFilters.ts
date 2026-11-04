"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readRepertoireFilterPreferences,
  saveRepertoireFilterPreferences,
} from "@/services/repertoire-filter-preferences";
import {
  hasActiveRepertoireFilters,
  type FutureLearnFilter,
  type GuitarTypeFilter,
  type RepertoireProgressFilter,
  type RepertoireSortOrder,
} from "@/utils/repertoire-filtering";
import type { RepertoireGroupBy } from "@/utils/repertoire-grouping";

/**
 * Los filtros y el orden del listado de repertorio. Se guardan por dispositivo
 * para que la búsqueda y los filtros sigan aplicados al volver a la lista; las
 * reglas de qué es un filtro activo viven en `repertoire-filtering`.
 */
export function useRepertoireFilters() {
  const [guitarTypeFilter, setGuitarTypeFilter] =
    useState<GuitarTypeFilter>("all");
  const [futureLearnFilter, setFutureLearnFilter] =
    useState<FutureLearnFilter>("all");
  const [progressFilter, setProgressFilter] =
    useState<RepertoireProgressFilter>("all");
  const [sortOrder, setSortOrder] = useState<RepertoireSortOrder>("original");
  const [groupBy, setGroupBy] = useState<RepertoireGroupBy>("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = readRepertoireFilterPreferences();
    setGuitarTypeFilter(stored.guitarType);
    setFutureLearnFilter(stored.futureLearn);
    setProgressFilter(stored.progress);
    setSortOrder(stored.sort);
    setGroupBy(stored.groupBy);
    setSearchQuery(stored.query);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveRepertoireFilterPreferences({
      query: searchQuery,
      progress: progressFilter,
      guitarType: guitarTypeFilter,
      futureLearn: futureLearnFilter,
      sort: sortOrder,
      groupBy,
    });
  }, [
    futureLearnFilter,
    guitarTypeFilter,
    groupBy,
    isHydrated,
    progressFilter,
    searchQuery,
    sortOrder,
  ]);

  const hasActiveFilters = hasActiveRepertoireFilters({
    query: searchQuery,
    progress: progressFilter,
    guitarType: guitarTypeFilter,
    futureLearn: futureLearnFilter,
  });

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setGuitarTypeFilter("all");
    setFutureLearnFilter("all");
    setProgressFilter("all");
    setSortOrder("original");
    setGroupBy("none");
  }, []);

  return {
    guitarTypeFilter,
    setGuitarTypeFilter,
    futureLearnFilter,
    setFutureLearnFilter,
    progressFilter,
    setProgressFilter,
    sortOrder,
    setSortOrder,
    groupBy,
    setGroupBy,
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
    clearFilters,
  };
}

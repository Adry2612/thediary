"use client";

import { useCallback, useState } from "react";
import {
  hasActiveRepertoireFilters,
  type FutureLearnFilter,
  type GuitarTypeFilter,
  type RepertoireProgressFilter,
  type RepertoireSortOrder,
} from "@/utils/repertoire-filtering";
import type { RepertoireGroupBy } from "@/utils/repertoire-grouping";

/**
 * Los filtros y el orden del listado de repertorio. Guardar aquí el estado deja
 * a la vista solo el markup; las reglas de qué es un filtro activo viven en
 * `repertoire-filtering`.
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

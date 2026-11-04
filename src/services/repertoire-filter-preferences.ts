import {
  isRepertoireProgressFilter,
  isRepertoireSortOrder,
  type FutureLearnFilter,
  type GuitarTypeFilter,
  type RepertoireProgressFilter,
  type RepertoireSortOrder,
} from "../utils/repertoire-filtering.ts";
import {
  isRepertoireGroupBy,
  type RepertoireGroupBy,
} from "../utils/repertoire-grouping.ts";

export type RepertoireFilterPreferences = {
  query: string;
  progress: RepertoireProgressFilter;
  guitarType: GuitarTypeFilter;
  futureLearn: FutureLearnFilter;
  sort: RepertoireSortOrder;
  groupBy: RepertoireGroupBy;
};

export const REPERTOIRE_FILTERS_KEY = "thediary.repertoire-filters";

export const DEFAULT_REPERTOIRE_FILTER_PREFERENCES: RepertoireFilterPreferences =
  {
    query: "",
    progress: "all",
    guitarType: "all",
    futureLearn: "all",
    sort: "original",
    groupBy: "none",
  };

const GUITAR_TYPES: readonly GuitarTypeFilter[] = [
  "all",
  "electric",
  "acoustic",
];
const FUTURE_LEARN: readonly FutureLearnFilter[] = ["all", "future", "current"];

function isGuitarTypeFilter(value: unknown): value is GuitarTypeFilter {
  return GUITAR_TYPES.includes(value as GuitarTypeFilter);
}

function isFutureLearnFilter(value: unknown): value is FutureLearnFilter {
  return FUTURE_LEARN.includes(value as FutureLearnFilter);
}

/** Solo los valores admitidos cuentan; el resto vuelve al valor por defecto. */
export function normalizeRepertoireFilterPreferences(
  value: unknown,
): RepertoireFilterPreferences {
  if (!value || typeof value !== "object") {
    return DEFAULT_REPERTOIRE_FILTER_PREFERENCES;
  }

  const candidate = value as Record<string, unknown>;
  const progressValue =
    typeof candidate.progress === "string" ? candidate.progress : "";
  const sortValue = typeof candidate.sort === "string" ? candidate.sort : "";
  const groupByValue =
    typeof candidate.groupBy === "string" ? candidate.groupBy : "";

  return {
    query:
      typeof candidate.query === "string" ? candidate.query.slice(0, 120) : "",
    progress: isRepertoireProgressFilter(progressValue)
      ? progressValue
      : DEFAULT_REPERTOIRE_FILTER_PREFERENCES.progress,
    guitarType: isGuitarTypeFilter(candidate.guitarType)
      ? candidate.guitarType
      : DEFAULT_REPERTOIRE_FILTER_PREFERENCES.guitarType,
    futureLearn: isFutureLearnFilter(candidate.futureLearn)
      ? candidate.futureLearn
      : DEFAULT_REPERTOIRE_FILTER_PREFERENCES.futureLearn,
    sort: isRepertoireSortOrder(sortValue)
      ? sortValue
      : DEFAULT_REPERTOIRE_FILTER_PREFERENCES.sort,
    groupBy: isRepertoireGroupBy(groupByValue)
      ? groupByValue
      : DEFAULT_REPERTOIRE_FILTER_PREFERENCES.groupBy,
  };
}

export function readRepertoireFilterPreferences(): RepertoireFilterPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_REPERTOIRE_FILTER_PREFERENCES;
  }

  try {
    const stored = window.localStorage.getItem(REPERTOIRE_FILTERS_KEY);
    return stored
      ? normalizeRepertoireFilterPreferences(JSON.parse(stored))
      : DEFAULT_REPERTOIRE_FILTER_PREFERENCES;
  } catch {
    return DEFAULT_REPERTOIRE_FILTER_PREFERENCES;
  }
}

export function saveRepertoireFilterPreferences(
  value: unknown,
): RepertoireFilterPreferences {
  const preferences = normalizeRepertoireFilterPreferences(value);
  if (typeof window === "undefined") return preferences;

  try {
    window.localStorage.setItem(
      REPERTOIRE_FILTERS_KEY,
      JSON.stringify(preferences),
    );
  } catch {
    // La preferencia es opcional: se mantiene el valor normalizado en memoria.
  }

  return preferences;
}

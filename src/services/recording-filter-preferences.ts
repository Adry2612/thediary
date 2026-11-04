import {
  INITIAL_PRACTICE_RECORDING_FILTERS,
  isPracticeRecordingSort,
  type PracticeRecordingFilters,
} from "../utils/practice-recording-filtering.ts";

export const RECORDING_FILTERS_KEY = "thediary.recording-filters";

export const DEFAULT_RECORDING_FILTER_PREFERENCES: PracticeRecordingFilters = {
  ...INITIAL_PRACTICE_RECORDING_FILTERS,
};

/** Solo los valores admitidos cuentan; el resto vuelve al valor por defecto. */
export function normalizeRecordingFilterPreferences(
  value: unknown,
): PracticeRecordingFilters {
  if (!value || typeof value !== "object") {
    return DEFAULT_RECORDING_FILTER_PREFERENCES;
  }

  const candidate = value as Record<string, unknown>;
  const sortValue =
    typeof candidate.sort === "string" ? candidate.sort : "";
  return {
    phaseOrder:
      typeof candidate.phaseOrder === "string"
        ? candidate.phaseOrder.slice(0, 20)
        : "",
    phaseName:
      typeof candidate.phaseName === "string"
        ? candidate.phaseName.slice(0, 120)
        : "",
    sort: isPracticeRecordingSort(sortValue)
      ? sortValue
      : DEFAULT_RECORDING_FILTER_PREFERENCES.sort,
  };
}

export function readRecordingFilterPreferences(): PracticeRecordingFilters {
  if (typeof window === "undefined") {
    return DEFAULT_RECORDING_FILTER_PREFERENCES;
  }

  try {
    const stored = window.localStorage.getItem(RECORDING_FILTERS_KEY);
    return stored
      ? normalizeRecordingFilterPreferences(JSON.parse(stored))
      : DEFAULT_RECORDING_FILTER_PREFERENCES;
  } catch {
    return DEFAULT_RECORDING_FILTER_PREFERENCES;
  }
}

export function saveRecordingFilterPreferences(
  value: unknown,
): PracticeRecordingFilters {
  const preferences = normalizeRecordingFilterPreferences(value);
  if (typeof window === "undefined") return preferences;

  try {
    window.localStorage.setItem(
      RECORDING_FILTERS_KEY,
      JSON.stringify(preferences),
    );
  } catch {
    // La preferencia es opcional: se mantiene el valor normalizado en memoria.
  }

  return preferences;
}

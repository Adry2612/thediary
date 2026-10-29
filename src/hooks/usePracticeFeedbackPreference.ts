"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PRACTICE_FEEDBACK_PREFERENCE,
  PRACTICE_FEEDBACK_PREFERENCE_KEY,
  readPracticeFeedbackPreference,
  savePracticeFeedbackPreference,
  setPracticeFeedbackEnabled,
  type PracticeFeedbackPreference,
} from "@/services/practice-feedback-preference";
import type { PracticeMetric } from "@/types/practice";

/**
 * Interruptores de mood y foco de este dispositivo. Se leen al montar, se
 * pueden releer a demanda y se actualizan si otra pestaña cambia la
 * preferencia.
 */
export function usePracticeFeedbackPreference() {
  const [preference, setPreference] = useState<PracticeFeedbackPreference>(
    DEFAULT_PRACTICE_FEEDBACK_PREFERENCE,
  );

  const refresh = useCallback(() => {
    setPreference(readPracticeFeedbackPreference());
  }, []);

  useEffect(() => {
    refresh();

    function handleStorage(event: StorageEvent) {
      if (event.key === null || event.key === PRACTICE_FEEDBACK_PREFERENCE_KEY) {
        refresh();
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  const setEnabled = useCallback(
    (metric: PracticeMetric, enabled: boolean) => {
      setPreference((current) =>
        savePracticeFeedbackPreference(
          setPracticeFeedbackEnabled(current, metric, enabled),
        ),
      );
    },
    [],
  );

  return {
    preference,
    isMoodEnabled: preference.mood,
    isFocusEnabled: preference.focus,
    setEnabled,
    refresh,
  };
}

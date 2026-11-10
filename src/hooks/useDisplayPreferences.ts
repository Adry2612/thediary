"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import {
  DISPLAY_PREFERENCES_EVENT,
  DISPLAY_PREFERENCES_KEY,
  DEFAULT_DISPLAY_PREFERENCES,
  readDisplayPreferences,
  resolveTechniqueNameLanguage,
  saveDisplayPreferences,
  type DisplayPreferences,
  type TechniqueNameLanguage,
  type TuningDisplay,
} from "@/services/display-preferences";
import type { WeekStartsOn } from "@/types/display";

/**
 * Preferencias de presentación del dispositivo. Se releen al montar y cuando
 * otra pestaña o la propia Configuración las cambian.
 */
export function useDisplayPreferences() {
  const { locale } = useI18n();
  const [preference, setPreference] = useState<DisplayPreferences>(
    DEFAULT_DISPLAY_PREFERENCES,
  );

  const refresh = useCallback(() => {
    setPreference(readDisplayPreferences());
  }, []);

  useEffect(() => {
    refresh();

    function handleStorage(event: StorageEvent) {
      if (event.key === null || event.key === DISPLAY_PREFERENCES_KEY) {
        refresh();
      }
    }
    function handleChange() {
      refresh();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(DISPLAY_PREFERENCES_EVENT, handleChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(DISPLAY_PREFERENCES_EVENT, handleChange);
    };
  }, [refresh]);

  const setTechniqueNameLanguage = useCallback(
    (value: TechniqueNameLanguage) => {
      setPreference((current) =>
        saveDisplayPreferences({ ...current, techniqueNameLanguage: value }),
      );
    },
    [],
  );

  const setTuningDisplay = useCallback((value: TuningDisplay) => {
    setPreference((current) =>
      saveDisplayPreferences({ ...current, tuningDisplay: value }),
    );
  }, []);

  const setWeekStartsOn = useCallback((value: WeekStartsOn) => {
    setPreference((current) =>
      saveDisplayPreferences({ ...current, weekStartsOn: value }),
    );
  }, []);

  return {
    preference,
    /** Valor elegido en Configuración, sin resolver por el idioma. */
    techniqueNamePreference:
      preference.techniqueNameLanguage ?? (locale === "en" ? "original" : "es"),
    techniqueNameLanguage: resolveTechniqueNameLanguage(preference, locale),
    tuningDisplay: preference.tuningDisplay,
    weekStartsOn: preference.weekStartsOn,
    setTechniqueNameLanguage,
    setTuningDisplay,
    setWeekStartsOn,
    refresh,
  };
}

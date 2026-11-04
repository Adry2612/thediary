"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_REMINDER_PREFERENCES,
  REMINDER_PREFERENCES_EVENT,
  REMINDER_PREFERENCES_KEY,
  readReminderPreferences,
  saveReminderPreferences,
} from "@/services/reminder-preferences";
import type {
  ReminderInactivityDays,
  ReminderPreferences,
} from "@/types/reminders";

/**
 * Preferencias de recordatorios del dispositivo. Se releen al montar y cuando
 * otra pestaña o la propia Configuración las cambian.
 */
export function useReminderPreferences() {
  const [preferences, setPreferences] = useState<ReminderPreferences>(
    DEFAULT_REMINDER_PREFERENCES,
  );

  const refresh = useCallback(() => {
    setPreferences(readReminderPreferences());
  }, []);

  useEffect(() => {
    refresh();

    function handleStorage(event: StorageEvent) {
      if (event.key === null || event.key === REMINDER_PREFERENCES_KEY) {
        refresh();
      }
    }
    function handleChange() {
      refresh();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(REMINDER_PREFERENCES_EVENT, handleChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(REMINDER_PREFERENCES_EVENT, handleChange);
    };
  }, [refresh]);

  const update = useCallback((patch: Partial<ReminderPreferences>) => {
    setPreferences((current) =>
      saveReminderPreferences({ ...current, ...patch }),
    );
  }, []);

  const setEnabled = useCallback(
    (enabled: boolean) => update({ enabled }),
    [update],
  );

  const setReason = useCallback(
    (reason: "practice" | "strings" | "inactivity", enabled: boolean) =>
      update({ [reason]: enabled }),
    [update],
  );

  const setTime = useCallback((time: string) => update({ time }), [update]);

  const setInactivityDays = useCallback(
    (inactivityDays: ReminderInactivityDays) => update({ inactivityDays }),
    [update],
  );

  return {
    preferences,
    setPreferences: update,
    setEnabled,
    setReason,
    setTime,
    setInactivityDays,
    refresh,
  };
}

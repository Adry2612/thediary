"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useReminderPreferences } from "@/hooks/useReminderPreferences";
import {
  dismissReminderForDate,
  readReminderDismissed,
} from "@/services/reminder-preferences";
import {
  getNotificationPermission,
  getPushSupport,
} from "@/services/push-reminders";
import { usePracticeStore } from "@/stores/usePracticeStore";
import {
  buildReminderContext,
  evaluateReminderReasons,
  type ReminderData,
} from "@/utils/reminder-reasons";
import {
  getDeviceTimeZone,
  getZonedDateKey,
  getZonedTimeKey,
} from "@/utils/reminder-time";
import { getReminderTexts } from "@/i18n/reminder-texts";
import { useI18n } from "@/i18n/I18nProvider";
import type { ReminderReason } from "@/types/reminders";

async function hasActivePushSubscription(): Promise<boolean> {
  if (getPushSupport() !== "supported") return false;
  if (getNotificationPermission() !== "granted") return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    const subscription = await registration?.pushManager.getSubscription();
    return Boolean(subscription);
  } catch {
    return false;
  }
}

/**
 * Aviso dentro de la app para cuando el push no puede entregarse: invitados,
 * navegadores sin soporte, permiso no concedido o sin suscripción activa.
 */
export function useInAppReminder() {
  const { user } = useAppData();
  const { locale } = useI18n();
  const { preferences } = useReminderPreferences();
  const history = usePracticeStore((state) => state.history);
  const templates = usePracticeStore((state) => state.templates);
  const weeklySchedule = usePracticeStore((state) => state.weeklySchedule);
  const guitars = usePracticeStore((state) => state.guitars);
  const guitarEntries = usePracticeStore((state) => state.guitarEntries);

  const [now, setNow] = useState(() => new Date());
  const [pushAvailable, setPushAvailable] = useState(false);
  const timeZone = useMemo(() => getDeviceTimeZone(), []);
  const todayKey = getZonedDateKey(now, timeZone);
  const [dismissed, setDismissed] = useState(() =>
    readReminderDismissed(todayKey),
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void hasActivePushSubscription().then((active) => {
      if (!cancelled) setPushAvailable(active);
    });
    return () => {
      cancelled = true;
    };
  }, [now, preferences.enabled, user]);

  useEffect(() => {
    setDismissed(readReminderDismissed(todayKey));
  }, [todayKey]);

  const data = useMemo<ReminderData>(
    () => ({
      history,
      templates,
      weeklySchedule,
      guitars,
      guitarEntries,
    }),
    [guitarEntries, guitars, history, templates, weeklySchedule],
  );

  const afterChosenTime = getZonedTimeKey(now, timeZone) >= preferences.time;
  const visible =
    !pushAvailable && !dismissed && afterChosenTime && preferences.enabled;

  const reasons = useMemo<ReminderReason[]>(() => {
    if (!visible) return [];
    const context = buildReminderContext(data, { now, timeZone });
    return evaluateReminderReasons(
      todayKey,
      context,
      preferences,
      getReminderTexts(locale),
    );
  }, [data, locale, now, preferences, timeZone, todayKey, visible]);

  const dismiss = useCallback(() => {
    dismissReminderForDate(todayKey);
    setDismissed(true);
  }, [todayKey]);

  return {
    visible: visible && reasons.length > 0,
    reasons,
    dismiss,
    todayKey,
  };
}

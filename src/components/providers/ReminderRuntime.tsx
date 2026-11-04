"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { useReminderPreferences } from "@/hooks/useReminderPreferences";
import {
  getNotificationPermission,
  getPushSupport,
  refreshPushSubscription,
  registerReminderServiceWorker,
} from "@/services/push-reminders";
import {
  createReminderPlanScheduler,
  type ReminderPlanScheduler,
} from "@/services/reminder-plan-sync";
import {
  replaceReminderPlanRows,
  savePushSubscription,
} from "@/services/supabase/push-subscriptions";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { ReminderData } from "@/utils/reminder-reasons";
import { getDeviceTimeZone } from "@/utils/reminder-time";

/**
 * Mantiene el service worker, la suscripción de este dispositivo y el plan
 * diario que lee el emisor. No pide permiso: eso solo ocurre en Configuración.
 */
export function ReminderRuntime() {
  const { user } = useAppData();
  const { locale } = useI18n();
  const { preferences } = useReminderPreferences();
  const history = usePracticeStore((state) => state.history);
  const templates = usePracticeStore((state) => state.templates);
  const weeklySchedule = usePracticeStore((state) => state.weeklySchedule);
  const guitars = usePracticeStore((state) => state.guitars);
  const guitarEntries = usePracticeStore((state) => state.guitarEntries);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const schedulerRef = useRef<ReminderPlanScheduler | null>(null);

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

  useEffect(() => {
    void registerReminderServiceWorker();
  }, []);

  useEffect(() => {
    schedulerRef.current = createReminderPlanScheduler(
      replaceReminderPlanRows,
    );
    return () => {
      schedulerRef.current?.cancel();
      schedulerRef.current = null;
    };
  }, []);

  // Sin cuenta o con los avisos apagados no hay suscripción que mantener.
  useEffect(() => {
    if (!user || !preferences.enabled) {
      setSubscriptionId(null);
      return;
    }
    if (getPushSupport() === "unsupported") {
      setSubscriptionId(null);
      return;
    }

    // Sin permiso vigente no hay entrega posible: el plan deja de escribirse.
    if (getNotificationPermission() !== "granted") {
      setSubscriptionId(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      const snapshot = await refreshPushSubscription();
      if (snapshot && !cancelled) {
        const stored = await savePushSubscription({
          userId: user.id,
          endpoint: snapshot.endpoint,
          p256dh: snapshot.p256dh,
          auth: snapshot.auth,
          timeZone: getDeviceTimeZone(),
        });
        if (!cancelled) setSubscriptionId(stored?.id ?? null);
        return;
      }

      if (!cancelled) setSubscriptionId(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [preferences.enabled, user]);

  // Recalcula el plan al guardar una sesión, cambiar preferencias o el idioma.
  useEffect(() => {
    if (!subscriptionId || !user) return;

    schedulerRef.current?.request({
      userId: user.id,
      subscriptionId,
      preferences,
      data,
      locale,
      timeZone: getDeviceTimeZone(),
    });
  }, [data, locale, preferences, subscriptionId, user]);

  return null;
}

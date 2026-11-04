"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import {
  getCurrentPushEndpoint,
  getNotificationPermission,
  getPushSupport,
  refreshPushSubscription,
  showTestNotification,
  subscribeForPush,
  unsubscribeFromPush,
  type PushSubscriptionSnapshot,
  type PushSupportState,
} from "@/services/push-reminders";
import {
  deletePushSubscription,
  loadPushSubscription,
  savePushSubscription,
  type StoredPushSubscription,
} from "@/services/supabase/push-subscriptions";
import { getDeviceTimeZone } from "@/utils/reminder-time";
import { useI18nSection } from "@/i18n/I18nProvider";
import { useReminderPreferences } from "@/hooks/useReminderPreferences";

export interface PushReminderState {
  support: PushSupportState;
  permission: NotificationPermission | "unsupported";
  subscription: StoredPushSubscription | null;
  busy: boolean;
  error: string | null;
  feedback: string | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  sendTest: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePushReminders(): PushReminderState {
  const { user } = useAppData();
  const text = useI18nSection("reminders");
  const { preferences, setEnabled } = useReminderPreferences();
  const [support, setSupport] = useState<PushSupportState>("unsupported");
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const [subscription, setSubscription] =
    useState<StoredPushSubscription | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const nextSupport = getPushSupport();
    setSupport(nextSupport);
    setPermission(getNotificationPermission());
    if (!user) {
      setSubscription(null);
      return;
    }

    const stored = await loadPushSubscription(user.id);
    setSubscription(stored);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    setError(null);
    setFeedback(null);
    if (!user) {
      setError(text.guestNotice);
      return;
    }
    if (support !== "supported") {
      setError(
        support === "not-configured"
          ? text.permissionNotConfigured
          : text.permissionUnsupported,
      );
      return;
    }

    setBusy(true);
    try {
      const snapshot: PushSubscriptionSnapshot | null = await subscribeForPush();
      if (!snapshot) {
        setPermission(getNotificationPermission());
        setError(text.permissionDenied);
        setEnabled(false);
        return;
      }

      const stored = await savePushSubscription({
        userId: user.id,
        endpoint: snapshot.endpoint,
        p256dh: snapshot.p256dh,
        auth: snapshot.auth,
        timeZone: getDeviceTimeZone(),
      });
      if (!stored) {
        setError(text.errorGeneric);
        return;
      }

      setSubscription(stored);
      setPermission(getNotificationPermission());
      setEnabled(true);
    } catch {
      setError(text.errorGeneric);
    } finally {
      setBusy(false);
    }
  }, [setEnabled, support, text, user]);

  const disable = useCallback(async () => {
    setError(null);
    setFeedback(null);
    setBusy(true);
    try {
      const endpoint =
        subscription?.endpoint ?? (await getCurrentPushEndpoint());
      await unsubscribeFromPush();
      if (user && endpoint) {
        await deletePushSubscription(user.id, endpoint);
      }
      setSubscription(null);
      setEnabled(false);
    } catch {
      setError(text.errorGeneric);
    } finally {
      setBusy(false);
    }
  }, [setEnabled, subscription, text, user]);

  const sendTest = useCallback(async () => {
    setError(null);
    setFeedback(null);
    if (permission !== "granted") {
      setError(text.permissionDenied);
      return;
    }

    const sent = await showTestNotification(
      text.notificationTitle,
      text.testSent,
    );
    if (sent) setFeedback(text.testSent);
    else setError(text.testFailed);
  }, [permission, text]);

  // Una suscripción guardada con el permiso revocado deja de contar.
  useEffect(() => {
    if (!preferences.enabled) return;
    if (permission === "denied" && subscription) {
      setSubscription(null);
      setEnabled(false);
    }
  }, [permission, preferences.enabled, setEnabled, subscription]);

  // Repara la suscripción al abrir la app sin pedir permiso de nuevo.
  useEffect(() => {
    if (!user || !preferences.enabled) return;
    if (getNotificationPermission() !== "granted") return;

    let cancelled = false;
    void (async () => {
      const snapshot = await refreshPushSubscription();
      if (!snapshot || cancelled) return;
      const stored = await savePushSubscription({
        userId: user.id,
        endpoint: snapshot.endpoint,
        p256dh: snapshot.p256dh,
        auth: snapshot.auth,
        timeZone: getDeviceTimeZone(),
      });
      if (!cancelled) setSubscription(stored);
    })();

    return () => {
      cancelled = true;
    };
  }, [preferences.enabled, user]);

  return {
    support,
    permission,
    subscription,
    busy,
    error,
    feedback,
    enable,
    disable,
    sendTest,
    refresh,
  };
}

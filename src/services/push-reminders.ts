import { pushSubscriptionPayload } from "../utils/push-keys.ts";

export const REMINDER_SERVICE_WORKER_URL = "/sw.js";

/** Clave pública VAPID; sin ella los avisos quedan «no configurados». */
export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
}

export type PushSupportState = "unsupported" | "not-configured" | "supported";

export function getPushSupport(): PushSupportState {
  if (typeof window === "undefined") return "unsupported";
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return "unsupported";
  }
  return getVapidPublicKey() ? "supported" : "not-configured";
}

export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (getPushSupport() === "unsupported") return "unsupported";
  return Notification.permission;
}

export async function registerReminderServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (getPushSupport() === "unsupported") return null;

  try {
    return await navigator.serviceWorker.register(REMINDER_SERVICE_WORKER_URL, {
      scope: "/",
    });
  } catch {
    return null;
  }
}

async function getReadyRegistration(): Promise<ServiceWorkerRegistration | null> {
  const registration = await registerReminderServiceWorker();
  if (!registration) return null;
  if (registration.active) return registration;

  try {
    await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
  return registration;
}

export interface PushSubscriptionSnapshot {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** Pide permiso dentro de un gesto del usuario y crea la suscripción. */
export async function subscribeForPush(): Promise<PushSubscriptionSnapshot | null> {
  if (getPushSupport() !== "supported") return null;

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") return null;

  const registration = await getReadyRegistration();
  if (!registration) return null;

  try {
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey()),
      }));
    return pushSubscriptionPayload(subscription);
  } catch {
    return null;
  }
}

/** Renueva la suscripción existente sin pedir permiso. */
export async function refreshPushSubscription(): Promise<PushSubscriptionSnapshot | null> {
  if (getPushSupport() !== "supported") return null;
  if (Notification.permission !== "granted") return null;

  const registration = await getReadyRegistration();
  if (!registration) return null;

  try {
    const existing = await registration.pushManager.getSubscription();
    // Con el permiso ya concedido se puede reparar una suscripción rotada.
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey()),
      }));
    return pushSubscriptionPayload(subscription);
  } catch {
    return null;
  }
}

/** Endpoint de la suscripción de este dispositivo, si existe. */
export async function getCurrentPushEndpoint(): Promise<string | null> {
  if (getPushSupport() === "unsupported") return null;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    const subscription = await registration?.pushManager.getSubscription();
    return subscription?.endpoint ?? null;
  } catch {
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (getPushSupport() === "unsupported") return;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe();
  } catch {
    // Sin permiso o sin registro ya no hay nada que cancelar.
  }
}

/** Notificación de prueba local: no programa nada en el servidor. */
export async function showTestNotification(
  title: string,
  body: string,
): Promise<boolean> {
  if (getPushSupport() !== "supported") return false;
  if (Notification.permission !== "granted") return false;

  const registration = await getReadyRegistration();
  if (!registration) return false;

  try {
    await registration.showNotification(title, {
      body,
      tag: "thediary-test",
      icon: "/web-app-manifest-192x192.png",
      data: { url: "/settings" },
    });
    return true;
  } catch {
    return false;
  }
}

/** Conversión base64url → bytes que exige `applicationServerKey`. */
export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const buffer = new ArrayBuffer(raw.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }
  return bytes;
}

/** Suscripción del navegador con la forma que usa el cliente. */
export interface BrowserPushSubscriptionLike {
  endpoint: string;
  getKey: (name: "p256dh" | "auth") => ArrayBuffer | null;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** Bytes de una clave → base64url sin relleno, como la espera el servidor. */
export function bufferToBase64Url(
  buffer: ArrayBuffer | ArrayBufferView | null,
): string {
  if (!buffer) return "";

  const bytes =
    buffer instanceof ArrayBuffer
      ? new Uint8Array(buffer)
      : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function pushSubscriptionPayload(
  subscription: BrowserPushSubscriptionLike,
): PushSubscriptionPayload {
  return {
    endpoint: subscription.endpoint,
    p256dh: bufferToBase64Url(subscription.getKey("p256dh")),
    auth: bufferToBase64Url(subscription.getKey("auth")),
  };
}

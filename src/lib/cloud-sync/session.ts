import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { readEncryptionKey } from "./config-store.ts";

export interface CloudTokenSession {
  provider: "google-drive" | "onedrive";
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  accountLabel?: string;
}

const COOKIE_PREFIX = "v1";

function encryptionKey(): Buffer {
  const configured = readEncryptionKey();
  if (!configured) throw new Error("CLOUD_SYNC_ENCRYPTION_KEY no está configurada.");
  return createHash("sha256").update(configured).digest();
}

export function encryptCloudTokenSession(session: CloudTokenSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  return [
    COOKIE_PREFIX,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptCloudTokenSession(value: string | undefined): CloudTokenSession | null {
  if (!value) return null;
  try {
    const [version, encodedIv, encodedTag, encodedPayload] = value.split(".");
    if (version !== COOKIE_PREFIX || !encodedIv || !encodedTag || !encodedPayload) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(encodedIv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
    const payload = Buffer.concat([
      decipher.update(Buffer.from(encodedPayload, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const session = JSON.parse(payload) as CloudTokenSession;
    if (!session.provider || !session.accessToken) return null;
    return session;
  } catch {
    return null;
  }
}

export function cloudTokenCookieName(provider: CloudTokenSession["provider"]): string {
  return `thediary-cloud-${provider}`;
}

// Browsers cap a single cookie at ~4 KB. Microsoft Graph tokens are large
// enough to exceed that, so the encrypted session is split across numbered
// chunk cookies (`name`, `name.1`, `name.2`, ...).
const MAX_COOKIE_CHUNK_LENGTH = 3000;
const MAX_COOKIE_CHUNKS = 16;

export interface CloudTokenCookie {
  name: string;
  value: string;
}

export function serializeCloudTokenSessionCookies(
  session: CloudTokenSession,
): CloudTokenCookie[] {
  const base = cloudTokenCookieName(session.provider);
  const encoded = encryptCloudTokenSession(session);
  const cookies: CloudTokenCookie[] = [];
  for (let index = 0; index < encoded.length; index += MAX_COOKIE_CHUNK_LENGTH) {
    const value = encoded.slice(index, index + MAX_COOKIE_CHUNK_LENGTH);
    cookies.push({
      name: cookies.length === 0 ? base : `${base}.${cookies.length}`,
      value,
    });
  }
  return cookies.slice(0, MAX_COOKIE_CHUNKS);
}

/** Every cookie name a session may occupy, for cleanup on disconnect. */
export function cloudTokenCookieNames(provider: CloudTokenSession["provider"]): string[] {
  const base = cloudTokenCookieName(provider);
  return [
    base,
    ...Array.from({ length: MAX_COOKIE_CHUNKS - 1 }, (_, index) => `${base}.${index + 1}`),
  ];
}

export function readCloudTokenSession(
  cookieHeader: string | null,
  provider: CloudTokenSession["provider"],
): CloudTokenSession | null {
  if (!cookieHeader) return null;
  const base = cloudTokenCookieName(provider);
  const cookies = new Map<string, string>();
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    cookies.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
  }

  let combined = cookies.get(base) ?? "";
  for (let index = 1; index < MAX_COOKIE_CHUNKS; index += 1) {
    const chunk = cookies.get(`${base}.${index}`);
    if (chunk === undefined) break;
    combined += chunk;
  }
  return combined ? decryptCloudTokenSession(combined) : null;
}

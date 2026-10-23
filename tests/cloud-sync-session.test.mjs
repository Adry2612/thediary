import assert from "node:assert/strict";
import test from "node:test";
import {
  cloudTokenCookieName,
  decryptCloudTokenSession,
  encryptCloudTokenSession,
  readCloudTokenSession,
  serializeCloudTokenSessionCookies,
} from "../src/services/cloud-sync/session.ts";

test("encrypts and decrypts OAuth sessions without exposing token plaintext", () => {
  const previous = process.env.CLOUD_SYNC_ENCRYPTION_KEY;
  process.env.CLOUD_SYNC_ENCRYPTION_KEY = "test-encryption-key";
  try {
    const session = { provider: "google-drive", accessToken: "secret-token", refreshToken: "refresh" };
    const encrypted = encryptCloudTokenSession(session);
    assert.doesNotMatch(encrypted, /secret-token|refresh/);
    assert.deepEqual(decryptCloudTokenSession(encrypted), session);
    assert.equal(decryptCloudTokenSession(`${encrypted}tampered`), null);
  } finally {
    if (previous === undefined) delete process.env.CLOUD_SYNC_ENCRYPTION_KEY;
    else process.env.CLOUD_SYNC_ENCRYPTION_KEY = previous;
  }
});

test("round-trips a session stored in a single cookie", () => {
  const previous = process.env.CLOUD_SYNC_ENCRYPTION_KEY;
  process.env.CLOUD_SYNC_ENCRYPTION_KEY = "test-encryption-key";
  try {
    const session = { provider: "google-drive", accessToken: "token", refreshToken: "refresh" };
    const cookies = serializeCloudTokenSessionCookies(session);
    assert.equal(cookies.length, 1);
    assert.equal(cookies[0].name, cloudTokenCookieName("google-drive"));
    const header = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
    assert.deepEqual(readCloudTokenSession(header, "google-drive"), session);
  } finally {
    if (previous === undefined) delete process.env.CLOUD_SYNC_ENCRYPTION_KEY;
    else process.env.CLOUD_SYNC_ENCRYPTION_KEY = previous;
  }
});

test("splits large sessions into chunk cookies and reassembles them", () => {
  const previous = process.env.CLOUD_SYNC_ENCRYPTION_KEY;
  process.env.CLOUD_SYNC_ENCRYPTION_KEY = "test-encryption-key";
  try {
    const session = {
      provider: "onedrive",
      accessToken: "a".repeat(5000),
      refreshToken: "b".repeat(4000),
      expiresAt: Date.now(),
    };
    const cookies = serializeCloudTokenSessionCookies(session);
    assert.ok(cookies.length > 1);
    for (const cookie of cookies) assert.ok(cookie.value.length <= 3000);
    // Later chunks are numbered, in order, without gaps.
    assert.equal(cookies[1].name, `${cloudTokenCookieName("onedrive")}.1`);
    const header = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
    assert.deepEqual(readCloudTokenSession(header, "onedrive"), session);
  } finally {
    if (previous === undefined) delete process.env.CLOUD_SYNC_ENCRYPTION_KEY;
    else process.env.CLOUD_SYNC_ENCRYPTION_KEY = previous;
  }
});

test("ignores missing or tampered cookie chunks", () => {
  const previous = process.env.CLOUD_SYNC_ENCRYPTION_KEY;
  process.env.CLOUD_SYNC_ENCRYPTION_KEY = "test-encryption-key";
  try {
    assert.equal(readCloudTokenSession(null, "google-drive"), null);
    assert.equal(readCloudTokenSession("", "google-drive"), null);
    assert.equal(
      readCloudTokenSession("thediary-cloud-google-drive=v1.abc.def.ghi", "google-drive"),
      null,
    );
  } finally {
    if (previous === undefined) delete process.env.CLOUD_SYNC_ENCRYPTION_KEY;
    else process.env.CLOUD_SYNC_ENCRYPTION_KEY = previous;
  }
});

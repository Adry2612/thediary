import assert from "node:assert/strict";
import test from "node:test";
import {
  bufferToBase64Url,
  pushSubscriptionPayload,
} from "../src/utils/push-keys.ts";

test("encodes bytes as base64url without padding", () => {
  const buffer = new Uint8Array([0xfb, 0xff, 0x00]).buffer;
  assert.equal(bufferToBase64Url(buffer), "-_8A");
});

test("keeps base64url characters and drops the trailing padding", () => {
  assert.equal(bufferToBase64Url(new Uint8Array([0x01]).buffer), "AQ");
});

test("an absent key becomes an empty string", () => {
  assert.equal(bufferToBase64Url(null), "");
});

test("maps a browser subscription to the stored payload", () => {
  const payload = pushSubscriptionPayload({
    endpoint: "https://push.example/abc",
    getKey: (name) =>
      name === "p256dh"
        ? new Uint8Array([0xfb, 0xff, 0x00]).buffer
        : new Uint8Array([0x01]).buffer,
  });

  assert.deepEqual(payload, {
    endpoint: "https://push.example/abc",
    p256dh: "-_8A",
    auth: "AQ",
  });
});

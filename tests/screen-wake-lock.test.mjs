import assert from "node:assert/strict";
import test from "node:test";
import { shouldHoldWakeLock } from "../src/utils/screen-wake-lock.ts";

test("holds the wake lock only while the timer runs in a visible page", () => {
  assert.equal(
    shouldHoldWakeLock({ isRunning: true, isVisible: true, isSupported: true }),
    true,
  );
});

test("releases the wake lock when paused, hidden or unsupported", () => {
  assert.equal(
    shouldHoldWakeLock({ isRunning: false, isVisible: true, isSupported: true }),
    false,
  );
  assert.equal(
    shouldHoldWakeLock({ isRunning: true, isVisible: false, isSupported: true }),
    false,
  );
  assert.equal(
    shouldHoldWakeLock({ isRunning: true, isVisible: true, isSupported: false }),
    false,
  );
});

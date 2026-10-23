import assert from "node:assert/strict";
import test from "node:test";
import { getSessionStatus } from "../src/utils/practice-session-status.ts";

test("reports a finished session before anything else", () => {
  assert.equal(getSessionStatus(true, true), "completed");
  assert.equal(getSessionStatus(true, false), "completed");
});

test("reports whether the timer is running or paused", () => {
  assert.equal(getSessionStatus(false, true), "running");
  assert.equal(getSessionStatus(false, false), "paused");
});

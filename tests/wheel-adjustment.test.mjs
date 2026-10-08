import assert from "node:assert/strict";
import test from "node:test";
import { consumeWheelDelta } from "../src/lib/wheel-adjustment.ts";

test("accumulates small wheel movements and emits one adjustment per threshold", () => {
  assert.deepEqual(consumeWheelDelta(0, 30), { steps: 0, remainder: 30 });
  assert.deepEqual(consumeWheelDelta(30, 50), { steps: 1, remainder: 0 });
  assert.deepEqual(consumeWheelDelta(0, -80), { steps: -1, remainder: 0 });
  assert.deepEqual(consumeWheelDelta(0, 1_000), { steps: 1, remainder: 0 });
});

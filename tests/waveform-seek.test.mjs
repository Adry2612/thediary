import assert from "node:assert/strict";
import test from "node:test";
import {
  clampSeekRatio,
  getSeekRatio,
  getSeekSeconds,
} from "../src/utils/waveform-seek.ts";

test("clamps any position to the wave", () => {
  assert.equal(clampSeekRatio(-0.4), 0);
  assert.equal(clampSeekRatio(0.35), 0.35);
  assert.equal(clampSeekRatio(1.8), 1);
  assert.equal(clampSeekRatio(Number.NaN), 0);
});

test("converts a pointer coordinate into a ratio", () => {
  const bounds = { left: 100, width: 400 };

  assert.equal(getSeekRatio(100, bounds), 0);
  assert.equal(getSeekRatio(300, bounds), 0.5);
  assert.equal(getSeekRatio(500, bounds), 1);
  assert.equal(getSeekRatio(700, bounds), 1);
});

test("a zero-width or invalid wave has no position", () => {
  assert.equal(getSeekRatio(120, { left: 100, width: 0 }), 0);
  assert.equal(getSeekRatio(Number.NaN, { left: 100, width: 400 }), 0);
});

test("turns a ratio into seconds inside the take", () => {
  assert.equal(getSeekSeconds(0, 12), 0);
  assert.equal(getSeekSeconds(0.5, 12), 6);
  assert.equal(getSeekSeconds(1, 12), 12);
  assert.equal(getSeekSeconds(1.7, 12), 12);
  assert.equal(getSeekSeconds(-1, 12), 0);
});

test("a take without duration cannot be seeked", () => {
  assert.equal(getSeekSeconds(0.5, 0), 0);
  assert.equal(getSeekSeconds(0.5, Number.NaN), 0);
});

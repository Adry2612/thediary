import assert from "node:assert/strict";
import test from "node:test";
import { getWaveformLevels } from "../src/lib/recording-waveform.ts";

test("keeps microphone silence visible at a low baseline", () => {
  assert.deepEqual(
    getWaveformLevels(new Uint8Array([128, 128, 128, 128]), 4),
    [0.08, 0.08, 0.08, 0.08],
  );
});

test("maps stronger microphone samples to taller waveform bars", () => {
  assert.deepEqual(
    getWaveformLevels(new Uint8Array([128, 160, 200, 255]), 4),
    [0.08, 1, 1, 1],
  );
});

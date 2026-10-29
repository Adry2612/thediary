import assert from "node:assert/strict";
import test from "node:test";
import {
  WAVEFORM_BASELINE_HEIGHT,
  appendWaveformLevel,
  getWaveformLevels,
  getWaveformPeaks,
} from "../src/utils/recording-waveform.ts";

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

test("the rolling buffer starts padded and keeps a fixed length", () => {
  const levels = appendWaveformLevel([], 0.5, 4);

  assert.deepEqual(levels, [WAVEFORM_BASELINE_HEIGHT, WAVEFORM_BASELINE_HEIGHT, WAVEFORM_BASELINE_HEIGHT, 0.5]);
});

test("newest levels stay on the right and the oldest leave the buffer", () => {
  const levels = [0.1, 0.2, 0.3, 0.4].reduce(
    (current, level) => appendWaveformLevel(current, level, 4),
    [],
  );

  assert.deepEqual(levels, [0.1, 0.2, 0.3, 0.4]);
  assert.deepEqual(appendWaveformLevel(levels, 0.9, 4), [0.2, 0.3, 0.4, 0.9]);
});

test("levels are clamped to the display range", () => {
  assert.equal(appendWaveformLevel([], 4, 1)[0], 1);
  assert.equal(appendWaveformLevel([], -1, 1)[0], WAVEFORM_BASELINE_HEIGHT);
  assert.equal(appendWaveformLevel([], Number.NaN, 1)[0], WAVEFORM_BASELINE_HEIGHT);
});

test("the buffer refuses an empty display", () => {
  assert.throws(() => appendWaveformLevel([], 0.5, 0), RangeError);
});

test("peaks are grouped into the requested number of bars", () => {
  const samples = new Float32Array(100).fill(0);
  samples[10] = 0.5;
  samples[90] = -0.25;

  const peaks = getWaveformPeaks(samples, 10);

  assert.equal(peaks.length, 10);
  assert.equal(peaks[1], 1);
  assert.equal(peaks[9], 1);
  assert.equal(peaks[5], WAVEFORM_BASELINE_HEIGHT);
});

test("decoded silence keeps a visible baseline", () => {
  const peaks = getWaveformPeaks(new Float32Array(50), 8);

  assert.deepEqual(
    peaks,
    Array.from({ length: 8 }, () => WAVEFORM_BASELINE_HEIGHT),
  );
});

test("a missing or empty signal falls back to the baseline", () => {
  const expected = Array.from({ length: 6 }, () => WAVEFORM_BASELINE_HEIGHT);

  assert.deepEqual(getWaveformPeaks(null, 6), expected);
  assert.deepEqual(getWaveformPeaks(undefined, 6), expected);
  assert.deepEqual(getWaveformPeaks(new Float32Array(0), 6), expected);
});

test("peaks refuse an empty display", () => {
  assert.throws(() => getWaveformPeaks(new Float32Array(2), 0), RangeError);
});

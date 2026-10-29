import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_TUNING_PRESET_ID,
  TUNING_PRESETS,
  detectPitch,
  getNoteFrequency,
  getNoteFromFrequency,
  getTuningTargets,
} from "../src/utils/tuner.ts";

const SAMPLE_RATE = 44_100;

function sine(frequency, seconds = 0.2, amplitude = 0.4) {
  const samples = new Float32Array(Math.round(SAMPLE_RATE * seconds));
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = amplitude * Math.sin((2 * Math.PI * frequency * index) / SAMPLE_RATE);
  }
  return samples;
}

test("note frequencies follow the A4 reference", () => {
  assert.ok(Math.abs(getNoteFrequency("A", 4) - 440) < 0.001);
  assert.ok(Math.abs(getNoteFrequency("E", 2) - 82.4069) < 0.01);
  assert.ok(Math.abs(getNoteFrequency("E", 2, 432) - 80.9086) < 0.01);
});

test("the standard preset lists the six guitar strings from low to high", () => {
  const targets = getTuningTargets(DEFAULT_TUNING_PRESET_ID);

  assert.deepEqual(
    targets.map((target) => `${target.note}${target.octave}`),
    ["E2", "A2", "D3", "G3", "B3", "E4"],
  );
  assert.equal(targets.length, 6);
});

test("every preset keeps six strings and unique ids", () => {
  assert.equal(TUNING_PRESETS.length, 5);
  assert.equal(new Set(TUNING_PRESETS.map((preset) => preset.id)).size, 5);
  for (const preset of TUNING_PRESETS) {
    assert.equal(preset.strings.length, 6);
  }
});

test("drop D lowers only the sixth string", () => {
  const targets = getTuningTargets("drop-d");

  assert.equal(targets[0].note, "D");
  assert.deepEqual(
    targets.slice(1).map((target) => target.note),
    ["A", "D", "G", "B", "E"],
  );
});

test("an unknown preset falls back to standard", () => {
  const targets = getTuningTargets("not-a-tuning");

  assert.deepEqual(
    targets.map((target) => target.note),
    ["E", "A", "D", "G", "B", "E"],
  );
});

test("a frequency maps to the nearest note and its cents", () => {
  assert.deepEqual(getNoteFromFrequency(440), {
    note: "A",
    octave: 4,
    cents: 0,
    targetFrequency: 440,
  });

  const sharp = getNoteFromFrequency(440 * 2 ** (40 / 1200));
  assert.equal(sharp.note, "A");
  assert.equal(sharp.cents, 40);

  const flat = getNoteFromFrequency(440 * 2 ** (-30 / 1200));
  assert.equal(flat.cents, -30);
});

test("detects the fundamental of a sine wave", () => {
  const detection = detectPitch(sine(440), SAMPLE_RATE);

  assert.ok(detection);
  assert.ok(Math.abs(detection.frequency - 440) < 2);
  assert.ok(detection.confidence > 0.9);
});

test("detects a low guitar string without jumping an octave", () => {
  const detection = detectPitch(sine(82.4069, 0.4), SAMPLE_RATE);

  assert.ok(detection);
  assert.ok(Math.abs(detection.frequency - 82.4069) < 1);
});

test("silence and noise produce no pitch", () => {
  assert.equal(detectPitch(new Float32Array(2048), SAMPLE_RATE), null);
  assert.equal(detectPitch(null, SAMPLE_RATE), null);
  assert.equal(detectPitch(sine(440), 0), null);
});

test("an invalid note is rejected", () => {
  assert.throws(() => getNoteFrequency("H", 3), RangeError);
});

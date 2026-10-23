import assert from "node:assert/strict";
import test from "node:test";
import {
  getTabColumnSeconds,
  getTabTuningMidi,
  pitchClassToMidi,
} from "../src/utils/tab-playback.ts";

function tab(overrides = {}) {
  return {
    tuning: "EADGBE",
    measures: 1,
    subdivision: 4,
    notes: [],
    ...overrides,
  };
}

test("calcula la altura MIDI de afinaciones estándar y alternativas", () => {
  assert.deepEqual(getTabTuningMidi("EADGBE"), [40, 45, 50, 55, 59, 64]);
  assert.deepEqual(getTabTuningMidi("DADGBE"), [38, 45, 50, 55, 59, 64]);
  assert.deepEqual(getTabTuningMidi("DADGAD"), [38, 45, 50, 55, 57, 62]);
  assert.equal(pitchClassToMidi(4, 40), 40);
});

test("convierte resolución y BPM en segundos por columna", () => {
  assert.equal(getTabColumnSeconds(tab(), 120), 0.5);
  assert.equal(getTabColumnSeconds(tab({ subdivision: 16 }), 120), 0.125);
  assert.equal(getTabColumnSeconds(tab({ subdivision: 8 }), 120), 0.25);
});

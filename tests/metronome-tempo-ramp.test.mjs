import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_TEMPO_RAMP_SETTINGS,
  getTempoRampIntervalSeconds,
  increaseTempoWithinLimit,
  normalizeTempoRampSettings,
} from "../src/lib/metronome-tempo-ramp.ts";

test("defaults to a disabled, bar-based tempo ramp", () => {
  assert.deepEqual(DEFAULT_TEMPO_RAMP_SETTINGS, {
    enabled: false,
    intervalValue: 4,
    intervalUnit: "bars",
    incrementBpm: 2,
    maximumBpm: 240,
  });
});

test("converts second- and minute-based intervals to seconds", () => {
  assert.equal(
    getTempoRampIntervalSeconds({
      ...DEFAULT_TEMPO_RAMP_SETTINGS,
      intervalUnit: "seconds",
      intervalValue: 15,
    }),
    15,
  );
  assert.equal(
    getTempoRampIntervalSeconds({
      ...DEFAULT_TEMPO_RAMP_SETTINGS,
      intervalUnit: "minutes",
      intervalValue: 2,
    }),
    120,
  );
});

test("clamps user-provided ramp values to supported ranges", () => {
  assert.deepEqual(
    normalizeTempoRampSettings({
      enabled: true,
      intervalValue: 0,
      intervalUnit: "bars",
      incrementBpm: 99,
      maximumBpm: 999,
    }),
    {
      enabled: true,
      intervalValue: 1,
      intervalUnit: "bars",
      incrementBpm: 20,
      maximumBpm: 240,
    },
  );
});

test("does not increment beyond the configured tempo maximum", () => {
  assert.equal(increaseTempoWithinLimit(118, 5, 120), 120);
  assert.equal(increaseTempoWithinLimit(120, 5, 120), 120);
});

import assert from "node:assert/strict";
import test from "node:test";
import { getTimeWeightedAverageBpm } from "../src/lib/metronome-bpm.ts";

test("averages tempo changes by their duration during a practice session", () => {
  assert.equal(
    getTimeWeightedAverageBpm(
      [
        { elapsedSeconds: 0, bpm: 60 },
        { elapsedSeconds: 10, bpm: 80 },
        { elapsedSeconds: 30, bpm: 100 },
      ],
      50,
    ),
    84,
  );
});

test("uses the latest tempo when settings change at the same elapsed time", () => {
  assert.equal(
    getTimeWeightedAverageBpm(
      [
        { elapsedSeconds: 0, bpm: 60 },
        { elapsedSeconds: 10, bpm: 80 },
        { elapsedSeconds: 10, bpm: 100 },
      ],
      20,
    ),
    80,
  );
});

test("returns zero when a practice session has no elapsed time or tempo samples", () => {
  assert.equal(getTimeWeightedAverageBpm([], 20), 0);
  assert.equal(
    getTimeWeightedAverageBpm([{ elapsedSeconds: 0, bpm: 80 }], 0),
    0,
  );
});

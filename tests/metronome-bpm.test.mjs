import assert from "node:assert/strict";
import test from "node:test";
import {
  addBpmSample,
  getBlockAverageBpms,
  getTimeWeightedAverageBpm,
} from "../src/utils/metronome-bpm.ts";

test("replaces the sample when the tempo changes within the same second", () => {
  const samples = [
    { elapsedSeconds: 0, bpm: 60 },
    { elapsedSeconds: 10, bpm: 80 },
  ];

  assert.deepEqual(addBpmSample(samples, 10, 90), [
    { elapsedSeconds: 0, bpm: 60 },
    { elapsedSeconds: 10, bpm: 90 },
  ]);
  assert.deepEqual(addBpmSample(samples, 11, 90), [
    { elapsedSeconds: 0, bpm: 60 },
    { elapsedSeconds: 10, bpm: 80 },
    { elapsedSeconds: 11, bpm: 90 },
  ]);
  assert.deepEqual(addBpmSample([], 0, 60), [{ elapsedSeconds: 0, bpm: 60 }]);
});

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

test("splits the session timeline into one average per block", () => {
  const samples = [
    { elapsedSeconds: 0, bpm: 60 },
    { elapsedSeconds: 60, bpm: 100 },
  ];

  assert.deepEqual(getBlockAverageBpms(samples, [60, 60]), [60, 100]);
});

test("weights tempo changes inside a block by their duration", () => {
  const samples = [
    { elapsedSeconds: 0, bpm: 60 },
    { elapsedSeconds: 30, bpm: 120 },
    { elapsedSeconds: 60, bpm: 90 },
  ];

  assert.deepEqual(getBlockAverageBpms(samples, [60, 60]), [90, 90]);
});

test("keeps the last known tempo for a block that starts between samples", () => {
  const samples = [
    { elapsedSeconds: 0, bpm: 70 },
    { elapsedSeconds: 90, bpm: 110 },
  ];

  assert.deepEqual(getBlockAverageBpms(samples, [40, 40, 40]), [70, 70, 100]);
});

test("returns no BPM for zero-duration or silent blocks", () => {
  assert.deepEqual(getBlockAverageBpms([], [60, 60]), [0, 0]);
  assert.deepEqual(
    getBlockAverageBpms([{ elapsedSeconds: 0, bpm: 80 }], [0, 60]),
    [0, 80],
  );
});

test("only records blocks in which the metronome ran", () => {
  assert.deepEqual(
    getBlockAverageBpms(
      [
        { elapsedSeconds: 0, bpm: 80 },
        { elapsedSeconds: 120, bpm: 100 },
      ],
      [60, 60, 60],
      [0, 2],
    ),
    [80, 0, 100],
  );
});

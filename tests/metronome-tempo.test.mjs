import assert from "node:assert/strict";
import test from "node:test";
import {
  clampMetronomeBpm,
  clampMetronomeVolume,
  getTapTempoUpdate,
} from "../src/lib/metronome-tempo.ts";

test("clamps the metronome tempo and volume to their supported ranges", () => {
  assert.equal(clampMetronomeBpm(10), 40);
  assert.equal(clampMetronomeBpm(80.6), 81);
  assert.equal(clampMetronomeBpm(300), 240);
  assert.equal(clampMetronomeVolume(-1), 0);
  assert.equal(clampMetronomeVolume(0.65), 0.65);
  assert.equal(clampMetronomeVolume(2), 1);
});

test("starts tap tempo over after the reset interval and ignores taps that are too close", () => {
  const initial = { lastTapTime: null, intervals: [], tapCount: 0 };
  const firstTap = getTapTempoUpdate(initial, 1_000);
  const tooSoon = getTapTempoUpdate(firstTap.state, 1_200);
  const accepted = getTapTempoUpdate(tooSoon.state, 1_500);
  const reset = getTapTempoUpdate(accepted.state, 3_501);

  assert.deepEqual(firstTap.state, {
    lastTapTime: 1_000,
    intervals: [],
    tapCount: 1,
  });
  assert.equal(tooSoon.accepted, false);
  assert.equal(tooSoon.state, firstTap.state);
  assert.equal(accepted.bpm, 120);
  assert.deepEqual(reset.state, {
    lastTapTime: 3_501,
    intervals: [],
    tapCount: 1,
  });
  assert.equal(reset.bpm, null);
});

test("calculates tempo from at most the four most recent accepted intervals", () => {
  let state = getTapTempoUpdate(
    { lastTapTime: null, intervals: [], tapCount: 0 },
    1_000,
  ).state;
  for (const tapTime of [1_250, 1_750, 2_250, 2_750, 3_250, 3_750]) {
    state = getTapTempoUpdate(state, tapTime).state;
  }

  assert.deepEqual(state.intervals, [500, 500, 500, 500]);
  assert.equal(state.tapCount, 5);
});

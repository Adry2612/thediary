import assert from "node:assert/strict";
import test from "node:test";
import { getScheduledMetronomeBeats } from "../src/lib/metronome-scheduler.ts";

test("schedules beats ahead using the tempo and current subdivision", () => {
  const result = getScheduledMetronomeBeats({
    state: { nextBeatTime: 1, beatNumber: 0, subdivisionNumber: 0 },
    currentTime: 1.5,
    bpm: 120,
    subdivision: 2,
  });

  assert.deepEqual(result.beats, [
    { scheduledAt: 1, beat: 0, subdivision: 0, isDownbeat: true },
    { scheduledAt: 1.25, beat: 0, subdivision: 1, isDownbeat: false },
    { scheduledAt: 1.5, beat: 1, subdivision: 0, isDownbeat: false },
  ]);
  assert.deepEqual(result.state, {
    nextBeatTime: 1.75,
    beatNumber: 1,
    subdivisionNumber: 1,
  });
});

test("wraps beat numbers and marks the first beat of each bar", () => {
  const result = getScheduledMetronomeBeats({
    state: { nextBeatTime: 1, beatNumber: 3, subdivisionNumber: 0 },
    currentTime: 1.5,
    bpm: 120,
    subdivision: 1,
  });

  assert.deepEqual(
    result.beats.map(({ beat, isDownbeat }) => ({ beat, isDownbeat })),
    [
      { beat: 3, isDownbeat: false },
      { beat: 0, isDownbeat: true },
    ],
  );
});

test("leaves the schedule unchanged when no beat is due", () => {
  const state = { nextBeatTime: 2, beatNumber: 1, subdivisionNumber: 0 };
  const result = getScheduledMetronomeBeats({
    state,
    currentTime: 1,
    bpm: 120,
    subdivision: 1,
  });

  assert.deepEqual(result, { state, beats: [] });
});

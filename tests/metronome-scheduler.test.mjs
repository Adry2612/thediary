import assert from "node:assert/strict";
import test from "node:test";
import { getScheduledMetronomeBeats } from "../src/lib/metronome-scheduler.ts";

const noTempoRamp = {
  enabled: false,
  intervalValue: 4,
  intervalUnit: "bars",
  incrementBpm: 2,
  maximumBpm: 240,
};

test("schedules beats ahead using the tempo and current subdivision", () => {
  const result = getScheduledMetronomeBeats({
    state: {
      nextBeatTime: 1,
      beatNumber: 0,
      subdivisionNumber: 0,
      completedBars: 0,
      nextTempoIncreaseAt: null,
      nextTempoIncreaseBar: null,
    },
    currentTime: 1.5,
    bpm: 120,
    subdivision: 2,
    beatsPerMeasure: 4,
    tempoRamp: noTempoRamp,
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
    completedBars: 0,
    nextTempoIncreaseAt: null,
    nextTempoIncreaseBar: null,
  });
  assert.equal(result.bpm, 120);
});

test("wraps beat numbers and marks the first beat of each bar", () => {
  const result = getScheduledMetronomeBeats({
    state: {
      nextBeatTime: 1,
      beatNumber: 3,
      subdivisionNumber: 0,
      completedBars: 0,
      nextTempoIncreaseAt: null,
      nextTempoIncreaseBar: null,
    },
    currentTime: 1.5,
    bpm: 120,
    subdivision: 1,
    beatsPerMeasure: 4,
    tempoRamp: noTempoRamp,
  });

  assert.deepEqual(
    result.beats.map(({ beat, isDownbeat }) => ({ beat, isDownbeat })),
    [
      { beat: 3, isDownbeat: false },
      { beat: 0, isDownbeat: true },
    ],
  );
  assert.equal(result.state.completedBars, 1);
});

test("leaves the schedule unchanged when no beat is due", () => {
  const state = {
    nextBeatTime: 2,
    beatNumber: 1,
    subdivisionNumber: 0,
    completedBars: 0,
    nextTempoIncreaseAt: null,
    nextTempoIncreaseBar: null,
  };
  const result = getScheduledMetronomeBeats({
    state,
    currentTime: 1,
    bpm: 120,
    subdivision: 1,
    beatsPerMeasure: 4,
    tempoRamp: noTempoRamp,
  });

  assert.deepEqual(result, { state, bpm: 120, beats: [] });
});

test("uses dotted-quarter pulses and two beats per 6/8 bar", () => {
  const result = getScheduledMetronomeBeats({
    state: {
      nextBeatTime: 1,
      beatNumber: 0,
      subdivisionNumber: 0,
      completedBars: 0,
      nextTempoIncreaseAt: null,
      nextTempoIncreaseBar: null,
    },
    currentTime: 2.1,
    bpm: 120,
    subdivision: 1,
    beatsPerMeasure: 2,
    tempoRamp: noTempoRamp,
  });

  assert.deepEqual(
    result.beats.map(({ scheduledAt, beat, isDownbeat }) => ({
      scheduledAt,
      beat,
      isDownbeat,
    })),
    [
      { scheduledAt: 1, beat: 0, isDownbeat: true },
      { scheduledAt: 1.5, beat: 1, isDownbeat: false },
      { scheduledAt: 2, beat: 0, isDownbeat: true },
    ],
  );
  assert.equal(result.state.completedBars, 1);
});

test("increases tempo on each configured bar boundary", () => {
  const result = getScheduledMetronomeBeats({
    state: {
      nextBeatTime: 0,
      beatNumber: 0,
      subdivisionNumber: 0,
      completedBars: 0,
      nextTempoIncreaseAt: null,
      nextTempoIncreaseBar: 1,
    },
    currentTime: 2.1,
    bpm: 60,
    subdivision: 1,
    beatsPerMeasure: 2,
    tempoRamp: {
      enabled: true,
      intervalValue: 1,
      intervalUnit: "bars",
      incrementBpm: 5,
      maximumBpm: 70,
    },
  });

  assert.deepEqual(
    result.beats.map(({ beat, isDownbeat }) => ({ beat, isDownbeat })),
    [
      { beat: 0, isDownbeat: true },
      { beat: 1, isDownbeat: false },
      { beat: 0, isDownbeat: true },
    ],
  );
  assert.equal(result.bpm, 65);
  assert.equal(result.state.nextTempoIncreaseBar, 2);
});

test("increases tempo by elapsed time without exceeding its maximum", () => {
  const result = getScheduledMetronomeBeats({
    state: {
      nextBeatTime: 0,
      beatNumber: 0,
      subdivisionNumber: 0,
      completedBars: 0,
      nextTempoIncreaseAt: 1,
      nextTempoIncreaseBar: null,
    },
    currentTime: 4.1,
    bpm: 60,
    subdivision: 1,
    beatsPerMeasure: 4,
    tempoRamp: {
      enabled: true,
      intervalValue: 1,
      intervalUnit: "seconds",
      incrementBpm: 3,
      maximumBpm: 65,
    },
  });

  assert.equal(result.bpm, 65);
  assert.equal(result.state.nextTempoIncreaseAt, null);
});

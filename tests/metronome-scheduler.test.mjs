import assert from "node:assert/strict";
import test from "node:test";
import { getScheduledMetronomeBeats } from "../src/utils/metronome-scheduler.ts";
import { createDefaultBeatPattern } from "../src/utils/metronome-beat-pattern.ts";

const noTempoRamp = {
  enabled: false,
  intervalValue: 4,
  intervalUnit: "bars",
  incrementBpm: 2,
  maximumBpm: 240,
};

const emptyState = {
  nextBeatTime: 1,
  beatNumber: 0,
  subdivisionNumber: 0,
  completedBars: 0,
  nextTempoIncreaseAt: null,
  nextTempoIncreaseBar: null,
};

test("schedules beats ahead using the tempo and current subdivision", () => {
  const result = getScheduledMetronomeBeats({
    state: emptyState,
    currentTime: 1.5,
    bpm: 120,
    subdivision: 2,
    beatsPerMeasure: 4,
    beatPattern: createDefaultBeatPattern(4),
    tempoRamp: noTempoRamp,
  });

  assert.deepEqual(result.beats, [
    { scheduledAt: 1, beat: 0, subdivision: 0, click: "accent" },
    { scheduledAt: 1.25, beat: 0, subdivision: 1, click: "normal" },
    { scheduledAt: 1.5, beat: 1, subdivision: 0, click: "normal" },
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
    state: { ...emptyState, beatNumber: 3 },
    currentTime: 1.5,
    bpm: 120,
    subdivision: 1,
    beatsPerMeasure: 4,
    beatPattern: createDefaultBeatPattern(4),
    tempoRamp: noTempoRamp,
  });

  assert.deepEqual(
    result.beats.map(({ beat, click }) => ({ beat, click })),
    [
      { beat: 3, click: "normal" },
      { beat: 0, click: "accent" },
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
    beatPattern: createDefaultBeatPattern(4),
    tempoRamp: noTempoRamp,
  });

  assert.deepEqual(result, { state, bpm: 120, beats: [] });
});

test("uses dotted-quarter pulses and two beats per 6/8 bar", () => {
  const result = getScheduledMetronomeBeats({
    state: emptyState,
    currentTime: 2.1,
    bpm: 120,
    subdivision: 1,
    beatsPerMeasure: 2,
    beatPattern: createDefaultBeatPattern(2),
    tempoRamp: noTempoRamp,
  });

  assert.deepEqual(
    result.beats.map(({ scheduledAt, beat, click }) => ({
      scheduledAt,
      beat,
      click,
    })),
    [
      { scheduledAt: 1, beat: 0, click: "accent" },
      { scheduledAt: 1.5, beat: 1, click: "normal" },
      { scheduledAt: 2, beat: 0, click: "accent" },
    ],
  );
  assert.equal(result.state.completedBars, 1);
});

test("a non-first beat can carry the accent", () => {
  const result = getScheduledMetronomeBeats({
    state: emptyState,
    currentTime: 2.1,
    bpm: 120,
    subdivision: 1,
    beatsPerMeasure: 4,
    beatPattern: ["normal", "normal", "accent", "normal"],
    tempoRamp: noTempoRamp,
  });

  assert.deepEqual(
    result.beats.map(({ beat, click }) => ({ beat, click })),
    [
      { beat: 0, click: "normal" },
      { beat: 1, click: "normal" },
      { beat: 2, click: "accent" },
    ],
  );
});

test("a closed accent clicks as its own kind", () => {
  const result = getScheduledMetronomeBeats({
    state: emptyState,
    currentTime: 1.5,
    bpm: 120,
    subdivision: 1,
    beatsPerMeasure: 2,
    beatPattern: ["accentClosed", "accent"],
    tempoRamp: noTempoRamp,
  });

  assert.deepEqual(
    result.beats.map(({ beat, click }) => ({ beat, click })),
    [
      { beat: 0, click: "accentClosed" },
      { beat: 1, click: "accent" },
    ],
  );
});

test("a muted beat and its subdivisions do not click", () => {
  const result = getScheduledMetronomeBeats({
    state: emptyState,
    currentTime: 1.5,
    bpm: 120,
    subdivision: 2,
    beatsPerMeasure: 2,
    beatPattern: ["muted", "accent"],
    tempoRamp: noTempoRamp,
  });

  assert.deepEqual(
    result.beats.map(({ beat, subdivision, click }) => ({
      beat,
      subdivision,
      click,
    })),
    [
      { beat: 0, subdivision: 0, click: "none" },
      { beat: 0, subdivision: 1, click: "none" },
      { beat: 1, subdivision: 0, click: "accent" },
    ],
  );
});

test("increases tempo on each configured bar boundary", () => {
  const result = getScheduledMetronomeBeats({
    state: {
      ...emptyState,
      nextBeatTime: 0,
      nextTempoIncreaseBar: 1,
    },
    currentTime: 2.1,
    bpm: 60,
    subdivision: 1,
    beatsPerMeasure: 2,
    beatPattern: createDefaultBeatPattern(2),
    tempoRamp: {
      enabled: true,
      intervalValue: 1,
      intervalUnit: "bars",
      incrementBpm: 5,
      maximumBpm: 70,
    },
  });

  assert.deepEqual(
    result.beats.map(({ beat, click }) => ({ beat, click })),
    [
      { beat: 0, click: "accent" },
      { beat: 1, click: "normal" },
      { beat: 0, click: "accent" },
    ],
  );
  assert.equal(result.bpm, 65);
  assert.equal(result.state.nextTempoIncreaseBar, 2);
});

test("a muted first beat does not stop the bar-based tempo ramp", () => {
  const result = getScheduledMetronomeBeats({
    state: {
      ...emptyState,
      nextBeatTime: 0,
      nextTempoIncreaseBar: 1,
    },
    currentTime: 2.1,
    bpm: 60,
    subdivision: 1,
    beatsPerMeasure: 2,
    beatPattern: ["muted", "normal"],
    tempoRamp: {
      enabled: true,
      intervalValue: 1,
      intervalUnit: "bars",
      incrementBpm: 5,
      maximumBpm: 70,
    },
  });

  assert.equal(result.bpm, 65);
  assert.equal(result.state.nextTempoIncreaseBar, 2);
});

test("increases tempo by elapsed time without exceeding its maximum", () => {
  const result = getScheduledMetronomeBeats({
    state: {
      ...emptyState,
      nextBeatTime: 0,
      nextTempoIncreaseAt: 1,
    },
    currentTime: 4.1,
    bpm: 60,
    subdivision: 1,
    beatsPerMeasure: 4,
    beatPattern: createDefaultBeatPattern(4),
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

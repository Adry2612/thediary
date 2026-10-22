import assert from "node:assert/strict";
import test from "node:test";
import {
  getLickProgress,
  markLickPracticed,
  recordLickBpm,
} from "../src/lib/licks/progress.ts";

const now = new Date("2026-02-01T10:30:00.000Z");
const base = {
  id: "lick-1",
  title: "Frase",
  tabContent: "",
  techniques: [],
  bpmHistory: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  practiceCount: 0,
};

test("records a BPM entry and updates the lick", () => {
  const lick = recordLickBpm(base, 120, "  limpio  ", now);
  assert.ok(lick);
  assert.equal(lick.currentBpm, 120);
  assert.equal(lick.lastPracticedAt, now.toISOString());
  assert.equal(lick.practiceCount, 1);
  assert.equal(lick.bpmHistory.length, 1);
  assert.equal(lick.bpmHistory[0].bpm, 120);
  assert.equal(lick.bpmHistory[0].notes, "limpio");
  assert.equal(lick.bpmHistory[0].date, now.toISOString());
  assert.ok(lick.bpmHistory[0].id);
});

test("rejects a BPM outside the metronome range", () => {
  assert.equal(recordLickBpm(base, 39, undefined, now), null);
  assert.equal(recordLickBpm(base, 241, undefined, now), null);
  assert.equal(recordLickBpm(base, Number.NaN, undefined, now), null);
});

test("keeps the history ordered when an older entry arrives", () => {
  const previous = {
    ...base,
    bpmHistory: [
      { id: "second", bpm: 130, date: "2026-01-20T00:00:00.000Z" },
    ],
  };
  const lick = recordLickBpm(previous, 110, undefined, new Date("2026-01-10T00:00:00.000Z"));
  assert.ok(lick);
  assert.deepEqual(
    lick.bpmHistory.map((entry) => entry.date),
    ["2026-01-10T00:00:00.000Z", "2026-01-20T00:00:00.000Z"],
  );
  assert.equal(lick.currentBpm, 130);
});

test("marking practised leaves BPM and history untouched", () => {
  const previous = {
    ...base,
    currentBpm: 100,
    bpmHistory: [
      { id: "a", bpm: 100, date: "2026-01-20T00:00:00.000Z" },
    ],
    practiceCount: 4,
  };
  const lick = markLickPracticed(previous, now);
  assert.equal(lick.lastPracticedAt, now.toISOString());
  assert.equal(lick.practiceCount, 5);
  assert.equal(lick.currentBpm, 100);
  assert.deepEqual(lick.bpmHistory, previous.bpmHistory);
});

test("progress without history or target", () => {
  assert.deepEqual(getLickProgress(base), { reachedTarget: false });
});

test("progress without a target", () => {
  const progress = getLickProgress({
    ...base,
    bpmHistory: [
      { id: "a", bpm: 80, date: "2026-01-02T00:00:00.000Z" },
      { id: "b", bpm: 95, date: "2026-01-03T00:00:00.000Z" },
    ],
  });
  assert.equal(progress.startBpm, 80);
  assert.equal(progress.currentBpm, 95);
  assert.equal(progress.percentage, undefined);
  assert.equal(progress.reachedTarget, false);
});

test("progress below, at and above the target", () => {
  const history = [{ id: "a", bpm: 80, date: "2026-01-02T00:00:00.000Z" }];

  const below = getLickProgress({
    ...base,
    targetBpm: 100,
    bpmHistory: history,
  });
  assert.equal(below.percentage, 80);
  assert.equal(below.reachedTarget, false);

  const at = getLickProgress({
    ...base,
    targetBpm: 80,
    bpmHistory: history,
  });
  assert.equal(at.percentage, 100);
  assert.equal(at.reachedTarget, true);

  const above = getLickProgress({
    ...base,
    targetBpm: 60,
    bpmHistory: history,
  });
  assert.equal(above.percentage, 100);
  assert.equal(above.reachedTarget, true);
});

test("a single entry is both the start and the current BPM", () => {
  const progress = getLickProgress({
    ...base,
    bpmHistory: [{ id: "a", bpm: 90, date: "2026-01-02T00:00:00.000Z" }],
  });
  assert.equal(progress.startBpm, 90);
  assert.equal(progress.currentBpm, 90);
});

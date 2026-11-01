import assert from "node:assert/strict";
import test from "node:test";
import {
  canRedo,
  canUndo,
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from "../src/utils/tab-score/history.ts";

function score(tempo = 90) {
  return {
    version: 2,
    tuning: "EADGBE",
    tempo,
    bars: [{ id: "bar-a", beats: [] }],
  };
}

const selection = { bar: 0, beat: 0, string: 0 };

test("undoes and redoes a change and restores the selection", () => {
  const history = createHistory(score(90), selection);
  const nextSelection = { bar: 0, beat: 1, string: 2 };
  const pushed = pushHistory(history, score(100), nextSelection);

  assert.equal(canUndo(pushed), true);
  assert.equal(canRedo(pushed), false);

  const undone = undoHistory(pushed);
  assert.equal(undone.present.score.tempo, 90);
  assert.deepEqual(undone.present.selection, selection);
  assert.equal(canRedo(undone), true);

  const redone = redoHistory(undone);
  assert.equal(redone.present.score.tempo, 100);
  assert.deepEqual(redone.present.selection, nextSelection);
});

test("a new edit after undoing discards the redo history", () => {
  const pushed = pushHistory(createHistory(score(90), selection), score(100), selection);
  const undone = undoHistory(pushed);
  const branched = pushHistory(undone, score(120), selection);

  assert.equal(canRedo(branched), false);
  assert.equal(branched.present.score.tempo, 120);
});

test("coalesces the two digits of one edit", () => {
  const first = pushHistory(
    createHistory(score(90), selection),
    score(100),
    selection,
    "fret:0:0:0",
  );
  const second = pushHistory(first, score(120), selection, "fret:0:0:0");
  const third = pushHistory(second, score(130), selection, "other");

  assert.equal(second.past.length, 1);
  assert.equal(second.present.score.tempo, 120);
  assert.equal(third.past.length, 2);
});

test("keeps at most 200 undo steps", () => {
  let history = createHistory(score(0), selection);
  for (let index = 1; index <= 250; index++) {
    history = pushHistory(history, score(index), selection);
  }

  assert.equal(history.past.length, 200);
  assert.equal(undoHistory(history).present.score.tempo, 249);
});

test("undoing without history does nothing", () => {
  const history = createHistory(score(90), selection);
  const undone = undoHistory(history);

  assert.equal(undone.present.score.tempo, 90);
  assert.equal(canUndo(undone), false);
  assert.equal(canRedo(redoHistory(history)), false);
});

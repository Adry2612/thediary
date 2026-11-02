import assert from "node:assert/strict";
import test from "node:test";
import { getSelectedNotes, moveSelection } from "../src/utils/tab-score/selection.ts";

function note(string, fret) {
  return { string, fret };
}

function beat(id, notes = []) {
  return { id, duration: 4, rest: notes.length === 0, notes };
}

function score() {
  return {
    tuning: "EADGBE",
    bars: [
      {
        id: "bar-a",
        beats: [
          beat("b0", [note(0, 5)]),
          beat("b1", [note(0, 7), note(1, 3)]),
          beat("b2", [note(0, 9)]),
          beat("b3"),
        ],
      },
    ],
  };
}

test("a horizontal drag marks every note in the beats, even across strings", () => {
  const notes = getSelectedNotes(score(), {
    bar: 0,
    beat: 0,
    string: 0,
    anchor: { bar: 0, beat: 2, string: 0 },
  });

  assert.deepEqual(notes, [
    { bar: 0, beat: 0, string: 0 },
    { bar: 0, beat: 1, string: 0 },
    { bar: 0, beat: 1, string: 1 },
    { bar: 0, beat: 2, string: 0 },
  ]);
});

test("a diagonal drag marks every note in the beats, whichever string", () => {
  const notes = getSelectedNotes(score(), {
    bar: 0,
    beat: 0,
    string: 0,
    anchor: { bar: 0, beat: 1, string: 1 },
  });

  assert.deepEqual(notes, [
    { bar: 0, beat: 0, string: 0 },
    { bar: 0, beat: 1, string: 0 },
    { bar: 0, beat: 1, string: 1 },
  ]);
});

test("skips empty beats and keeps only the notes that exist", () => {
  const notes = getSelectedNotes(score(), {
    bar: 0,
    beat: 0,
    string: 0,
    anchor: { bar: 0, beat: 3, string: 1 },
  });

  assert.deepEqual(notes, [
    { bar: 0, beat: 0, string: 0 },
    { bar: 0, beat: 1, string: 0 },
    { bar: 0, beat: 1, string: 1 },
    { bar: 0, beat: 2, string: 0 },
  ]);
});

test("without an anchor selects only the focus note", () => {
  assert.deepEqual(
    getSelectedNotes(score(), { bar: 0, beat: 2, string: 0 }),
    [{ bar: 0, beat: 2, string: 0 }],
  );
  assert.deepEqual(
    getSelectedNotes(score(), { bar: 0, beat: 3, string: 0 }),
    [],
  );
});

test("up moves to the string drawn above and down to the one below", () => {
  const base = score();

  assert.equal(
    moveSelection(base, { bar: 0, beat: 0, string: 0 }, "up", false).string,
    1,
  );
  assert.equal(
    moveSelection(base, { bar: 0, beat: 0, string: 5 }, "up", false).string,
    5,
  );
  assert.equal(
    moveSelection(base, { bar: 0, beat: 0, string: 5 }, "down", false).string,
    4,
  );
  assert.equal(
    moveSelection(base, { bar: 0, beat: 0, string: 0 }, "down", false).string,
    0,
  );
});

test("Shift extends the selection while the string moves", () => {
  const moved = moveSelection(
    score(),
    { bar: 0, beat: 0, string: 1 },
    "up",
    true,
  );

  assert.equal(moved.string, 2);
  assert.deepEqual(moved.anchor, { bar: 0, beat: 0, string: 1 });
});

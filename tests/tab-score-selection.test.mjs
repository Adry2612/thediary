import assert from "node:assert/strict";
import test from "node:test";
import { getSelectedNotes } from "../src/utils/tab-score/selection.ts";

function note(string, fret) {
  return { string, fret };
}

function beat(id, notes = []) {
  return { id, duration: 4, rest: notes.length === 0, notes };
}

function score() {
  return {
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

test("selects the notes on the dragged string, not the whole beats", () => {
  const notes = getSelectedNotes(score(), {
    bar: 0,
    beat: 0,
    string: 0,
    anchor: { bar: 0, beat: 2, string: 0 },
  });

  assert.deepEqual(notes, [
    { bar: 0, beat: 0, string: 0 },
    { bar: 0, beat: 1, string: 0 },
    { bar: 0, beat: 2, string: 0 },
  ]);
});

test("selects every note inside a rectangle of strings and beats", () => {
  const notes = getSelectedNotes(score(), {
    bar: 0,
    beat: 1,
    string: 0,
    anchor: { bar: 0, beat: 1, string: 1 },
  });

  assert.deepEqual(notes, [
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

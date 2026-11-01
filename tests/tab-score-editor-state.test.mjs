import assert from "node:assert/strict";
import test from "node:test";
import {
  createEditorState,
  getSelectedBeats,
  tabScoreEditorReducer,
} from "../src/utils/tab-score/editor-state.ts";
import { createEmptyScore } from "../src/utils/tab-score/model.ts";
import { clearClipboard } from "../src/utils/tab-score/clipboard.ts";

function run(actions, initial = createEmptyScore()) {
  return actions.reduce(tabScoreEditorReducer, createEditorState(initial));
}

test("writes a fret, advances and undoes it", () => {
  const written = run([
    { type: "select", position: { bar: 0, beat: 0, string: 3 } },
    { type: "digit", digit: "5" },
  ]);

  assert.equal(written.score.bars[0].beats[0].notes[0].fret, 5);
  assert.equal(written.score.bars[0].beats[0].notes[0].string, 3);
  assert.equal(written.score.bars[0].beats[0].rest, false);
  assert.equal(written.buffer, "");
  assert.deepEqual(written.selection, { bar: 0, beat: 1, string: 3 });

  const undone = tabScoreEditorReducer(written, { type: "undo" });
  assert.equal(undone.score.bars[0].beats.length, 1);
  assert.equal(undone.score.bars[0].beats[0].rest, true);
  assert.equal(undone.score.bars[0].beats[0].notes.length, 0);

  const redone = tabScoreEditorReducer(undone, { type: "redo" });
  assert.equal(redone.score.bars[0].beats[0].notes[0].fret, 5);
});

test("writes a riff with the numbers in a row and fills the bar", () => {
  const state = run([
    { type: "selectAt", position: { bar: 0, beat: 0, string: 2 }, fraction: 0 },
    { type: "digit", digit: "5" },
    { type: "digit", digit: "7" },
    { type: "digit", digit: "8" },
    { type: "digit", digit: "5" },
  ]);

  assert.deepEqual(
    state.score.bars[0].beats.map((beat) => beat.notes[0]?.fret ?? null),
    [5, 7, 8, 5],
  );
  assert.deepEqual(
    state.score.bars[0].beats.map((beat) => beat.duration),
    [4, 4, 4, 4],
  );
  assert.equal(state.score.bars.length, 2);
  assert.deepEqual(state.selection, { bar: 1, beat: 0, string: 2 });
  assert.equal(state.history.past.length, 4);
});

test("0 and 3 are two notes and not the fret 03", () => {
  const state = run([
    { type: "digit", digit: "0" },
    { type: "digit", digit: "3" },
  ]);

  assert.equal(state.score.bars[0].beats[0].notes[0].fret, 0);
  assert.equal(state.score.bars[0].beats[1].notes[0].fret, 3);
});

test("two digits build one fret and coalesce into a single undo step", () => {
  const written = run([
    { type: "digit", digit: "1" },
    { type: "digit", digit: "2" },
  ]);

  assert.equal(written.score.bars[0].beats[0].notes[0].fret, 12);
  assert.equal(written.score.bars[0].beats[1].notes.length, 0);
  assert.equal(written.buffer, "");
  assert.deepEqual(written.selection, { bar: 0, beat: 1, string: 0 });
  assert.equal(written.history.past.length, 1);

  const undone = tabScoreEditorReducer(written, { type: "undo" });
  assert.equal(undone.score.bars[0].beats.length, 1);
  assert.equal(undone.score.bars[0].beats[0].rest, true);
});

test("the wait after a first digit ends with the advance action", () => {
  const waiting = run([{ type: "digit", digit: "1" }]);

  assert.equal(waiting.buffer, "1");
  assert.deepEqual(waiting.selection, { bar: 0, beat: 0, string: 0 });

  const advanced = tabScoreEditorReducer(waiting, { type: "advance" });
  assert.equal(advanced.buffer, "");
  assert.equal(advanced.score.bars[0].beats[0].notes[0].fret, 1);
  assert.deepEqual(advanced.selection, { bar: 0, beat: 1, string: 0 });
});

test("a fret above 24 closes the first note and starts the next", () => {
  const written = run([
    { type: "digit", digit: "2" },
    { type: "digit", digit: "4" },
    { type: "digit", digit: "5" },
  ]);

  assert.equal(written.score.bars[0].beats[0].notes[0].fret, 24);
  assert.equal(written.score.bars[0].beats[1].notes[0].fret, 5);
});

test("moving clears the fret buffer", () => {
  const moved = run([
    { type: "digit", digit: "3" },
    { type: "move", direction: "down" },
  ]);

  assert.equal(moved.buffer, "");
  assert.deepEqual(moved.selection, { bar: 0, beat: 1, string: 1 });
});

test("reports an error without changing the score", () => {
  const state = run([{ type: "deleteNote" }]);

  assert.equal(state.error, "noSelection");
  assert.equal(state.score.bars[0].beats[0].rest, true);
});

test("selects a range and copies beats between editors", () => {
  clearClipboard();
  const base = createEmptyScore();
  base.bars[0].beats[0].duration = 2;
  base.bars[0].beats.push({ id: "beat-b", duration: 2, rest: true, notes: [] });
  const withNotes = run(
    [
      { type: "digit", digit: "3" },
      { type: "move", direction: "right" },
      { type: "digit", digit: "5" },
    ],
    base,
  );

  const selected = tabScoreEditorReducer(withNotes, {
    type: "select",
    position: { bar: 0, beat: 0, string: 0 },
  });
  const ranged = tabScoreEditorReducer(selected, {
    type: "select",
    position: { bar: 0, beat: 1, string: 0 },
    extend: true,
  });
  const copied = tabScoreEditorReducer(ranged, { type: "copyBeats" });

  assert.equal(getSelectedBeats(ranged).length, 2);
  assert.equal(copied.clipboard.kind, "beats");
  assert.equal(copied.clipboard.beats.length, 2);

  const other = createEditorState(createEmptyScore(), copied.clipboard);
  const pasted = tabScoreEditorReducer(other, { type: "paste" });
  assert.equal(
    pasted.score.bars[0].beats[0].notes[0].fret,
    3,
  );
});

test("applies techniques and bar actions through the reducer", () => {
  const state = run([
    { type: "digit", digit: "3" },
    { type: "select", position: { bar: 0, beat: 0, string: 0 } },
    { type: "technique", patch: { palmMute: true } },
    { type: "appendBar" },
  ]);

  assert.equal(state.score.bars[0].beats[0].notes[0].palmMute, true);
  assert.equal(state.score.bars.length, 2);
  assert.equal(state.selection.bar, 1);
});

test("splits a beat and undoes it through the reducer", () => {
  const split = run([{ type: "splitBeat" }]);

  assert.equal(split.score.bars[0].beats.length, 2);
  assert.equal(split.selection.beat, 1);
  assert.equal(split.score.bars[0].beats[1].rest, true);

  const undone = tabScoreEditorReducer(split, { type: "undo" });
  assert.equal(undone.score.bars[0].beats.length, 1);
  assert.equal(undone.selection.beat, 0);
});

test("the first digit after clicking a gap splits the beat at that point", () => {
  const state = run([
    {
      type: "selectAt",
      position: { bar: 0, beat: 0, string: 0 },
      fraction: 0.75,
    },
    { type: "digit", digit: "5" },
  ]);

  assert.equal(state.score.bars[0].beats.length, 3);
  assert.equal(state.score.bars[0].beats[0].rest, true);
  assert.equal(state.score.bars[0].beats[1].rest, true);
  assert.equal(state.score.bars[0].beats[2].rest, false);
  assert.deepEqual(state.score.bars[0].beats[2].notes, [
    { string: 0, fret: 5 },
  ]);
  assert.equal(state.score.bars.length, 2);
  assert.deepEqual(state.selection, { bar: 1, beat: 0, string: 0 });
  assert.equal(state.history.past.length, 1);

  const undone = tabScoreEditorReducer(state, { type: "undo" });
  assert.equal(undone.score.bars.length, 1);
  assert.equal(undone.score.bars[0].beats.length, 1);
  assert.equal(undone.score.bars[0].beats[0].rest, true);
});

test("moving a beat swaps it with its neighbour and keeps the selection", () => {
  const initial = {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [
      {
        id: "bar-a",
        beats: [
          {
            id: "b1",
            duration: 4,
            rest: false,
            notes: [{ string: 0, fret: 1 }],
          },
          {
            id: "b2",
            duration: 4,
            rest: false,
            notes: [{ string: 0, fret: 2 }],
          },
        ],
      },
    ],
  };

  const state = run([{ type: "moveBeat", direction: "right" }], initial);
  assert.equal(state.score.bars[0].beats[0].notes[0].fret, 2);
  assert.equal(state.score.bars[0].beats[1].notes[0].fret, 1);
  assert.equal(state.selection.beat, 1);
});

test("replaceScore resets the history", () => {
  const state = run([
    { type: "digit", digit: "3" },
    { type: "replaceScore", score: createEmptyScore("DADGAD") },
  ]);

  assert.equal(state.score.tuning, "DADGAD");
  assert.equal(state.history.past.length, 0);
});

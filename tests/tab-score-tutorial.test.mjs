import assert from "node:assert/strict";
import test from "node:test";
import {
  TAB_TUTORIAL_STEPS,
  checkTutorialStep,
  snapshotTutorial,
} from "../src/utils/tab-score/tutorial.ts";

function score(beats, overrides = {}) {
  return {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [{ id: "bar-a", beats }],
    ...overrides,
  };
}

function beat(overrides = {}) {
  return { id: "beat-a", duration: 4, notes: [], rest: true, ...overrides };
}

const selection = { bar: 0, beat: 0, string: 0 };

test("describes the action steps in order and ends in done", () => {
  assert.deepEqual(TAB_TUTORIAL_STEPS, [
    "select",
    "write",
    "chord",
    "menu",
    "duration",
    "split",
    "done",
  ]);
});

test("a note that was already there does not complete the write step", () => {
  const value = score([
    beat({ rest: false, notes: [{ string: 0, fret: 5 }] }),
  ]);
  const snapshot = snapshotTutorial(value, selection, false);

  assert.equal(
    checkTutorialStep("write", snapshot, {
      score: value,
      selection,
      paletteOpen: false,
    }).advance,
    false,
  );

  const written = score([
    beat({ rest: false, notes: [{ string: 0, fret: 7 }] }),
  ]);
  assert.equal(
    checkTutorialStep("write", snapshot, {
      score: written,
      selection,
      paletteOpen: false,
    }).advance,
    true,
  );
});

test("the chord step waits for a new note on the selected beat", () => {
  const one = score([beat({ rest: false, notes: [{ string: 0, fret: 5 }] })]);
  const snapshot = snapshotTutorial(one, selection, false);

  assert.equal(
    checkTutorialStep("chord", snapshot, {
      score: one,
      selection,
      paletteOpen: false,
    }).advance,
    false,
  );

  const two = score([
    beat({
      rest: false,
      notes: [
        { string: 0, fret: 5 },
        { string: 1, fret: 7 },
      ],
    }),
  ]);
  assert.equal(
    checkTutorialStep("chord", snapshot, {
      score: two,
      selection,
      paletteOpen: false,
    }).advance,
    true,
  );
});

test("the duration step notices only a different duration", () => {
  const quarter = score([beat({ duration: 4 })]);
  const snapshot = snapshotTutorial(quarter, selection, false);

  assert.equal(
    checkTutorialStep("duration", snapshot, {
      score: quarter,
      selection,
      paletteOpen: false,
    }).advance,
    false,
  );

  const eighth = score([beat({ duration: 8 })]);
  assert.equal(
    checkTutorialStep("duration", snapshot, {
      score: eighth,
      selection,
      paletteOpen: false,
    }).advance,
    true,
  );
});

test("the split step waits for one more beat in the bar", () => {
  const one = score([beat()]);
  const snapshot = snapshotTutorial(one, selection, false);

  assert.equal(
    checkTutorialStep("split", snapshot, {
      score: one,
      selection,
      paletteOpen: false,
    }).advance,
    false,
  );

  const two = score([beat(), beat({ id: "beat-b", duration: 2 })]);
  assert.equal(
    checkTutorialStep("split", snapshot, {
      score: two,
      selection,
      paletteOpen: false,
    }).advance,
    true,
  );
});

test("the menu step needs the menu to close and open again", () => {
  const value = score([beat()]);
  const openAtEntry = snapshotTutorial(value, selection, true);

  const stillOpen = checkTutorialStep("menu", openAtEntry, {
    score: value,
    selection,
    paletteOpen: true,
  });
  assert.equal(stillOpen.advance, false);

  const closed = checkTutorialStep("menu", stillOpen.snapshot, {
    score: value,
    selection,
    paletteOpen: false,
  });
  assert.equal(closed.advance, false);

  const reopened = checkTutorialStep("menu", closed.snapshot, {
    score: value,
    selection,
    paletteOpen: true,
  });
  assert.equal(reopened.advance, true);
});

test("the selection step never advances on its own", () => {
  const value = score([beat()]);
  const snapshot = snapshotTutorial(value, selection, false);
  assert.equal(
    checkTutorialStep("select", snapshot, {
      score: value,
      selection: { bar: 0, beat: 0, string: 3 },
      paletteOpen: false,
    }).advance,
    false,
  );
});

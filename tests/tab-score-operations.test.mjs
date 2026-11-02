import assert from "node:assert/strict";
import test from "node:test";
import {
  applyTechnique,
  addBar,
  advanceAfterWrite,
  deleteBar,
  deleteBeat,
  deleteNote,
  divideBeat,
  duplicateBar,
  fitRestBeat,
  insertBarAfter,
  moveBeat,
  setDots,
  splitBeat,
  splitBeatAt,
  setDuration,
  setRest,
  setTempo,
  setTimeSignature,
  setTuplet,
  toggleTie,
  toggleRest,
  tupletBaseDuration,
  writeFret,
} from "../src/utils/tab-score/operations.ts";
import { moveSelection } from "../src/utils/tab-score/selection.ts";
import {
  getBarTicks,
  getScoreBarFill,
} from "../src/utils/tab-score/ticks.ts";
import { TAB_TICKS_PER_QUARTER } from "../src/types/tab-score.ts";

function beat(overrides = {}) {
  return { id: "beat-a", duration: 4, notes: [], rest: true, ...overrides };
}

function score(beats = [beat()], overrides = {}) {
  return {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [{ id: "bar-a", timeSignature: { numerator: 4, denominator: 4 }, beats }],
    ...overrides,
  };
}

function isError(result) {
  return "error" in result;
}

test("writing a fret turns a rest into a note and adds strings", () => {
  const first = writeFret(score(), { bar: 0, beat: 0, string: 0 }, 5);
  assert.equal(isError(first), false);
  assert.equal(first.score.bars[0].beats[0].rest, false);
  assert.deepEqual(first.score.bars[0].beats[0].notes, [{ string: 0, fret: 5 }]);

  const second = writeFret(first.score, { bar: 0, beat: 0, string: 2 }, 7);
  assert.deepEqual(second.score.bars[0].beats[0].notes, [
    { string: 0, fret: 5 },
    { string: 2, fret: 7 },
  ]);
});

test("writing on an empty beat turns it back into a note", () => {
  const base = score([
    beat({ duration: 4, rest: false, empty: true, notes: [] }),
    beat(),
    beat(),
    beat(),
  ]);
  const result = writeFret(base, { bar: 0, beat: 0, string: 2 }, 9);
  const updated = result.score.bars[0].beats[0];

  assert.equal(updated.rest, false);
  assert.equal(updated.empty, undefined);
  assert.deepEqual(updated.notes, [{ string: 2, fret: 9 }]);
});

test("changing the fret keeps the techniques", () => {
  const base = score([beat({ notes: [{ string: 0, fret: 5, palmMute: true }] })]);
  const result = writeFret(base, { bar: 0, beat: 0, string: 0 }, 9);

  assert.equal(result.score.bars[0].beats[0].notes[0].fret, 9);
  assert.equal(result.score.bars[0].beats[0].notes[0].palmMute, true);
});

test("rejects a fret above 24", () => {
  assert.deepEqual(writeFret(score(), { bar: 0, beat: 0, string: 0 }, 25), {
    error: "invalidFret",
  });
});

test("deleting the only note leaves an empty beat with the same duration", () => {
  const base = score([
    beat({ duration: 4, rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat(),
    beat(),
    beat(),
  ]);
  const result = deleteNote(base, { bar: 0, beat: 0, string: 0 });
  const updated = result.score.bars[0].beats[0];

  assert.equal(updated.rest, false);
  assert.equal(updated.empty, true);
  assert.deepEqual(updated.notes, []);
  assert.equal(updated.duration, 4);
  assert.equal(getScoreBarFill(result.score, 0), "exact");
});

test("deleting one note of a chord keeps the others", () => {
  const base = score([
    beat({
      rest: false,
      notes: [
        { string: 0, fret: 5 },
        { string: 2, fret: 7 },
      ],
    }),
  ]);
  const result = deleteNote(base, { bar: 0, beat: 0, string: 0 });
  const updated = result.score.bars[0].beats[0];

  assert.equal(updated.rest, false);
  assert.equal(updated.empty, undefined);
  assert.deepEqual(updated.notes, [{ string: 2, fret: 7 }]);
});

test("deleting a note removes the tie that it started", () => {
  const base = score([
    beat({ rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat({ rest: false, notes: [{ string: 0, fret: 5, tie: true }] }),
  ]);
  const result = deleteNote(base, { bar: 0, beat: 0, string: 0 });

  assert.equal(result.score.bars[0].beats[1].notes[0].tie, undefined);
});

test("the rest option toggles between rest and empty", () => {
  const base = score([
    beat({ duration: 4, rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat(),
    beat(),
    beat(),
  ]);
  const selection = { bar: 0, beat: 0, string: 0 };

  const rested = toggleRest(base, selection).score.bars[0].beats[0];
  assert.equal(rested.rest, true);
  assert.equal(rested.empty, undefined);
  assert.deepEqual(rested.notes, []);

  const emptied = toggleRest(
    toggleRest(base, selection).score,
    selection,
  ).score.bars[0].beats[0];
  assert.equal(emptied.rest, false);
  assert.equal(emptied.empty, true);
  assert.deepEqual(emptied.notes, []);
  assert.equal(
    getScoreBarFill(toggleRest(base, selection).score, 0),
    "exact",
  );
});

test("deleting a beat leaves the bar short", () => {
  const base = score([beat(), beat()]);
  const result = deleteBeat(base, { bar: 0, beat: 0, string: 0 });

  assert.equal(result.score.bars[0].beats.length, 1);
  assert.equal(getScoreBarFill(result.score, 0), "under");
});

test("turning beats into rests keeps their duration", () => {
  const base = score([
    beat({ duration: 8, rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat({ duration: 8, rest: false, notes: [{ string: 1, fret: 5 }] }),
  ]);
  const result = setRest(base, {
    bar: 0,
    beat: 0,
    string: 0,
    anchor: { bar: 0, beat: 1, string: 0 },
  });

  for (const updated of result.score.bars[0].beats) {
    assert.equal(updated.rest, true);
    assert.equal(updated.duration, 8);
    assert.deepEqual(updated.notes, []);
  }
});

test("setting a duration changes only the selected beats", () => {
  const base = score([beat(), beat(), beat()]);
  const result = setDuration(
    base,
    { bar: 0, beat: 0, string: 0, anchor: { bar: 0, beat: 1, string: 0 } },
    8,
  );

  assert.equal(result.score.bars[0].beats[0].duration, 8);
  assert.equal(result.score.bars[0].beats[1].duration, 8);
  assert.equal(result.score.bars[0].beats[2].duration, 4);
});

test("dots and triplets can be turned on and off", () => {
  const dotted = setDots(score(), { bar: 0, beat: 0, string: 0 }, 1);
  assert.equal(dotted.score.bars[0].beats[0].dots, 1);

  const plain = setDots(dotted.score, { bar: 0, beat: 0, string: 0 }, 0);
  assert.equal(plain.score.bars[0].beats[0].dots, undefined);

  const triplet = setTuplet(score(), { bar: 0, beat: 0, string: 0 }, 3);
  assert.equal(triplet.score.bars[0].beats[0].tuplet, 3);
});

test("applies and removes a technique over a range", () => {
  const base = score([
    beat({ rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat({ rest: false, notes: [{ string: 0, fret: 7 }] }),
  ]);
  const selection = {
    bar: 0,
    beat: 0,
    string: 0,
    anchor: { bar: 0, beat: 1, string: 0 },
  };

  const applied = applyTechnique(base, selection, { palmMute: true });
  assert.equal(applied.score.bars[0].beats[0].notes[0].palmMute, true);
  assert.equal(applied.score.bars[0].beats[1].notes[0].palmMute, true);

  const removed = applyTechnique(applied.score, selection, { palmMute: true });
  assert.equal(removed.score.bars[0].beats[0].notes[0].palmMute, undefined);
  assert.equal(removed.score.bars[0].beats[1].notes[0].palmMute, undefined);
});

test("legato and slide need a previous note on the same string", () => {
  const only = score([beat({ rest: false, notes: [{ string: 0, fret: 5 }] })]);
  assert.deepEqual(
    applyTechnique(only, { bar: 0, beat: 0, string: 0 }, { legato: "hammer" }),
    { error: "needsPreviousNote" },
  );

  const pair = score([
    beat({ rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat({ rest: false, notes: [{ string: 0, fret: 7 }] }),
  ]);
  const result = applyTechnique(
    pair,
    { bar: 0, beat: 1, string: 0 },
    { legato: "hammer" },
  );
  assert.equal(result.score.bars[0].beats[1].notes[0].legato, "hammer");
});

test("ties need a previous note and can be toggled", () => {
  const only = score([beat({ rest: false, notes: [{ string: 0, fret: 5 }] })]);
  assert.deepEqual(toggleTie(only, { bar: 0, beat: 0, string: 0 }), {
    error: "needsPreviousNote",
  });

  const pair = score([
    beat({ rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat({ rest: false, notes: [{ string: 0, fret: 5 }] }),
  ]);
  const tied = toggleTie(pair, { bar: 0, beat: 1, string: 0 });
  assert.equal(tied.score.bars[0].beats[1].notes[0].tie, true);

  const untied = toggleTie(tied.score, { bar: 0, beat: 1, string: 0 });
  assert.equal(untied.score.bars[0].beats[1].notes[0].tie, undefined);
});

test("inserts, duplicates and deletes bars", () => {
  const base = score();
  const inserted = insertBarAfter(base, { bar: 0, beat: 0, string: 0 });
  assert.equal(inserted.score.bars.length, 2);
  assert.equal(inserted.selection.bar, 1);

  const duplicated = duplicateBar(base, { bar: 0, beat: 0, string: 0 });
  assert.equal(duplicated.score.bars.length, 2);
  assert.notEqual(duplicated.score.bars[0].id, duplicated.score.bars[1].id);

  const deleted = deleteBar(duplicated.score, { bar: 0, beat: 0, string: 0 });
  assert.equal(deleted.score.bars.length, 1);

  const lastOne = deleteBar(base, { bar: 0, beat: 0, string: 0 });
  assert.equal(lastOne.score.bars.length, 1);
  assert.equal(lastOne.score.bars[0].beats[0].rest, true);
});

test("refuses to add more than 64 bars", () => {
  const bars = Array.from({ length: 64 }, (_, index) => ({
    id: `bar-${index}`,
    beats: [beat()],
  }));
  assert.deepEqual(addBar(score([beat()], { bars }), { bar: 0, beat: 0, string: 0 }), {
    error: "barLimit",
  });
});

test("changes the time signature and the tempo from a bar", () => {
  const base = score([beat(), beat()], {
    bars: [
      { id: "bar-a", beats: [beat()] },
      { id: "bar-b", beats: [beat()] },
    ],
  });

  const signature = setTimeSignature(base, { bar: 0, beat: 0, string: 0 }, {
    numerator: 3,
    denominator: 4,
  });
  assert.deepEqual(signature.score.bars[0].timeSignature, {
    numerator: 3,
    denominator: 4,
  });

  const initialTempo = setTempo(base, { bar: 0, beat: 0, string: 0 }, 120);
  assert.equal(initialTempo.score.tempo, 120);

  const laterTempo = setTempo(base, { bar: 1, beat: 0, string: 0 }, 120);
  assert.equal(laterTempo.score.bars[1].tempo, 120);
  assert.equal(laterTempo.score.tempo, 90);

  assert.deepEqual(
    setTempo(base, { bar: 0, beat: 0, string: 0 }, 500),
    { error: "invalidTempo" },
  );
});

test("splits a beat in two and keeps the bar adding up", () => {
  const base = score([
    beat({ duration: 4, rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat({ duration: 2 }),
    beat({ duration: 4 }),
  ]);

  const result = splitBeat(base, { bar: 0, beat: 0, string: 0 });
  assert.equal(isError(result), false);
  assert.equal(result.score.bars[0].beats.length, 4);
  assert.equal(result.score.bars[0].beats[0].duration, 8);
  assert.deepEqual(result.score.bars[0].beats[0].notes, [{ string: 0, fret: 5 }]);
  assert.equal(result.score.bars[0].beats[1].duration, 8);
  assert.equal(result.score.bars[0].beats[1].rest, true);
  assert.deepEqual(result.selection, { bar: 0, beat: 1, string: 0 });
  assert.equal(getScoreBarFill(result.score, 0), "exact");
});

test("splitting a rest leaves two rests and selects the second", () => {
  const base = score([beat({ duration: 4 }), beat({ duration: 2 }), beat({ duration: 4 })]);

  const result = splitBeat(base, { bar: 0, beat: 0, string: 2 });
  assert.equal(result.score.bars[0].beats[0].rest, true);
  assert.equal(result.score.bars[0].beats[1].rest, true);
  assert.deepEqual(result.selection, { bar: 0, beat: 1, string: 2 });
});

test("splitting a dotted beat copies the dot into both halves", () => {
  const base = score([
    beat({ duration: 4, dots: 1 }),
    beat({ duration: 4 }),
  ]);

  const result = splitBeat(base, { bar: 0, beat: 0, string: 0 });
  assert.equal(result.score.bars[0].beats[0].duration, 8);
  assert.equal(result.score.bars[0].beats[0].dots, 1);
  assert.equal(result.score.bars[0].beats[1].duration, 8);
  assert.equal(result.score.bars[0].beats[1].dots, 1);
  assert.equal(getBarTicks(result.score.bars[0]), getBarTicks(base.bars[0]));
});

test("splitting a triplet beat copies the triplet into both halves", () => {
  const base = score([
    beat({ duration: 4, tuplet: 3 }),
    beat({ duration: 4, tuplet: 3 }),
    beat({ duration: 4, tuplet: 3 }),
  ]);

  const result = splitBeat(base, { bar: 0, beat: 0, string: 0 });
  assert.equal(result.score.bars[0].beats[0].duration, 8);
  assert.equal(result.score.bars[0].beats[0].tuplet, 3);
  assert.equal(result.score.bars[0].beats[1].duration, 8);
  assert.equal(result.score.bars[0].beats[1].tuplet, 3);
  assert.equal(getBarTicks(result.score.bars[0]), getBarTicks(base.bars[0]));
});

test("refuses to split a sixty-fourth or a bar full of beats", () => {
  const smallest = score([beat({ duration: 64 })]);
  assert.deepEqual(splitBeat(smallest, { bar: 0, beat: 0, string: 0 }), {
    error: "cannotSplit",
  });

  const many = score(
    Array.from({ length: 64 }, (_, index) => beat({ id: `beat-${index}` })),
  );
  assert.deepEqual(splitBeat(many, { bar: 0, beat: 0, string: 0 }), {
    error: "beatLimit",
  });
});

test("splits a beat at the clicked point and keeps the bar exact", () => {
  const base = score([
    beat({ duration: 4, rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat({ duration: 4 }),
    beat({ duration: 2 }),
  ]);

  const result = splitBeatAt(base, { bar: 0, beat: 0, string: 0 }, 0.75);
  assert.equal(isError(result), false);
  assert.equal(result.selection.beat, 2);
  assert.equal(result.score.bars[0].beats[0].duration, 8);
  assert.equal(result.score.bars[0].beats[0].rest, false);
  assert.equal(result.score.bars[0].beats[1].duration, 16);
  assert.equal(result.score.bars[0].beats[2].duration, 16);
  assert.equal(result.score.bars[0].beats[2].rest, true);
  assert.equal(getBarTicks(result.score.bars[0]), getBarTicks(base.bars[0]));
});

test("a click near the start of a beat does not split it", () => {
  const base = score([beat({ duration: 4, rest: false, notes: [{ string: 0, fret: 5 }] })]);
  const result = splitBeatAt(base, { bar: 0, beat: 0, string: 0 }, 0.1);

  assert.equal(result.score, base);
  assert.deepEqual(result.selection, { bar: 0, beat: 0, string: 0 });
});

test("a sixty-fourth beat is not split further", () => {
  const base = score([beat({ duration: 64 })]);
  const result = splitBeatAt(base, { bar: 0, beat: 0, string: 0 }, 0.8);

  assert.equal(result.score, base);
  assert.deepEqual(result.selection, { bar: 0, beat: 0, string: 0 });
});

test("moves a beat between its neighbours and stops at the edges", () => {
  const base = score([
    beat({ id: "b1", rest: false, notes: [{ string: 0, fret: 1 }] }),
    beat({ id: "b2", rest: false, notes: [{ string: 0, fret: 2 }] }),
    beat({ id: "b3", rest: true }),
  ]);

  const right = moveBeat(base, { bar: 0, beat: 0, string: 0 }, "right");
  assert.equal(right.score.bars[0].beats[0].notes[0].fret, 2);
  assert.equal(right.score.bars[0].beats[1].notes[0].fret, 1);
  assert.equal(right.selection.beat, 1);

  const left = moveBeat(right.score, right.selection, "left");
  assert.equal(left.score.bars[0].beats[0].notes[0].fret, 1);
  assert.equal(left.selection.beat, 0);

  assert.deepEqual(
    moveBeat(base, { bar: 0, beat: 0, string: 0 }, "left"),
    { error: "cannotMove" },
  );
  assert.deepEqual(
    moveBeat(base, { bar: 0, beat: 2, string: 0 }, "right"),
    { error: "cannotMove" },
  );
});

test("fits a whole rest into quarter notes so a write has a next slot", () => {
  const value = score([beat({ duration: 1 })]);
  const fitted = fitRestBeat(value, 0, 0, TAB_TICKS_PER_QUARTER);

  assert.deepEqual(
    fitted.bars[0].beats.map((entry) => entry.duration),
    [4, 4, 2],
  );
  assert.equal(getBarTicks(fitted.bars[0]), getBarTicks(value.bars[0]));
});

test("advances to the next beat and splits the rest to the same size", () => {
  const value = score([
    beat({ rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat({ id: "beat-b", duration: 2 }),
  ]);
  const result = advanceAfterWrite(value, { bar: 0, beat: 0, string: 0 });

  assert.equal(isError(result), false);
  assert.deepEqual(result.selection, { bar: 0, beat: 1, string: 0 });
  assert.deepEqual(
    result.score.bars[0].beats.map((entry) => entry.duration),
    [4, 4, 4],
  );
  assert.equal(
    getBarTicks(result.score.bars[0]),
    getBarTicks(value.bars[0]),
  );
});

test("advances into the next bar and prepares its first slot", () => {
  const value = {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [
      { id: "bar-a", beats: [beat({ rest: false, notes: [{ string: 0, fret: 5 }] })] },
      { id: "bar-b", beats: [beat({ id: "beat-b", duration: 1 })] },
    ],
  };
  const result = advanceAfterWrite(value, { bar: 0, beat: 0, string: 2 });

  assert.equal(isError(result), false);
  assert.deepEqual(result.selection, { bar: 1, beat: 0, string: 2 });
  assert.deepEqual(
    result.score.bars[1].beats.map((entry) => entry.duration),
    [4, 4, 2],
  );
});

test("creates a bar at the end and stops at the bar limit", () => {
  const value = score([beat({ rest: false, notes: [{ string: 0, fret: 5 }] })]);
  const created = advanceAfterWrite(value, { bar: 0, beat: 0, string: 0 });

  assert.equal(isError(created), false);
  assert.equal(created.score.bars.length, 2);
  assert.deepEqual(created.selection, { bar: 1, beat: 0, string: 0 });

  const bars = Array.from({ length: 64 }, (_, index) => ({
    id: `bar-${index}`,
    beats: [beat({ rest: false, notes: [{ string: 0, fret: 1 }] })],
  }));
  const full = { version: 2, tuning: "EADGBE", tempo: 90, bars };
  const atLimit = advanceAfterWrite(full, { bar: 63, beat: 0, string: 0 });

  assert.equal(atLimit.score.bars.length, 64);
  assert.deepEqual(atLimit.selection, { bar: 63, beat: 0, string: 0 });
});

test("moves the selection across beats, bars and strings", () => {
  const base = score([beat(), beat()], {
    bars: [
      { id: "bar-a", beats: [beat(), beat()] },
      { id: "bar-b", beats: [beat()] },
    ],
  });

  const right = moveSelection(base, { bar: 0, beat: 1, string: 0 }, "right", false);
  assert.deepEqual(right, { bar: 1, beat: 0, string: 0 });

  const left = moveSelection(base, { bar: 1, beat: 0, string: 0 }, "left", false);
  assert.deepEqual(left, { bar: 0, beat: 1, string: 0 });

  const up = moveSelection(base, { bar: 0, beat: 0, string: 0 }, "up", false);
  assert.equal(up.string, 1);

  const down = moveSelection(base, { bar: 0, beat: 0, string: 4 }, "down", false);
  assert.equal(down.string, 3);

  const extended = moveSelection(
    base,
    { bar: 0, beat: 0, string: 0 },
    "right",
    true,
  );
  assert.deepEqual(extended.anchor, { bar: 0, beat: 0, string: 0 });
  assert.equal(extended.beat, 1);
});

test("derives the base figure of every subdivision", () => {
  assert.equal(tupletBaseDuration(beat({ duration: 4 }), 3), 8);
  assert.equal(tupletBaseDuration(beat({ duration: 4 }), 5), 16);
  assert.equal(tupletBaseDuration(beat({ duration: 4 }), 6), 16);
  assert.equal(tupletBaseDuration(beat({ duration: 4 }), 7), 16);
  assert.equal(tupletBaseDuration(beat({ duration: 4 }), 9), 32);
  assert.equal(tupletBaseDuration(beat({ duration: 4 }), 10), 32);
  assert.equal(tupletBaseDuration(beat({ duration: 4 }), 12), 32);
  assert.equal(tupletBaseDuration(beat({ duration: 64 }), 3), null);
  assert.equal(tupletBaseDuration(beat({ duration: 4, dots: 1 }), 3), null);
  assert.equal(tupletBaseDuration(beat({ duration: 4, tuplet: 3 }), 3), null);
});

test("divides a quarter into a triplet without changing the bar", () => {
  const base = score([
    beat({ id: "b1", duration: 4, rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat({ id: "b2", duration: 2 }),
    beat({ id: "b3", duration: 4 }),
  ]);
  const result = divideBeat(base, { bar: 0, beat: 0, string: 0 }, 3);

  assert.equal(isError(result), false);
  assert.equal(result.score.bars[0].beats.length, 5);
  assert.equal(result.score.bars[0].beats[0].duration, 8);
  assert.equal(result.score.bars[0].beats[0].tuplet, 3);
  assert.deepEqual(result.score.bars[0].beats[0].notes, [{ string: 0, fret: 5 }]);
  assert.equal(result.score.bars[0].beats[1].rest, false);
  assert.equal(result.score.bars[0].beats[1].empty, true);
  assert.equal(result.score.bars[0].beats[1].tuplet, 3);
  assert.equal(result.score.bars[0].beats[2].tuplet, 3);
  assert.deepEqual(result.selection, { bar: 0, beat: 0, string: 0 });
  assert.equal(getBarTicks(result.score.bars[0]), getBarTicks(base.bars[0]));
});

test("divides an eighth into a quintuplet and a quarter into a septuplet", () => {
  const fifth = divideBeat(
    score([beat({ duration: 8 })]),
    { bar: 0, beat: 0, string: 0 },
    5,
  );
  assert.equal(isError(fifth), false);
  assert.equal(fifth.score.bars[0].beats.length, 5);
  assert.equal(fifth.score.bars[0].beats[0].duration, 32);
  assert.equal(fifth.score.bars[0].beats[0].tuplet, 5);

  const seventh = divideBeat(
    score([beat({ duration: 4 })]),
    { bar: 0, beat: 0, string: 1 },
    7,
  );
  assert.equal(isError(seventh), false);
  assert.equal(seventh.score.bars[0].beats.length, 7);
  assert.equal(seventh.score.bars[0].beats[0].duration, 16);
  assert.equal(seventh.score.bars[0].beats[0].tuplet, 7);
  assert.equal(seventh.selection.string, 1);
  assert.ok(Math.abs(getBarTicks(seventh.score.bars[0]) - 960) <= 4);
});

test("refuses subdivisions that do not fit or are already applied", () => {
  const tooShort = divideBeat(
    score([beat({ duration: 64 })]),
    { bar: 0, beat: 0, string: 0 },
    3,
  );
  assert.deepEqual(tooShort, { error: "cannotSubdivide" });

  const dotted = divideBeat(
    score([beat({ duration: 4, dots: 1 })]),
    { bar: 0, beat: 0, string: 0 },
    3,
  );
  assert.deepEqual(dotted, { error: "cannotSubdivide" });

  const already = divideBeat(
    score([beat({ duration: 8, tuplet: 3 })]),
    { bar: 0, beat: 0, string: 0 },
    5,
  );
  assert.deepEqual(already, { error: "alreadySubdivided" });
});

test("refuses to exceed the beats of a bar", () => {
  const beats = Array.from({ length: 64 }, (_, index) =>
    beat({ id: `b-${index}`, duration: 32 }),
  );
  const result = divideBeat(
    { version: 2, tuning: "EADGBE", tempo: 90, bars: [{ id: "bar-a", beats }] },
    { bar: 0, beat: 0, string: 0 },
    3,
  );
  assert.deepEqual(result, { error: "beatLimit" });
});

test("groups the selected notes into one triplet instead of splitting each", () => {
  const eighths = Array.from({ length: 8 }, (_, index) =>
    beat({ id: `e${index}`, duration: 8 }),
  );
  const base = score(eighths);
  const result = divideBeat(
    base,
    { bar: 0, beat: 0, string: 0, anchor: { bar: 0, beat: 2, string: 0 } },
    3,
  );

  assert.equal(isError(result), false);
  const beats = result.score.bars[0].beats;
  assert.deepEqual(
    beats.slice(0, 3).map((entry) => [entry.duration, entry.tuplet]),
    [
      [8, 3],
      [8, 3],
      [8, 3],
    ],
  );
  // Los cinco octavos restantes y un hueco vacío de corchea por el tiempo liberado.
  assert.deepEqual(
    beats.slice(3, 8).map((entry) => entry.duration),
    [8, 8, 8, 8, 8],
  );
  assert.equal(beats[8].rest, false);
  assert.equal(beats[8].empty, true);
  assert.equal(beats[8].duration, 8);
  assert.deepEqual(result.selection, { bar: 0, beat: 3, string: 0 });
  assert.equal(getBarTicks(result.score.bars[0]), getBarTicks(base.bars[0]));
});

test("after grouping, writing continues after the group and does not join it", () => {
  const eighths = Array.from({ length: 8 }, (_, index) =>
    beat({ id: `e${index}`, duration: 8 }),
  );
  const grouped = divideBeat(
    score(eighths),
    { bar: 0, beat: 0, string: 0, anchor: { bar: 0, beat: 2, string: 0 } },
    3,
  );
  assert.equal(isError(grouped), false);
  assert.equal(grouped.selection.beat, 3);

  const written = writeFret(grouped.score, grouped.selection, 9);
  const writtenBeat = written.score.bars[0].beats[3];

  assert.equal(writtenBeat.tuplet, undefined);
  assert.equal(writtenBeat.notes[0].fret, 9);
  assert.deepEqual(
    written.score.bars[0].beats.slice(0, 3).map((entry) => entry.tuplet),
    [3, 3, 3],
  );
});

test("groups three quarters and leaves the freed quarter empty", () => {
  const base = score([
    beat({ id: "q1", duration: 4 }),
    beat({ id: "q2", duration: 4 }),
    beat({ id: "q3", duration: 4 }),
    beat({ id: "q4", duration: 4 }),
  ]);
  const result = divideBeat(
    base,
    { bar: 0, beat: 0, string: 0, anchor: { bar: 0, beat: 2, string: 0 } },
    3,
  );

  assert.equal(isError(result), false);
  const beats = result.score.bars[0].beats;
  assert.deepEqual(
    beats.slice(0, 3).map((entry) => entry.tuplet),
    [3, 3, 3],
  );
  assert.equal(beats.at(-1).rest, false);
  assert.equal(beats.at(-1).empty, true);
  assert.equal(beats.at(-1).duration, 4);
  assert.equal(getBarTicks(result.score.bars[0]), getBarTicks(base.bars[0]));
});

test("groups a quintuplet of five eighths", () => {
  const base = score(
    Array.from({ length: 5 }, (_, index) => beat({ id: `e${index}`, duration: 8 })),
  );
  const result = divideBeat(
    base,
    { bar: 0, beat: 0, string: 0, anchor: { bar: 0, beat: 4, string: 0 } },
    5,
  );

  assert.equal(isError(result), false);
  const beats = result.score.bars[0].beats;
  assert.equal(beats.slice(0, 5).every((entry) => entry.tuplet === 5), true);
  assert.equal(beats.at(-1).rest, false);
  assert.equal(beats.at(-1).empty, true);
  assert.equal(beats.at(-1).duration, 8);
  assert.equal(getBarTicks(result.score.bars[0]), getBarTicks(base.bars[0]));
});

test("refuses a group whose size or values do not match the subdivision", () => {
  const three = score([
    beat({ id: "a", duration: 8 }),
    beat({ id: "b", duration: 8 }),
    beat({ id: "c", duration: 8 }),
  ]);
  assert.deepEqual(
    divideBeat(
      three,
      { bar: 0, beat: 0, string: 0, anchor: { bar: 0, beat: 2, string: 0 } },
      5,
    ),
    { error: "tupletExactCount" },
  );

  const mixedFits = score([
    beat({ id: "a", duration: 4 }),
    beat({ id: "b", duration: 4 }),
    beat({ id: "c", duration: 16 }),
  ]);
  const grouped = divideBeat(
    mixedFits,
    { bar: 0, beat: 0, string: 0, anchor: { bar: 0, beat: 2, string: 0 } },
    3,
  );
  assert.equal(isError(grouped), false);
  assert.deepEqual(
    grouped.score.bars[0].beats.slice(0, 3).map((entry) => entry.tuplet),
    [3, 3, 3],
  );
  assert.equal(getBarTicks(grouped.score.bars[0]), getBarTicks(mixedFits.bars[0]));

  const across = {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [
      { id: "bar-a", beats: [beat({ id: "a", duration: 8 })] },
      { id: "bar-b", beats: [beat({ id: "b", duration: 8 }), beat({ id: "c", duration: 8 })] },
    ],
  };
  assert.deepEqual(
    divideBeat(
      across,
      { bar: 0, beat: 0, string: 0, anchor: { bar: 1, beat: 1, string: 0 } },
      3,
    ),
    { error: "tupletAcrossBars" },
  );
});

test("uniforms mixed figures when the freed time is not writable", () => {
  const base = score([
    beat({ id: "q1", duration: 4 }),
    beat({ id: "q2", duration: 4 }),
    beat({ id: "e3", duration: 8 }),
    beat({ id: "r4", duration: 4, dots: 1 }),
  ]);
  const result = divideBeat(
    base,
    { bar: 0, beat: 0, string: 0, anchor: { bar: 0, beat: 2, string: 0 } },
    3,
  );

  assert.equal(isError(result), false);
  const beats = result.score.bars[0].beats;
  assert.deepEqual(
    beats.slice(0, 3).map((entry) => [entry.duration, entry.dots, entry.tuplet]),
    [
      [8, undefined, 3],
      [8, undefined, 3],
      [8, undefined, 3],
    ],
  );
  const freed = beats.at(-1);
  assert.equal(freed.rest, false);
  assert.equal(freed.empty, true);
  assert.equal(freed.duration, 4);
  assert.equal(freed.dots, 1);
  assert.equal(getBarTicks(result.score.bars[0]), getBarTicks(base.bars[0]));
  assert.equal(result.selection.beat, 3);
});

test("rejects a selection with more beats than the subdivision", () => {
  const base = score([
    beat({ id: "q1", duration: 4 }),
    beat({ id: "q2", duration: 4 }),
    beat({ id: "q3", duration: 4 }),
    beat({ id: "q4", duration: 4 }),
  ]);
  const result = divideBeat(
    base,
    { bar: 0, beat: 0, string: 0, anchor: { bar: 0, beat: 3, string: 0 } },
    3,
  );

  assert.deepEqual(result, { error: "tupletExactCount" });
});

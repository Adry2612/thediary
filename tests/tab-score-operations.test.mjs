import assert from "node:assert/strict";
import test from "node:test";
import {
  applyTechnique,
  addBar,
  deleteBar,
  deleteBeat,
  deleteNote,
  duplicateBar,
  insertBarAfter,
  setDots,
  setDuration,
  setRest,
  setTempo,
  setTimeSignature,
  setTuplet,
  toggleTie,
  writeFret,
} from "../src/utils/tab-score/operations.ts";
import { moveSelection } from "../src/utils/tab-score/selection.ts";
import { getScoreBarFill } from "../src/utils/tab-score/ticks.ts";

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

test("deleting the only note leaves a rest with the same duration", () => {
  const base = score([
    beat({ duration: 8, rest: false, notes: [{ string: 0, fret: 5 }] }),
  ]);
  const result = deleteNote(base, { bar: 0, beat: 0, string: 0 });
  const updated = result.score.bars[0].beats[0];

  assert.equal(updated.rest, true);
  assert.deepEqual(updated.notes, []);
  assert.equal(updated.duration, 8);
});

test("deleting a note removes the tie that it started", () => {
  const base = score([
    beat({ rest: false, notes: [{ string: 0, fret: 5 }] }),
    beat({ rest: false, notes: [{ string: 0, fret: 5, tie: true }] }),
  ]);
  const result = deleteNote(base, { bar: 0, beat: 0, string: 0 });

  assert.equal(result.score.bars[0].beats[1].notes[0].tie, undefined);
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
  assert.equal(up.string, 0);

  const down = moveSelection(base, { bar: 0, beat: 0, string: 4 }, "down", false);
  assert.equal(down.string, 5);

  const extended = moveSelection(
    base,
    { bar: 0, beat: 0, string: 0 },
    "right",
    true,
  );
  assert.deepEqual(extended.anchor, { bar: 0, beat: 0, string: 0 });
  assert.equal(extended.beat, 1);
});

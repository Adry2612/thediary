import assert from "node:assert/strict";
import test from "node:test";
import {
  clearClipboard,
  copyBars,
  copyBeats,
  cutBars,
  cutBeats,
  getClipboard,
  pasteBars,
  pasteBeats,
} from "../src/utils/tab-score/clipboard.ts";

function beat(id, fret = 3) {
  return {
    id,
    duration: 4,
    rest: false,
    notes: [{ string: 0, fret }],
  };
}

function score(id = "a", beats = [beat("b1"), beat("b2")]) {
  return {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [
      { id: `bar-${id}-1`, beats },
      { id: `bar-${id}-2`, beats: [beat(`b-${id}-3`, 5)] },
    ],
  };
}

const range = {
  bar: 0,
  beat: 0,
  string: 0,
  anchor: { bar: 0, beat: 1, string: 0 },
};

test("copies selected beats and pastes them in another beat", () => {
  clearClipboard();
  const base = score();
  const copied = copyBeats(base, range);

  assert.equal(copied.kind, "beats");
  assert.equal(copied.beats.length, 2);
  assert.equal(getClipboard().kind, "beats");

  const pasted = pasteBeats(base, { bar: 1, beat: 0, string: 0 });
  assert.equal(pasted.score.bars[1].beats.length, 3);
  assert.equal(pasted.score.bars[1].beats[0].notes[0].fret, 3);
  assert.equal(pasted.score.bars[1].beats[1].notes[0].fret, 3);
});

test("pastes beats between two tabs with new ids", () => {
  clearClipboard();
  const first = score("a");
  const second = score("b");
  const copied = copyBeats(first, { bar: 0, beat: 0, string: 0 });
  const sourceId = copied.beats[0].id;

  const pasted = pasteBeats(second, { bar: 1, beat: 0, string: 0 });
  assert.equal(pasted.score.bars[1].beats.length, 2);
  assert.notEqual(pasted.score.bars[1].beats[0].id, sourceId);
});

test("copies and pastes whole bars", () => {
  clearClipboard();
  const base = score();
  const copied = copyBars(base, { bar: 0, beat: 0, string: 0 });

  assert.equal(copied.kind, "bars");
  const pasted = pasteBars(base, { bar: 0, beat: 0, string: 0 });
  assert.equal(pasted.score.bars.length, 3);
  assert.equal(pasted.selection.bar, 1);
});

test("refuses to paste bars beyond 64", () => {
  clearClipboard();
  const base = score();
  copyBars(base, { bar: 0, beat: 0, string: 0 });

  const full = {
    ...base,
    bars: Array.from({ length: 64 }, (_, index) => ({
      id: `bar-${index}`,
      beats: [beat(`beat-${index}`)],
    })),
  };

  assert.deepEqual(pasteBars(full, { bar: 0, beat: 0, string: 0 }), {
    error: "barLimit",
  });
});

test("cutting beats copies them and removes them", () => {
  clearClipboard();
  const base = score();
  const result = cutBeats(base, range);

  assert.equal(result.score.bars[0].beats.length, 0);
  assert.equal(getClipboard().kind, "beats");
  assert.equal(getClipboard().beats.length, 2);
});

test("cutting all bars is refused and keeps the tab usable", () => {
  clearClipboard();
  const base = score();
  const result = cutBars(base, {
    bar: 0,
    beat: 0,
    string: 0,
    anchor: { bar: 1, beat: 0, string: 0 },
  });

  assert.deepEqual(result, { error: "noSelection" });
});

test("pasting without a clipboard reports no selection", () => {
  clearClipboard();
  assert.deepEqual(pasteBeats(score(), { bar: 0, beat: 0, string: 0 }), {
    error: "noSelection",
  });
  assert.deepEqual(pasteBars(score(), { bar: 0, beat: 0, string: 0 }), {
    error: "noSelection",
  });
});

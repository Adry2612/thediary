import assert from "node:assert/strict";
import test from "node:test";
import {
  getBarFill,
  resolveTimeSignature,
} from "../src/utils/tab-score/ticks.ts";
import {
  getRepeatRanges,
  normalizeTabScore,
} from "../src/utils/tab-score/model.ts";

function beat(overrides = {}) {
  return {
    id: "beat-1",
    duration: 4,
    rest: false,
    notes: [{ string: 0, fret: 3 }],
    ...overrides,
  };
}

function bar(overrides = {}) {
  return {
    id: "bar-1",
    timeSignature: { numerator: 4, denominator: 4 },
    beats: [beat()],
    ...overrides,
  };
}

function score(bars, overrides = {}) {
  return {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars,
    ...overrides,
  };
}

test("keeps every valid expression mark", () => {
  const normalized = normalizeTabScore(
    score([
      bar({
        section: "Intro",
        repeat: { start: true },
        endings: [1],
        pickup: true,
        beats: [
          beat({
            id: "b1",
            dynamic: "mf",
            hairpin: "crescendo",
            text: "let it ring",
            chord: "Em",
            stroke: "down",
            fermata: true,
            grace: { fret: 2, timing: "before" },
          }),
          beat({ id: "b2", duration: 4, rest: false, notes: [] }),
        ],
      }),
      bar({
        id: "bar-2",
        repeat: { end: 2 },
        beats: [beat({ id: "b3" })],
      }),
    ]),
  );

  assert.equal(normalized.bars[0].section, "Intro");
  assert.deepEqual(normalized.bars[0].repeat, { start: true });
  assert.deepEqual(normalized.bars[0].endings, [1]);
  assert.equal(normalized.bars[0].pickup, true);
  assert.equal(normalized.bars[0].beats[0].dynamic, "mf");
  assert.equal(normalized.bars[0].beats[0].hairpin, "crescendo");
  assert.equal(normalized.bars[0].beats[0].text, "let it ring");
  assert.equal(normalized.bars[0].beats[0].chord, "Em");
  assert.equal(normalized.bars[0].beats[0].stroke, "down");
  assert.equal(normalized.bars[0].beats[0].fermata, true);
  assert.deepEqual(normalized.bars[0].beats[0].grace, {
    fret: 2,
    timing: "before",
  });
  assert.deepEqual(normalized.bars[1].repeat, { end: 2 });
});

test("drops unknown mark values but keeps the beat and its notes", () => {
  const normalized = normalizeTabScore(
    score([
      bar({
        repeat: { start: false, end: 1 },
        beats: [
          beat({
            dynamic: "fff",
            hairpin: "swell",
            stroke: "sideways",
            fermata: "yes",
            grace: { fret: 30, timing: "later" },
          }),
        ],
      }),
    ]),
  );

  const beatValue = normalized.bars[0].beats[0];
  assert.equal(beatValue.dynamic, undefined);
  assert.equal(beatValue.hairpin, undefined);
  assert.equal(beatValue.stroke, undefined);
  assert.equal(beatValue.fermata, undefined);
  assert.equal(beatValue.grace, undefined);
  assert.deepEqual(beatValue.notes, [{ string: 0, fret: 3 }]);
  assert.equal(normalized.bars[0].repeat, undefined);
});

test("caps a section at 30 characters and a text at 40", () => {
  const normalized = normalizeTabScore(
    score([
      bar({
        section: "s".repeat(50),
        beats: [beat({ text: "t".repeat(60) })],
      }),
    ]),
  );

  assert.equal(normalized.bars[0].section?.length, 30);
  assert.equal(normalized.bars[0].beats[0].text?.length, 40);
});

test("drops an ending outside a repeat and a pickup that is not first", () => {
  const normalized = normalizeTabScore(
    score([
      bar({ id: "bar-1" }),
      bar({ id: "bar-2", endings: [1], pickup: true }),
    ]),
  );

  assert.equal(normalized.bars[1].endings, undefined);
  assert.equal(normalized.bars[1].pickup, undefined);
});

test("a repeat end without a start covers from the first bar", () => {
  const bars = [{ repeat: undefined }, { repeat: { end: 2 } }];

  assert.deepEqual(getRepeatRanges(bars), [{ start: 0, end: 1 }]);
  assert.equal(
    normalizeTabScore(score([bar({ id: "a" }), bar({ id: "b", endings: [2] })])).bars[1]
      .endings,
    undefined,
  );
});

test("keeps a score without marks exactly as saved", () => {
  const value = score([bar({ beats: [beat(), beat({ id: "b2", rest: true, notes: [] })] })]);

  assert.deepEqual(normalizeTabScore(value), value);
});

test("a pickup bar is not underfull but still overfull when it exceeds", () => {
  const quarter = { id: "q", duration: 4, rest: true, notes: [] };

  assert.equal(
    getBarFill({ beats: [quarter, quarter, quarter, quarter, quarter], pickup: true }),
    "over",
  );
  assert.equal(getBarFill({ beats: [], pickup: true }), "exact");
  assert.equal(getBarFill({ beats: [quarter] }), "under");

  const scoreValue = score([bar({ pickup: true, beats: [quarter] })]);
  assert.equal(
    getBarFill(scoreValue.bars[0], resolveTimeSignature(scoreValue, 0)),
    "exact",
  );
});

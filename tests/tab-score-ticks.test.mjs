import assert from "node:assert/strict";
import test from "node:test";
import {
  getBarFill,
  getBarTicks,
  getBeatTicks,
  getScoreBarFill,
  getTimeSignatureTicks,
  resolveTimeSignature,
} from "../src/utils/tab-score/ticks.ts";

function beat(duration, overrides = {}) {
  return { id: `beat-${duration}`, duration, notes: [], ...overrides };
}

test("computes every duration in ticks (960 per quarter)", () => {
  const expected = {
    1: 3840,
    2: 1920,
    4: 960,
    8: 480,
    16: 240,
    32: 120,
    64: 60,
  };

  for (const [duration, ticks] of Object.entries(expected)) {
    assert.equal(getBeatTicks(beat(Number(duration))), ticks, duration);
  }
});

test("applies dots and triplets", () => {
  assert.equal(getBeatTicks(beat(4, { dots: 1 })), 1440);
  assert.equal(getBeatTicks(beat(8, { dots: 1 })), 720);
  assert.equal(getBeatTicks(beat(4, { tuplet: 3 })), 640);
  assert.equal(getBeatTicks(beat(8, { tuplet: 3, dots: 1 })), 480);
});

test("computes the expected ticks of each time signature", () => {
  assert.equal(
    getTimeSignatureTicks({ numerator: 4, denominator: 4 }),
    3840,
  );
  assert.equal(
    getTimeSignatureTicks({ numerator: 3, denominator: 4 }),
    2880,
  );
  assert.equal(
    getTimeSignatureTicks({ numerator: 6, denominator: 8 }),
    2880,
  );
  assert.equal(
    getTimeSignatureTicks({ numerator: 7, denominator: 8 }),
    3360,
  );
});

test("marks a bar as under, exact or over", () => {
  const fourFour = { numerator: 4, denominator: 4 };

  assert.equal(
    getBarFill({ beats: [beat(1)] }, fourFour),
    "exact",
  );
  assert.equal(
    getBarFill({ beats: [beat(4)] }, fourFour),
    "under",
  );
  assert.equal(
    getBarFill({ beats: [beat(1), beat(4)] }, fourFour),
    "over",
  );
});

test("inherits the time signature from the previous bar", () => {
  const score = {
    bars: [
      { id: "a", timeSignature: { numerator: 3, denominator: 4 }, beats: [] },
      { id: "b", beats: [] },
      { id: "c", timeSignature: { numerator: 6, denominator: 8 }, beats: [] },
      { id: "d", beats: [] },
    ],
  };

  assert.equal(resolveTimeSignature(score, 0).numerator, 3);
  assert.equal(resolveTimeSignature(score, 1).numerator, 3);
  assert.equal(resolveTimeSignature(score, 2).numerator, 6);
  assert.equal(resolveTimeSignature(score, 3).denominator, 8);
});

test("flags each bar of a score with its inherited signature", () => {
  const score = {
    bars: [
      {
        id: "a",
        timeSignature: { numerator: 3, denominator: 4 },
        beats: [beat(2, { dots: 1 })],
      },
      { id: "b", beats: [beat(4)] },
      { id: "c", beats: [beat(4)] },
    ],
  };

  assert.equal(getScoreBarFill(score, 0), "exact");
  assert.equal(getScoreBarFill(score, 1), "under");
  assert.equal(getScoreBarFill(score, 2), "under");
  assert.equal(getBarTicks(score.bars[0]), 2880);
});

test("applies every subdivision ratio", () => {
  const expected = {
    3: 640,
    5: 768,
    6: 640,
    7: 549,
    9: 853,
    10: 768,
    12: 640,
  };

  for (const [tuplet, ticks] of Object.entries(expected)) {
    assert.equal(getBeatTicks(beat(4, { tuplet: Number(tuplet) })), ticks);
  }
});

test("does not flag the rounding of sevens and nines", () => {
  const fourFour = { numerator: 4, denominator: 4 };
  const quarters = [
    beat(4),
    beat(4),
    beat(4),
  ];
  const seven = Array.from({ length: 7 }, (_, index) =>
    beat(16, { id: `seven-${index}`, tuplet: 7 }),
  );
  const nine = Array.from({ length: 9 }, (_, index) =>
    beat(32, { id: `nine-${index}`, tuplet: 9 }),
  );

  assert.equal(
    getBarFill({ beats: [...quarters, ...seven] }, fourFour),
    "exact",
  );
  assert.equal(
    getBarFill({ beats: [...quarters, ...nine] }, fourFour),
    "exact",
  );
  assert.equal(
    getBarFill({ beats: [beat(2), beat(4), beat(8)] }, fourFour),
    "under",
  );
});

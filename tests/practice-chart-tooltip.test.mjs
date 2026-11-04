import assert from "node:assert/strict";
import test from "node:test";
import {
  getBucketComparison,
  getContainedTooltipPosition,
} from "../src/utils/practice-chart-tooltip.ts";

test("keeps tooltip coordinates inside the chart at all edges", () => {
  assert.deepEqual(
    getContainedTooltipPosition(0, 0, 500, 320),
    { left: 8, top: 8 },
  );
  assert.deepEqual(
    getContainedTooltipPosition(500, 320, 500, 320),
    { left: 284, top: 200 },
  );
  assert.deepEqual(
    getContainedTooltipPosition(250, 180, 500, 320),
    { left: 146, top: 60 },
  );
});

test("keeps the detailed tooltip inside a chart narrower than the card", () => {
  assert.deepEqual(
    getContainedTooltipPosition(0, 150, 240, 320),
    { left: 8, top: 30 },
  );
});

test("the best bucket has no gap to explain", () => {
  assert.deepEqual(getBucketComparison(4 * 3600, 4 * 3600), {
    isBest: true,
    gapSeconds: 0,
    gapRatio: 0,
    useDuration: false,
  });
});

test("a small gap is expressed as a percentage", () => {
  const comparison = getBucketComparison(3.5 * 3600, 4 * 3600);
  assert.equal(comparison.isBest, false);
  assert.equal(comparison.gapSeconds, 1800);
  assert.equal(comparison.gapRatio, 0.125);
  assert.equal(comparison.useDuration, false);
});

test("a gap of an hour or more is expressed as a duration", () => {
  const comparison = getBucketComparison(2 * 3600, 4 * 3600);
  assert.equal(comparison.gapSeconds, 2 * 3600);
  assert.equal(comparison.gapRatio, 0.5);
  assert.equal(comparison.useDuration, true);
});

test("an empty bucket does not divide by zero", () => {
  assert.deepEqual(getBucketComparison(0, 0), {
    isBest: true,
    gapSeconds: 0,
    gapRatio: 0,
    useDuration: false,
  });
});

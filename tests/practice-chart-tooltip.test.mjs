import assert from "node:assert/strict";
import test from "node:test";
import { getContainedTooltipPosition } from "../src/utils/practice-chart-tooltip.ts";

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

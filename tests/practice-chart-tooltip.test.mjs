import assert from "node:assert/strict";
import test from "node:test";
import { getContainedTooltipPosition } from "../src/lib/practice-chart-tooltip.ts";

test("keeps tooltip coordinates inside the chart at all edges", () => {
  assert.deepEqual(
    getContainedTooltipPosition(0, 0, 500, 320),
    { left: 8, top: 8 },
  );
  assert.deepEqual(
    getContainedTooltipPosition(500, 320, 500, 320),
    { left: 316, top: 256 },
  );
  assert.deepEqual(
    getContainedTooltipPosition(250, 180, 500, 320),
    { left: 162, top: 116 },
  );
});

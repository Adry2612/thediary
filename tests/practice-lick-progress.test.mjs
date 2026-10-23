import assert from "node:assert/strict";
import test from "node:test";
import { getPracticedLickIds } from "../src/utils/practice-lick-progress.ts";

test("collects each distinct lick with elapsed time once", () => {
  assert.deepEqual(
    getPracticedLickIds([
      { lickId: "lick-1", elapsedSeconds: 60 },
      { lickId: "lick-1", elapsedSeconds: 30 },
      { lickId: "lick-2", elapsedSeconds: 10 },
    ]),
    ["lick-1", "lick-2"],
  );
});

test("ignores lick blocks without elapsed time", () => {
  assert.deepEqual(
    getPracticedLickIds([
      { lickId: "lick-1", elapsedSeconds: 0 },
      { lickId: undefined, elapsedSeconds: 60 },
    ]),
    [],
  );
});

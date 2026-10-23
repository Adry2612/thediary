import test from "node:test";
import assert from "node:assert/strict";
import { interpolate } from "../src/utils/interpolate.ts";

test("replaces known placeholders and keeps unknown ones", () => {
  assert.equal(
    interpolate("{sessions} sesiones y {missing}", { sessions: 3 }),
    "3 sesiones y {missing}",
  );
});

test("stringifies numeric values", () => {
  assert.equal(interpolate("Total: {total}", { total: 0 }), "Total: 0");
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  getRepertoirePartIds,
  repertoirePartChanges,
  toggleRepertoirePartId,
  withRepertoirePartIds,
} from "../src/utils/practice-parts.ts";

test("reads a legacy single part as a one-item list", () => {
  assert.deepEqual(getRepertoirePartIds({ repertoirePartId: "part-1" }), [
    "part-1",
  ]);
});

test("reads the new list and prefers it over the legacy field", () => {
  assert.deepEqual(
    getRepertoirePartIds({
      repertoirePartId: "part-1",
      repertoirePartIds: ["part-2", "part-3", "part-2"],
    }),
    ["part-2", "part-3"],
  );
});

test("writes one part in the legacy field and several in the list", () => {
  assert.deepEqual(withRepertoirePartIds(["part-1"]), {
    repertoirePartId: "part-1",
  });
  assert.deepEqual(withRepertoirePartIds(["part-1", "part-2"]), {
    repertoirePartIds: ["part-1", "part-2"],
  });
  assert.deepEqual(withRepertoirePartIds([]), {});
});

test("clears the other field when a block changes its parts", () => {
  assert.deepEqual(repertoirePartChanges(["part-1"]), {
    repertoirePartId: "part-1",
    repertoirePartIds: undefined,
  });
  assert.deepEqual(repertoirePartChanges(["part-1", "part-2"]), {
    repertoirePartId: undefined,
    repertoirePartIds: ["part-1", "part-2"],
  });
  assert.deepEqual(repertoirePartChanges([]), {
    repertoirePartId: undefined,
    repertoirePartIds: undefined,
  });
});

test("toggles a part without touching the rest", () => {
  assert.deepEqual(toggleRepertoirePartId(["part-1"], "part-2"), [
    "part-1",
    "part-2",
  ]);
  assert.deepEqual(toggleRepertoirePartId(["part-1", "part-2"], "part-1"), [
    "part-2",
  ]);
});

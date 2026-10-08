import assert from "node:assert/strict";
import test from "node:test";
import {
  readTutorialProgress,
  saveTutorialProgress,
} from "../src/lib/tutorial-progress.ts";

function createStorage(initialValues = []) {
  const values = new Map(initialValues);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("returns no progress for a first-time visitor", () => {
  assert.equal(readTutorialProgress(createStorage()), null);
});

test("persists a skipped tutorial so it can be completed later", () => {
  const storage = createStorage();

  saveTutorialProgress(storage, "skipped");

  assert.equal(readTutorialProgress(storage), "skipped");
});

test("persists completion so the tutorial does not auto-open again", () => {
  const storage = createStorage();

  saveTutorialProgress(storage, "completed");

  assert.equal(readTutorialProgress(storage), "completed");
});

test("rejects an unknown stored tutorial status", () => {
  const storage = createStorage([["thediary-tutorial-progress-v1", "dismissed"]]);

  assert.throws(
    () => readTutorialProgress(storage),
    /estado guardado del tutorial/i,
  );
});

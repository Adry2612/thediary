import assert from "node:assert/strict";
import test from "node:test";
import {
  clearPracticeStorageNamespace,
} from "../src/stores/practiceStorageNamespace.ts";

function installLocalStorage(entries) {
  const values = new Map(entries);
  const localStorage = {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage },
  });
  return values;
}

test("clears the selected namespace and legacy guest state only", () => {
  const values = installLocalStorage([
    ["guitar-practice-history-v1:user-123", "account"],
    ["guitar-practice-history-v1:guest", "guest"],
    ["guitar-practice-history-v1", "legacy"],
  ]);

  clearPracticeStorageNamespace("user-123");

  assert.equal(values.has("guitar-practice-history-v1:user-123"), false);
  assert.equal(values.has("guitar-practice-history-v1:guest"), true);
  assert.equal(values.has("guitar-practice-history-v1"), true);
  delete globalThis.window;
});

test("clearing guest state also removes the legacy unnamespaced state", () => {
  const values = installLocalStorage([
    ["guitar-practice-history-v1:guest", "guest"],
    ["guitar-practice-history-v1", "legacy"],
  ]);

  clearPracticeStorageNamespace("guest");

  assert.equal(values.has("guitar-practice-history-v1:guest"), false);
  assert.equal(values.has("guitar-practice-history-v1"), false);
  delete globalThis.window;
});

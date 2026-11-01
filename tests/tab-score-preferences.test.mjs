import assert from "node:assert/strict";
import test from "node:test";

const values = new Map();

globalThis.window = {
  localStorage: {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  },
};

const {
  readNotePreview,
  readShowStandardNotation,
  saveNotePreview,
  saveShowStandardNotation,
} = await import("../src/services/tab-score-preferences.ts");

test("notation and preview start disabled", () => {
  values.clear();
  assert.equal(readShowStandardNotation(), false);
  assert.equal(readNotePreview(), false);
});

test("saves and reads both preferences", () => {
  values.clear();
  saveShowStandardNotation(true);
  saveNotePreview(true);

  assert.equal(readShowStandardNotation(), true);
  assert.equal(readNotePreview(), true);

  saveShowStandardNotation(false);
  assert.equal(readShowStandardNotation(), false);
});

test("uses the documented storage keys", () => {
  values.clear();
  saveShowStandardNotation(true);
  saveNotePreview(false);

  assert.equal(values.get("thediary.tab-score-notation"), "true");
  assert.equal(values.get("thediary.tab-score-preview"), "false");
});

test("survives a storage that throws", async () => {
  const original = globalThis.window.localStorage;
  globalThis.window.localStorage = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
  };

  const module = await import("../src/services/tab-score-preferences.ts?throwing");
  assert.equal(module.readShowStandardNotation(), false);
  assert.equal(module.readNotePreview(), false);
  assert.doesNotThrow(() => module.saveShowStandardNotation(true));

  globalThis.window.localStorage = original;
});

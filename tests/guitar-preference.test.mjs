import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeGuitarPreference,
  readGuitarPreference,
  saveGuitarPreference,
} from "../src/services/guitar-preference.ts";

test("accepts only the supported guitar types as a preference", () => {
  assert.equal(normalizeGuitarPreference("electric"), "electric");
  assert.equal(normalizeGuitarPreference("acoustic"), "acoustic");
  assert.equal(normalizeGuitarPreference("classical"), null);
  assert.equal(normalizeGuitarPreference(""), null);
  assert.equal(normalizeGuitarPreference(null), null);
  assert.equal(normalizeGuitarPreference(undefined), null);
});

test("returns no preference when there is no browser storage", () => {
  assert.equal(readGuitarPreference(), null);
  assert.equal(saveGuitarPreference("electric"), "electric");
});

test("round-trips the preference through local storage", () => {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  };

  assert.equal(readGuitarPreference(), null);
  assert.equal(saveGuitarPreference("acoustic"), "acoustic");
  assert.equal(readGuitarPreference(), "acoustic");
  assert.equal(saveGuitarPreference("classical"), null);
  assert.equal(readGuitarPreference(), null);

  delete globalThis.window;
});

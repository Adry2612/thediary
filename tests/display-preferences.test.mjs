import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_DISPLAY_PREFERENCES,
  normalizeDisplayPreferences,
  resolveTechniqueNameLanguage,
} from "../src/services/display-preferences.ts";

test("keeps valid preferences", () => {
  assert.deepEqual(
    normalizeDisplayPreferences({
      techniqueNameLanguage: "original",
      tuningDisplay: "notes",
    }),
    { techniqueNameLanguage: "original", tuningDisplay: "notes" },
  );
});

test("drops unknown values and falls back to the defaults", () => {
  assert.deepEqual(normalizeDisplayPreferences({ tuningDisplay: "chords" }), {
    tuningDisplay: "name",
  });
  assert.deepEqual(
    normalizeDisplayPreferences({ techniqueNameLanguage: "fr" }),
    { tuningDisplay: "name" },
  );
  assert.deepEqual(normalizeDisplayPreferences(null), DEFAULT_DISPLAY_PREFERENCES);
});

test("leaves the technique language absent for the automatic default", () => {
  assert.deepEqual(normalizeDisplayPreferences({}), { tuningDisplay: "name" });
});

test("follows the interface language when there is no explicit choice", () => {
  assert.equal(
    resolveTechniqueNameLanguage(DEFAULT_DISPLAY_PREFERENCES, "es"),
    "es",
  );
  assert.equal(
    resolveTechniqueNameLanguage(DEFAULT_DISPLAY_PREFERENCES, "en"),
    "original",
  );
});

test("an explicit choice overrides the interface language", () => {
  assert.equal(
    resolveTechniqueNameLanguage(
      { techniqueNameLanguage: "original", tuningDisplay: "name" },
      "es",
    ),
    "original-es",
  );
  assert.equal(
    resolveTechniqueNameLanguage(
      { techniqueNameLanguage: "original", tuningDisplay: "name" },
      "en",
    ),
    "original",
  );
  assert.equal(
    resolveTechniqueNameLanguage(
      { techniqueNameLanguage: "es", tuningDisplay: "name" },
      "en",
    ),
    "es",
  );
});

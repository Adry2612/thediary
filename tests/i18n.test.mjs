import test from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../src/i18n/createTranslator.ts";
import { translations } from "../src/i18n/translations.ts";

test("uses the same translation structure in Spanish and English", () => {
  assert.deepEqual(Object.keys(translations.es), Object.keys(translations.en));
  assert.deepEqual(Object.keys(translations.es.landing), Object.keys(translations.en.landing));
});

test("returns the translated text for nested keys", () => {
  const t = createTranslator(translations.en);
  assert.equal(t("landing.primaryAction"), "Prepare a practice session");
  assert.equal(t("navigation.settings"), "Settings");
});

test("falls back to the key when a translation is missing", () => {
  const t = createTranslator(translations.es);
  assert.equal(t("missing.key"), "missing.key");
});

import test from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../src/i18n/createTranslator.ts";
import { translations } from "../src/i18n/translations.ts";

test("uses the same translation structure in Spanish and English", () => {
  assert.deepEqual(Object.keys(translations.es), Object.keys(translations.en));
  assert.deepEqual(Object.keys(translations.es.landing), Object.keys(translations.en.landing));
  assert.deepEqual(Object.keys(translations.es.licks), Object.keys(translations.en.licks));
  assert.deepEqual(Object.keys(translations.es.settings), Object.keys(translations.en.settings));
  assert.deepEqual(Object.keys(translations.es.account), Object.keys(translations.en.account));
});

test("returns the translated text for nested keys", () => {
  const t = createTranslator(translations.en);
  assert.equal(t("landing.primaryAction"), "Prepare a practice session");
  assert.equal(t("navigation.settings"), "Settings");
});

test("names the practice block detail in both languages", () => {
  assert.equal(translations.es.practice.exercises, "Detalle del bloque");
  assert.equal(translations.en.practice.exercises, "Block detail");
  assert.equal(translations.es.practice.exercisePlaceholder, "p. ej. Dos notas por cuerda, ejercicio 4");
  assert.equal(translations.en.practice.exercisePlaceholder, "e.g. Two notes per string, exercise 4");
  assert.equal(translations.es.timer.continueAfterBlockTime, "Seguir contando al terminar el bloque");
  assert.equal(translations.en.timer.continueAfterBlockTime, "Keep counting after the block ends");
  assert.equal(translations.es.practice.songPickerSearch, "Buscar canción");
  assert.equal(translations.en.practice.songPickerSearch, "Search songs");
  assert.equal(translations.es.practice.songPickerNoResults, "No hay canciones que coincidan con esa búsqueda.");
  assert.equal(translations.en.practice.songPickerNoResults, "No songs match that search.");
  assert.equal(translations.es.practice.techniquePickerSearch, "Buscar técnica");
  assert.equal(translations.en.practice.techniquePickerSearch, "Search techniques");
  assert.equal(translations.es.practice.techniquePickerNoResults, "No hay técnicas que coincidan con esa búsqueda.");
  assert.equal(translations.en.practice.techniquePickerNoResults, "No techniques match that search.");
});

test("falls back to the key when a translation is missing", () => {
  const t = createTranslator(translations.es);
  assert.equal(t("missing.key"), "missing.key");
});

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

test("names the dashboard insights in both languages", () => {
  assert.equal(translations.es.dashboard.guitarBalance, "Balance de guitarras");
  assert.equal(translations.en.dashboard.guitarBalance, "Guitar balance");
  assert.equal(translations.es.dashboard.tempoProgress, "Progreso de tempo");
  assert.equal(translations.en.dashboard.tempoProgress, "Tempo progress");
  assert.deepEqual(
    Object.keys(translations.es.dashboard).sort(),
    Object.keys(translations.en.dashboard).sort(),
  );
});

test("names the session guitar type in both languages", () => {
  assert.equal(translations.es.practice.guitarType, "Tipo de guitarra");
  assert.equal(translations.en.practice.guitarType, "Guitar type");
  assert.deepEqual(
    Object.keys(translations.es.practice).sort(),
    Object.keys(translations.en.practice).sort(),
  );
});

test("names the floating practice bar controls in both languages", () => {
  assert.equal(
    translations.es.practice.openActivePractice,
    "Volver a la práctica en curso",
  );
  assert.equal(
    translations.en.practice.openActivePractice,
    "Return to the practice in progress",
  );
  assert.equal(translations.es.practice.goToTimer, "Ir al temporizador");
  assert.equal(translations.en.practice.goToTimer, "Go to the timer");
  assert.equal(translations.es.practice.pausePractice, "Pausar la práctica");
  assert.equal(translations.en.practice.pausePractice, "Pause the practice");
  assert.equal(translations.es.practice.resumePractice, "Reanudar la práctica");
  assert.equal(
    translations.en.practice.resumePractice,
    "Resume the practice",
  );
});

test("names the home repertoire card states in both languages", () => {
  assert.equal(translations.es.home.noParts, "Sin partes todavía");
  assert.equal(translations.en.home.noParts, "No parts yet");
});

test("names the home plan labels and upcoming blocks in both languages", () => {
  assert.equal(translations.es.practice.sessionPlan, "Plan de la sesión");
  assert.equal(translations.en.practice.sessionPlan, "Session plan");
  assert.equal(
    translations.es.practice.upcomingBlocks,
    "Próximos bloques",
  );
  assert.equal(translations.en.practice.upcomingBlocks, "Upcoming blocks");
  assert.equal(translations.es.practice.nextBlock, "Siguiente");
  assert.equal(translations.en.practice.nextBlock, "Next");
  assert.equal(
    translations.es.practice.noUpcomingBlocks,
    "No quedan más bloques en esta sesión.",
  );
  assert.equal(
    translations.en.practice.noUpcomingBlocks,
    "No more blocks left in this session.",
  );
  assert.equal(translations.es.practice.nextPhase, undefined);
  assert.equal(translations.en.practice.nextPhase, undefined);
  assert.equal(translations.es.practice.noNextPhase, undefined);
  assert.equal(translations.en.practice.noNextPhase, undefined);
});

test("falls back to the key when a translation is missing", () => {
  const t = createTranslator(translations.es);
  assert.equal(t("missing.key"), "missing.key");
});

test("keeps the catalog copy in both languages", () => {
  const keys = [
    "catalogSearchTitle",
    "catalogSearchHint",
    "catalogSearchPlaceholder",
    "catalogSearchAction",
    "catalogSearching",
    "catalogEmpty",
    "catalogUnavailable",
    "catalogUse",
    "catalogBackfill",
  ];

  for (const key of keys) {
    assert.equal(typeof translations.es.repertoire[key], "string", key);
    assert.equal(typeof translations.en.repertoire[key], "string", key);
    assert.ok(translations.es.repertoire[key].length > 0, key);
    assert.ok(translations.en.repertoire[key].length > 0, key);
  }
});

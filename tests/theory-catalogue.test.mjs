import assert from "node:assert/strict";
import test from "node:test";
import {
  THEORY_CATALOG,
  getTheoryCatalogNames,
  getTheoryName,
  resolveTheoryEntry,
} from "../src/utils/catalogs/theory.ts";

test("the theory catalogue has unique ids and both names", () => {
  assert.ok(THEORY_CATALOG.length >= 10);
  assert.equal(
    new Set(THEORY_CATALOG.map((topic) => topic.id)).size,
    THEORY_CATALOG.length,
  );
  for (const topic of THEORY_CATALOG) {
    assert.notEqual(topic.es, "");
    assert.notEqual(topic.en, "");
  }
});

test("resolves a topic by its Spanish or original name", () => {
  assert.equal(resolveTheoryEntry("Escala mayor")?.id, "major-scale");
  assert.equal(resolveTheoryEntry("major scale")?.id, "major-scale");
  assert.equal(resolveTheoryEntry("MODES")?.id, "modes");
  assert.equal(resolveTheoryEntry("tema inventado"), null);
});

test("returns the name in the requested language", () => {
  assert.equal(getTheoryName("major-scale", "es"), "Escala mayor");
  assert.equal(getTheoryName("Escala mayor", "original"), "Major scale");
  assert.equal(getTheoryName("tema propio", "original"), "tema propio");
  assert.deepEqual(
    getTheoryCatalogNames("original").slice(0, 2),
    ["Notes and intervals", "Major scale"],
  );
});

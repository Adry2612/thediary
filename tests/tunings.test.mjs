import assert from "node:assert/strict";
import test from "node:test";
import {
  formatTuning,
  formatTuningPreset,
  getCommonTuningValues,
  resolveTuningEntry,
} from "../src/utils/catalogs/tunings.ts";

test("formats known tunings by name or by strings", () => {
  assert.equal(
    formatTuning("E Standard (EADGBE)", { display: "name", locale: "es" }),
    "Estándar",
  );
  assert.equal(
    formatTuning("E Standard (EADGBE)", { display: "name", locale: "en" }),
    "Standard",
  );
  assert.equal(
    formatTuning("E Standard (EADGBE)", { display: "notes", locale: "es" }),
    "EADGBE",
  );
  assert.equal(
    formatTuning("Drop D (DADGBE)", { display: "name", locale: "es" }),
    "Drop D",
  );
  assert.equal(
    formatTuning("Drop D (DADGBE)", { display: "notes", locale: "es" }),
    "DADGBE",
  );
});

test("formats bare notes and stored aliases", () => {
  assert.equal(
    formatTuning("DADGBE", { display: "name", locale: "es" }),
    "Drop D",
  );
  assert.equal(
    formatTuning("Full Step Down (D G C F A D)", {
      display: "name",
      locale: "es",
    }),
    "Un tono abajo",
  );
});

test("keeps custom and unknown tunings as stored", () => {
  assert.equal(
    formatTuning("Mi afinación (DADGBE)", {
      display: "name",
      locale: "es",
    }),
    "Mi afinación (DADGBE)",
  );
  assert.equal(
    formatTuning("XYZ", { display: "notes", locale: "es" }),
    "XYZ",
  );
  assert.equal(resolveTuningEntry("XYZ"), null);
});

test("formats the tuner presets", () => {
  assert.equal(
    formatTuningPreset("eb-standard", { display: "name", locale: "es" }),
    "Eb estándar",
  );
  assert.equal(
    formatTuningPreset("eb-standard", { display: "notes", locale: "es" }),
    "EbAbDbGbBbEb",
  );
});

test("common tunings keep the stored values and the free option", () => {
  const values = getCommonTuningValues();
  assert.equal(values[0], "E Standard (EADGBE)");
  assert.equal(values.at(-1), "Otra...");
  assert.ok(values.includes("Drop D (DADGBE)"));
  assert.ok(values.includes("Full Step Down (D G C F A D)"));
  assert.equal(values.includes("Eb Standard (EbAbDbGbBbEb)"), false);
});

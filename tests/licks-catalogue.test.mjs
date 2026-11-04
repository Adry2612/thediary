import assert from "node:assert/strict";
import test from "node:test";
import {
  MUSICAL_KEYS,
  isMusicalKey,
  normalizeMusicalKey,
} from "../src/utils/licks/keys.ts";
import {
  LICK_TECHNIQUES,
  getLickTechnique,
  isTechniqueId,
  normalizeTechniques,
} from "../src/utils/licks/techniques.ts";
import {
  getTechniqueName,
  resolveTechniqueEntry,
} from "../src/utils/catalogs/techniques.ts";
import { TECHNIQUE_IDS } from "../src/types/lick.ts";

test("the key catalogue has the twelve roots in major and minor", () => {
  assert.equal(MUSICAL_KEYS.length, 24);
  assert.equal(new Set(MUSICAL_KEYS).size, 24);
  assert.ok(isMusicalKey("A#m"));
  assert.ok(isMusicalKey("C"));
  assert.equal(isMusicalKey("H"), false);
  assert.equal(isMusicalKey("Cb"), false);
  assert.equal(normalizeMusicalKey("H"), undefined);
});

test("every technique has Spanish and original names and a glyph", () => {
  assert.equal(LICK_TECHNIQUES.length, TECHNIQUE_IDS.length);
  for (const id of TECHNIQUE_IDS) {
    const descriptor = getLickTechnique(id);
    assert.ok(descriptor, `${id} lacks a descriptor`);
    assert.notEqual(descriptor.es, "");
    assert.notEqual(descriptor.en, "");
    assert.notEqual(descriptor.glyph, "");
  }
});

test("resolves a technique by either of its names", () => {
  assert.equal(resolveTechniqueEntry("Púa alterna")?.id, "ALTERNATE_PICKING");
  assert.equal(resolveTechniqueEntry("alternate picking")?.id, "ALTERNATE_PICKING");
  assert.equal(resolveTechniqueEntry("LEGATO")?.id, "LEGATO");
  assert.equal(resolveTechniqueEntry("inventada"), null);
  assert.equal(getTechniqueName("LEGATO", "es"), "Legato");
  assert.equal(
    getTechniqueName("Púa alterna", "original"),
    "Alternate picking",
  );
  assert.equal(getTechniqueName("propia", "es"), "propia");
});

test("the classic picking techniques keep their English name in Spanish", () => {
  assert.equal(getTechniqueName("ALTERNATE_PICKING", "es"), "Alternate picking");
  assert.equal(getTechniqueName("SWEEP_PICKING", "es"), "Sweep picking");
  assert.equal(getTechniqueName("DOUBLE_STOPS", "es"), "Double stops");
  assert.equal(getTechniqueName("Dobles cuerdas", "original-es"), "Double stops");
  assert.equal(getTechniqueName("Barridos", "es"), "Sweep picking");
  assert.equal(resolveTechniqueEntry("Ritmo y rascado")?.id, "RHYTHM_STRUMMING");
});

test("the catalogue includes the common missing techniques", () => {
  for (const id of [
    "PALM_MUTE",
    "HARMONICS",
    "STRING_SKIPPING",
    "TREMOLO_PICKING",
    "DOUBLE_STOPS",
    "ARPEGGIOS",
    "SLAP",
    "POP",
    "CHICKEN_PICKING",
    "WHAMMY_BAR",
  ]) {
    const entry = getLickTechnique(id);
    assert.ok(entry, `${id} is missing from the catalogue`);
    assert.notEqual(entry.es, "");
    assert.notEqual(entry.en, "");
  }
});

test("translations only use the original name in an English interface", () => {
  assert.equal(getTechniqueName("RHYTHM_STRUMMING", "es"), "Rasgueo");
  assert.equal(getTechniqueName("RHYTHM_STRUMMING", "original"), "Strumming");
  assert.equal(getTechniqueName("RHYTHM_STRUMMING", "original-es"), "Rasgueo");
  assert.equal(
    getTechniqueName("SWEEP_PICKING", "original-es"),
    "Sweep picking",
  );
  assert.equal(getTechniqueName("PALM_MUTE", "original-es"), "Palm mute");
  assert.equal(getTechniqueName("DOUBLE_STOPS", "original-es"), "Double stops");
  assert.equal(getTechniqueName("HARMONICS", "original-es"), "Armónicos");
  assert.equal(getTechniqueName("HARMONICS", "original"), "Harmonics");
  assert.equal(getTechniqueName("ARPEGGIOS", "original-es"), "Arpegios");
  assert.equal(getTechniqueName("ARPEGGIOS", "original"), "Arpeggios");
});

test("unknown techniques are rejected and valid ones keep catalogue order", () => {
  assert.equal(isTechniqueId("LEGATO"), true);
  assert.equal(isTechniqueId("legato"), false);
  assert.equal(isTechniqueId("SWEEP"), false);
  assert.deepEqual(
    normalizeTechniques(["TAPPING", "LEGATO", "TAPPING", "INVENTED"]),
    ["LEGATO", "TAPPING"],
  );
  assert.deepEqual(normalizeTechniques("LEGATO"), []);
  assert.deepEqual(normalizeTechniques(undefined), []);
});

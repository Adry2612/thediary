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

test("every technique has a descriptor with a label key and a glyph", () => {
  assert.equal(LICK_TECHNIQUES.length, TECHNIQUE_IDS.length);
  for (const id of TECHNIQUE_IDS) {
    const descriptor = getLickTechnique(id);
    assert.ok(descriptor, `${id} lacks a descriptor`);
    assert.notEqual(descriptor.labelKey, "");
    assert.notEqual(descriptor.glyph, "");
  }
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

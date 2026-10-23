import assert from "node:assert/strict";
import test from "node:test";
import { RESOURCE_LABELS } from "../src/utils/practice-resources.ts";
import { PRACTICE_RESOURCE_KINDS } from "../src/types/practice.ts";

test("names every kind of material, with no gaps and no extras", () => {
  assert.deepEqual(
    [...PRACTICE_RESOURCE_KINDS].sort(),
    Object.keys(RESOURCE_LABELS).sort(),
  );
});

test("gives every kind a non-empty label", () => {
  for (const kind of PRACTICE_RESOURCE_KINDS) {
    assert.equal(typeof RESOURCE_LABELS[kind], "string");
    assert.ok(RESOURCE_LABELS[kind].trim().length > 0);
  }
});

test("keeps the labels the lists were showing", () => {
  assert.deepEqual(RESOURCE_LABELS, {
    songsterr: "Songsterr",
    pdf: "PDF",
    audio: "Audio",
    guitarpro: "Guitar Pro",
    youtube: "YouTube",
    spotify: "Spotify",
    tab: "TAB",
  });
});

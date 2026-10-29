import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeTargetMinutes,
  targetMinutesToSeconds,
} from "../src/utils/practice-target.ts";

test("accepts positive whole minutes", () => {
  assert.equal(normalizeTargetMinutes(30), 30);
  assert.equal(normalizeTargetMinutes("45"), 45);
});

test("rejects zero, negatives and fractions", () => {
  assert.equal(normalizeTargetMinutes(0), undefined);
  assert.equal(normalizeTargetMinutes(-5), undefined);
  assert.equal(normalizeTargetMinutes(1.5), undefined);
  assert.equal(normalizeTargetMinutes(""), undefined);
  assert.equal(normalizeTargetMinutes(null), undefined);
  assert.equal(normalizeTargetMinutes(undefined), undefined);
});

test("converts minutes to seconds and keeps no target as null", () => {
  assert.equal(targetMinutesToSeconds(30), 1800);
  assert.equal(targetMinutesToSeconds(undefined), null);
  assert.equal(targetMinutesToSeconds(0), null);
});

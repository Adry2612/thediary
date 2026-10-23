import assert from "node:assert/strict";
import test from "node:test";
import {
  DIFFICULTY_LABEL_KEYS,
  getDifficultyLabel,
} from "../src/utils/difficulty-labels.ts";

const text = {
  difficultyBeginner: "Principiante",
  difficultyIntermediate: "Intermedio",
  difficultyAdvanced: "Avanzado",
  difficultyNone: "Sin dificultad",
};

test("gives every difficulty its own dictionary key", () => {
  assert.deepEqual(DIFFICULTY_LABEL_KEYS, {
    beginner: "difficultyBeginner",
    intermediate: "difficultyIntermediate",
    advanced: "difficultyAdvanced",
  });
});

test("names the difficulty in the active language", () => {
  assert.equal(getDifficultyLabel(text, "beginner"), "Principiante");
  assert.equal(getDifficultyLabel(text, "advanced"), "Avanzado");
});

test("falls back to the no-difficulty text when there is none", () => {
  assert.equal(getDifficultyLabel(text, undefined), "Sin dificultad");
  assert.equal(getDifficultyLabel({}, undefined), "");
});

test("falls back to the raw name when the dictionary has no entry", () => {
  assert.equal(getDifficultyLabel({}, "intermediate"), "intermediate");
});

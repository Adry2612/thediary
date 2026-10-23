import assert from "node:assert/strict";
import test from "node:test";
import {
  DELETE_CONFIRMATION_WORD,
  isDeleteConfirmation,
  passwordsMatch,
} from "../src/utils/account-validation.ts";

test("matches a password against its repetition", () => {
  assert.equal(passwordsMatch("secreta", "secreta"), true);
});

test("rejects a mismatched or empty repetition", () => {
  assert.equal(passwordsMatch("secreta", "secreto"), false);
  assert.equal(passwordsMatch("", ""), true);
  assert.equal(passwordsMatch("secreta", ""), false);
  assert.equal(passwordsMatch("", "secreta"), false);
});

test("does not trim before comparing passwords", () => {
  assert.equal(passwordsMatch("secreta ", "secreta"), false);
});

test("confirms the deletion with exactly the expected word", () => {
  assert.equal(DELETE_CONFIRMATION_WORD, "BORRAR");
  assert.equal(isDeleteConfirmation("BORRAR"), true);
});

test("rejects anything else as a deletion confirmation", () => {
  assert.equal(isDeleteConfirmation(""), false);
  assert.equal(isDeleteConfirmation("borrar"), false);
  assert.equal(isDeleteConfirmation("BORRAR "), false);
  assert.equal(isDeleteConfirmation("BORRA"), false);
});

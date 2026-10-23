import test from "node:test";
import assert from "node:assert/strict";
import { errorMessage } from "../src/utils/error-message.ts";

test("returns the message of an Error", () => {
  assert.equal(errorMessage(new Error("Sin conexión"), "algo falló"), "Sin conexión");
});

test("keeps an empty message instead of replacing it with the fallback", () => {
  assert.equal(errorMessage(new Error(""), "algo falló"), "");
});

test("returns the fallback for a non-Error value", () => {
  assert.equal(errorMessage("boom", "algo falló"), "algo falló");
  assert.equal(errorMessage({ message: "boom" }, "algo falló"), "algo falló");
});

test("returns the fallback for undefined and null", () => {
  assert.equal(errorMessage(undefined, "algo falló"), "algo falló");
  assert.equal(errorMessage(null, "algo falló"), "algo falló");
});

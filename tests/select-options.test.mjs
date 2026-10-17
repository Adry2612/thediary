import assert from "node:assert/strict";
import test from "node:test";
import { buildSelectEntries } from "../src/lib/select-options.ts";

test("inserts a header before each group", () => {
  const entries = buildSelectEntries([
    { value: "C", label: "C", group: "Acordes" },
    { value: "Cm", label: "Cm", group: "Acordes" },
    { value: "Cadd9", label: "Cadd9", group: "Personalizados" },
  ]);

  assert.deepEqual(
    entries.map((entry) => entry.kind),
    ["header", "option", "option", "header", "option"],
  );
  assert.deepEqual(
    entries
      .filter((entry) => entry.kind === "header")
      .map((entry) => entry.label),
    ["Acordes", "Personalizados"],
  );
});

test("headers carry no option index, so they cannot be selected", () => {
  const entries = buildSelectEntries([
    { value: "C", label: "C", group: "Acordes" },
    { value: "Cadd9", label: "Cadd9", group: "Personalizados" },
  ]);

  const headers = entries.filter((entry) => entry.kind === "header");
  assert.ok(headers.every((entry) => !("index" in entry)));
  assert.deepEqual(
    entries
      .filter((entry) => entry.kind === "option")
      .map((entry) => entry.index),
    [0, 1],
  );
});

test("keeps ungrouped options without a header", () => {
  const entries = buildSelectEntries([
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ]);

  assert.deepEqual(
    entries.map((entry) => entry.kind),
    ["option", "option"],
  );
});

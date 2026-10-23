import assert from "node:assert/strict";
import test from "node:test";
import { tokenizeTabLine } from "../src/utils/licks/tab-highlight.ts";

test("tokenizing preserves every character", () => {
  const line = "e|--7h9---12--|";
  assert.equal(
    tokenizeTabLine(line)
      .map((token) => token.text)
      .join(""),
    line,
  );
});

test("marks only digit runs as frets", () => {
  const tokens = tokenizeTabLine("E|--7h9--|");
  assert.deepEqual(
    tokens.map((token) => token.kind),
    ["text", "fret", "text", "fret", "text"],
  );
  assert.deepEqual(
    tokens.filter((token) => token.kind === "fret").map((token) => token.text),
    ["7", "9"],
  );
});

test("handles lines without digits and empty lines", () => {
  assert.deepEqual(tokenizeTabLine("E|--------|"), [
    { text: "E|--------|", kind: "text" },
  ]);
  assert.deepEqual(tokenizeTabLine(""), []);
});

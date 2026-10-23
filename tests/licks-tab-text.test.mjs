import assert from "node:assert/strict";
import test from "node:test";
import { repertoireTabToText } from "../src/utils/licks/tab-text.ts";

const tab = (overrides) => ({
  tuning: "EADGBE",
  measures: 1,
  subdivision: 4,
  notes: [],
  ...overrides,
});

test("renders six aligned rows with a simple riff", () => {
  const text = repertoireTabToText(
    tab({
      notes: [
        { string: 0, column: 0, fret: 3 },
        { string: 5, column: 0, fret: 8 },
      ],
    }),
  );
  assert.equal(
    text,
    [
      "E |8-----------|",
      "B |------------|",
      "G |------------|",
      "D |------------|",
      "A |------------|",
      "E |3-----------|",
    ].join("\n"),
  );
});

test("dead notes become an x and technique glyphs stay on their note", () => {
  const dead = repertoireTabToText(
    tab({ notes: [{ string: 0, column: 0, fret: 0, dead: true }] }),
  );
  assert.match(dead.split("\n")[5], /^E \|x/);

  const hammer = repertoireTabToText(
    tab({
      notes: [
        { string: 0, column: 0, fret: 7, legato: "hammer" },
        { string: 0, column: 1, fret: 9 },
      ],
    }),
  );
  assert.match(hammer.split("\n")[5], /^E \|7h-9/);
});

test("keeps measure boundaries across several measures", () => {
  const text = repertoireTabToText(
    tab({
      measures: 2,
      notes: [{ string: 0, column: 4, fret: 5 }],
    }),
  );
  assert.equal(
    text.split("\n")[5],
    "E |------------|5-----------|",
  );
  assert.equal(text.split("\n").length, 6);
});

test("an empty tab produces no text", () => {
  assert.equal(repertoireTabToText(tab({ notes: [] })), "");
  assert.equal(repertoireTabToText(null), "");
});

test("a single-string note still aligns every row", () => {
  const text = repertoireTabToText(
    tab({ notes: [{ string: 3, column: 2, fret: 12 }] }),
  );
  const rows = text.split("\n");
  assert.equal(rows.length, 6);
  assert.equal(new Set(rows.map((row) => row.length)).size, 1);
  assert.match(rows[2], /G \|------12----\|/);
});

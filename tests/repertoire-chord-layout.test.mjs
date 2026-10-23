import assert from "node:assert/strict";
import test from "node:test";
import {
  layoutChordChart,
  wrapLyricLine,
} from "../src/utils/repertoire-chord-layout.ts";

function line(text, chords = [], id = "line-1") {
  return { id, text, chords };
}

function chord(position, name, id = `${name}-${position}`) {
  return { id, name, position };
}

test("wraps a long line by word, keeping every row within the width", () => {
  const rows = wrapLyricLine(line("uno dos tres cuatro cinco"), 9);

  assert.deepEqual(
    rows.map((row) => row.text),
    ["uno dos", "tres", "cuatro", "cinco"],
  );
  assert.ok(rows.every((row) => row.text.length <= 9));
  assert.deepEqual(
    rows.map((row) => row.start),
    [0, 8, 13, 20],
  );
});

test("splits a word that is longer than a row by character", () => {
  const rows = wrapLyricLine(line("supercalifragilistic"), 6);

  assert.deepEqual(
    rows.map((row) => row.text),
    ["superc", "alifra", "gilist", "ic"],
  );
});

test("keeps a chord aligned with its word when the line fits in one row", () => {
  const rows = wrapLyricLine(line("uno dos tres", [chord(4, "G")]), 20);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].chords.length, 1);
  assert.equal(rows[0].chords[0].column, 4);
  assert.equal(rows[0].chords[0].position, 4);
});

test("keeps a chord anchored in a space the wrap consumes at the previous row end", () => {
  const rows = wrapLyricLine(line("uno  dos", [chord(4, "G")]), 5);

  assert.deepEqual(
    rows.map((row) => row.text),
    ["uno", "dos"],
  );
  assert.equal(rows[0].chords.length, 1);
  assert.equal(rows[0].chords[0].column, 3);
  assert.equal(rows[0].chords[0].position, 4);
  assert.equal(rows[1].chords.length, 0);
});

test("moves a chord whose name does not fit at the row edge to the next row", () => {
  const rows = wrapLyricLine(line("uno dos tres", [chord(7, "G7")]), 8);

  assert.deepEqual(
    rows.map((row) => row.text),
    ["uno dos", "tres"],
  );
  assert.equal(rows[0].chords.length, 0);
  assert.equal(rows[1].chords.length, 1);
  assert.equal(rows[1].chords[0].column, 0);
  assert.equal(rows[1].chords[0].position, 7);
});

test("keeps a chord that fits exactly at the row edge", () => {
  const rows = wrapLyricLine(line("uno dos tres", [chord(7, "G")]), 8);

  assert.equal(rows[0].chords.length, 1);
  assert.equal(rows[0].chords[0].column, 7);
  assert.equal(rows[1].chords.length, 0);
});

test("pushes overlapping chords without moving their anchors", () => {
  const rows = wrapLyricLine(
    line("uno dos", [chord(0, "Cmaj7"), chord(1, "G")]),
    20,
  );

  assert.deepEqual(
    rows[0].chords.map((placed) => [placed.name, placed.column]),
    [
      ["Cmaj7", 0],
      ["G", 6],
    ],
  );
  assert.deepEqual(
    rows[0].chords.map((placed) => placed.position),
    [0, 1],
  );
});

test("a blank line produces a single stanza row", () => {
  const rows = wrapLyricLine(line("", []), 20);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].isBlank, true);
  assert.equal(rows[0].text, "");
  assert.deepEqual(rows[0].chords, []);
});

test("marks continuation rows and leaves the first row and blanks unmarked", () => {
  const rows = wrapLyricLine(line("uno dos tres cuatro", []), 8);

  assert.deepEqual(
    rows.map((row) => row.isContinuation),
    [false, true, true],
  );

  const blank = wrapLyricLine(line("", []), 20);
  assert.equal(blank[0].isContinuation, false);
});

test("collapses consecutive blank lines into a single stanza break", () => {
  const chart = {
    lines: [
      line("uno", [], "a"),
      line("", [], "b"),
      line("   ", [], "c"),
      line("dos", [], "d"),
    ],
  };

  const rows = layoutChordChart(chart, 20);

  assert.deepEqual(
    rows.map((row) => row.text),
    ["uno", "", "dos"],
  );
  assert.equal(rows.filter((row) => row.isBlank).length, 1);
});

test("keeps a single blank line as one stanza break", () => {
  const chart = {
    lines: [line("uno", [], "a"), line("", [], "b"), line("dos", [], "c")],
  };

  const rows = layoutChordChart(chart, 20);

  assert.deepEqual(
    rows.map((row) => row.text),
    ["uno", "", "dos"],
  );
});

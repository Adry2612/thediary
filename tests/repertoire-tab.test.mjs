import assert from "node:assert/strict";
import test from "node:test";
import {
  clearTabNote,
  createEmptyTab,
  findTabNote,
  getTabColumns,
  normalizeTab,
  setTabMeasures,
  setTabNote,
  setTabSubdivision,
} from "../src/lib/repertoire-tab.ts";

test("creates an empty tab with the song tuning", () => {
  const tab = createEmptyTab("Drop D (DADGBE)");
  assert.equal(tab.tuning, "DADGBE");
  assert.equal(tab.subdivision, 16);
  assert.equal(getTabColumns(tab), 32);
  assert.deepEqual(tab.notes, []);
});

test("sets, finds and clears a note in a cell", () => {
  const tab = createEmptyTab();
  const withNote = setTabNote(tab, 2, 5, 7);
  assert.deepEqual(findTabNote(withNote, 2, 5), {
    string: 2,
    column: 5,
    fret: 7,
  });
  const replaced = setTabNote(withNote, 2, 5, 9);
  assert.equal(replaced.notes.length, 1);
  assert.equal(findTabNote(replaced, 2, 5).fret, 9);
  assert.deepEqual(clearTabNote(replaced, 2, 5).notes, []);
});

test("ignores out-of-range cells and frets", () => {
  const tab = createEmptyTab();
  assert.deepEqual(setTabNote(tab, 6, 0, 3).notes, []);
  assert.deepEqual(setTabNote(tab, 0, 0, 99).notes, []);
  assert.deepEqual(setTabNote(tab, 0, 999, 3).notes, []);
});

test("normalizes persisted tabs, dropping invalid notes", () => {
  const tab = normalizeTab({
    tuning: "EADGBE",
    measures: 1,
    subdivision: 8,
    notes: [
      { string: 0, column: 0, fret: 5 },
      { string: 9, column: 0, fret: 5 },
      { string: 1, column: 99, fret: 5 },
      { string: 2, column: 3, fret: 40 },
    ],
  });
  assert.equal(tab.measures, 1);
  assert.equal(tab.subdivision, 8);
  assert.deepEqual(tab.notes, [
    { string: 0, column: 0, fret: 5 },
    { string: 1, column: 7, fret: 5 },
    { string: 2, column: 3, fret: 24 },
  ]);
});

test("removing measures drops notes outside the new range", () => {
  const tab = setTabNote(createEmptyTab(), 0, 20, 3);
  const shorter = setTabMeasures(tab, 1);
  assert.equal(shorter.measures, 1);
  assert.deepEqual(shorter.notes, []);
});

test("changing subdivision keeps the timing", () => {
  const tab = setTabNote(createEmptyTab(), 0, 8, 3);
  const eighth = setTabSubdivision(tab, 8);
  assert.equal(eighth.subdivision, 8);
  assert.equal(findTabNote(eighth, 0, 4).fret, 3);
});

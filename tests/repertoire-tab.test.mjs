import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyTab,
  normalizeTab,
  normalizeTabTechniques,
} from "../src/utils/repertoire-tab.ts";

test("creates an empty tab with the song tuning", () => {
  const tab = createEmptyTab("Drop D (DADGBE)");
  assert.equal(tab.tuning, "DADGBE");
  assert.equal(tab.subdivision, 16);
  assert.deepEqual(tab.notes, []);
});

test("normalizes valid notes and discards impossible ones", () => {
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

test("keeps the last note written in the same cell", () => {
  const tab = normalizeTab({
    tuning: "EADGBE",
    measures: 1,
    subdivision: 4,
    notes: [
      { string: 0, column: 1, fret: 3 },
      { string: 0, column: 1, fret: 7 },
    ],
  });

  assert.equal(tab.notes.length, 1);
  assert.equal(tab.notes[0].fret, 7);
});

test("uses the fallback tuning and clamps the measures", () => {
  const tab = normalizeTab(
    { tuning: "", measures: 500, subdivision: 4, notes: [] },
    "DADGAD",
  );

  assert.equal(tab.measures, 64);
  assert.equal(tab.tuning, "DADGAD");
});

test("discards unknown technique values but keeps the note", () => {
  const note = normalizeTabTechniques({
    string: 1,
    column: 2,
    fret: 5,
    legato: "unknown",
    vibrato: "wide",
    bend: { semitones: 3 },
    palmMute: true,
  });

  assert.equal(note.fret, 5);
  assert.equal(note.legato, undefined);
  assert.equal(note.vibrato, "wide");
  assert.equal(note.bend, undefined);
  assert.equal(note.palmMute, true);
});

test("drops a legato when the previous note on that string disappears", () => {
  const tab = normalizeTab({
    tuning: "EADGBE",
    measures: 1,
    subdivision: 4,
    notes: [
      { string: 0, column: 0, fret: 3, legato: "hammer" },
      { string: 0, column: 2, fret: 5, legato: "hammer" },
    ],
  });

  assert.equal(tab.notes[0].legato, undefined);
  assert.equal(tab.notes[1].legato, "hammer");
});

test("an empty tab keeps the fallback tuning", () => {
  const tab = normalizeTab(undefined, "DADGAD");
  assert.equal(tab.tuning, "DADGAD");
  assert.deepEqual(tab.notes, []);
});

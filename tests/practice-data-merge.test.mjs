import assert from "node:assert/strict";
import test from "node:test";
import {
  mergePracticeData,
  normalizePracticeData,
} from "../src/lib/supabase/practice-data.ts";

function customChord(id, name) {
  return { id, name, shape: { frets: [null, 3, 2, 0, 1, 0] } };
}

test("merges the user's saved chords from cloud and local without duplicating", () => {
  const remote = normalizePracticeData({
    customChords: [customChord("a", "Cadd9"), customChord("b", "Cmaj9")],
  });
  const local = normalizePracticeData({
    customChords: [customChord("b", "Cmaj9"), customChord("c", "G/B")],
  });

  const merged = mergePracticeData(remote, local);

  assert.deepEqual(
    merged.customChords.map((chord) => chord.id).sort(),
    ["a", "b", "c"],
  );
});

test("a local saved chord wins when both sides share the id", () => {
  const remote = normalizePracticeData({
    customChords: [customChord("a", "C")],
  });
  const local = normalizePracticeData({
    customChords: [customChord("a", "C personalizado")],
  });

  const merged = mergePracticeData(remote, local);

  assert.equal(merged.customChords.length, 1);
  assert.equal(merged.customChords[0].name, "C personalizado");
});

test("normalizing a state without saved chords yields an empty collection", () => {
  const state = normalizePracticeData({ history: [] });

  assert.deepEqual(state.customChords, []);
});

function lick(id, title) {
  return {
    id,
    title,
    tabContent: "",
    techniques: [],
    bpmHistory: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    practiceCount: 0,
  };
}

test("merges licks from cloud and local by id", () => {
  const remote = normalizePracticeData({
    licks: [lick("a", "Frase A"), lick("b", "Frase B")],
  });
  const local = normalizePracticeData({
    licks: [lick("b", "Frase B local"), lick("c", "Frase C")],
  });

  const merged = mergePracticeData(remote, local);

  assert.deepEqual(
    merged.licks.map((item) => item.id).sort(),
    ["a", "b", "c"],
  );
  assert.equal(
    merged.licks.find((item) => item.id === "b").title,
    "Frase B local",
  );
});

test("normalizing a state saved before licks yields an empty collection", () => {
  const state = normalizePracticeData({ history: [], repertoireItems: [] });

  assert.deepEqual(state.licks, []);
});

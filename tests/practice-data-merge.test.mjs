import assert from "node:assert/strict";
import test from "node:test";
import {
  mergePracticeData,
  normalizePracticeData,
} from "../src/services/supabase/practice-data.ts";

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

test("normalizing an old session fills the lick skill and keeps lick links", () => {
  const state = normalizePracticeData({
    history: [
      {
        id: "old-session",
        skillSeconds: {
          technique: 60,
          theory: 0,
          repertoire: 0,
          improvisation: 30,
        },
        phases: [
          {
            id: 1,
            name: "Lick",
            skill: "lick",
            elapsedSeconds: 60,
            lickId: "lick-1",
          },
        ],
      },
    ],
  });

  assert.deepEqual(state.history[0].skillSeconds, {
    technique: 60,
    theory: 0,
    repertoire: 0,
    lick: 0,
    improvisation: 30,
  });
  assert.equal(state.history[0].phases?.[0].lickId, "lick-1");
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

test("preserves the guitar type and block BPM through the cloud merge", () => {
  const remote = normalizePracticeData({
    history: [
      {
        id: "session-1",
        startedAt: "2026-10-01T10:00:00.000Z",
        guitarType: "acoustic",
        skillSeconds: { technique: 60 },
        phases: [
          {
            id: 1,
            name: "Escalas",
            skill: "technique",
            elapsedSeconds: 60,
            averageBpm: 92,
          },
        ],
      },
    ],
  });
  const local = normalizePracticeData({
    history: [
      {
        id: "session-1",
        startedAt: "2026-10-01T10:00:00.000Z",
        guitarType: "electric",
        skillSeconds: { technique: 60 },
        phases: [
          {
            id: 1,
            name: "Escalas",
            skill: "technique",
            elapsedSeconds: 60,
            averageBpm: 96,
          },
        ],
      },
      {
        id: "session-2",
        startedAt: "2026-10-02T10:00:00.000Z",
        guitarType: "classical",
        skillSeconds: { technique: 60 },
      },
    ],
  });

  const merged = mergePracticeData(remote, local);

  assert.equal(merged.history[0].guitarType, "electric");
  assert.equal(merged.history[0].phases?.[0].averageBpm, 96);
  assert.equal("guitarType" in merged.history[1], false);
});

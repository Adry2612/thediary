import assert from "node:assert/strict";
import test from "node:test";
import {
  applySessionEdit,
  toEditableSession,
} from "../src/utils/practice-session-editing.ts";

function session(overrides = {}) {
  return {
    id: "session-1",
    title: "Rutina de tarde",
    startedAt: "2026-10-16T10:00:00.000Z",
    durationSeconds: 1_500,
    averageBpm: 90,
    completed: true,
    skillSeconds: {
      technique: 900,
      theory: 0,
      repertoire: 600,
      lick: 0,
      improvisation: 0,
    },
    notes: "Buena sesión",
    phases: [
      { id: 1, name: "Técnica", skill: "technique", elapsedSeconds: 900, durationMinutes: 15 },
      { id: 2, name: "Repertorio", skill: "repertoire", elapsedSeconds: 600, durationMinutes: 10 },
    ],
    ...overrides,
  };
}

test("loads a saved session into the editable draft", () => {
  const draft = toEditableSession(session());

  assert.equal(draft.title, "Rutina de tarde");
  assert.equal(draft.durationMinutes, 25);
  assert.deepEqual(
    draft.blocks.map((block) => [block.name, block.actualMinutes]),
    [
      ["Técnica", 15],
      ["Repertorio", 10],
    ],
  );
});

test("derives duration and skill totals from the edited blocks", () => {
  const draft = toEditableSession(session());
  draft.blocks[0] = { ...draft.blocks[0], actualMinutes: 20, skill: "technique" };
  draft.blocks[1] = { ...draft.blocks[1], actualMinutes: 5, skill: "theory" };

  const updated = applySessionEdit(session(), draft);

  assert.equal(updated.durationSeconds, 1_500);
  assert.deepEqual(updated.skillSeconds, {
    technique: 1_200,
    theory: 300,
    repertoire: 0,
    lick: 0,
    improvisation: 0,
  });
  assert.equal(updated.phases.length, 2);
  assert.equal(updated.title, "Rutina de tarde");
});

test("keeps block links and details when a saved session is edited", () => {
  const original = session({
    phases: [{
      id: 1,
      name: "Frase",
      skill: "lick",
      elapsedSeconds: 60,
      durationMinutes: 1,
      lickId: "lick-1",
      repertoireItemId: "song-1",
      repertoirePartId: "part-1",
      exercises: ["Dos notas por cuerda"],
      resources: [{ id: "r1", title: "Base", kind: "audio", assetId: "a1" }],
    }],
  });
  const draft = toEditableSession(original);
  draft.blocks[0] = { ...draft.blocks[0], actualMinutes: 2 };

  const updated = applySessionEdit(original, draft);

  assert.equal(updated.phases[0].lickId, "lick-1");
  assert.equal(updated.phases[0].repertoireItemId, "song-1");
  assert.equal(updated.phases[0].repertoirePartId, "part-1");
  assert.deepEqual(updated.phases[0].exercises, ["Dos notas por cuerda"]);
  assert.equal(updated.phases[0].resources?.[0].title, "Base");
});

test("keeps the guitar type and each block's BPM through an edit", () => {
  const original = session({
    guitarType: "acoustic",
    phases: [
      {
        id: 1,
        name: "Canción",
        skill: "repertoire",
        elapsedSeconds: 600,
        durationMinutes: 10,
        averageBpm: 88,
      },
    ],
  });
  const draft = toEditableSession(original);

  assert.equal(draft.guitarType, "acoustic");
  assert.equal(draft.blocks[0].averageBpm, 88);

  draft.blocks[0] = { ...draft.blocks[0], actualMinutes: 12 };
  const updated = applySessionEdit(original, draft);

  assert.equal(updated.guitarType, "acoustic");
  assert.equal(updated.phases[0].averageBpm, 88);
});

test("changes or clears the guitar type", () => {
  const original = session({ guitarType: "electric" });

  const changed = toEditableSession(original);
  changed.guitarType = "acoustic";
  assert.equal(applySessionEdit(original, changed).guitarType, "acoustic");

  const cleared = toEditableSession(original);
  cleared.guitarType = null;
  assert.equal("guitarType" in applySessionEdit(original, cleared), false);
});

test("keeps the guitar type when all blocks are removed", () => {
  const original = session({ guitarType: "electric" });
  const draft = toEditableSession(original);
  draft.blocks = [];
  draft.durationMinutes = 30;

  const updated = applySessionEdit(original, draft);

  assert.equal(updated.guitarType, "electric");
  assert.equal(updated.phases, undefined);
});

test("drops the blocks and keeps the previous skill split when all are removed", () => {
  const draft = toEditableSession(session());
  draft.blocks = [];
  draft.durationMinutes = 30;

  const updated = applySessionEdit(session(), draft);

  assert.equal(updated.phases, undefined);
  assert.equal(updated.durationSeconds, 1_800);
  assert.deepEqual(updated.skillSeconds, session().skillSeconds);
});

test("ignores unnamed blocks and always falls back for the title", () => {
  const draft = toEditableSession(session());
  draft.title = "   ";
  draft.blocks = [{ ...draft.blocks[0], name: "  " }];

  const updated = applySessionEdit(session(), draft);

  assert.equal(updated.title, undefined);
  assert.equal(updated.phases, undefined);
  assert.equal(updated.durationSeconds, 1_500);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  applySessionEdit,
  toEditableSession,
} from "../src/lib/practice-session-editing.ts";

function session(overrides = {}) {
  return {
    id: "session-1",
    title: "Rutina de tarde",
    startedAt: "2026-10-16T10:00:00.000Z",
    durationSeconds: 1_500,
    averageBpm: 90,
    completed: true,
    skillSeconds: { technique: 900, theory: 0, repertoire: 600, improvisation: 0 },
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
    improvisation: 0,
  });
  assert.equal(updated.phases.length, 2);
  assert.equal(updated.title, "Rutina de tarde");
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

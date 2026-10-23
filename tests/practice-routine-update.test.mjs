import assert from "node:assert/strict";
import test from "node:test";
import {
  applyRoutineLinkChanges,
  hasPracticeLinkChanges,
} from "../src/utils/practice-routine-update.ts";

function phase(overrides = {}) {
  return {
    id: "phase-1",
    name: "Canción",
    durationMinutes: 10,
    skill: "repertoire",
    repertoireItemId: "song-1",
    repertoirePartId: "part-1",
    ...overrides,
  };
}

function routine(overrides = {}) {
  return {
    id: "routine-1",
    name: "Rutina",
    updatedAt: "2026-10-01T00:00:00.000Z",
    phases: [phase()],
    ...overrides,
  };
}

test("detects a changed song, part, lick or name", () => {
  const base = [phase()];

  assert.equal(hasPracticeLinkChanges([phase()], base), false);
  assert.equal(
    hasPracticeLinkChanges(
      [phase({ repertoireItemId: "song-2" })],
      base,
    ),
    true,
  );
  assert.equal(
    hasPracticeLinkChanges([phase({ repertoirePartId: undefined })], base),
    true,
  );
  assert.equal(
    hasPracticeLinkChanges(
      [phase({ skill: "lick", lickId: "lick-1" })],
      [phase({ skill: "lick", lickId: "lick-2" })],
    ),
    true,
  );
  assert.equal(
    hasPracticeLinkChanges([phase({ name: "Otra" })], base),
    true,
  );
});

test("detects added or missing blocks", () => {
  assert.equal(hasPracticeLinkChanges([], [phase()]), true);
  assert.equal(hasPracticeLinkChanges([phase()], []), true);
});

test("patches only links and names and keeps durations and order", () => {
  const original = routine({
    phases: [
      phase({ durationMinutes: 15 }),
      phase({ id: "phase-2", name: "Otra", repertoireItemId: "song-2" }),
    ],
  });
  const updated = applyRoutineLinkChanges(
    original,
    [
      phase({
        name: "Canción nueva",
        repertoireItemId: "song-3",
        repertoirePartId: undefined,
      }),
      phase({
        id: "phase-2",
        name: "Otra",
        repertoireItemId: "song-2",
        repertoirePartId: "part-2",
      }),
    ],
    "2026-10-23T12:00:00.000Z",
  );

  assert.equal(updated.updatedAt, "2026-10-23T12:00:00.000Z");
  assert.equal(updated.phases[0].name, "Canción nueva");
  assert.equal(updated.phases[0].repertoireItemId, "song-3");
  assert.equal(updated.phases[0].repertoirePartId, undefined);
  assert.equal(updated.phases[0].durationMinutes, 15);
  assert.equal(updated.phases[1].repertoirePartId, "part-2");
  assert.equal(updated.phases[1].durationMinutes, 10);
});

test("keeps a routine block that the session does not contain", () => {
  const original = routine({ phases: [phase(), phase({ id: "phase-2" })] });
  const updated = applyRoutineLinkChanges(
    original,
    [phase({ repertoireItemId: "song-3" })],
    "2026-10-23T12:00:00.000Z",
  );

  assert.equal(updated.phases[1].id, "phase-2");
  assert.equal(updated.phases[1].repertoireItemId, "song-1");
});

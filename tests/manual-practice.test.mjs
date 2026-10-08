import assert from "node:assert/strict";
import test from "node:test";
import { createManualPracticeRecord } from "../src/lib/manual-practice.ts";

test("creates a historical session from its blocks, duration, skills, and notes", () => {
  const record = createManualPracticeRecord({
    title: "Escalas en casa",
    startedAtLocal: "2026-10-07T18:30",
    blocks: [
      { name: "Escalas", durationMinutes: 25, skill: "technique" },
      { name: "Repertorio", durationMinutes: 20, skill: "repertoire" },
    ],
    notes: "Trabajé despacio y con metrónomo.",
  });

  assert.equal(record.title, "Escalas en casa");
  assert.equal(record.startedAt, new Date("2026-10-07T18:30").toISOString());
  assert.equal(record.durationSeconds, 2700);
  assert.equal(record.completed, true);
  assert.equal(record.averageBpm, 0);
  assert.deepEqual(record.skillSeconds, {
    technique: 1500,
    theory: 0,
    repertoire: 1200,
    improvisation: 0,
  });
  assert.equal(record.notes, "Trabajé despacio y con metrónomo.");
  assert.deepEqual(
    record.phases.map(({ name, durationMinutes, elapsedSeconds, skill }) => ({
      name,
      durationMinutes,
      elapsedSeconds,
      skill,
    })),
    [
      {
        name: "Escalas",
        durationMinutes: 25,
        elapsedSeconds: 1500,
        skill: "technique",
      },
      {
        name: "Repertorio",
        durationMinutes: 20,
        elapsedSeconds: 1200,
        skill: "repertoire",
      },
    ],
  );
  assert.ok(record.id);
});

test("uses a default title and omits empty notes", () => {
  const record = createManualPracticeRecord({
    title: " ",
    startedAtLocal: "2026-10-07T18:30",
    blocks: [{ name: "Tema", durationMinutes: 30, skill: "repertoire" }],
    notes: "  ",
  });

  assert.equal(record.title, "Práctica manual");
  assert.equal(record.notes, undefined);
  assert.equal(record.skillSeconds.repertoire, 1800);
});

test("rejects invalid dates, empty blocks, invalid durations, and unknown skills", () => {
  const input = {
    title: "",
    startedAtLocal: "2026-10-07T18:30",
    blocks: [{ name: "Técnica", durationMinutes: 30, skill: "theory" }],
    notes: "",
  };

  assert.throws(
    () =>
      createManualPracticeRecord({
        ...input,
        startedAtLocal: "not-a-date",
      }),
    /fecha y hora válidas/,
  );
  assert.throws(
    () =>
      createManualPracticeRecord({
        ...input,
        startedAtLocal: "2026-02-30T18:30",
      }),
    /fecha y hora válidas/,
  );
  assert.throws(
    () =>
      createManualPracticeRecord({
        ...input,
        blocks: [],
      }),
    /al menos un bloque/i,
  );
  assert.throws(
    () =>
      createManualPracticeRecord({
        ...input,
        blocks: [{ ...input.blocks[0], durationMinutes: 0 }],
      }),
    /duración.*entero entre 1 y 240/i,
  );
  assert.throws(
    () =>
      createManualPracticeRecord({
        ...input,
        blocks: [{ ...input.blocks[0], skill: "unknown" }],
      }),
    /tipo de práctica válido/i,
  );
  assert.throws(
    () =>
      createManualPracticeRecord({
        ...input,
        blocks: [{ ...input.blocks[0], name: " " }],
      }),
    /nombre del bloque/i,
  );
});

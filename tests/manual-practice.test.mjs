import assert from "node:assert/strict";
import test from "node:test";
import {
  createManualPracticeBlockDraft,
  createManualPracticeRecord,
  manualPracticeBlocksFromDrafts,
  toLocalDateTimeInputValue,
} from "../src/utils/manual-practice.ts";

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
    lick: 0,
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

test("opens a new block with an id, half an hour and a skill", () => {
  const block = createManualPracticeBlockDraft();

  assert.equal(typeof block.id, "string");
  assert.ok(block.id.length > 0);
  assert.equal(block.name, "");
  assert.equal(block.durationMinutes, "30");
  assert.equal(block.skill, "technique");
});

test("gives every new block its own id", () => {
  assert.notEqual(createManualPracticeBlockDraft().id, createManualPracticeBlockDraft().id);
});

test("writes the local clock time for a datetime-local field", () => {
  assert.equal(toLocalDateTimeInputValue(new Date(2026, 2, 5, 9, 7)), "2026-03-05T09:07");
  assert.equal(toLocalDateTimeInputValue(new Date(2026, 11, 31, 23, 59)), "2026-12-31T23:59");
  assert.equal(toLocalDateTimeInputValue(new Date(2026, 0, 1, 0, 0)), "2026-01-01T00:00");
});

test("turns edited blocks into the blocks the record validates", () => {
  const blocks = manualPracticeBlocksFromDrafts([
    { id: "a", name: "Escalas", durationMinutes: "15", skill: "technique" },
    { id: "b", name: "Oído", durationMinutes: "", skill: "theory" },
  ]);

  assert.deepEqual(blocks, [
    { name: "Escalas", durationMinutes: 15, skill: "technique" },
    { name: "Oído", durationMinutes: 0, skill: "theory" },
  ]);
});

test("records a session built from an untouched draft form", () => {
  const block = createManualPracticeBlockDraft();
  const record = createManualPracticeRecord({
    title: "",
    startedAtLocal: "2026-10-07T18:30",
    blocks: manualPracticeBlocksFromDrafts([
      { ...block, name: "Rutina" },
    ]),
    notes: "",
  });

  assert.equal(record.title, "Práctica manual");
  assert.equal(record.durationSeconds, 30 * 60);
  assert.equal(record.phases[0].skill, "technique");
});

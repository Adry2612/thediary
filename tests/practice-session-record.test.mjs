import assert from "node:assert/strict";
import test from "node:test";
import { createPracticeSessionRecord } from "../src/lib/practice-session-record.ts";

test("builds a saved session from timer results and phase metadata", () => {
  const phases = [
    {
      id: "phase-1",
      name: "Técnica",
      durationMinutes: 15,
      skill: "technique",
      exercises: ["Arpegios", "Escalas"],
      resources: [
        {
          id: "resource-1",
          title: "Backing track",
          kind: "audio",
          assetId: "asset-1",
        },
      ],
      repertoireItemId: "song-1",
      repertoirePartId: "part-1",
    },
  ];
  const result = {
    elapsedSeconds: 720,
    startedAt: "2026-10-08T12:00:00.000Z",
    completed: false,
    skillSeconds: {
      technique: 600,
      theory: 0,
      repertoire: 120,
      improvisation: 0,
    },
    phases: [
      {
        id: "phase-1",
        name: "Técnica",
        skill: "technique",
        elapsedSeconds: 720,
      },
    ],
  };

  const record = createPracticeSessionRecord({
    id: "session-1",
    title: "Práctica de jueves",
    averageBpm: 96,
    result,
    phases,
    notes: "  Buen control del tempo.  ",
    phaseNotes: { 0: "  Mantenerlo lento.  " },
  });

  assert.deepEqual(record, {
    id: "session-1",
    title: "Práctica de jueves",
    startedAt: "2026-10-08T12:00:00.000Z",
    durationSeconds: 720,
    averageBpm: 96,
    completed: false,
    skillSeconds: result.skillSeconds,
    notes: "Buen control del tempo.",
    phases: [
      {
        ...result.phases[0],
        durationMinutes: 15,
        exercises: ["Arpegios", "Escalas"],
        resources: [
          {
            id: "resource-1",
            title: "Backing track",
            kind: "audio",
            assetId: "asset-1",
          },
        ],
        notes: "Mantenerlo lento.",
        repertoireItemId: "song-1",
        repertoirePartId: "part-1",
      },
    ],
  });
  assert.notEqual(record.phases?.[0].exercises, phases[0].exercises);
  assert.notEqual(record.phases?.[0].resources, phases[0].resources);
  assert.notEqual(record.phases?.[0].resources?.[0], phases[0].resources[0]);
});

test("omits blank session and phase notes", () => {
  const record = createPracticeSessionRecord({
    id: "session-2",
    title: "Sesión",
    averageBpm: 0,
    result: {
      elapsedSeconds: 60,
      startedAt: "2026-10-08T12:00:00.000Z",
      completed: true,
      skillSeconds: {
        technique: 60,
        theory: 0,
        repertoire: 0,
        improvisation: 0,
      },
      phases: [
        {
          id: 1,
          name: "Escalas",
          skill: "technique",
          elapsedSeconds: 60,
        },
      ],
    },
    phases: [{ id: 1, name: "Escalas", durationMinutes: 1, skill: "technique" }],
    notes: "  ",
    phaseNotes: { 0: " " },
  });

  assert.equal(record.notes, undefined);
  assert.equal(record.phases?.[0].notes, undefined);
});

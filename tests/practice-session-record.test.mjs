import assert from "node:assert/strict";
import test from "node:test";
import {
  createPracticeSessionRecord,
  normalizeSessionRecord,
} from "../src/utils/practice-session-record.ts";

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
      lickId: "lick-1",
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
      lick: 0,
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
        lickId: "lick-1",
      },
    ],
  });
  assert.notEqual(record.phases?.[0].exercises, phases[0].exercises);
  assert.notEqual(record.phases?.[0].resources, phases[0].resources);
  assert.notEqual(record.phases?.[0].resources?.[0], phases[0].resources[0]);
});

test("stores the specific guitar used", () => {
  const record = createPracticeSessionRecord({
    id: "session-guitar",
    title: "Con guitarra",
    averageBpm: 0,
    result: {
      elapsedSeconds: 600,
      startedAt: "2026-10-08T12:00:00.000Z",
      completed: true,
      skillSeconds: {
        technique: 600,
        theory: 0,
        repertoire: 0,
        lick: 0,
        improvisation: 0,
      },
      phases: [{ id: 1, name: "Escalas", skill: "technique", elapsedSeconds: 600 }],
    },
    phases: [{ id: 1, name: "Escalas", durationMinutes: 10, skill: "technique" }],
    guitarType: "electric",
    guitarId: "guitar-1",
    notes: "",
    phaseNotes: {},
  });

  assert.equal(record.guitarId, "guitar-1");
  assert.equal(normalizeSessionRecord(record).guitarId, "guitar-1");
  assert.equal(
    normalizeSessionRecord({
      ...record,
      guitarId: "   ",
    }).guitarId,
    undefined,
  );
});

test("overrides the timer completion for a free practice", () => {
  const record = createPracticeSessionRecord({
    id: "free-session",
    title: "Práctica libre",
    averageBpm: 0,
    result: {
      elapsedSeconds: 600,
      startedAt: "2026-10-08T12:00:00.000Z",
      completed: false,
      skillSeconds: {
        technique: 0,
        theory: 0,
        repertoire: 600,
        lick: 0,
        improvisation: 0,
      },
      phases: [
        { id: 1, name: "Canción", skill: "repertoire", elapsedSeconds: 600 },
      ],
    },
    phases: [
      { id: 1, name: "Canción", durationMinutes: 1, skill: "repertoire" },
    ],
    completed: true,
    notes: "",
    phaseNotes: {},
  });

  assert.equal(record.completed, true);
});

test("stores the guitar type and the average BPM of each block", () => {
  const record = createPracticeSessionRecord({
    id: "session-bpm",
    title: "Bloques con metrónomo",
    averageBpm: 90,
    result: {
      elapsedSeconds: 120,
      startedAt: "2026-10-08T12:00:00.000Z",
      completed: true,
      skillSeconds: {
        technique: 60,
        theory: 0,
        repertoire: 60,
        lick: 0,
        improvisation: 0,
      },
      phases: [
        { id: 1, name: "Escalas", skill: "technique", elapsedSeconds: 60 },
        { id: 2, name: "Canción", skill: "repertoire", elapsedSeconds: 60 },
      ],
    },
    phases: [
      { id: 1, name: "Escalas", durationMinutes: 1, skill: "technique" },
      { id: 2, name: "Canción", durationMinutes: 1, skill: "repertoire" },
    ],
    notes: "",
    phaseNotes: {},
    guitarType: "electric",
    bpmSamples: [
      { elapsedSeconds: 0, bpm: 80 },
      { elapsedSeconds: 60, bpm: 100 },
    ],
    metronomeBlockIndexes: [0, 1],
  });

  assert.equal(record.guitarType, "electric");
  assert.deepEqual(
    record.phases.map((phase) => phase.averageBpm),
    [80, 100],
  );
});

test("omits the guitar type and block BPM when they were not recorded", () => {
  const record = createPracticeSessionRecord({
    id: "session-no-bpm",
    title: "Sin metrónomo",
    averageBpm: 0,
    result: {
      elapsedSeconds: 60,
      startedAt: "2026-10-08T12:00:00.000Z",
      completed: true,
      skillSeconds: {
        technique: 60,
        theory: 0,
        repertoire: 0,
        lick: 0,
        improvisation: 0,
      },
      phases: [
        { id: 1, name: "Escalas", skill: "technique", elapsedSeconds: 60 },
      ],
    },
    phases: [{ id: 1, name: "Escalas", durationMinutes: 1, skill: "technique" }],
    notes: "",
    phaseNotes: {},
    bpmSamples: [{ elapsedSeconds: 0, bpm: 90 }],
    metronomeBlockIndexes: [],
  });

  assert.equal("guitarType" in record, false);
  assert.equal("averageBpm" in record.phases[0], false);
});

test("normalizes stored guitar and block BPM values without losing the session", () => {
  const base = {
    id: "session-normalize",
    startedAt: "2026-10-08T12:00:00.000Z",
    durationSeconds: 120,
    averageBpm: 0,
    skillSeconds: {
      technique: 60,
      theory: 0,
      repertoire: 60,
      lick: 0,
      improvisation: 0,
    },
  };

  const valid = normalizeSessionRecord({
    ...base,
    guitarType: "acoustic",
    phases: [
      {
        id: 1,
        name: "Canción",
        skill: "repertoire",
        elapsedSeconds: 60,
        averageBpm: 96.4,
      },
    ],
  });
  assert.equal(valid.guitarType, "acoustic");
  assert.equal(valid.phases[0].averageBpm, 96);

  const invalid = normalizeSessionRecord({
    ...base,
    guitarType: "classical",
    phases: [
      {
        id: 1,
        name: "Canción",
        skill: "repertoire",
        elapsedSeconds: 60,
        averageBpm: -5,
      },
      {
        id: 2,
        name: "Técnica",
        skill: "technique",
        elapsedSeconds: 60,
        averageBpm: "120",
      },
    ],
  });
  assert.equal("guitarType" in invalid, false);
  assert.equal("averageBpm" in invalid.phases[0], false);
  assert.equal("averageBpm" in invalid.phases[1], false);
  assert.equal(invalid.phases.length, 2);
});

test("uses the resolved block name from the phase metadata", () => {
  const record = createPracticeSessionRecord({
    id: "session-resolved-name",
    title: "Sesión",
    averageBpm: 0,
    result: {
      elapsedSeconds: 60,
      startedAt: "2026-10-08T12:00:00.000Z",
      completed: true,
      skillSeconds: {
        technique: 0,
        theory: 0,
        repertoire: 60,
        lick: 0,
        improvisation: 0,
      },
      phases: [
        {
          id: "r1",
          name: "Nombre viejo",
          skill: "repertoire",
          elapsedSeconds: 60,
          lickId: undefined,
        },
      ],
    },
    phases: [
      {
        id: "r1",
        name: "Canción",
        durationMinutes: 1,
        skill: "repertoire",
        repertoireItemId: "song-1",
      },
    ],
    notes: "",
    phaseNotes: {},
  });

  assert.equal(record.phases?.[0].name, "Canción");
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
        lick: 0,
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

test("stores mood and focus only when they were answered", () => {
  const result = {
    elapsedSeconds: 60,
    startedAt: "2026-10-08T12:00:00.000Z",
    completed: true,
    skillSeconds: {
      technique: 60,
      theory: 0,
      repertoire: 0,
      lick: 0,
      improvisation: 0,
    },
    phases: [
      { id: 1, name: "Escalas", skill: "technique", elapsedSeconds: 60 },
    ],
  };
  const phases = [
    { id: 1, name: "Escalas", durationMinutes: 1, skill: "technique" },
  ];

  const withMetrics = createPracticeSessionRecord({
    id: "session-metrics",
    title: "Con métricas",
    averageBpm: 0,
    result,
    phases,
    notes: "",
    phaseNotes: {},
    mood: 4,
    focus: 2,
  });
  const withoutMetrics = createPracticeSessionRecord({
    id: "session-no-metrics",
    title: "Sin métricas",
    averageBpm: 0,
    result,
    phases,
    notes: "",
    phaseNotes: {},
  });

  assert.equal(withMetrics.mood, 4);
  assert.equal(withMetrics.focus, 2);
  assert.equal("mood" in withoutMetrics, false);
  assert.equal("focus" in withoutMetrics, false);
});

test("drops stored metric values outside the five-point scale", () => {
  const base = {
    id: "session-metrics-normalize",
    startedAt: "2026-10-08T12:00:00.000Z",
    durationSeconds: 120,
    averageBpm: 0,
    skillSeconds: {
      technique: 60,
      theory: 0,
      repertoire: 60,
      lick: 0,
      improvisation: 0,
    },
  };

  const normalized = normalizeSessionRecord({
    ...base,
    mood: 9,
    focus: 3,
  });
  const missing = normalizeSessionRecord({ ...base });

  assert.equal("mood" in normalized, false);
  assert.equal(normalized.focus, 3);
  assert.equal("mood" in missing, false);
  assert.equal("focus" in missing, false);
});

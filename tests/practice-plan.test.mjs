import assert from "node:assert/strict";
import test from "node:test";
import {
  clonePracticePhases,
  createPracticePhase,
  getPracticePlanDuration,
  getPracticePlanKey,
  getRoutineSaveTarget,
  normalizePracticePhaseLinks,
  normalizeRepertoirePhaseNames,
} from "../src/utils/practice-plan.ts";

test("creates a new practice phase with the established defaults", () => {
  assert.deepEqual(createPracticePhase("phase-1"), {
    id: "phase-1",
    name: "",
    durationMinutes: 5,
    skill: "technique",
    exercises: [],
    resources: [],
  });
});

test("clones phases and their mutable collections without changing the source", () => {
  const phases = [
    {
      id: "phase-1",
      name: "Lick",
      durationMinutes: 15,
      skill: "lick",
      exercises: ["Arpegios"],
      lickId: "lick-1",
      resources: [
        {
          id: "asset-1",
          title: "Backing track",
          kind: "audio",
          assetId: "asset-1",
        },
      ],
    },
  ];

  const clone = clonePracticePhases(phases);

  assert.deepEqual(clone, [
    {
      ...phases[0],
      repertoireItemId: undefined,
      repertoirePartId: undefined,
      catalogSong: undefined,
    },
  ]);
  assert.notEqual(clone, phases);
  assert.equal(clone[0].lickId, "lick-1");
  assert.notEqual(clone[0].exercises, phases[0].exercises);
  assert.notEqual(clone[0].resources, phases[0].resources);
  assert.notEqual(clone[0].resources[0], phases[0].resources[0]);
});

test("cloned phases always have independent exercise and resource arrays", () => {
  const [clone] = clonePracticePhases([
    { id: 1, name: "Técnica", durationMinutes: 10, skill: "technique" },
  ]);

  assert.deepEqual(clone.exercises, []);
  assert.deepEqual(clone.resources, []);
});

test("calculates the total duration of a plan", () => {
  assert.equal(
    getPracticePlanDuration([
      { durationMinutes: 10 },
      { durationMinutes: 25 },
      { durationMinutes: 0 },
    ]),
    35,
  );
});

test("a repertoire block name follows its song without touching other blocks", () => {
  const repertoireItems = [
    { id: "song-1", kind: "song", title: "Canción", parts: [] },
  ];
  const phases = [
    {
      id: "a",
      name: "Nombre viejo",
      durationMinutes: 10,
      skill: "repertoire",
      repertoireItemId: "song-1",
    },
    {
      id: "b",
      name: "Técnica",
      durationMinutes: 5,
      skill: "technique",
    },
  ];

  const normalized = normalizeRepertoirePhaseNames(phases, repertoireItems);

  assert.equal(normalized[0].name, "Canción");
  assert.equal(normalized[1], phases[1]);
  assert.equal(
    normalizeRepertoirePhaseNames(phases, []),
    phases,
  );
  assert.equal(
    normalizeRepertoirePhaseNames(normalized, repertoireItems),
    normalized,
  );
});

test("normalizes links that do not belong to the block category", () => {  const base = {
    id: "phase-1",
    name: "Bloque",
    durationMinutes: 10,
    repertoireItemId: "song-1",
    repertoirePartId: "part-1",
    lickId: "lick-1",
  };

  assert.deepEqual(normalizePracticePhaseLinks({ ...base, skill: "technique" }), {
    ...base,
    skill: "technique",
    repertoireItemId: undefined,
    repertoirePartId: undefined,
    catalogSong: undefined,
    lickId: undefined,
  });
  assert.deepEqual(normalizePracticePhaseLinks({ ...base, skill: "repertoire" }), {
    ...base,
    skill: "repertoire",
    catalogSong: undefined,
    lickId: undefined,
  });
  assert.deepEqual(normalizePracticePhaseLinks({ ...base, skill: "lick" }), {
    ...base,
    skill: "lick",
    repertoireItemId: undefined,
    repertoirePartId: undefined,
    catalogSong: undefined,
  });
});

test("keeps a catalog song only while the block is repertoire", () => {
  const catalogSong = {
    source: "itunes",
    id: "catalog-1",
    title: "Canción",
    artist: "Artista",
  };
  const phase = {
    id: "phase-1",
    name: "Canción",
    durationMinutes: 10,
    skill: "repertoire",
    catalogSong,
  };

  assert.deepEqual(normalizePracticePhaseLinks(phase), { ...phase, lickId: undefined });
  assert.equal(
    normalizePracticePhaseLinks({ ...phase, skill: "technique" }).catalogSong,
    undefined,
  );
  assert.equal(
    normalizePracticePhaseLinks({
      ...phase,
      repertoireItemId: "song-1",
    }).catalogSong,
    undefined,
  );
});

test("the plan key changes with structure but not with block content", () => {
  const phases = [
    { id: "a", name: "Técnica", durationMinutes: 10, skill: "technique" },
    { id: "b", name: "Canción", durationMinutes: 20, skill: "repertoire" },
  ];
  const key = getPracticePlanKey(phases);

  assert.equal(
    getPracticePlanKey([
      { ...phases[0], name: "Otro nombre" },
      { ...phases[1], repertoireItemId: "song-1" },
    ]),
    key,
  );
  assert.notEqual(
    getPracticePlanKey([{ ...phases[0], durationMinutes: 11 }, phases[1]]),
    key,
  );
  assert.notEqual(getPracticePlanKey([phases[0]]), key);
});

test("a new routine creates its own identity even after loading a template", () => {
  assert.deepEqual(getRoutineSaveTarget(null, "new-id"), {
    id: "new-id",
    isUpdate: false,
  });
  assert.deepEqual(getRoutineSaveTarget(undefined, "new-id"), {
    id: "new-id",
    isUpdate: false,
  });
});

test("an existing routine keeps its identity when saved", () => {
  assert.deepEqual(getRoutineSaveTarget("routine-1", "new-id"), {
    id: "routine-1",
    isUpdate: true,
  });
});

test("clones keep block notes", () => {
  const [clone] = clonePracticePhases([
    {
      id: "phase-1",
      name: "Técnica",
      durationMinutes: 10,
      skill: "technique",
      notes: "Mantener la muñeca relajada.",
    },
  ]);

  assert.equal(clone.notes, "Mantener la muñeca relajada.");
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  clonePracticePhases,
  createPracticePhase,
  getPracticePlanDuration,
} from "../src/lib/practice-plan.ts";

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
      name: "Técnica",
      durationMinutes: 15,
      skill: "technique",
      exercises: ["Arpegios"],
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

  assert.deepEqual(clone, phases);
  assert.notEqual(clone, phases);
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

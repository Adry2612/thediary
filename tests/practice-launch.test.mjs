import assert from "node:assert/strict";
import test from "node:test";
import { createPracticePlanFromSession } from "../src/lib/practice-launch.ts";

test("reconstructs a repeatable plan from a saved session without sharing mutable data", () => {
  const session = {
    title: undefined,
    phases: [
      {
        id: "phase-1",
        name: "Arpegios",
        skill: "technique",
        elapsedSeconds: 65,
        exercises: ["Arpegios ascendentes"],
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
      {
        id: "phase-2",
        name: "Improvisación",
        skill: "improvisation",
        elapsedSeconds: 0,
        durationMinutes: 8,
      },
    ],
  };

  const plan = createPracticePlanFromSession(session);

  assert.deepEqual(plan, {
    name: "Mi sesión",
    phases: [
      {
        id: "phase-1",
        name: "Arpegios",
        durationMinutes: 2,
        skill: "technique",
        exercises: ["Arpegios ascendentes"],
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
      {
        id: "phase-2",
        name: "Improvisación",
        durationMinutes: 8,
        skill: "improvisation",
        exercises: undefined,
        resources: undefined,
        repertoireItemId: undefined,
        repertoirePartId: undefined,
      },
    ],
  });
  assert.notEqual(plan.phases[0].exercises, session.phases[0].exercises);
  assert.notEqual(plan.phases[0].resources, session.phases[0].resources);
  assert.notEqual(
    plan.phases[0].resources[0],
    session.phases[0].resources[0],
  );
});

test("rejects sessions without recorded phases", () => {
  assert.equal(createPracticePlanFromSession({}), null);
  assert.equal(createPracticePlanFromSession({ phases: [] }), null);
});

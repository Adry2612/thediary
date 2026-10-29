import assert from "node:assert/strict";
import test from "node:test";
import { createPracticePlanFromSession, createQuickPracticePlan, createQuickRepertoirePlan, createTemplatePlan } from "../src/utils/practice-launch.ts";

test("reconstructs a repeatable plan from a saved session without sharing mutable data", () => {
  const session = {
    title: undefined,
    phases: [
      {
        id: "phase-1",
        name: "Arpegios",
        skill: "repertoire",
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
        skill: "repertoire",
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
        lickId: undefined,
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
        lickId: undefined,
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

test("builds the quick practice plan as one timed technique block", () => {
  assert.deepEqual(
    createQuickPracticePlan("Práctica rápida", "Bloque rápido", "phase-1"),
    {
      name: "Práctica rápida",
      phases: [
        {
          id: "phase-1",
          name: "Bloque rápido",
          durationMinutes: 120,
          skill: "technique",
        },
      ],
      isCountUp: true,
    },
  );
});

test("builds a quick repertoire plan linked to the item and its material", () => {
  const guitarPro = {
    id: "resource-1",
    title: "Canción.gp",
    kind: "guitarpro",
    assetId: "asset-1",
  };
  const plan = createQuickRepertoirePlan({
    id: "song-1",
    title: "Canción",
    parts: [],
    updatedAt: "2026-10-01T12:00:00.000Z",
    guitarPro,
    resources: [guitarPro],
  });

  assert.deepEqual(plan, {
    name: "Canción",
    phases: [
      {
        id: "quick-song-1",
        name: "Canción",
        durationMinutes: 1,
        skill: "repertoire",
        repertoireItemId: "song-1",
        resources: [guitarPro],
      },
    ],
    attachedResources: [guitarPro],
    isCountUp: true,
  });
});

test("keeps the song's guitar type in a quick repertoire plan", () => {
  const plan = createQuickRepertoirePlan({
    id: "song-1",
    title: "Canción",
    parts: [],
    updatedAt: "2026-10-01T12:00:00.000Z",
    guitarType: "acoustic",
  });

  assert.equal(plan.guitarType, "acoustic");
});

test("applies the confirmed guitar type, specific guitar and target to a quick repertoire plan", () => {
  const plan = createQuickRepertoirePlan(
    {
      id: "song-1",
      title: "Canción",
      parts: [],
      updatedAt: "2026-10-01T12:00:00.000Z",
      guitarType: "acoustic",
    },
    { guitarType: "electric", guitarId: "guitar-1", targetMinutes: 30 },
  );

  assert.equal(plan.guitarType, "electric");
  assert.equal(plan.guitarId, "guitar-1");
  assert.equal(plan.targetMinutes, 30);
});

test("discards an invalid quick repertoire target", () => {
  const plan = createQuickRepertoirePlan(
    {
      id: "song-1",
      title: "Canción",
      parts: [],
      updatedAt: "2026-10-01T12:00:00.000Z",
    },
    { targetMinutes: 0 },
  );

  assert.equal("targetMinutes" in plan, false);
});

test("does not invent a guitar type for a quick repertoire plan without one", () => {
  const plan = createQuickRepertoirePlan({
    id: "song-1",
    title: "Canción",
    parts: [],
    updatedAt: "2026-10-01T12:00:00.000Z",
  });

  assert.equal("guitarType" in plan, false);
});

test("reconstructs a lick block with its link", () => {
  const plan = createPracticePlanFromSession({
    title: "Sesión",
    phases: [
      {
        id: "lick-phase",
        name: "Frase",
        skill: "lick",
        elapsedSeconds: 60,
        durationMinutes: 1,
        lickId: "lick-1",
      },
    ],
  });

  assert.equal(plan?.phases[0].lickId, "lick-1");
});

test("copies a template plan without sharing the stored phases", () => {
  const phases = [
    {
      id: "phase-1",
      name: "Calentamiento",
      durationMinutes: 5,
      skill: "technique",
    },
  ];
  const plan = createTemplatePlan({ id: "template-1", name: "Rutina", phases });

  assert.deepEqual(plan, {
    name: "Rutina",
    phases: [
      {
        ...phases[0],
        repertoireItemId: undefined,
        repertoirePartId: undefined,
        lickId: undefined,
      },
    ],
    templateId: "template-1",
  });
  assert.notEqual(plan.phases, phases);
});

test("keeps a template's guitar type in its launch plan", () => {
  const plan = createTemplatePlan({
    id: "template-1",
    name: "Rutina",
    phases: [],
    guitarType: "acoustic",
  });

  assert.equal(plan.guitarType, "acoustic");
  assert.equal(plan.templateId, "template-1");
});

test("keeps a repeated session's specific guitar", () => {
  const plan = createPracticePlanFromSession({
    title: "Sesión",
    guitarType: "acoustic",
    guitarId: "guitar-2",
    phases: [
      { id: "p", name: "Canción", skill: "repertoire", elapsedSeconds: 60 },
    ],
  });

  assert.equal(plan?.guitarId, "guitar-2");
  assert.equal(plan?.guitarType, "acoustic");
});

test("keeps a repeated session's guitar type", () => {
  const plan = createPracticePlanFromSession({
    title: "Sesión",
    guitarType: "electric",
    phases: [
      {
        id: "phase-1",
        name: "Escalas",
        skill: "technique",
        elapsedSeconds: 600,
        durationMinutes: 10,
      },
    ],
  });

  assert.equal(plan?.guitarType, "electric");
});

test("does not add a guitar type when the source has none", () => {
  const plan = createTemplatePlan({
    id: "template-1",
    name: "Rutina",
    phases: [],
  });

  assert.equal("guitarType" in plan, false);
});

import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_REMINDER_PREFERENCES } from "../src/services/reminder-preferences.ts";
import { buildReminderPlan } from "../src/utils/reminder-plan.ts";
import { localDateTimeToUtc } from "../src/utils/reminder-time.ts";

const TIME_ZONE = "Europe/Madrid";

const TEXTS = {
  title: "thediary.",
  practice: "Hoy toca {routine}",
  strings: "Cambia las cuerdas de {guitar}",
  inactivity: "Llevas {days} días sin practicar",
};

const PREFERENCES = { ...DEFAULT_REMINDER_PREFERENCES, enabled: true };

const EMPTY_SCHEDULE = {
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
};

function sessionOn(dateKey, extra = {}) {
  return {
    id: `session-${dateKey}`,
    startedAt: localDateTimeToUtc(dateKey, "12:00", TIME_ZONE).toISOString(),
    durationSeconds: 600,
    averageBpm: 80,
    skillSeconds: {},
    ...extra,
  };
}

function baseData(overrides = {}) {
  return {
    history: [],
    templates: [],
    weeklySchedule: EMPTY_SCHEDULE,
    guitars: [],
    guitarEntries: [],
    ...overrides,
  };
}

function plan(data, { now, preferences = PREFERENCES, horizonDays = 14 } = {}) {
  return buildReminderPlan({
    preferences,
    data,
    texts: TEXTS,
    timeZone: TIME_ZONE,
    now,
    horizonDays,
  });
}

test("a disabled switch produces no plan", () => {
  assert.deepEqual(
    plan(baseData(), {
      now: new Date("2026-11-04T17:00:00.000Z"),
      preferences: { ...PREFERENCES, enabled: false },
    }),
    [],
  );
});

test("includes today before the chosen time and starts tomorrow after it", () => {
  const data = baseData({
    templates: [
      { id: "routine-1", name: "Escalas", phases: [], updatedAt: "2026-01-01" },
    ],
    weeklySchedule: { ...EMPTY_SCHEDULE, 3: "routine-1" },
  });

  const before = plan(data, { now: new Date("2026-11-04T17:00:00.000Z") });
  assert.equal(before[0].localDate, "2026-11-04");
  assert.equal(before[0].scheduledAt, "2026-11-04T18:00:00.000Z");

  const after = plan(data, { now: new Date("2026-11-04T18:00:00.000Z") });
  assert.equal(after[0].localDate, "2026-11-11");
});

test("combines every applicable reason into one entry per local day", () => {
  const data = baseData({
    history: [sessionOn("2026-10-28")],
    templates: [
      { id: "routine-1", name: "Escalas", phases: [], updatedAt: "2026-01-01" },
    ],
    weeklySchedule: { ...EMPTY_SCHEDULE, 3: "routine-1" },
    guitars: [
      {
        id: "g1",
        name: "Strat",
        intervalDays: 7,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    guitarEntries: [
      {
        id: "e1",
        guitarId: "g1",
        date: "2026-10-21",
        kind: "strings",
        createdAt: "2026-10-21T10:00:00.000Z",
        updatedAt: "2026-10-21T10:00:00.000Z",
      },
    ],
  });

  const entries = plan(data, {
    now: new Date("2026-11-04T17:00:00.000Z"),
  });
  const today = entries.find((entry) => entry.localDate === "2026-11-04");
  assert.ok(today);
  assert.deepEqual(
    today.reasons.map((reason) => reason.kind).sort(),
    ["inactivity", "practice", "strings"],
  );
  assert.equal(today.title, "thediary.");
  assert.deepEqual(
    entries.map((entry) => entry.localDate),
    ["2026-11-04", "2026-11-11"],
  );
});

test("no applicable reason means no entry that day", () => {
  const entries = plan(baseData(), {
    now: new Date("2026-11-04T17:00:00.000Z"),
  });
  assert.deepEqual(entries, []);
});

test("repeats strings and inactivity at most once a week", () => {
  const data = baseData({
    history: [sessionOn("2026-10-27")],
    guitars: [
      {
        id: "g1",
        name: "Strat",
        intervalDays: 7,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    guitarEntries: [
      {
        id: "e1",
        guitarId: "g1",
        date: "2026-10-13",
        kind: "strings",
        createdAt: "2026-10-13T10:00:00.000Z",
        updatedAt: "2026-10-13T10:00:00.000Z",
      },
    ],
  });

  const entries = plan(data, {
    now: new Date("2026-11-04T17:00:00.000Z"),
    horizonDays: 15,
  });
  assert.deepEqual(
    entries.map((entry) => entry.localDate),
    ["2026-11-10", "2026-11-17"],
  );
});

test("stops at the requested horizon", () => {
  const data = baseData({
    templates: [
      { id: "routine-1", name: "Escalas", phases: [], updatedAt: "2026-01-01" },
    ],
    weeklySchedule: { ...EMPTY_SCHEDULE, 3: "routine-1" },
  });

  const entries = plan(data, {
    now: new Date("2026-11-04T17:00:00.000Z"),
    horizonDays: 10,
  });
  assert.deepEqual(
    entries.map((entry) => entry.localDate),
    ["2026-11-04", "2026-11-11"],
  );
});

test("practising removes the practice reason from the plan", () => {
  const data = baseData({
    history: [sessionOn("2026-11-04")],
    templates: [
      { id: "routine-1", name: "Escalas", phases: [], updatedAt: "2026-01-01" },
    ],
    weeklySchedule: { ...EMPTY_SCHEDULE, 3: "routine-1" },
  });

  const entries = plan(data, {
    now: new Date("2026-11-04T17:00:00.000Z"),
  });
  assert.equal(
    entries.some((entry) => entry.localDate === "2026-11-04"),
    false,
  );
});

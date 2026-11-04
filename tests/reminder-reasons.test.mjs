import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_REMINDER_PREFERENCES } from "../src/services/reminder-preferences.ts";
import {
  buildReminderContext,
  evaluateReminderReasons,
} from "../src/utils/reminder-reasons.ts";
import { localDateTimeToUtc } from "../src/utils/reminder-time.ts";

const TIME_ZONE = "Europe/Madrid";
const NOW = new Date("2026-11-04T18:00:00.000Z"); // 19:00 en Madrid, miércoles
const TODAY = "2026-11-04";

const TEXTS = {
  title: "thediary.",
  practice: "Hoy toca {routine}",
  strings: "Cambia las cuerdas de {guitar}",
  inactivity: "Llevas {days} días sin practicar",
};

const PREFERENCES = { ...DEFAULT_REMINDER_PREFERENCES, enabled: true };

function session(startedAt, extra = {}) {
  return {
    id: `session-${startedAt}`,
    startedAt,
    durationSeconds: 600,
    averageBpm: 80,
    skillSeconds: {},
    ...extra,
  };
}

function sessionOn(dateKey, extra = {}) {
  return session(
    localDateTimeToUtc(dateKey, "12:00", TIME_ZONE).toISOString(),
    extra,
  );
}

function guitar(id, name, extra = {}) {
  return {
    id,
    name,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...extra,
  };
}

function stringChange(id, guitarId, date) {
  return {
    id,
    guitarId,
    date,
    kind: "strings",
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
  };
}

function evaluate(data, preferences = PREFERENCES, dateKey = TODAY) {
  const context = buildReminderContext(data, {
    now: NOW,
    timeZone: TIME_ZONE,
  });
  return evaluateReminderReasons(dateKey, context, preferences, TEXTS);
}

test("names the routine assigned to the local weekday", () => {
  const reasons = evaluate({
    history: [],
    templates: [
      { id: "routine-1", name: "Escalas", phases: [], updatedAt: "2026-01-01" },
    ],
    weeklySchedule: {
      0: null,
      1: null,
      2: null,
      3: "routine-1",
      4: null,
      5: null,
      6: null,
    },
    guitars: [],
    guitarEntries: [],
  });

  assert.deepEqual(reasons, [
    {
      kind: "practice",
      text: "Hoy toca Escalas",
      url: "/",
      routineId: "routine-1",
    },
  ]);
});

test("does not mention practice without a routine or with a session that day", () => {
  const base = {
    templates: [
      { id: "routine-1", name: "Escalas", phases: [], updatedAt: "2026-01-01" },
    ],
    weeklySchedule: {
      0: null,
      1: null,
      2: null,
      3: "routine-1",
      4: null,
      5: null,
      6: null,
    },
    guitars: [],
    guitarEntries: [],
  };

  assert.deepEqual(
    evaluate({
      ...base,
      history: [sessionOn(TODAY)],
      weeklySchedule: {
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
      },
    }),
    [],
  );
  assert.deepEqual(evaluate({ ...base, history: [sessionOn(TODAY)] }), []);
});

test("a manual practice counts as practise that day", () => {
  const reasons = evaluate({
    history: [sessionOn(TODAY, { title: "Práctica manual" })],
    templates: [
      { id: "routine-1", name: "Escalas", phases: [], updatedAt: "2026-01-01" },
    ],
    weeklySchedule: {
      0: null,
      1: null,
      2: null,
      3: "routine-1",
      4: null,
      5: null,
      6: null,
    },
    guitars: [],
    guitarEntries: [],
  });

  assert.equal(reasons.some((reason) => reason.kind === "practice"), false);
});

test("names the most urgent due guitar and ignores the ones only due soon", () => {
  const data = {
    history: [],
    templates: [],
    weeklySchedule: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
    },
    guitars: [
      guitar("g1", "Strat", { intervalDays: 7 }),
      guitar("g2", "Les Paul", { intervalDays: 7 }),
      guitar("g3", "Acústica", { intervalDays: 30 }),
    ],
    guitarEntries: [
      stringChange("e1", "g1", "2026-10-13"),
      stringChange("e2", "g2", "2026-10-20"),
      stringChange("e3", "g3", "2026-10-25"),
    ],
  };

  assert.deepEqual(evaluate(data), [
    {
      kind: "strings",
      text: "Cambia las cuerdas de Strat",
      url: "/tools#tools-strings",
      guitarId: "g1",
      lastChangeDate: "2026-10-13",
    },
  ]);
});

test("a guitar with an hours interval is due only when the usage reaches it", () => {
  const data = {
    history: [sessionOn(TODAY, { guitarId: "g1", durationSeconds: 2 * 3600 })],
    templates: [],
    weeklySchedule: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
    },
    guitars: [guitar("g1", "Strat", { intervalHours: 1 })],
    guitarEntries: [stringChange("e1", "g1", "2026-10-25")],
  };

  const reasons = evaluate(data);
  assert.equal(reasons.length, 1);
  assert.equal(reasons[0].kind, "strings");
});

test("no interval or no recorded change produces no string reminder", () => {
  const schedule = {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  };
  const withoutInterval = {
    history: [],
    templates: [],
    weeklySchedule: schedule,
    guitars: [guitar("g1", "Strat")],
    guitarEntries: [stringChange("e1", "g1", "2026-10-13")],
  };
  const withoutHistory = {
    history: [],
    templates: [],
    weeklySchedule: schedule,
    guitars: [guitar("g1", "Strat", { intervalDays: 7 })],
    guitarEntries: [],
  };

  assert.deepEqual(evaluate(withoutInterval), []);
  assert.deepEqual(evaluate(withoutHistory), []);
});

test("the inactivity reminder waits for the configured days", () => {
  const data = {
    history: [sessionOn("2026-10-27")],
    templates: [],
    weeklySchedule: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
    },
    guitars: [],
    guitarEntries: [],
  };

  assert.deepEqual(evaluate(data), [
    {
      kind: "inactivity",
      text: "Llevas 8 días sin practicar",
      url: "/",
      lastPracticeDate: "2026-10-27",
    },
  ]);
  assert.deepEqual(
    evaluate(data, { ...PREFERENCES, inactivityDays: 14 }),
    [],
  );
});

test("never practised means no inactivity reminder", () => {
  assert.deepEqual(
    evaluate({
      history: [],
      templates: [],
      weeklySchedule: {
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
      },
      guitars: [],
      guitarEntries: [],
    }),
    [],
  );
});

test("each reminder switch removes only its own reason", () => {
  const data = {
    history: [sessionOn("2026-10-27")],
    templates: [
      { id: "routine-1", name: "Escalas", phases: [], updatedAt: "2026-01-01" },
    ],
    weeklySchedule: {
      0: null,
      1: null,
      2: null,
      3: "routine-1",
      4: null,
      5: null,
      6: null,
    },
    guitars: [guitar("g1", "Strat", { intervalDays: 7 })],
    guitarEntries: [stringChange("e1", "g1", "2026-10-13")],
  };

  assert.deepEqual(
    evaluate(data, { ...PREFERENCES, practice: false, strings: false }).map(
      (reason) => reason.kind,
    ),
    ["inactivity"],
  );
});

test("a disabled master switch produces no reasons", () => {
  const data = {
    history: [sessionOn("2026-10-27")],
    templates: [],
    weeklySchedule: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
    },
    guitars: [],
    guitarEntries: [],
  };

  assert.deepEqual(evaluate(data, { ...PREFERENCES, enabled: false }), []);
});

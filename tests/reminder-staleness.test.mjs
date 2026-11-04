import assert from "node:assert/strict";
import test from "node:test";
import {
  filterStaleEntry,
  filterStaleReasons,
} from "../src/utils/reminder-staleness.ts";
import { localDateTimeToUtc } from "../src/utils/reminder-time.ts";

const TIME_ZONE = "Europe/Madrid";

function sessionOn(dateKey) {
  return {
    id: `session-${dateKey}`,
    startedAt: localDateTimeToUtc(dateKey, "12:00", TIME_ZONE).toISOString(),
    durationSeconds: 600,
    averageBpm: 80,
    skillSeconds: {},
  };
}

function stringChange(date, extra = {}) {
  return {
    id: `change-${date}`,
    guitarId: "g1",
    date,
    kind: "strings",
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
    ...extra,
  };
}

function baseData(overrides = {}) {
  return {
    history: [],
    templates: [],
    weeklySchedule: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
    guitars: [],
    guitarEntries: [],
    ...overrides,
  };
}

test("drops the practice reason when a session exists that local day", () => {
  const entry = {
    localDate: "2026-11-04",
    reasons: [
      {
        kind: "practice",
        text: "Hoy toca Escalas",
        url: "/",
        routineId: "routine-1",
      },
    ],
  };

  assert.deepEqual(
    filterStaleReasons(entry, {
      data: baseData({ history: [sessionOn("2026-11-04")] }),
      timeZone: TIME_ZONE,
    }),
    [],
  );
  assert.equal(
    filterStaleEntry(entry, {
      data: baseData({ history: [sessionOn("2026-11-04")] }),
      timeZone: TIME_ZONE,
    }),
    null,
  );
});

test("does not drop the practice reason for a session on another day", () => {
  const entry = {
    localDate: "2026-11-04",
    reasons: [
      {
        kind: "practice",
        text: "Hoy toca Escalas",
        url: "/",
        routineId: "routine-1",
      },
    ],
  };

  assert.equal(
    filterStaleReasons(entry, {
      data: baseData({ history: [sessionOn("2026-11-03")] }),
      timeZone: TIME_ZONE,
    }).length,
    1,
  );
});

test("drops inactivity when a newer session exists", () => {
  const entry = {
    localDate: "2026-11-10",
    reasons: [
      {
        kind: "inactivity",
        text: "Llevas 8 días sin practicar",
        url: "/",
        lastPracticeDate: "2026-10-27",
      },
    ],
  };

  assert.deepEqual(
    filterStaleReasons(entry, {
      data: baseData({ history: [sessionOn("2026-11-02")] }),
      timeZone: TIME_ZONE,
    }),
    [],
  );
  assert.equal(
    filterStaleReasons(entry, {
      data: baseData({ history: [sessionOn("2026-10-20")] }),
      timeZone: TIME_ZONE,
    }).length,
    1,
  );
});

test("drops a string reason when the guitar has a newer change", () => {
  const entry = {
    localDate: "2026-11-10",
    reasons: [
      {
        kind: "strings",
        text: "Cambia las cuerdas de Strat",
        url: "/tools#tools-strings",
        guitarId: "g1",
        lastChangeDate: "2026-10-13",
      },
    ],
  };

  assert.deepEqual(
    filterStaleReasons(entry, {
      data: baseData({ guitarEntries: [stringChange("2026-11-05")] }),
      timeZone: TIME_ZONE,
    }),
    [],
  );
  assert.equal(
    filterStaleReasons(entry, {
      data: baseData({ guitarEntries: [stringChange("2026-10-13")] }),
      timeZone: TIME_ZONE,
    }).length,
    1,
  );
});

test("keeps the reasons that still hold and discards the whole entry when none does", () => {
  const entry = {
    localDate: "2026-11-10",
    reasons: [
      {
        kind: "practice",
        text: "Hoy toca Escalas",
        url: "/",
        routineId: "routine-1",
      },
      {
        kind: "inactivity",
        text: "Llevas 14 días sin practicar",
        url: "/",
        lastPracticeDate: "2026-10-27",
      },
    ],
  };

  const survivors = filterStaleReasons(entry, {
    data: baseData({ history: [sessionOn("2026-11-05")] }),
    timeZone: TIME_ZONE,
  });
  assert.deepEqual(
    survivors.map((reason) => reason.kind),
    ["practice"],
  );

  assert.deepEqual(
    filterStaleEntry(
      { ...entry, reasons: survivors },
      {
        data: baseData({ history: [sessionOn("2026-11-10")] }),
        timeZone: TIME_ZONE,
      },
    ),
    null,
  );
});

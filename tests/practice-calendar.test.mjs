import assert from "node:assert/strict";
import test from "node:test";
import {
  getPracticeWeekDays,
  getSessionsForWeek,
  getYearlyHeatmapData,
} from "../src/lib/practice-calendar.ts";

const emptySkills = {
  technique: 0,
  theory: 0,
  repertoire: 0,
  improvisation: 0,
};

function createSession(id, startedAt, overrides = {}) {
  return {
    id,
    title: `Práctica ${id}`,
    startedAt,
    durationSeconds: 1800,
    averageBpm: 90,
    skillSeconds: { ...emptySkills, technique: 1800 },
    ...overrides,
  };
}

test("builds a complete leap-year calendar and aggregates session detail", () => {
  const history = [
    createSession("a", "2024-02-29T12:00:00.000Z", {
      durationSeconds: 3600,
      averageBpm: 100,
      skillSeconds: { ...emptySkills, repertoire: 3600 },
    }),
    createSession("b", "2024-02-29T15:00:00.000Z", {
      durationSeconds: 1800,
      averageBpm: 80,
    }),
  ];

  const calendar = getYearlyHeatmapData(2024, history);
  const leapDay = calendar.find((day) => day.dateKey === "2024-02-29");

  assert.equal(calendar.length, 366);
  assert.deepEqual(leapDay, {
    dateKey: "2024-02-29",
    sessionCount: 2,
    totalMinutes: 90,
    averageBpm: 90,
    skillMinutes: { ...emptySkills, technique: 30, repertoire: 60 },
  });
});

test("returns this calendar week's sessions without including adjacent weeks", () => {
  const history = [
    createSession("previous", "2026-10-04T12:00:00.000Z"),
    createSession("monday", "2026-10-05T12:00:00.000Z"),
    createSession("sunday", "2026-10-11T12:00:00.000Z"),
    createSession("next", "2026-10-12T12:00:00.000Z"),
  ];

  const sessions = getSessionsForWeek(history, new Date(2026, 9, 7, 12));

  assert.deepEqual(
    sessions.map((session) => session.id),
    ["sunday", "monday"],
  );
});

test("returns seven Monday-to-Sunday indicators with practiced days marked", () => {
  const history = [
    createSession("monday", "2026-10-05T12:00:00.000Z"),
    createSession("friday", "2026-10-09T12:00:00.000Z"),
  ];

  const days = getPracticeWeekDays(history, new Date(2026, 9, 7, 12));

  assert.equal(days.length, 7);
  assert.deepEqual(
    days.map(({ dateKey, hasPractice }) => [dateKey, hasPractice]),
    [
      ["2026-10-05", true],
      ["2026-10-06", false],
      ["2026-10-07", false],
      ["2026-10-08", false],
      ["2026-10-09", true],
      ["2026-10-10", false],
      ["2026-10-11", false],
    ],
  );
});

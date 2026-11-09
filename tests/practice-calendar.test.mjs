import assert from "node:assert/strict";
import test from "node:test";
import {
  createCalendarCells,
  getLatestPracticeDateKey,
  getMonthMarkers,
  getPracticeWeekDays,
  getSessionsForWeek,
  getYearlyHeatmapData,
  parseDateKey,
  toDateKey,
} from "../src/utils/practice-calendar.ts";
import { formatDateLabel } from "../src/utils/format.ts";

const emptySkills = {
  technique: 0,
  theory: 0,
  repertoire: 0,
  lick: 0,
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

test("calculates BPM averages only from sessions that recorded a tempo", () => {
  const history = [
    createSession("with-bpm", "2024-02-29T12:00:00.000Z", {
      averageBpm: 100,
    }),
    createSession("manual", "2024-02-29T15:00:00.000Z", {
      averageBpm: 0,
    }),
  ];

  const leapDay = getYearlyHeatmapData(2024, history).find(
    (day) => day.dateKey === "2024-02-29",
  );

  assert.equal(leapDay.sessionCount, 2);
  assert.equal(leapDay.averageBpm, 100);
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

test("keys a local date and pads month and day", () => {
  assert.equal(toDateKey(new Date(2026, 0, 1)), "2026-01-01");
  assert.equal(toDateKey(new Date(2026, 11, 31)), "2026-12-31");
  assert.equal(toDateKey(new Date(2026, 8, 9)), "2026-09-09");
});

test("parses a key back to the same local day, not to UTC", () => {
  const parsed = parseDateKey("2026-03-05");

  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 2);
  assert.equal(parsed.getDate(), 5);
  assert.equal(parsed.getHours(), 0);
  assert.equal(toDateKey(parsed), "2026-03-05");
});

test("round-trips the last and first day of a year", () => {
  assert.equal(toDateKey(parseDateKey("2025-12-31")), "2025-12-31");
  assert.equal(toDateKey(parseDateKey("2026-01-01")), "2026-01-01");
  assert.equal(parseDateKey("2025-12-31").getFullYear(), 2025);
  assert.equal(parseDateKey("2026-01-01").getFullYear(), 2026);
});

test("formats a long date with and without the year", () => {
  const withoutYear = formatDateLabel("2026-03-05", "es-ES");
  const withYear = formatDateLabel("2026-03-05", "es-ES", true);

  assert.match(withoutYear, /marzo/);
  assert.doesNotMatch(withoutYear, /2026/);
  assert.match(withYear, /marzo/);
  assert.match(withYear, /2026/);
});

test("names every month once in the column markers", () => {
  const year = 2026;
  const firstWeekday = (new Date(year, 0, 1).getDay() + 6) % 7;
  const daysInYear = getYearlyHeatmapData(year, []).length;
  const weekCount = Math.ceil((firstWeekday + daysInYear) / 7);
  const markers = getMonthMarkers(year, weekCount, firstWeekday, "es-ES");

  assert.equal(markers.length, weekCount);
  assert.equal(markers.filter((marker) => marker !== "").length, 12);
  assert.ok(markers[0].startsWith("ene"));
});

test("builds a grid padded to whole weeks, starting on the first of January", () => {
  const year = 2026;
  const yearStart = new Date(year, 0, 1);
  const firstWeekday = (yearStart.getDay() + 6) % 7;
  const days = getYearlyHeatmapData(year, []);
  const weekCount = Math.ceil((firstWeekday + days.length) / 7);
  const statsByDate = new Map(days.map((day) => [day.dateKey, day]));
  const sessions = [createSession("a", "2026-03-05T12:00:00.000Z")];
  const sessionsByDate = new Map([["2026-03-05", sessions]]);
  const cells = createCalendarCells(
    year,
    weekCount,
    firstWeekday,
    days,
    statsByDate,
    sessionsByDate,
  );

  assert.equal(cells.length, weekCount * 7);
  assert.equal(cells.slice(0, firstWeekday).filter(Boolean).length, 0);
  assert.equal(cells[firstWeekday].dateKey, "2026-01-01");
  assert.equal(cells[cells.length - 1], null);

  const march = cells.find((cell) => cell?.dateKey === "2026-03-05");
  assert.equal(march.sessions.length, 1);
  assert.ok(march.stats);
  assert.equal(march.stats.dateKey, "2026-03-05");
});

test("builds a full leap-year grid", () => {
  const year = 2024;
  const firstWeekday = (new Date(year, 0, 1).getDay() + 6) % 7;
  const days = getYearlyHeatmapData(year, []);
  const weekCount = Math.ceil((firstWeekday + days.length) / 7);
  const cells = createCalendarCells(
    year,
    weekCount,
    firstWeekday,
    days,
    new Map(days.map((day) => [day.dateKey, day])),
    new Map(),
  );

  assert.equal(days.length, 366);
  assert.equal(cells[firstWeekday].dateKey, "2024-01-01");
  assert.ok(cells.some((cell) => cell?.dateKey === "2024-02-29"));
});

test("points at the day of the newest session of the year", () => {
  const year = 2026;
  const days = getYearlyHeatmapData(year, []);
  const history = [
    createSession("older", "2026-02-01T12:00:00.000Z"),
    createSession("newer", "2026-06-20T12:00:00.000Z"),
    createSession("other-year", "2025-12-31T12:00:00.000Z"),
  ];

  assert.equal(getLatestPracticeDateKey(history, days, year), "2026-06-20");
});

test("falls back to the last day with minutes when the year has no sessions", () => {
  const year = 2026;
  const days = getYearlyHeatmapData(year, [
    createSession("a", "2026-04-02T12:00:00.000Z"),
    createSession("b", "2026-04-09T12:00:00.000Z"),
  ]);

  assert.equal(getLatestPracticeDateKey([], days, year), "2026-04-09");
});

test("points nowhere when the year has no practice at all", () => {
  const year = 2026;

  assert.equal(getLatestPracticeDateKey([], getYearlyHeatmapData(year, []), year), undefined);
});

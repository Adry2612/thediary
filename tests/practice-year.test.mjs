import assert from "node:assert/strict";
import test from "node:test";
import {
  getCalendarYearRange,
  getPracticeYears,
  getPracticeYearSummary,
} from "../src/utils/practice-year.ts";

const emptySkills = {
  technique: 0,
  theory: 0,
  repertoire: 0,
  lick: 0,
  improvisation: 0,
};

function session(
  id,
  date,
  durationSeconds = 1800,
  overrides = {},
) {
  return {
    id,
    title: `Práctica ${id}`,
    startedAt: date.toISOString(),
    durationSeconds,
    averageBpm: 90,
    skillSeconds: { ...emptySkills, technique: durationSeconds },
    ...overrides,
  };
}

test("builds a full calendar-year range", () => {
  assert.deepEqual(getCalendarYearRange(2025), {
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  });
});

test("lists practice years from newest to oldest and keeps the current one", () => {
  const history = [
    session("a", new Date(2023, 4, 2, 12)),
    session("b", new Date(2025, 0, 10, 12)),
    session("c", new Date(2025, 8, 10, 12)),
  ];

  assert.deepEqual(getPracticeYears(history, 2026), [2026, 2025, 2023]);
});

test("summarizes the sessions of one calendar year only", () => {
  const history = [
    session("january", new Date(2025, 0, 5, 12), 1800),
    session("march", new Date(2025, 2, 9, 12), 5400, {
      averageBpm: 110,
      skillSeconds: { ...emptySkills, repertoire: 5400 },
    }),
    session("march-again", new Date(2025, 2, 10, 12), 1800, {
      averageBpm: 0,
    }),
    session("previous", new Date(2024, 11, 31, 12), 7200),
    session("next", new Date(2026, 0, 1, 12), 7200),
  ];

  const summary = getPracticeYearSummary(history, 2025);

  assert.equal(summary.sessionCount, 3);
  assert.equal(summary.totalSeconds, 9000);
  assert.equal(summary.practicedDays, 3);
  assert.equal(summary.daysInYear, 365);
  assert.equal(summary.monthsWithPractice, 2);
  assert.equal(summary.averageSessionSeconds, 3000);
  assert.equal(summary.averageBpm, 100);
  assert.equal(summary.longestStreakDays, 2);
  assert.deepEqual(summary.bestMonth, {
    month: 2,
    seconds: 7200,
    sessionCount: 2,
  });
  assert.equal(summary.mostPracticedSkill, "repertoire");
  assert.equal(summary.mostPracticedSeconds, 5400);
});

test("returns an empty summary for a year without practice", () => {
  const summary = getPracticeYearSummary([], 2024);

  assert.equal(summary.sessionCount, 0);
  assert.equal(summary.totalSeconds, 0);
  assert.equal(summary.practicedDays, 0);
  assert.equal(summary.daysInYear, 366);
  assert.equal(summary.bestMonth, null);
  assert.equal(summary.mostPracticedSkill, null);
  assert.equal(summary.longestStreakDays, 0);
});

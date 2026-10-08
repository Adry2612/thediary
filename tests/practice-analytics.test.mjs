import assert from "node:assert/strict";
import test from "node:test";
import {
  getMonthlyHeatmapData,
  getPracticeStatistics,
  getPracticeTimeBuckets,
  getSkillDistribution,
  getStreakCount,
} from "../src/lib/practice-analytics.ts";

const emptySkills = {
  technique: 0,
  theory: 0,
  repertoire: 0,
  improvisation: 0,
};

function createSession(id, startedAt, overrides = {}) {
  return {
    id,
    startedAt,
    durationSeconds: 1800,
    averageBpm: 90,
    skillSeconds: { ...emptySkills, technique: 1800 },
    ...overrides,
  };
}

test("groups week practice by each day from Monday through Sunday", () => {
  const history = [
    createSession("tuesday-a", "2026-10-06T12:00:00.000Z"),
    createSession("tuesday-b", "2026-10-06T17:00:00.000Z", {
      durationSeconds: 900,
    }),
    createSession("previous", "2026-10-04T12:00:00.000Z"),
  ];

  const buckets = getPracticeTimeBuckets(
    history,
    "week",
    new Date(2026, 9, 7, 12),
  );

  assert.equal(buckets.length, 7);
  assert.equal(buckets[1].totalSeconds, 2700);
  assert.equal(buckets.reduce((sum, bucket) => sum + bucket.totalSeconds, 0), 2700);
});

test("groups the selected month into Monday-to-Sunday week buckets", () => {
  const history = [
    createSession("september", "2026-09-30T12:00:00.000Z"),
    createSession("first-partial-week", "2026-10-02T12:00:00.000Z"),
    createSession("second-week", "2026-10-08T12:00:00.000Z", {
      durationSeconds: 3600,
    }),
  ];

  const buckets = getPracticeTimeBuckets(
    history,
    "month",
    new Date(2026, 9, 7, 12),
  );

  assert.equal(buckets.length, 5);
  assert.equal(buckets[0].label, "1–4");
  assert.equal(buckets[1].label, "5–11");
  assert.equal(buckets[0].totalSeconds, 1800);
  assert.equal(buckets[1].totalSeconds, 3600);
});

test("groups year practice by month and summarizes total time and strongest skill", () => {
  const history = [
    createSession("january", "2026-01-12T12:00:00.000Z", {
      durationSeconds: 2400,
      skillSeconds: { ...emptySkills, technique: 900, repertoire: 300 },
    }),
    createSession("october", "2026-10-07T12:00:00.000Z", {
      durationSeconds: 1200,
      skillSeconds: { ...emptySkills, technique: 300, repertoire: 1200 },
    }),
  ];

  const buckets = getPracticeTimeBuckets(
    history,
    "year",
    new Date(2026, 9, 7, 12),
  );
  const statistics = getPracticeStatistics(history);

  assert.equal(buckets.length, 12);
  assert.equal(buckets[0].totalSeconds, 2400);
  assert.equal(buckets[9].totalSeconds, 1200);
  assert.deepEqual(statistics, {
    sessionCount: 2,
    totalSeconds: 3600,
    mostPracticedSkill: "repertoire",
    mostPracticedSeconds: 1500,
  });
});

test("aggregates daily session time, average BPM, and skill minutes for a month", () => {
  const history = [
    createSession("first", "2026-10-06T12:00:00.000Z", {
      durationSeconds: 1800,
      averageBpm: 90,
      skillSeconds: { ...emptySkills, technique: 900 },
    }),
    createSession("second", "2026-10-06T17:00:00.000Z", {
      durationSeconds: 900,
      averageBpm: 120,
      skillSeconds: { ...emptySkills, theory: 1200 },
    }),
  ];

  const days = getMonthlyHeatmapData(2026, 10, history);

  assert.equal(days.length, 31);
  assert.deepEqual(days[5], {
    dateKey: "2026-10-06",
    sessionCount: 2,
    totalMinutes: 45,
    averageBpm: 105,
    skillMinutes: {
      technique: 15,
      theory: 20,
      repertoire: 0,
      improvisation: 0,
    },
  });
  assert.equal(days[6].sessionCount, 0);
});

test("distributes skill time within an inclusive date range", () => {
  const history = [
    createSession("included", "2026-10-06T12:00:00.000Z", {
      skillSeconds: { ...emptySkills, technique: 1200, repertoire: 600 },
    }),
    createSession("excluded", "2026-10-07T12:00:00.000Z", {
      skillSeconds: { ...emptySkills, theory: 3600 },
    }),
  ];

  assert.deepEqual(
    getSkillDistribution(history, {
      startDate: "2026-10-06",
      endDate: "2026-10-06",
    }),
    {
      totalMinutes: 30,
      categories: {
        technique: { minutes: 20, percentage: 67 },
        theory: { minutes: 0, percentage: 0 },
        repertoire: { minutes: 10, percentage: 33 },
        improvisation: { minutes: 0, percentage: 0 },
      },
    },
  );
});

test("counts consecutive practice days, continuing from yesterday when today is empty", () => {
  const history = [
    createSession("today", "2026-10-08T12:00:00.000Z"),
    createSession("yesterday", "2026-10-07T12:00:00.000Z"),
    createSession("two-days-ago", "2026-10-06T12:00:00.000Z"),
    createSession("older-gap", "2026-10-04T12:00:00.000Z"),
  ];

  assert.equal(getStreakCount(history, new Date(2026, 9, 8, 12)), 3);
  assert.equal(getStreakCount(history.slice(1), new Date(2026, 9, 8, 12)), 2);
});

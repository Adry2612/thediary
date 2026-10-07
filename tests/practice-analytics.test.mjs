import assert from "node:assert/strict";
import test from "node:test";
import {
  getPracticeStatistics,
  getPracticeTimeBuckets,
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

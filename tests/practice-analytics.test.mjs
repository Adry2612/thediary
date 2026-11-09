import assert from "node:assert/strict";
import test from "node:test";
import {
  getGuitarBalance,
  getGuitarBalanceShares,
  getLongestStreak,
  getMonthlyHeatmapData,
  getPracticeContentRankings,
  getPracticeStatistics,
  getPracticeTimeBuckets,
  getPracticeTimeSummary,
  getSkillDistribution,
  getStreakCount,
  getTempoContentIdentity,
  getTempoTrend,
  isStreakOnFire,
  normalizePracticeContentName,
  STREAK_FIRE_MIN_DAYS,
} from "../src/utils/practice-analytics.ts";

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
    startedAt,
    durationSeconds: 1800,
    averageBpm: 90,
    skillSeconds: { ...emptySkills, technique: 1800 },
    ...overrides,
  };
}

test("groups the seven days ending today by each day", () => {
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
  assert.equal(buckets[0].startDate, "2026-10-01");
  assert.equal(buckets[5].totalSeconds, 2700);
  assert.equal(buckets[5].sessionCount, 2);
  assert.equal(buckets[1].sessionCount, 0);
  assert.equal(buckets.reduce((sum, bucket) => sum + bucket.totalSeconds, 0), 4500);
});

test("groups the last 30 days into Monday-to-Sunday week buckets", () => {
  const history = [
    createSession("september", "2026-09-30T12:00:00.000Z"),
    createSession("first-crossing-week", "2026-10-02T12:00:00.000Z"),
    createSession("future", "2026-10-08T12:00:00.000Z", {
      durationSeconds: 3600,
    }),
  ];

  const buckets = getPracticeTimeBuckets(
    history,
    "month",
    new Date(2026, 9, 7, 12),
  );

  assert.equal(buckets.length, 5);
  assert.equal(buckets[0].label, "8–13");
  assert.equal(buckets[3].label, "28 sept–4 oct");
  assert.equal(buckets[3].totalSeconds, 3600);
  assert.equal(buckets[3].sessionCount, 2);
  assert.equal(buckets[4].label, "5–7");
  assert.equal(buckets[4].totalSeconds, 0);
});

test("groups the twelve-month window by month and summarizes total time and strongest skill", () => {
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
  assert.equal(buckets[0].startDate, "2025-11-01");
  assert.equal(buckets[2].totalSeconds, 2400);
  assert.equal(buckets[2].sessionCount, 1);
  assert.equal(buckets[11].totalSeconds, 1200);
  assert.equal(buckets[11].sessionCount, 1);
  assert.equal(buckets[3].sessionCount, 0);
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
      lick: 0,
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
        technique: { minutes: 20, percentage: 67, sessionCount: 1 },
        theory: { minutes: 0, percentage: 0, sessionCount: 0 },
        repertoire: { minutes: 10, percentage: 33, sessionCount: 1 },
        lick: { minutes: 0, percentage: 0, sessionCount: 0 },
        improvisation: { minutes: 0, percentage: 0, sessionCount: 0 },
      },
    },
  );
});

test("includes lick time in the skill balance and its session count", () => {
  const history = [
    createSession("lick-a", "2026-10-06T12:00:00.000Z", {
      skillSeconds: { ...emptySkills, lick: 1800 },
    }),
    createSession("lick-b", "2026-10-07T12:00:00.000Z", {
      skillSeconds: { ...emptySkills, lick: 900, technique: 900 },
    }),
  ];

  const distribution = getSkillDistribution(history, {
    startDate: "2026-10-01",
    endDate: "2026-10-31",
  });

  assert.equal(distribution.totalMinutes, 60);
  assert.equal(distribution.categories.lick.minutes, 45);
  assert.equal(distribution.categories.lick.percentage, 75);
  assert.equal(distribution.categories.lick.sessionCount, 2);
  assert.equal(distribution.categories.technique.sessionCount, 1);
});

test("can report lick as the most practiced area", () => {
  const history = [
    createSession("lick", "2026-10-06T12:00:00.000Z", {
      skillSeconds: { ...emptySkills, lick: 3600 },
    }),
  ];

  const statistics = getPracticeStatistics(history);

  assert.equal(statistics.mostPracticedSkill, "lick");
  assert.equal(statistics.mostPracticedSeconds, 3600);
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

test("recognises a streak only from seven consecutive days", () => {
  assert.equal(STREAK_FIRE_MIN_DAYS, 7);
  assert.equal(isStreakOnFire(0), false);
  assert.equal(isStreakOnFire(6), false);
  assert.equal(isStreakOnFire(7), true);
  assert.equal(isStreakOnFire(30), true);
});

test("finds the longest consecutive run across the full history", () => {
  const history = Array.from({ length: 14 }, (_, index) =>
    createSession(
      `record-${index}`,
      new Date(2025, 11, 20 + index, 12).toISOString(),
    ),
  );
  history.push(
    createSession("current-1", "2026-03-01T12:00:00.000Z"),
    createSession("current-2", "2026-03-02T12:00:00.000Z"),
    createSession("current-3", "2026-03-03T12:00:00.000Z"),
  );

  assert.equal(getLongestStreak(history), 14);
});

test("returns zero for an empty history and one for a single day", () => {
  assert.equal(getLongestStreak([]), 0);
  assert.equal(
    getLongestStreak([
      createSession("only", "2026-03-01T12:00:00.000Z"),
    ]),
    1,
  );
});

test("keeps the best run when two runs tie", () => {
  const history = [
    createSession("first-1", "2026-01-01T12:00:00.000Z"),
    createSession("first-2", "2026-01-02T12:00:00.000Z"),
    createSession("first-3", "2026-01-03T12:00:00.000Z"),
    createSession("second-1", "2026-02-01T12:00:00.000Z"),
    createSession("second-2", "2026-02-02T12:00:00.000Z"),
    createSession("second-3", "2026-02-03T12:00:00.000Z"),
  ];

  assert.equal(getLongestStreak(history), 3);
});

test("filters statistics to the requested rolling window", () => {
  const history = [
    createSession("inside-a", "2026-10-02T12:00:00.000Z", {
      durationSeconds: 600,
      skillSeconds: { ...emptySkills, theory: 600 },
    }),
    createSession("inside-b", "2026-10-06T12:00:00.000Z", {
      durationSeconds: 900,
      skillSeconds: { ...emptySkills, repertoire: 900 },
    }),
    createSession("outside", "2026-09-20T12:00:00.000Z", {
      durationSeconds: 3600,
      skillSeconds: { ...emptySkills, technique: 3600 },
    }),
  ];

  assert.deepEqual(
    getPracticeStatistics(history, {
      startDate: "2026-10-01",
      endDate: "2026-10-07",
    }),
    {
      sessionCount: 2,
      totalSeconds: 1500,
      mostPracticedSkill: "repertoire",
      mostPracticedSeconds: 900,
    },
  );
});

test("filters the content rankings to the requested rolling window", () => {
  const history = [
    createSession("inside", "2026-10-05T12:00:00.000Z", {
      phases: [
        {
          id: "phase-1",
          name: "Canción",
          skill: "repertoire",
          elapsedSeconds: 600,
          repertoireItemId: "song-1",
        },
      ],
    }),
    createSession("outside", "2026-09-05T12:00:00.000Z", {
      phases: [
        {
          id: "phase-2",
          name: "Otra",
          skill: "repertoire",
          elapsedSeconds: 3600,
          repertoireItemId: "song-1",
        },
      ],
    }),
  ];

  const rankings = getPracticeContentRankings(
    history,
    [{ id: "song-1", kind: "song", title: "Canción", parts: [] }],
    { startDate: "2026-10-01", endDate: "2026-10-07" },
  );

  assert.deepEqual(rankings.songs, [
    { key: "song:song-1", label: "Canción", seconds: 600, sessionCount: 1 },
  ]);
});

function phase(overrides) {
  return {
    id: overrides.id ?? overrides.name,
    name: overrides.name,
    skill: overrides.skill ?? "technique",
    elapsedSeconds: overrides.elapsedSeconds ?? 600,
    ...overrides,
  };
}

test("splits monthly time between electric, acoustic and unclassified guitar", () => {
  const history = [
    createSession("electric", "2026-10-06T12:00:00.000Z", {
      durationSeconds: 3600,
      guitarType: "electric",
    }),
    createSession("acoustic", "2026-10-07T12:00:00.000Z", {
      durationSeconds: 1800,
      guitarType: "acoustic",
    }),
    createSession("unknown", "2026-10-08T12:00:00.000Z", {
      durationSeconds: 600,
    }),
    createSession("outside", "2026-09-08T12:00:00.000Z", {
      durationSeconds: 600,
      guitarType: "electric",
    }),
  ];
  const range = { startDate: "2026-10-01", endDate: "2026-10-31" };

  const balance = getGuitarBalance(history, range);

  assert.deepEqual(balance, {
    electricSeconds: 3600,
    acousticSeconds: 1800,
    unclassifiedSeconds: 600,
  });
  assert.deepEqual(getGuitarBalanceShares(balance), {
    electric: 67,
    acoustic: 33,
  });
  assert.deepEqual(
    getGuitarBalanceShares({
      electricSeconds: 3600,
      acousticSeconds: 0,
      unclassifiedSeconds: 600,
    }),
    { electric: 100, acoustic: 0 },
  );
  assert.deepEqual(getGuitarBalanceShares(getGuitarBalance([], range)), {
    electric: 0,
    acoustic: 0,
  });
});

test("distributes skill time for a week and for a year window", () => {
  const history = [
    createSession("this-week", "2026-10-06T12:00:00.000Z", {
      skillSeconds: { ...emptySkills, technique: 1800 },
    }),
    createSession("last-week", "2026-09-29T12:00:00.000Z", {
      skillSeconds: { ...emptySkills, theory: 600 },
    }),
    createSession("january", "2026-01-15T12:00:00.000Z", {
      skillSeconds: { ...emptySkills, lick: 300 },
    }),
    createSession("last-year", "2025-12-20T12:00:00.000Z", {
      skillSeconds: { ...emptySkills, repertoire: 900 },
    }),
  ];

  const week = getSkillDistribution(history, {
    startDate: "2026-10-05",
    endDate: "2026-10-11",
  });
  assert.equal(week.totalMinutes, 30);
  assert.deepEqual(week.categories.technique, {
    minutes: 30,
    percentage: 100,
    sessionCount: 1,
  });
  assert.equal(week.categories.theory.minutes, 0);

  const year = getSkillDistribution(history, {
    startDate: "2026-01-01",
    endDate: "2026-12-31",
  });
  assert.equal(year.totalMinutes, 45);
  assert.equal(year.categories.technique.minutes, 30);
  assert.equal(year.categories.theory.minutes, 10);
  assert.equal(year.categories.lick.minutes, 5);
  assert.equal(year.categories.repertoire.minutes, 0);
});

test("splits guitar time for a week and for a year window", () => {
  const history = [
    createSession("this-week", "2026-10-06T12:00:00.000Z", {
      guitarType: "electric",
    }),
    createSession("last-week", "2026-09-29T12:00:00.000Z", {
      guitarType: "acoustic",
    }),
    createSession("march", "2026-03-03T12:00:00.000Z", {
      durationSeconds: 600,
      guitarType: "acoustic",
    }),
    createSession("last-year", "2025-12-20T12:00:00.000Z", {
      guitarType: "electric",
    }),
  ];

  assert.deepEqual(
    getGuitarBalance(history, {
      startDate: "2026-10-05",
      endDate: "2026-10-11",
    }),
    {
      electricSeconds: 1800,
      acousticSeconds: 0,
      unclassifiedSeconds: 0,
    },
  );

  assert.deepEqual(
    getGuitarBalance(history, {
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    }),
    {
      electricSeconds: 1800,
      acousticSeconds: 2400,
      unclassifiedSeconds: 0,
    },
  );
});

test("ranks songs, techniques and theory over the full history", () => {
  const repertoire = [
    {
      id: "song-a",
      kind: "song",
      title: "Canción A",
      parts: [{ id: "part-1", name: "Estribillo" }],
      updatedAt: "2026-10-01T00:00:00.000Z",
    },
    {
      id: "song-b",
      kind: "song",
      title: "Canción B",
      parts: [],
      updatedAt: "2026-10-01T00:00:00.000Z",
    },
  ];
  const history = [
    createSession("session-1", "2026-10-01T12:00:00.000Z", {
      phases: [
        phase({ name: "Escalas", skill: "technique", elapsedSeconds: 600 }),
        phase({ name: "Armonía mayor", skill: "theory", elapsedSeconds: 600 }),
        phase({
          name: "Canción A",
          skill: "repertoire",
          elapsedSeconds: 300,
          repertoireItemId: "song-a",
          repertoirePartId: "part-1",
        }),
      ],
    }),
    createSession("session-2", "2026-10-02T12:00:00.000Z", {
      phases: [
        phase({ name: "escalas", skill: "technique", elapsedSeconds: 300 }),
        phase({ name: "armonia mayor", skill: "theory", elapsedSeconds: 300 }),
        phase({
          name: "Canción A",
          skill: "repertoire",
          elapsedSeconds: 300,
          repertoireItemId: "song-a",
        }),
      ],
    }),
    createSession("session-3", "2026-10-03T12:00:00.000Z", {
      phases: [
        phase({
          name: "Canción borrada",
          skill: "repertoire",
          elapsedSeconds: 200,
          repertoireItemId: "deleted-song",
        }),
      ],
    }),
  ];

  const rankings = getPracticeContentRankings(history, repertoire);

  assert.deepEqual(
    rankings.songs.map(({ label, seconds, sessionCount }) => ({
      label,
      seconds,
      sessionCount,
    })),
    [
      { label: "Canción A", seconds: 600, sessionCount: 2 },
      { label: "Canción borrada", seconds: 200, sessionCount: 1 },
    ],
  );
  assert.deepEqual(
    rankings.techniques.map(({ label, seconds, sessionCount }) => ({
      label,
      seconds,
      sessionCount,
    })),
    [{ label: "Escalas", seconds: 900, sessionCount: 2 }],
  );
  assert.deepEqual(
    rankings.theory.map(({ label, seconds }) => ({ label, seconds })),
    [{ label: "Armonía mayor", seconds: 900 }],
  );
});

test("groups catalogue techniques and theory across both languages", () => {
  const history = [
    createSession("language-a", "2026-10-01T12:00:00.000Z", {
      phases: [
        phase({ name: "Púa alterna", skill: "technique", elapsedSeconds: 300 }),
        phase({ name: "Escala mayor", skill: "theory", elapsedSeconds: 200 }),
      ],
    }),
    createSession("language-b", "2026-10-02T12:00:00.000Z", {
      phases: [
        phase({
          name: "Alternate picking",
          skill: "technique",
          elapsedSeconds: 300,
        }),
        phase({ name: "Major scale", skill: "theory", elapsedSeconds: 200 }),
      ],
    }),
  ];

  const rankings = getPracticeContentRankings(history);

  assert.deepEqual(
    rankings.techniques.map(({ label, seconds, sessionCount }) => ({
      label,
      seconds,
      sessionCount,
    })),
    [{ label: "Alternate picking", seconds: 600, sessionCount: 2 }],
  );
  assert.deepEqual(
    rankings.theory.map(({ label, seconds, sessionCount }) => ({
      label,
      seconds,
      sessionCount,
    })),
    [{ label: "Major scale", seconds: 400, sessionCount: 2 }],
  );
});

test("returns empty rankings when there is no phase data", () => {
  const rankings = getPracticeContentRankings([], []);

  assert.deepEqual(rankings, { songs: [], techniques: [], theory: [] });
});

test("summarizes the seven days ending today and compares the previous seven", () => {
  const today = new Date(2026, 9, 7, 12);
  const history = [
    createSession("monday", new Date(2026, 9, 5, 12).toISOString(), {
      durationSeconds: 1800,
    }),
    createSession("tuesday-a", new Date(2026, 9, 6, 12).toISOString(), {
      durationSeconds: 1800,
    }),
    createSession("tuesday-b", new Date(2026, 9, 6, 17).toISOString(), {
      durationSeconds: 900,
    }),
    createSession("previous-monday", new Date(2026, 8, 28, 12).toISOString(), {
      durationSeconds: 1800,
    }),
    createSession("previous-sunday", new Date(2026, 9, 4, 12).toISOString(), {
      durationSeconds: 3600,
    }),
  ];

  assert.deepEqual(getPracticeTimeSummary(history, "week", today), {
    totalSeconds: 8100,
    sessionCount: 4,
    averageSessionSeconds: 2025,
    bestBucket: { label: "dom 4", totalSeconds: 3600 },
    previousTotalSeconds: 1800,
    changeRatio: 3.5,
  });
});

test("summarizes the last 30 days and ignores older and future practice", () => {
  const today = new Date(2026, 9, 7, 12);
  const history = [
    createSession("september", new Date(2026, 8, 30, 12).toISOString(), {
      durationSeconds: 1200,
    }),
    createSession("october-first", new Date(2026, 9, 2, 12).toISOString(), {
      durationSeconds: 1800,
    }),
    createSession("october-second", new Date(2026, 9, 8, 12).toISOString(), {
      durationSeconds: 3600,
    }),
  ];

  const summary = getPracticeTimeSummary(history, "month", today);

  assert.equal(summary.totalSeconds, 3000);
  assert.equal(summary.sessionCount, 2);
  assert.equal(summary.averageSessionSeconds, 1500);
  assert.deepEqual(summary.bestBucket, {
    label: "28 sept–4 oct",
    totalSeconds: 3000,
  });
  assert.equal(summary.previousTotalSeconds, 0);
  assert.equal(summary.changeRatio, null);
});

test("mid month compares the 30 days with the previous 30", () => {
  const today = new Date(2026, 10, 15, 12);
  const history = [
    createSession("october-outside", new Date(2026, 9, 5, 12).toISOString(), {
      durationSeconds: 900,
    }),
    createSession("october-inside", new Date(2026, 9, 20, 12).toISOString(), {
      durationSeconds: 3000,
    }),
    createSession("november-first", new Date(2026, 10, 3, 12).toISOString(), {
      durationSeconds: 600,
    }),
    createSession("november-tenth", new Date(2026, 10, 10, 12).toISOString(), {
      durationSeconds: 1200,
    }),
  ];

  const summary = getPracticeTimeSummary(history, "month", today);

  assert.equal(summary.totalSeconds, 4800);
  assert.equal(summary.previousTotalSeconds, 900);
  assert.equal(summary.changeRatio, (4800 - 900) / 900);
});

test("the first day of a month keeps the end of the previous month", () => {
  const today = new Date(2026, 10, 1, 12);
  const history = [
    createSession("october-first", new Date(2026, 9, 1, 12).toISOString(), {
      durationSeconds: 1200,
    }),
    createSession("october-late", new Date(2026, 9, 20, 12).toISOString(), {
      durationSeconds: 600,
    }),
  ];

  const summary = getPracticeTimeSummary(history, "month", today);

  assert.equal(summary.totalSeconds, 600);
  assert.equal(summary.previousTotalSeconds, 1200);
  assert.equal(summary.changeRatio, -0.5);
});

test("reports no comparison when the previous 30 days have no practice", () => {
  const today = new Date(2026, 10, 1, 12);
  const history = [
    createSession("too-old", new Date(2026, 8, 1, 12).toISOString(), {
      durationSeconds: 900,
    }),
    createSession("october-late", new Date(2026, 9, 20, 12).toISOString(), {
      durationSeconds: 1800,
    }),
  ];

  const summary = getPracticeTimeSummary(history, "month", today);

  assert.equal(summary.previousTotalSeconds, 0);
  assert.equal(summary.changeRatio, null);
});

test("a practice dated after today is excluded from the week", () => {
  const today = new Date(2026, 9, 7, 12);
  const history = [
    createSession("previous", new Date(2026, 8, 29, 12).toISOString(), {
      durationSeconds: 300,
    }),
    createSession("current", new Date(2026, 9, 6, 12).toISOString(), {
      durationSeconds: 600,
    }),
    createSession("future", new Date(2026, 9, 9, 12).toISOString(), {
      durationSeconds: 1200,
    }),
  ];

  const summary = getPracticeTimeSummary(history, "week", today);

  assert.equal(summary.totalSeconds, 600);
  assert.equal(summary.previousTotalSeconds, 300);
  assert.equal(summary.changeRatio, 1);
});

test("summarizes the twelve-month window against the same months one year earlier", () => {
  const today = new Date(2026, 9, 7, 12);
  const history = [
    createSession("january", new Date(2026, 0, 12, 12).toISOString(), {
      durationSeconds: 2400,
    }),
    createSession("october", new Date(2026, 9, 7, 12).toISOString(), {
      durationSeconds: 3600,
    }),
    createSession("last-year", new Date(2025, 8, 30, 12).toISOString(), {
      durationSeconds: 1800,
    }),
    createSession(
      "last-year-late",
      new Date(2024, 11, 20, 12).toISOString(),
      { durationSeconds: 900 },
    ),
  ];

  const summary = getPracticeTimeSummary(history, "year", today);

  assert.equal(summary.totalSeconds, 6000);
  assert.equal(summary.sessionCount, 2);
  assert.equal(summary.averageSessionSeconds, 3000);
  assert.deepEqual(summary.bestBucket, { label: "oct", totalSeconds: 3600 });
  assert.equal(summary.previousTotalSeconds, 2700);
  assert.equal(summary.changeRatio, (6000 - 2700) / 2700);
});

test("reports no comparison when the previous period is empty", () => {
  const history = [
    createSession("tuesday", new Date(2026, 9, 6, 12).toISOString()),
  ];

  const summary = getPracticeTimeSummary(
    history,
    "week",
    new Date(2026, 9, 7, 12),
  );

  assert.equal(summary.previousTotalSeconds, 0);
  assert.equal(summary.changeRatio, null);
});

test("returns an empty summary when the period has no practice", () => {
  assert.deepEqual(
    getPracticeTimeSummary([], "week", new Date(2026, 9, 7, 12)),
    {
      totalSeconds: 0,
      sessionCount: 0,
      averageSessionSeconds: 0,
      bestBucket: null,
      previousTotalSeconds: 0,
      changeRatio: null,
    },
  );
});

test("normalizes content names and identifies songs, parts and licks", () => {
  assert.equal(normalizePracticeContentName("  Escalas  Mayores "), "escalas mayores");
  assert.equal(normalizePracticeContentName("Armonía"), "armonia");

  const repertoire = [
    {
      id: "song-1",
      kind: "song",
      title: "Canción",
      parts: [{ id: "part-1", name: "Puente" }],
      updatedAt: "2026-10-01T00:00:00.000Z",
    },
  ];
  assert.deepEqual(
    getTempoContentIdentity(
      phase({
        name: "Bloque",
        skill: "repertoire",
        repertoireItemId: "song-1",
        repertoirePartId: "part-1",
      }),
      repertoire,
    ),
    { key: "song:song-1:part:part-1", label: "Canción · Puente" },
  );
  assert.deepEqual(
    getTempoContentIdentity(
      phase({ name: "Frase", skill: "lick", lickId: "lick-1" }),
      repertoire,
    ),
    { key: "lick:lick-1", label: "Frase" },
  );
  assert.deepEqual(
    getTempoContentIdentity(
      phase({ name: "Escalas", skill: "technique" }),
      repertoire,
    ),
    { key: "technique:escalas", label: "Escalas" },
  );
});

const tempoToday = new Date(2026, 9, 24, 12);

function tempoSession(id, startedAt, bpm, seconds = 600) {
  return createSession(id, startedAt, {
    averageBpm: 0,
    phases: [
      {
        id,
        name: "Escalas",
        skill: "technique",
        elapsedSeconds: seconds,
        averageBpm: bpm,
      },
    ],
  });
}

test("compares each content over consecutive rolling windows", () => {
  const history = [
    tempoSession("previous-a", new Date(2026, 9, 15, 12).toISOString(), 80),
    {
      ...tempoSession("previous-b", new Date(2026, 9, 16, 12).toISOString(), 100, 1800),
      phases: [
        {
          id: "previous-b",
          name: "Arpegios",
          skill: "technique",
          elapsedSeconds: 1800,
          averageBpm: 100,
        },
      ],
    },
    tempoSession("current-a", new Date(2026, 9, 20, 12).toISOString(), 82),
    {
      ...tempoSession("current-b", new Date(2026, 9, 21, 12).toISOString(), 120, 1800),
      phases: [
        {
          id: "current-b",
          name: "Arpegios",
          skill: "technique",
          elapsedSeconds: 1800,
          averageBpm: 120,
        },
      ],
    },
  ];

  const trend = getTempoTrend(history, "week", tempoToday);

  assert.equal(trend.comparedCount, 2);
  assert.equal(trend.deltaBpm, 16);
  assert.equal(trend.deltaPercent, 16);
  assert.equal(trend.isSmallSample, true);
  assert.deepEqual(
    trend.movers.map(({ label, deltaBpm }) => ({ label, deltaBpm })),
    [
      { label: "Arpegios", deltaBpm: 20 },
      { label: "Escalas", deltaBpm: 2 },
    ],
  );
});

test("excludes a content practised in only one of the windows", () => {
  const history = [
    tempoSession("current", new Date(2026, 9, 20, 12).toISOString(), 90),
  ];

  const trend = getTempoTrend(history, "week", tempoToday);

  assert.equal(trend.comparedCount, 0);
  assert.equal(trend.deltaBpm, 0);
  assert.equal(trend.deltaPercent, 0);
  assert.equal(trend.hasMetronomeData, true);
});

test("uses the time-weighted level of up to the three most recent sessions", () => {
  const history = [
    tempoSession("previous", new Date(2026, 9, 15, 12).toISOString(), 70),
    tempoSession("week-1", new Date(2026, 9, 18, 12).toISOString(), 60),
    tempoSession("week-2", new Date(2026, 9, 19, 12).toISOString(), 70),
    tempoSession("week-3", new Date(2026, 9, 20, 12).toISOString(), 80),
    tempoSession("week-4", new Date(2026, 9, 21, 12).toISOString(), 90),
  ];

  const trend = getTempoTrend(history, "week", tempoToday);

  assert.equal(trend.comparedCount, 1);
  assert.equal(trend.deltaBpm, 10);
  assert.equal(trend.movers[0].nowBpm, 80);
  assert.equal(trend.movers[0].beforeBpm, 70);
});

test("matches contents without accents or case between windows", () => {
  const history = [
    {
      ...tempoSession("previous", new Date(2026, 9, 15, 12).toISOString(), 80),
      phases: [
        {
          id: "previous",
          name: "Escalas",
          skill: "technique",
          elapsedSeconds: 600,
          averageBpm: 80,
        },
      ],
    },
    {
      ...tempoSession("current", new Date(2026, 9, 20, 12).toISOString(), 90),
      phases: [
        {
          id: "current",
          name: "escalas",
          skill: "technique",
          elapsedSeconds: 600,
          averageBpm: 90,
        },
      ],
    },
  ];

  const trend = getTempoTrend(history, "week", tempoToday);

  assert.equal(trend.comparedCount, 1);
  assert.equal(trend.deltaBpm, 10);
});

test("uses the session average only for legacy single-block sessions", () => {
  const legacySingle = {
    id: "legacy-single",
    startedAt: new Date(2026, 9, 15, 12).toISOString(),
    durationSeconds: 600,
    averageBpm: 80,
    skillSeconds: { ...emptySkills, technique: 600 },
    phases: [
      { id: 1, name: "Escalas", skill: "technique", elapsedSeconds: 600 },
    ],
  };
  const currentSingle = {
    ...legacySingle,
    id: "current-single",
    startedAt: new Date(2026, 9, 20, 12).toISOString(),
    averageBpm: 90,
  };

  assert.equal(
    getTempoTrend([legacySingle, currentSingle], "week", tempoToday).deltaBpm,
    10,
  );

  const legacyMulti = {
    ...legacySingle,
    id: "legacy-multi",
    phases: [
      { id: 1, name: "Escalas", skill: "technique", elapsedSeconds: 300 },
      { id: 2, name: "Teoría", skill: "theory", elapsedSeconds: 300 },
    ],
  };
  const currentMulti = {
    ...legacyMulti,
    id: "current-multi",
    startedAt: new Date(2026, 9, 20, 12).toISOString(),
    averageBpm: 90,
  };

  const trend = getTempoTrend([legacyMulti, currentMulti], "week", tempoToday);
  assert.equal(trend.comparedCount, 0);
  assert.equal(trend.hasMetronomeData, false);
});

test("labels the empty state when there is no metronome data", () => {
  const history = [
    createSession("no-bpm", new Date(2026, 9, 20, 12).toISOString(), {
      averageBpm: 0,
    }),
  ];

  const trend = getTempoTrend(history, "week", tempoToday);

  assert.equal(trend.comparedCount, 0);
  assert.equal(trend.hasMetronomeData, false);
  assert.deepEqual(trend.movers, []);
});

test("uses 30-day windows for the month period", () => {
  const history = [
    tempoSession("previous", new Date(2026, 8, 20, 12).toISOString(), 80),
    tempoSession("current", new Date(2026, 9, 20, 12).toISOString(), 90),
  ];

  assert.equal(
    getTempoTrend(history, "week", tempoToday).comparedCount,
    0,
  );
  assert.equal(
    getTempoTrend(history, "month", tempoToday).comparedCount,
    1,
  );

  const outside = [
    tempoSession("too-old", new Date(2026, 6, 1, 12).toISOString(), 80),
    tempoSession("current", new Date(2026, 9, 20, 12).toISOString(), 90),
  ];
  assert.equal(
    getTempoTrend(outside, "month", tempoToday).comparedCount,
    0,
  );
});

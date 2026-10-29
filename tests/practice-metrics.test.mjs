import assert from "node:assert/strict";
import test from "node:test";
import {
  getPracticeMetricAverage,
  getPracticeMetricLabelKey,
  getPracticeMetricSummary,
  getPracticeMetricTrend,
  getPracticeWellbeingSeries,
  getPracticeWellbeingSummary,
  hasPracticeWellbeingData,
  normalizePracticeMetricValue,
  PRACTICE_METRIC_VALUES,
} from "../src/utils/practice-metrics.ts";

function session(id, startedAt, mood, focus) {
  return {
    id,
    startedAt,
    durationSeconds: 600,
    averageBpm: 0,
    skillSeconds: {
      technique: 600,
      theory: 0,
      repertoire: 0,
      lick: 0,
      improvisation: 0,
    },
    ...(mood === undefined ? {} : { mood }),
    ...(focus === undefined ? {} : { focus }),
  };
}

function at(year, month, day) {
  return new Date(year, month - 1, day, 10).toISOString();
}

test("only accepts whole values from one to five", () => {
  assert.equal(normalizePracticeMetricValue(1), 1);
  assert.equal(normalizePracticeMetricValue(5), 5);
  assert.equal(normalizePracticeMetricValue("3"), 3);
  assert.equal(normalizePracticeMetricValue(0), null);
  assert.equal(normalizePracticeMetricValue(6), null);
  assert.equal(normalizePracticeMetricValue(2.5), null);
  assert.equal(normalizePracticeMetricValue("bien"), null);
  assert.equal(normalizePracticeMetricValue(null), null);
  assert.equal(normalizePracticeMetricValue(undefined), null);
});

test("the scale exposes five levels", () => {
  assert.deepEqual(PRACTICE_METRIC_VALUES, [1, 2, 3, 4, 5]);
});

test("each metric value maps to its own dictionary key", () => {
  assert.equal(getPracticeMetricLabelKey("mood", 4), "metricMood4");
  assert.equal(getPracticeMetricLabelKey("focus", 1), "metricFocus1");
});

test("averages only the sessions that answered the metric", () => {
  const sessions = [
    session("a", at(2026, 10, 1), 2, 4),
    session("b", at(2026, 10, 2), undefined, 2),
    session("c", at(2026, 10, 3), 4, undefined),
  ];

  assert.deepEqual(getPracticeMetricAverage(sessions, "mood"), {
    average: 3,
    count: 2,
  });
  assert.deepEqual(getPracticeMetricAverage(sessions, "focus"), {
    average: 3,
    count: 2,
  });
});

test("rounds the average to one decimal", () => {
  const sessions = [
    session("a", at(2026, 10, 1), 4),
    session("b", at(2026, 10, 2), 5),
    session("c", at(2026, 10, 3), 4),
  ];

  assert.deepEqual(getPracticeMetricAverage(sessions, "mood"), {
    average: 4.3,
    count: 3,
  });
});

test("a metric with no answers has no average", () => {
  assert.equal(
    getPracticeMetricAverage([session("a", at(2026, 10, 1))], "mood"),
    null,
  );
});

test("trend compares the two averages and can stay flat", () => {
  assert.equal(
    getPracticeMetricTrend({ average: 4, count: 2 }, { average: 3, count: 1 }),
    "up",
  );
  assert.equal(
    getPracticeMetricTrend({ average: 2, count: 2 }, { average: 3.5, count: 1 }),
    "down",
  );
  assert.equal(
    getPracticeMetricTrend({ average: 3, count: 2 }, { average: 3, count: 1 }),
    "flat",
  );
  assert.equal(getPracticeMetricTrend({ average: 3, count: 1 }, null), null);
  assert.equal(getPracticeMetricTrend(null, { average: 3, count: 1 }), null);
});

test("summarizes one metric inside a period against the previous one", () => {
  const sessions = [
    session("prev", at(2026, 9, 10), 2, 2),
    session("current-a", at(2026, 10, 2), 4, 3),
    session("current-b", at(2026, 10, 20), 5, 5),
    session("outside", at(2026, 8, 1), 1, 1),
  ];

  const summary = getPracticeMetricSummary(
    sessions,
    "mood",
    { startDate: "2026-10-01", endDate: "2026-10-31" },
    { startDate: "2026-09-01", endDate: "2026-09-30" },
  );

  assert.deepEqual(summary, {
    average: 4.5,
    count: 2,
    previousAverage: 2,
    change: 2.5,
    trend: "up",
  });
});

test("a period without answers has no summary even if older periods do", () => {
  assert.equal(
    getPracticeMetricSummary(
      [session("prev", at(2026, 9, 10), 2)],
      "mood",
      { startDate: "2026-10-01", endDate: "2026-10-31" },
    ),
    null,
  );
});

test("the weekly series has one bucket per day and leaves gaps as null", () => {
  const sessions = [
    session("a", at(2026, 10, 27), 4, 2),
    session("b", at(2026, 10, 27), 2, undefined),
    session("c", at(2026, 10, 29), 5, undefined),
  ];

  const series = getPracticeWellbeingSeries(
    sessions,
    "week",
    new Date(2026, 9, 29),
  );

  assert.equal(series.length, 7);
  const tuesday = series.find(
    (bucket) => "2026-10-27" >= bucket.startDate && "2026-10-27" <= bucket.endDate,
  );
  const thursday = series.find(
    (bucket) => "2026-10-29" >= bucket.startDate && "2026-10-29" <= bucket.endDate,
  );
  const wednesday = series.find(
    (bucket) => "2026-10-28" >= bucket.startDate && "2026-10-28" <= bucket.endDate,
  );

  assert.deepEqual(tuesday?.mood, { average: 3, count: 2 });
  assert.deepEqual(tuesday?.focus, { average: 2, count: 1 });
  assert.deepEqual(thursday?.mood, { average: 5, count: 1 });
  assert.equal(thursday?.focus, null);
  assert.equal(wednesday?.mood, null);
  assert.equal(wednesday?.focus, null);
});

test("the month series uses calendar weeks clipped to the month", () => {
  const sessions = [
    session("a", at(2026, 10, 2), 3),
    session("b", at(2026, 10, 20), 5),
  ];
  const series = getPracticeWellbeingSeries(
    sessions,
    "month",
    new Date(2026, 9, 29),
  );

  assert.ok(series.length >= 4);
  assert.equal(series[0].startDate, "2026-10-01");
  assert.equal(series[series.length - 1].endDate, "2026-10-31");
  assert.equal(
    series.reduce((total, bucket) => total + (bucket.mood?.count ?? 0), 0),
    2,
  );
});

test("the year series has twelve monthly buckets", () => {
  const sessions = [session("a", at(2026, 10, 20), 5)];
  const series = getPracticeWellbeingSeries(
    sessions,
    "year",
    new Date(2026, 9, 29),
  );

  assert.equal(series.length, 12);
  assert.deepEqual(series[9].mood, { average: 5, count: 1 });
  assert.equal(series[8].mood, null);
});

test("the wellbeing summary compares the period with the previous one", () => {
  const sessions = [
    session("september", at(2026, 9, 10), 2, 2),
    session("october-a", at(2026, 10, 2), 4, 3),
    session("october-b", at(2026, 10, 20), 5, 5),
  ];

  const summary = getPracticeWellbeingSummary(
    sessions,
    "month",
    new Date(2026, 9, 29),
  );

  assert.deepEqual(summary.mood, {
    average: 4.5,
    count: 2,
    previousAverage: 2,
    change: 2.5,
    trend: "up",
  });
  assert.deepEqual(summary.focus, {
    average: 4,
    count: 2,
    previousAverage: 2,
    change: 2,
    trend: "up",
  });
});

test("the summary has no comparison when the previous period is empty", () => {
  const summary = getPracticeWellbeingSummary(
    [session("october", at(2026, 10, 10), 4)],
    "month",
    new Date(2026, 9, 29),
  );

  assert.equal(summary.mood?.previousAverage, null);
  assert.equal(summary.mood?.change, null);
  assert.equal(summary.mood?.trend, null);
});

test("the history has wellbeing data when any session answered", () => {
  assert.equal(hasPracticeWellbeingData([]), false);
  assert.equal(
    hasPracticeWellbeingData([session("a", at(2026, 10, 10))]),
    false,
  );
  assert.equal(
    hasPracticeWellbeingData([session("a", at(2026, 10, 10), undefined, 3)]),
    true,
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  getComparisonSpans,
  sumSecondsInSpan,
} from "../src/utils/period-comparison.ts";

test("mid month looks back 30 days and compares the previous 30", () => {
  const spans = getComparisonSpans("month", new Date(2026, 10, 15));

  assert.deepEqual(spans, {
    current: { startDate: "2026-10-17", endDate: "2026-11-15" },
    previous: { startDate: "2026-09-17", endDate: "2026-10-16" },
  });
});

test("the first day of a month still includes the end of the previous month", () => {
  const spans = getComparisonSpans("month", new Date(2026, 10, 1));

  assert.deepEqual(spans, {
    current: { startDate: "2026-10-03", endDate: "2026-11-01" },
    previous: { startDate: "2026-09-03", endDate: "2026-10-02" },
  });
});

test("the 30-day window crosses month boundaries", () => {
  const spans = getComparisonSpans("month", new Date(2026, 2, 31));

  assert.deepEqual(spans, {
    current: { startDate: "2026-03-02", endDate: "2026-03-31" },
    previous: { startDate: "2026-01-31", endDate: "2026-03-01" },
  });
});

test("mid week compares Monday to the same weekday of the previous week", () => {
  const spans = getComparisonSpans("week", new Date(2026, 10, 11));

  assert.deepEqual(spans, {
    current: { startDate: "2026-11-09", endDate: "2026-11-11" },
    previous: { startDate: "2026-11-02", endDate: "2026-11-04" },
  });
});

test("mid year compares January to the same day of the previous year", () => {
  const spans = getComparisonSpans("year", new Date(2026, 2, 10));

  assert.deepEqual(spans, {
    current: { startDate: "2026-01-01", endDate: "2026-03-10" },
    previous: { startDate: "2025-01-01", endDate: "2025-03-10" },
  });
});

test("the leap day is compared with the last day of February", () => {
  const spans = getComparisonSpans("year", new Date(2028, 1, 29));

  assert.deepEqual(spans.previous, {
    startDate: "2027-01-01",
    endDate: "2027-02-28",
  });
});

test("a week crossing the clock change keeps its seven days", () => {
  const spans = getComparisonSpans("week", new Date(2026, 9, 25));

  assert.deepEqual(spans, {
    current: { startDate: "2026-10-19", endDate: "2026-10-25" },
    previous: { startDate: "2026-10-12", endDate: "2026-10-18" },
  });
});

test("the daily seconds inside a span are summed inclusively", () => {
  const dailySeconds = new Map([
    ["2026-09-30", 1_200],
    ["2026-10-01", 600],
    ["2026-10-15", 900],
    ["2026-10-16", 3_000],
  ]);

  assert.equal(
    sumSecondsInSpan(dailySeconds, {
      startDate: "2026-10-01",
      endDate: "2026-10-15",
    }),
    1_500,
  );
});

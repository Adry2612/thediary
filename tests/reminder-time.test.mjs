import assert from "node:assert/strict";
import test from "node:test";
import {
  addDaysToDateKey,
  daysBetweenDateKeys,
  getDateKeyWeekday,
  getEndOfLocalDay,
  getZonedDateKey,
  getZonedTimeKey,
  localDateTimeToUtc,
} from "../src/utils/reminder-time.ts";

test("reads a date and a time in the device zone", () => {
  const instant = "2026-07-01T23:30:00.000Z";
  assert.equal(getZonedDateKey(instant, "America/New_York"), "2026-07-01");
  assert.equal(getZonedTimeKey(instant, "America/New_York"), "19:30");
  assert.equal(getZonedDateKey(instant, "Europe/Madrid"), "2026-07-02");
  assert.equal(getZonedTimeKey(instant, "Europe/Madrid"), "01:30");
});

test("resolves a wall time in a zone west of Greenwich", () => {
  const instant = localDateTimeToUtc("2026-07-01", "19:00", "America/New_York");
  assert.equal(instant.toISOString(), "2026-07-01T23:00:00.000Z");
});

test("resolves Madrid before the spring change", () => {
  const instant = localDateTimeToUtc("2026-03-28", "19:00", "Europe/Madrid");
  assert.equal(instant.toISOString(), "2026-03-28T18:00:00.000Z");
});

test("moves a nonexistent spring time to the next valid instant", () => {
  const instant = localDateTimeToUtc("2026-03-29", "02:30", "Europe/Madrid");
  assert.equal(instant.toISOString(), "2026-03-29T01:30:00.000Z");
  assert.equal(getZonedTimeKey(instant, "Europe/Madrid"), "03:30");
});

test("resolves an ambiguous autumn time deterministically", () => {
  const instant = localDateTimeToUtc("2026-10-25", "02:30", "Europe/Madrid");
  assert.equal(instant.toISOString(), "2026-10-25T01:30:00.000Z");
  assert.equal(getZonedTimeKey(instant, "Europe/Madrid"), "02:30");
});

test("adds days across month and year boundaries", () => {
  assert.equal(addDaysToDateKey("2026-12-31", 1), "2027-01-01");
  assert.equal(addDaysToDateKey("2026-03-01", -1), "2026-02-28");
  assert.equal(addDaysToDateKey("2028-02-28", 1), "2028-02-29");
  assert.equal(addDaysToDateKey("2026-01-01", 365), "2027-01-01");
});

test("computes the local weekday of a date key", () => {
  assert.equal(getDateKeyWeekday("2026-11-04"), 3);
  assert.equal(getDateKeyWeekday("2026-11-08"), 0);
});

test("counts whole days between two local dates", () => {
  assert.equal(daysBetweenDateKeys("2026-11-01", "2026-11-04"), 3);
  assert.equal(daysBetweenDateKeys("2026-11-04", "2026-11-01"), -3);
  assert.equal(daysBetweenDateKeys("2026-12-31", "2027-01-01"), 1);
});

test("the end of a local day is just before the next local midnight", () => {
  const end = getEndOfLocalDay("2026-03-29", "Europe/Madrid");
  assert.equal(end.toISOString(), "2026-03-29T21:59:59.999Z");
});

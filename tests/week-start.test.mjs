import assert from "node:assert/strict";
import test from "node:test";
import {
  getCalendarFirstWeekday,
  getStartOfWeek,
  getWeekdayOrder,
  getWeekStartOffset,
} from "../src/utils/week-start.ts";

test("measures the days to the start of the week from either first day", () => {
  const wednesday = new Date(2026, 9, 7);

  assert.equal(getWeekStartOffset(wednesday, "monday"), 2);
  assert.equal(getWeekStartOffset(wednesday, "sunday"), 3);
});

test("orders the weekdays from the chosen first day", () => {
  assert.deepEqual(getWeekdayOrder("monday"), [1, 2, 3, 4, 5, 6, 0]);
  assert.deepEqual(getWeekdayOrder("sunday"), [0, 1, 2, 3, 4, 5, 6]);
});

test("resolves the local start of the week", () => {
  const wednesday = new Date(2026, 9, 7, 18, 30);

  assert.equal(getStartOfWeek(wednesday, "monday").getDate(), 5);
  assert.equal(getStartOfWeek(wednesday, "sunday").getDate(), 4);
});

test("places January 1st in its column for the annual grid", () => {
  assert.equal(getCalendarFirstWeekday(2026, "monday"), 3);
  assert.equal(getCalendarFirstWeekday(2026, "sunday"), 4);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  formatClockInput,
  formatOvertimeInput,
  parseClockInput,
} from "../src/utils/clock-time.ts";

test("parses seconds, m:ss and h:mm:ss", () => {
  assert.equal(parseClockInput("83"), 83);
  assert.equal(parseClockInput("1:23"), 83);
  assert.equal(parseClockInput("1:02:03"), 3723);
  assert.equal(parseClockInput("0:00"), 0);
  assert.equal(parseClockInput("  2:05 "), 125);
});

test("rejects negative, decimal, overflowing and malformed times", () => {
  assert.equal(parseClockInput(""), null);
  assert.equal(parseClockInput("-1"), null);
  assert.equal(parseClockInput("1.5"), null);
  assert.equal(parseClockInput("abc"), null);
  assert.equal(parseClockInput("1:60"), null);
  assert.equal(parseClockInput("1:02:60"), null);
  assert.equal(parseClockInput("24:00:00"), null);
  assert.equal(parseClockInput("1:2:3:4"), null);
});

test("formats times as m:ss and h:mm:ss", () => {
  assert.equal(formatClockInput(0), "0:00");
  assert.equal(formatClockInput(83), "1:23");
  assert.equal(formatClockInput(3723), "1:02:03");
});

test("formats overtime with a plus sign and hides zero", () => {
  assert.equal(formatOvertimeInput(0), "");
  assert.equal(formatOvertimeInput(12), "+0:12");
  assert.equal(formatOvertimeInput(3723), "+1:02:03");
});

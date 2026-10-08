import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  assignRoutineToWeekday,
  normalizeWeeklyRoutineSchedule,
  removeRoutineFromSchedule,
} from "../src/lib/weekly-routine-schedule.ts";

test("normalizes missing and malformed weekday assignments", () => {
  assert.deepEqual(
    normalizeWeeklyRoutineSchedule({ 1: "routine-a", 2: "", 8: "unknown" }),
    {
      0: null,
      1: "routine-a",
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
    },
  );
  assert.deepEqual(
    normalizeWeeklyRoutineSchedule(null),
    DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  );
});

test("assigns a routine to one weekday without changing the original schedule", () => {
  const nextSchedule = assignRoutineToWeekday(
    DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
    1,
    "routine-a",
  );

  assert.equal(nextSchedule[1], "routine-a");
  assert.equal(nextSchedule[2], null);
  assert.equal(DEFAULT_WEEKLY_ROUTINE_SCHEDULE[1], null);
});

test("removes every weekday assignment for a deleted routine only", () => {
  const schedule = {
    ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
    1: "routine-a",
    3: "routine-a",
    5: "routine-b",
  };

  assert.deepEqual(removeRoutineFromSchedule(schedule, "routine-a"), {
    ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
    5: "routine-b",
  });
});

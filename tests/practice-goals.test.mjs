import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PRACTICE_GOALS,
  adjustPracticeGoal,
  getPracticeIntensityLevel,
  normalizePracticeGoals,
} from "../src/lib/practice-goals.ts";

test("scales calendar intensity by the daily practice goal", () => {
  assert.equal(getPracticeIntensityLevel(0, 60), 0);
  assert.equal(getPracticeIntensityLevel(10, 60), 1);
  assert.equal(getPracticeIntensityLevel(20, 60), 2);
  assert.equal(getPracticeIntensityLevel(40, 60), 3);
  assert.equal(getPracticeIntensityLevel(60, 60), 4);
  assert.equal(getPracticeIntensityLevel(80, 60), 4);
});

test("migrates the weekly time target to a bounded weekly day target", () => {
  assert.deepEqual(
    normalizePracticeGoals({ dailyMinutes: 90, weeklyMinutes: 420 }),
    { dailyMinutes: 90, weeklyDays: 5 },
  );
  assert.deepEqual(
    normalizePracticeGoals({ dailyMinutes: 30, weeklyDays: 7 }),
    { dailyMinutes: 30, weeklyDays: 7 },
  );
  assert.deepEqual(
    normalizePracticeGoals({ dailyMinutes: 30, weeklyDays: 8 }),
    { dailyMinutes: 30, weeklyDays: 5 },
  );
  assert.deepEqual(
    normalizePracticeGoals({ dailyMinutes: -1, weeklyMinutes: "30" }),
    DEFAULT_PRACTICE_GOALS,
  );
});

test("adjusts practice goals in five-minute steps without crossing limits", () => {
  assert.equal(adjustPracticeGoal(30, 1, 60), 35);
  assert.equal(adjustPracticeGoal(5, -1, 60), 5);
  assert.equal(adjustPracticeGoal(60, 1, 60), 60);
  assert.equal(adjustPracticeGoal(6, 1, 7, 1, 1), 7);
  assert.equal(adjustPracticeGoal(1, -1, 7, 1, 1), 1);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PRACTICE_GOALS,
  normalizePracticeGoals,
} from "../src/lib/practice-goals.ts";
import {
  DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  normalizeWeeklyRoutineSchedule,
} from "../src/lib/weekly-routine-schedule.ts";
import { normalizePracticeStorageState } from "../src/stores/normalizePracticeStorageState.ts";

const normalizers = {
  normalizeGoals: normalizePracticeGoals,
  normalizeSchedule: normalizeWeeklyRoutineSchedule,
};

test("uses safe defaults when persisted state is absent", () => {
  assert.deepEqual(normalizePracticeStorageState({
    state: undefined,
    ...normalizers,
  }), {
    history: [],
    templates: [],
    repertoireItems: [],
    weeklySchedule: DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
    practiceGoals: DEFAULT_PRACTICE_GOALS,
  });
});

test("preserves valid collections and normalizes optional persisted settings", () => {
  const history = [{ id: "session-1" }];
  const templates = [{ id: "template-1" }];
  const repertoireItems = [{ id: "item-1" }];

  assert.deepEqual(
    normalizePracticeStorageState({
      state: {
        history,
        templates,
        repertoireItems,
        weeklySchedule: { 1: "routine-1", 2: " " },
        practiceGoals: { dailyMinutes: 90, weeklyDays: 3 },
      },
      ...normalizers,
    }),
    {
      history,
      templates,
      repertoireItems,
      weeklySchedule: {
        0: null,
        1: "routine-1",
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
      },
      practiceGoals: { dailyMinutes: 90, weeklyDays: 3 },
    },
  );
});

test("replaces malformed collections and settings with defaults", () => {
  assert.deepEqual(
    normalizePracticeStorageState({
      state: {
        history: null,
        templates: {},
        repertoireItems: null,
        weeklySchedule: null,
        practiceGoals: { dailyMinutes: -1, weeklyDays: 10 },
      },
      ...normalizers,
    }),
    {
      history: [],
      templates: [],
      repertoireItems: [],
      weeklySchedule: DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
      practiceGoals: DEFAULT_PRACTICE_GOALS,
    },
  );
});

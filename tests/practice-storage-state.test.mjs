import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PRACTICE_GOALS,
  normalizePracticeGoals,
} from "../src/utils/practice-goals.ts";
import {
  DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  normalizeWeeklyRoutineSchedule,
} from "../src/utils/weekly-routine-schedule.ts";
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
    licks: [],
    customChords: [],
    weeklySchedule: DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
    practiceGoals: DEFAULT_PRACTICE_GOALS,
  });
});

test("preserves valid collections and normalizes optional persisted settings", () => {
  const history = [{
    id: "session-1",
    skillSeconds: {
      technique: 60,
      theory: 0,
      repertoire: 0,
      improvisation: 0,
    },
  }];
  const templates = [{ id: "template-1" }];
  const repertoireItems = [{ id: "item-1", kind: "song" }];
  const licks = [{
    id: "lick-1",
    title: "Frase",
    tabContent: "",
    techniques: [],
    bpmHistory: [],
    createdAt: "2000-01-01T00:00:00.000Z",
    practiceCount: 0,
  }];
  const customChords = [{ id: "chord-1", name: "Cadd9" }];

  assert.deepEqual(
    normalizePracticeStorageState({
      state: {
        history,
        templates,
        repertoireItems,
        licks,
        customChords,
        weeklySchedule: { 1: "routine-1", 2: " " },
        practiceGoals: { dailyMinutes: 90, weeklyDays: 3 },
      },
      ...normalizers,
    }),
    {
      history: [{
        ...history[0],
        skillSeconds: {
          technique: 60,
          theory: 0,
          repertoire: 0,
          lick: 0,
          improvisation: 0,
        },
      }],
      templates,
      repertoireItems,
      licks: [
        {
          id: "lick-1",
          title: "Frase",
          tabContent: "",
          techniques: [],
          bpmHistory: [],
          createdAt: "2000-01-01T00:00:00.000Z",
          practiceCount: 0,
        },
      ],
      customChords,
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

test("fills the lick category in sessions saved before it existed", () => {
  const [session] = normalizePracticeStorageState({
    state: {
      history: [{
        id: "session-1",
        skillSeconds: {
          technique: 60,
          theory: 0,
          repertoire: 0,
          improvisation: 30,
        },
      }],
    },
    ...normalizers,
  }).history;

  assert.deepEqual(session.skillSeconds, {
    technique: 60,
    theory: 0,
    repertoire: 0,
    lick: 0,
    improvisation: 30,
  });
});

test("replaces malformed collections and settings with defaults", () => {
  assert.deepEqual(
    normalizePracticeStorageState({
      state: {
        history: null,
        templates: {},
        repertoireItems: null,
        licks: null,
        customChords: null,
        weeklySchedule: null,
        practiceGoals: { dailyMinutes: -1, weeklyDays: 10 },
      },
      ...normalizers,
    }),
    {
      history: [],
      templates: [],
      repertoireItems: [],
      licks: [],
      customChords: [],
      weeklySchedule: DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
      practiceGoals: DEFAULT_PRACTICE_GOALS,
    },
  );
});

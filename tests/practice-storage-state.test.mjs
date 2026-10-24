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

test("keeps a valid guitar type and per-block BPM and drops invalid values", () => {
  const state = normalizePracticeStorageState({
    state: {
      history: [
        {
          id: "valid",
          guitarType: "electric",
          skillSeconds: { technique: 60 },
          phases: [
            {
              id: 1,
              name: "Escalas",
              skill: "technique",
              elapsedSeconds: 60,
              averageBpm: 100,
            },
          ],
        },
        {
          id: "invalid",
          guitarType: "classical",
          skillSeconds: { technique: 60 },
          phases: [
            {
              id: 1,
              name: "Escalas",
              skill: "technique",
              elapsedSeconds: 60,
              averageBpm: 0,
            },
          ],
        },
        {
          id: "legacy",
          skillSeconds: { technique: 60 },
        },
      ],
    },
    ...normalizers,
  });

  assert.equal(state.history[0].guitarType, "electric");
  assert.equal(state.history[0].phases?.[0].averageBpm, 100);
  assert.equal("guitarType" in state.history[1], false);
  assert.equal("averageBpm" in (state.history[1].phases?.[0] ?? {}), false);
  assert.equal("guitarType" in state.history[2], false);
  assert.equal(state.history[2].skillSeconds.lick, 0);
});

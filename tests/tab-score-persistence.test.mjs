import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyScore } from "../src/utils/tab-score/model.ts";
import { resolveTabScore } from "../src/utils/tab-score/resolve.ts";
import { normalizeLick } from "../src/utils/licks/normalize.ts";
import { normalizePracticeStorageState } from "../src/stores/normalizePracticeStorageState.ts";
import {
  DEFAULT_PRACTICE_GOALS,
  normalizePracticeGoals,
} from "../src/utils/practice-goals.ts";
import {
  DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  normalizeWeeklyRoutineSchedule,
} from "../src/utils/weekly-routine-schedule.ts";

const grid = {
  tuning: "EADGBE",
  measures: 1,
  subdivision: 4,
  notes: [{ string: 0, column: 0, fret: 3 }],
};

const normalizers = {
  normalizeGoals: normalizePracticeGoals,
  normalizeSchedule: normalizeWeeklyRoutineSchedule,
};

function scoreWithTempo(tempo) {
  const score = createEmptyScore();
  return { ...score, tempo };
}

function lick(overrides = {}) {
  return {
    id: "lick-1",
    title: "Frase",
    techniques: [],
    bpmHistory: [],
    createdAt: "2000-01-01T00:00:00.000Z",
    practiceCount: 0,
    ...overrides,
  };
}

test("the saved score wins over the grid tab", () => {
  const score = scoreWithTempo(120);
  const resolved = resolveTabScore({ score, tab: grid });

  assert.equal(resolved.tempo, 120);
});

test("an invalid score falls back to migrating the grid tab", () => {
  const resolved = resolveTabScore({
    score: { version: 99, bars: [] },
    tab: grid,
  });

  assert.equal(resolved.tempo, 90);
  assert.equal(resolved.bars[0].beats[0].notes[0].fret, 3);
});

test("without a score the grid tab is migrated", () => {
  const resolved = resolveTabScore({ tab: grid });

  assert.equal(resolved.version, 2);
  assert.equal(resolved.bars.length, 1);
  assert.equal(resolved.bars[0].beats[0].notes[0].fret, 3);
});

test("without a score or a tab an empty score is returned", () => {
  const resolved = resolveTabScore({ tuning: "DADGAD" });

  assert.equal(resolved.tuning, "DADGAD");
  assert.equal(resolved.bars.length, 1);
  assert.equal(resolved.bars[0].beats[0].rest, true);
});

test("resolving does not mutate or write the grid tab", () => {
  const tab = structuredClone(grid);
  const before = structuredClone(tab);
  resolveTabScore({ tab });

  assert.deepEqual(tab, before);
});

test("normalizing a lick keeps a valid score and its tab", () => {
  const score = scoreWithTempo(120);
  const normalized = normalizeLick(lick({ tab: structuredClone(grid), score }));

  assert.equal(normalized.score, score);
  assert.equal(normalized.tab.notes[0].fret, 3);
});

test("normalizing a lick drops an invalid score but keeps the tab", () => {
  const normalized = normalizeLick(
    lick({ tab: structuredClone(grid), score: { version: 3 } }),
  );

  assert.equal(normalized.score, undefined);
  assert.equal(normalized.tab.notes[0].fret, 3);
});

test("persisted repertoire items keep a valid score and the tab untouched", () => {
  const tab = structuredClone(grid);
  const score = scoreWithTempo(120);
  const state = normalizePracticeStorageState({
    state: {
      repertoireItems: [
        {
          id: "item-1",
          kind: "song",
          title: "Canción",
          parts: [],
          updatedAt: "2000-01-01T00:00:00.000Z",
          tab,
          score,
        },
      ],
      licks: [],
    },
    ...normalizers,
  });

  assert.equal(state.repertoireItems[0].tab, tab);
  assert.equal(state.repertoireItems[0].score, score);
});

test("persisted repertoire items drop an invalid score and keep the tab", () => {
  const tab = structuredClone(grid);
  const state = normalizePracticeStorageState({
    state: {
      repertoireItems: [
        {
          id: "item-1",
          kind: "song",
          title: "Canción",
          parts: [],
          updatedAt: "2000-01-01T00:00:00.000Z",
          tab,
          score: { version: 3 },
        },
      ],
      licks: [],
    },
    ...normalizers,
  });

  assert.equal(state.repertoireItems[0].score, undefined);
  assert.equal(state.repertoireItems[0].tab, tab);
});

test("the empty state still normalizes without scores", () => {
  const state = normalizePracticeStorageState({ state: undefined, ...normalizers });
  assert.deepEqual(state.repertoireItems, []);
  assert.deepEqual(state.licks, []);
  assert.deepEqual(state.weeklySchedule, DEFAULT_WEEKLY_ROUTINE_SCHEDULE);
  assert.deepEqual(state.practiceGoals, DEFAULT_PRACTICE_GOALS);
});

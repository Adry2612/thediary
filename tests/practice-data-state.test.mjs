import assert from "node:assert/strict";
import test from "node:test";
import {
  hasPracticeData,
  hasPracticeStateChanged,
  toPersistedSnapshot,
} from "../src/utils/practice-data-state.ts";
import { DEFAULT_PRACTICE_GOALS } from "../src/utils/practice-goals.ts";
import { DEFAULT_WEEKLY_ROUTINE_SCHEDULE } from "../src/utils/weekly-routine-schedule.ts";

function createEmptyState(overrides = {}) {
  return {
    history: [],
    templates: [],
    repertoireItems: [],
    licks: [],
    customChords: [],
    weeklySchedule: { ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE },
    practiceGoals: { ...DEFAULT_PRACTICE_GOALS },
    guitars: [],
    guitarEntries: [],
    ...overrides,
  };
}

test("a freshly created state holds no practice data", () => {
  assert.equal(hasPracticeData(createEmptyState()), false);
});

test("any populated collection counts as practice data", () => {
  assert.equal(hasPracticeData(createEmptyState({ history: [{ id: "s" }] })), true);
  assert.equal(hasPracticeData(createEmptyState({ templates: [{ id: "t" }] })), true);
  assert.equal(
    hasPracticeData(createEmptyState({ repertoireItems: [{ id: "r" }] })),
    true,
  );
  assert.equal(
    hasPracticeData(createEmptyState({ licks: [{ id: "l" }] })),
    true,
  );
  assert.equal(
    hasPracticeData(createEmptyState({ customChords: [{ id: "c" }] })),
    true,
  );
  assert.equal(
    hasPracticeData(createEmptyState({ guitars: [{ id: "g" }] })),
    true,
  );
  assert.equal(
    hasPracticeData(createEmptyState({ guitarEntries: [{ id: "e" }] })),
    true,
  );
});

test("a routine assigned to a weekday counts as practice data", () => {
  const weeklySchedule = { ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE, 2: "routine-1" };

  assert.equal(hasPracticeData(createEmptyState({ weeklySchedule })), true);
});

test("changed practice goals count as practice data, unset ones do not", () => {
  assert.equal(
    hasPracticeData(
      createEmptyState({
        practiceGoals: { ...DEFAULT_PRACTICE_GOALS, dailyMinutes: 30 },
      }),
    ),
    true,
  );
  assert.equal(
    hasPracticeData(
      createEmptyState({
        practiceGoals: { ...DEFAULT_PRACTICE_GOALS, weeklyDays: 7 },
      }),
    ),
    true,
  );
  assert.equal(
    hasPracticeData(
      createEmptyState({ practiceGoals: { ...DEFAULT_PRACTICE_GOALS } }),
    ),
    false,
  );
});

test("reports a change when zustand replaces one of the saved parts", () => {
  const previous = createEmptyState();
  const current = createEmptyState({ history: [{ id: "s" }] });

  assert.equal(hasPracticeStateChanged(current, previous), true);
});

test("reports no change when the parts are the same references", () => {
  const previous = createEmptyState();
  const current = { ...previous };

  assert.equal(hasPracticeStateChanged(current, previous), false);
});

test("ignores changes in the parts that are not saved", () => {
  const previous = createEmptyState();
  const current = { ...previous, isSaving: true, hasHydrated: true };

  assert.equal(hasPracticeStateChanged(current, previous), false);
});

test("copies only the persisted parts into the snapshot", () => {
  const state = createEmptyState({ hasHydrated: true, isSaving: false });
  const snapshot = toPersistedSnapshot(state);

  assert.deepEqual(Object.keys(snapshot).sort(), [
    "customChords",
    "guitarEntries",
    "guitars",
    "history",
    "licks",
    "practiceGoals",
    "repertoireItems",
    "templates",
    "weeklySchedule",
  ]);
  assert.equal(snapshot.history, state.history);
  assert.equal(snapshot.practiceGoals, state.practiceGoals);
});

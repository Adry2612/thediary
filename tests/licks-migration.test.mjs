import assert from "node:assert/strict";
import test from "node:test";
import { migrateRepertoireLicks } from "../src/lib/licks/migration.ts";
import { normalizePracticeStorageState } from "../src/stores/normalizePracticeStorageState.ts";
import {
  DEFAULT_PRACTICE_GOALS,
  normalizePracticeGoals,
} from "../src/lib/practice-goals.ts";
import {
  DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  normalizeWeeklyRoutineSchedule,
} from "../src/lib/weekly-routine-schedule.ts";

function legacyLick(overrides = {}) {
  return {
    id: "legacy-lick",
    kind: "lick",
    title: "Pentatónica en Mi menor",
    parts: [],
    updatedAt: "2026-01-02T03:04:05.000Z",
    tab: {
      tuning: "EADGBE",
      measures: 1,
      subdivision: 4,
      notes: [{ string: 0, column: 0, fret: 5 }],
    },
    ...overrides,
  };
}

test("migrates a repertoire lick and removes it from the repertoire", () => {
  const result = migrateRepertoireLicks(
    [legacyLick()],
    [],
    new Date("2026-03-01T00:00:00.000Z"),
  );

  assert.deepEqual(result.repertoireItems, []);
  assert.equal(result.licks.length, 1);
  const lick = result.licks[0];
  assert.equal(lick.id, "legacy-lick");
  assert.equal(lick.title, "Pentatónica en Mi menor");
  assert.match(lick.tabContent, /E \|5/);
  assert.equal(lick.key, undefined);
  assert.deepEqual(lick.techniques, []);
  assert.deepEqual(lick.bpmHistory, []);
  assert.equal(lick.practiceCount, 0);
  assert.equal(lick.createdAt, "2026-01-02T03:04:05.000Z");
});

test("keeps songs untouched", () => {
  const song = { id: "song-1", kind: "song", title: "Canción" };

  const result = migrateRepertoireLicks([song], []);

  assert.deepEqual(result.repertoireItems, [song]);
  assert.deepEqual(result.licks, []);
});

test("running the migration again creates no duplicates", () => {
  const first = migrateRepertoireLicks([legacyLick()], []);
  const second = migrateRepertoireLicks(
    first.repertoireItems,
    first.licks,
  );

  assert.equal(second.repertoireItems.length, 0);
  assert.equal(second.licks.length, 1);
  assert.equal(second.licks[0].id, "legacy-lick");
});

test("an existing lick with the same id wins and the source is removed", () => {
  const existing = {
    id: "legacy-lick",
    title: "Ya migrado",
    tabContent: "texto",
    techniques: [],
    bpmHistory: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    practiceCount: 3,
  };

  const result = migrateRepertoireLicks([legacyLick()], [existing]);

  assert.equal(result.licks.length, 1);
  assert.equal(result.licks[0].title, "Ya migrado");
  assert.equal(result.repertoireItems.length, 0);
});

test("a lick that cannot be converted stays in the repertoire", () => {
  const broken = legacyLick({ tab: { notes: null } });

  const result = migrateRepertoireLicks([broken], []);

  assert.equal(result.repertoireItems.length, 1);
  assert.equal(result.licks.length, 0);
});

test("the storage normalization runs the migration", () => {
  const normalized = normalizePracticeStorageState({
    state: {
      history: [],
      templates: [],
      repertoireItems: [legacyLick()],
      licks: [],
      customChords: [],
      weeklySchedule: null,
      practiceGoals: null,
    },
    normalizeGoals: normalizePracticeGoals,
    normalizeSchedule: normalizeWeeklyRoutineSchedule,
  });

  assert.deepEqual(normalized.repertoireItems, []);
  assert.equal(normalized.licks.length, 1);
  assert.deepEqual(normalized.weeklySchedule, {
    ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  });
  assert.deepEqual(normalized.practiceGoals, {
    ...DEFAULT_PRACTICE_GOALS,
  });
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  getDefaultLickId,
  getLicksSummary,
  getSortedLicks,
  getVisibleLicks,
} from "../src/lib/licks/library.ts";

const base = {
  id: "lick",
  title: "Frase",
  tabContent: "",
  techniques: [],
  bpmHistory: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  practiceCount: 0,
};

test("sorts practised licks first, then by title", () => {
  const licks = [
    { ...base, id: "b", title: "Beta", lastPracticedAt: "2026-02-01T00:00:00.000Z" },
    { ...base, id: "a", title: "Alfa", lastPracticedAt: "2026-03-01T00:00:00.000Z" },
    { ...base, id: "d", title: "Delta" },
    { ...base, id: "c", title: "Charlie" },
  ];
  assert.deepEqual(
    getSortedLicks(licks).map((lick) => lick.id),
    ["a", "b", "c", "d"],
  );
  assert.equal(getDefaultLickId(licks), "a");
});

test("search filters by title without losing the order", () => {
  const licks = [
    { ...base, id: "a", title: "Pentatónica en Mi" },
    { ...base, id: "b", title: "Barrido en La" },
    { ...base, id: "c", title: "Pentatónica en Sol" },
  ];
  assert.deepEqual(
    getVisibleLicks(licks, "pentatónica").map((lick) => lick.id).sort(),
    ["a", "c"],
  );
  assert.equal(getVisibleLicks(licks, "   ").length, 3);
  assert.equal(getVisibleLicks(licks, "zzz").length, 0);
});

test("summary counts licks with BPM, techniques and keys in use", () => {
  const summary = getLicksSummary([
    {
      ...base,
      id: "a",
      techniques: ["LEGATO", "TAPPING"],
      key: "Am",
      currentBpm: 120,
    },
    { ...base, id: "b", techniques: ["LEGATO"], key: "Am" },
    { ...base, id: "c" },
  ]);
  assert.deepEqual(summary, {
    total: 3,
    withBpm: 1,
    techniques: 2,
    keys: 1,
  });
});

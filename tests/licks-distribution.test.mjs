import assert from "node:assert/strict";
import test from "node:test";
import {
  getKeyDistribution,
  getTechniqueDistribution,
} from "../src/utils/licks/distribution.ts";

const base = {
  id: "lick",
  title: "Frase",
  tabContent: "",
  bpmHistory: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  practiceCount: 0,
};

test("a single technique takes the whole share", () => {
  const distribution = getTechniqueDistribution([
    { ...base, techniques: ["LEGATO"] },
  ]);
  assert.equal(distribution.total, 1);
  assert.deepEqual(distribution.groups, [
    {
      id: "LEGATO",
      labelKey: "techniqueLegato",
      count: 1,
      percentage: 100,
    },
  ]);
});

test("multi-technique licks count in each technique but once as a lick", () => {
  const distribution = getTechniqueDistribution([
    { ...base, id: "a", techniques: ["LEGATO", "TAPPING"] },
    { ...base, id: "b", techniques: ["LEGATO"] },
  ]);
  assert.equal(distribution.total, 2);
  const legato = distribution.groups.find((group) => group.id === "LEGATO");
  const tapping = distribution.groups.find((group) => group.id === "TAPPING");
  assert.equal(legato?.count, 2);
  assert.equal(legato?.percentage, 100);
  assert.equal(tapping?.count, 1);
  assert.equal(tapping?.percentage, 50);
});

test("licks without techniques are grouped as unclassified", () => {
  const distribution = getTechniqueDistribution([
    { ...base, id: "a", techniques: [] },
    { ...base, id: "b", techniques: ["SLIDE"] },
  ]);
  assert.deepEqual(
    distribution.groups.map((group) => [group.id, group.percentage]),
    [
      ["SLIDE", 50],
      ["UNCLASSIFIED", 50],
    ],
  );
});

test("keys are grouped by name and keyless licks stay unclassified", () => {
  const distribution = getKeyDistribution([
    { ...base, id: "a", key: "Am" },
    { ...base, id: "b", key: "Am" },
    { ...base, id: "c", key: undefined },
  ]);
  assert.equal(distribution.total, 3);
  assert.deepEqual(distribution.groups, [
    { id: "Am", name: "Am", count: 2, percentage: 67 },
    {
      id: "UNCLASSIFIED",
      count: 1,
      percentage: 33,
      unclassified: true,
    },
  ]);
});

test("an empty library has no groups", () => {
  assert.deepEqual(getTechniqueDistribution([]), { total: 0, groups: [] });
  assert.deepEqual(getKeyDistribution([]), { total: 0, groups: [] });
});

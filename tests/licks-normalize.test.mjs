import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLick, normalizeLicks } from "../src/utils/licks/normalize.ts";

const base = {
  id: "lick-1",
  title: "Frase",
  tabContent: "e|---|",
  techniques: ["LEGATO"],
  bpmHistory: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  practiceCount: 2,
};

test("keeps a valid lick", () => {
  const lick = normalizeLick(base);
  assert.ok(lick);
  assert.equal(lick.id, "lick-1");
  assert.deepEqual(lick.techniques, ["LEGATO"]);
  assert.equal(lick.practiceCount, 2);
});

test("keeps the lick's Guitar Pro material and drops invalid resources", () => {
  const lick = normalizeLick({
    ...base,
    resources: [
      {
        id: "material-1",
        title: "Riff.gp",
        kind: "guitarpro",
        assetId: "asset-1",
        fileName: "Riff.gp",
      },
      {
        id: "old-tab",
        title: "TAB antigua",
        kind: "tab",
        text: "e|---|",
      },
    ],
  });

  assert.ok(lick);
  assert.deepEqual(lick.resources, [
    {
      id: "material-1",
      title: "Riff.gp",
      kind: "guitarpro",
      assetId: "asset-1",
      fileName: "Riff.gp",
    },
  ]);
});

test("discards the retired tablature fields", () => {
  const lick = normalizeLick({
    ...base,
    tab: { tuning: "EADGBE", measures: 1, subdivision: 4, notes: [] },
    score: { version: 2, tuning: "EADGBE", tempo: 90, bars: [] },
  });

  assert.ok(lick);
  assert.equal("tab" in lick, false);
  assert.equal("score" in lick, false);
  assert.equal("tabContent" in lick, false);
});

test("keeps a valid reference video and drops a broken one", () => {
  const valid = normalizeLick({
    ...base,
    referenceVideo: {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      startSeconds: 83,
      endSeconds: 95,
    },
  });
  assert.deepEqual(valid?.referenceVideo, {
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    startSeconds: 83,
    endSeconds: 95,
  });

  const broken = normalizeLick({
    ...base,
    referenceVideo: {
      url: "https://vimeo.com/1",
      startSeconds: 10,
      endSeconds: 5,
    },
  });
  assert.ok(broken);
  assert.equal(broken.referenceVideo, undefined);
  assert.equal(broken.title, "Frase");
});

test("loads an old lick without a reference video", () => {
  const lick = normalizeLick(base);
  assert.ok(lick);
  assert.equal(lick.referenceVideo, undefined);
});

test("drops only invalid values, not the lick", () => {
  const lick = normalizeLick({
    ...base,
    key: "H",
    techniques: ["LEGATO", "INVENTED"],
    targetBpm: 900,
    associatedSongId: "",
    practiceCount: -3,
    lastPracticedAt: "not a date",
  });
  assert.ok(lick);
  assert.equal(lick.key, undefined);
  assert.deepEqual(lick.techniques, ["LEGATO"]);
  assert.equal(lick.targetBpm, undefined);
  assert.equal(lick.associatedSongId, undefined);
  assert.equal(lick.practiceCount, 0);
  assert.equal(lick.lastPracticedAt, undefined);
});

test("current BPM mirrors the last valid history entry", () => {
  const lick = normalizeLick({
    ...base,
    currentBpm: 1,
    bpmHistory: [
      { id: "b", bpm: 120, date: "2026-01-03T00:00:00.000Z" },
      { id: "a", bpm: 100, date: "2026-01-02T00:00:00.000Z" },
      { id: "c", bpm: 999, date: "2026-01-04T00:00:00.000Z" },
    ],
  });
  assert.ok(lick);
  assert.equal(lick.currentBpm, 120);
  assert.deepEqual(
    lick.bpmHistory.map((entry) => entry.id),
    ["a", "b"],
  );
});

test("drops history entries with invalid values", () => {
  const lick = normalizeLick({
    ...base,
    bpmHistory: [
      {
        id: "entry-1",
        bpm: "120",
        date: "2026-01-03T00:00:00.000Z",
      },
    ],
  });
  assert.ok(lick);
  assert.deepEqual(lick.bpmHistory, []);
  assert.equal(lick.title, "Frase");
});

test("gives history entries a stable id when it is missing", () => {
  const lick = normalizeLick({
    ...base,
    bpmHistory: [{ bpm: 90, date: "2026-01-03T00:00:00.000Z" }],
  });
  assert.ok(lick);
  assert.equal(lick.bpmHistory[0].id, "bpm-00");
});

test("rejects items without an id and de-duplicates the collection", () => {
  assert.equal(normalizeLick({ ...base, id: "" }), null);
  assert.equal(normalizeLick(null), null);
  const licks = normalizeLicks([
    base,
    { ...base, title: "Otra" },
    { ...base, id: "lick-2", title: "Segunda" },
  ]);
  assert.equal(licks.length, 2);
  assert.equal(licks.find((lick) => lick.id === "lick-1")?.title, "Otra");
});

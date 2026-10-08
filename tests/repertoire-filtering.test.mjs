import assert from "node:assert/strict";
import test from "node:test";
import {
  getFilteredRepertoireItems,
  getRecentRepertoireItems,
  isRepertoireProgressFilter,
  isRepertoireSortOrder,
} from "../src/lib/repertoire-filtering.ts";

const items = [
  {
    id: "song-2",
    kind: "song",
    title: "Luna Roja",
    artist: "Sofía",
    parts: [{ id: "solo", name: "Solo", learned: false }],
    updatedAt: "2026-10-02T12:00:00.000Z",
  },
  {
    id: "song-1",
    kind: "song",
    title: "Canción Azul",
    artist: "Norte",
    parts: [{ id: "bridge", name: "Puente", learned: true }],
    updatedAt: "2026-10-01T12:00:00.000Z",
  },
  {
    id: "lick-1",
    kind: "lick",
    title: "Frase breve",
    parts: [{ id: "main", name: "Principal", learned: false }],
    updatedAt: "2026-10-03T12:00:00.000Z",
  },
];

const emptyStats = new Map();
const defaultFilters = {
  query: "",
  kind: "all",
  progress: "all",
  sort: "original",
};

test("recognizes only supported repertoire progress and sorting options", () => {
  for (const progress of ["all", "learning", "learned"]) {
    assert.equal(isRepertoireProgressFilter(progress), true);
  }
  for (const sort of ["original", "recent", "title", "artist", "practice"]) {
    assert.equal(isRepertoireSortOrder(sort), true);
  }

  assert.equal(isRepertoireProgressFilter("unknown"), false);
  assert.equal(isRepertoireSortOrder("unknown"), false);
});

test("searches song title, artist, and part names without accent sensitivity", () => {
  const titleResults = getFilteredRepertoireItems(
    items,
    { ...defaultFilters, query: "cancion azul" },
    emptyStats,
  );
  const partResults = getFilteredRepertoireItems(
    items,
    { ...defaultFilters, query: "PUENTE" },
    emptyStats,
  );
  const artistResults = getFilteredRepertoireItems(
    items,
    { ...defaultFilters, query: "sofia" },
    emptyStats,
  );

  assert.deepEqual(titleResults.map((item) => item.id), ["song-1"]);
  assert.deepEqual(partResults.map((item) => item.id), ["song-1"]);
  assert.deepEqual(artistResults.map((item) => item.id), ["song-2"]);
});

test("combines kind and learning-status filters", () => {
  const result = getFilteredRepertoireItems(
    items,
    {
      ...defaultFilters,
      kind: "song",
      progress: "learned",
    },
    emptyStats,
  );

  assert.deepEqual(result.map((item) => item.id), ["song-1"]);
});

test("sorts by title, artist, and total linked practice time", () => {
  const practiceStats = new Map([
    ["song-1", new Map([["bridge", { practiceSeconds: 1200, sessionCount: 2 }]])],
    ["song-2", new Map([["solo", { practiceSeconds: 2400, sessionCount: 3 }]])],
  ]);
  const byTitle = getFilteredRepertoireItems(
    items,
    { ...defaultFilters, sort: "title" },
    practiceStats,
  );
  const byPractice = getFilteredRepertoireItems(
    items,
    { ...defaultFilters, sort: "practice" },
    practiceStats,
  );
  const byRecent = getFilteredRepertoireItems(
    items,
    { ...defaultFilters, sort: "recent" },
    practiceStats,
  );
  const byArtist = getFilteredRepertoireItems(
    items,
    { ...defaultFilters, sort: "artist" },
    practiceStats,
  );

  assert.deepEqual(byTitle.map((item) => item.id), [
    "song-1",
    "lick-1",
    "song-2",
  ]);
  assert.deepEqual(byPractice.map((item) => item.id), [
    "song-2",
    "song-1",
    "lick-1",
  ]);
  assert.deepEqual(byRecent.map((item) => item.id), [
    "lick-1",
    "song-2",
    "song-1",
  ]);
  assert.deepEqual(byArtist.map((item) => item.id), [
    "song-1",
    "song-2",
    "lick-1",
  ]);
});

test("sorts songs by artist and keeps songs without an artist after named artists", () => {
  const itemsWithUncreditedSong = [
    ...items,
    {
      ...items[0],
      id: "song-3",
      title: "Sin artista",
      artist: undefined,
    },
  ];
  const result = getFilteredRepertoireItems(
    itemsWithUncreditedSong,
    { ...defaultFilters, kind: "song", sort: "artist" },
    emptyStats,
  );

  assert.deepEqual(
    result.map((item) => item.id),
    ["song-1", "song-2", "song-3"],
  );
});

test("returns the four most recently updated repertoire items without reordering the source", () => {
  const sourceItems = [
    ...items,
    {
      ...items[0],
      id: "song-3",
      title: "Tema nuevo",
      updatedAt: "2026-10-04T12:00:00.000Z",
    },
    {
      ...items[0],
      id: "song-4",
      title: "Tema reciente",
      updatedAt: "2026-10-05T12:00:00.000Z",
    },
  ];
  const recentItems = getRecentRepertoireItems(sourceItems);

  assert.deepEqual(
    recentItems.map((item) => item.id),
    ["song-4", "song-3", "lick-1", "song-2"],
  );
  assert.deepEqual(sourceItems.map((item) => item.id), [
    "song-2",
    "song-1",
    "lick-1",
    "song-3",
    "song-4",
  ]);
});

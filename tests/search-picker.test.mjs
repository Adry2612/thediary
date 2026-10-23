import assert from "node:assert/strict";
import test from "node:test";
import { filterSearchPickerItems } from "../src/utils/search-picker.ts";

const items = [
  {
    id: "song-1",
    label: "Canción Azul",
    description: "Norte",
    searchText: "Canción Azul Norte Puente",
  },
  {
    id: "song-2",
    label: "Luna Roja",
    description: "Sofía",
    searchText: "Luna Roja Sofía Solo",
  },
  { id: "technique-1", label: "Púa alterna" },
  { id: "technique-2", label: "Legato" },
];

function ids(query) {
  return filterSearchPickerItems(items, query).map((item) => item.id);
}

test("filters by label, description and extra search text without accents", () => {
  assert.deepEqual(ids("cancion"), ["song-1"]);
  assert.deepEqual(ids("PUENTE"), ["song-1"]);
  assert.deepEqual(ids("sofia"), ["song-2"]);
  assert.deepEqual(ids("luna solo"), ["song-2"]);
  assert.deepEqual(ids("pua"), ["technique-1"]);
});

test("shows everything without a query and nothing when there are no matches", () => {
  assert.deepEqual(ids(""), [
    "song-1",
    "song-2",
    "technique-1",
    "technique-2",
  ]);
  assert.deepEqual(ids("   "), [
    "song-1",
    "song-2",
    "technique-1",
    "technique-2",
  ]);
  assert.deepEqual(ids("zzz"), []);
});

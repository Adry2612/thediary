import assert from "node:assert/strict";
import test from "node:test";
import { groupRepertoireItems } from "../src/utils/repertoire-grouping.ts";
import { createRepertoireItem } from "../src/utils/repertoire-item.ts";

const UNKNOWN_LABEL = "Sin dato";

function createItem(id, overrides = {}) {
  return createRepertoireItem({
    id,
    initialPartId: `${id}-part`,
    kind: "song",
    title: `Canción ${id}`,
    artist: "",
    updatedAt: "2026-10-17T10:00:00.000Z",
    ...overrides,
  });
}

test("groups the songs by artist in alphabetical order", () => {
  const items = [
    createItem("1", { artist: "Metallica" }),
    createItem("2", { artist: "AC/DC" }),
    createItem("3", { artist: "Metallica" }),
  ];

  const groups = groupRepertoireItems(items, "artist", {
    unknownLabel: UNKNOWN_LABEL,
  });

  assert.deepEqual(
    groups.map((group) => group.label),
    ["AC/DC", "Metallica"],
  );
  assert.deepEqual(
    groups.map((group) => group.items.map((item) => item.id)),
    [["2"], ["1", "3"]],
  );
});

test("groups the songs by album", () => {
  const items = [
    createItem("1", { album: "Ride the Lightning" }),
    createItem("2", { album: "Master of Puppets" }),
    createItem("3", { album: "Ride the Lightning" }),
  ];

  const groups = groupRepertoireItems(items, "album", {
    unknownLabel: UNKNOWN_LABEL,
  });

  assert.deepEqual(
    groups.map((group) => group.label),
    ["Master of Puppets", "Ride the Lightning"],
  );
  assert.deepEqual(groups[1].items.map((item) => item.id), ["1", "3"]);
});

test("merges spellings that differ in case and accents", () => {
  const items = [
    createItem("1", { artist: "Soda Stereo" }),
    createItem("2", { artist: "soda stereo" }),
    createItem("3", { artist: "SODA STÉREO" }),
  ];

  const groups = groupRepertoireItems(items, "artist", {
    unknownLabel: UNKNOWN_LABEL,
  });

  assert.equal(groups.length, 1);
  assert.equal(groups[0].label, "Soda Stereo");
  assert.deepEqual(groups[0].items.map((item) => item.id), ["1", "2", "3"]);
});

test("puts the songs without the value in a last group", () => {
  const items = [
    createItem("1", { artist: "Metallica" }),
    createItem("2"),
    createItem("3", { artist: "  " }),
    createItem("4", { artist: "AC/DC" }),
  ];

  const groups = groupRepertoireItems(items, "artist", {
    unknownLabel: UNKNOWN_LABEL,
  });

  assert.deepEqual(
    groups.map((group) => group.label),
    ["AC/DC", "Metallica", UNKNOWN_LABEL],
  );
  assert.deepEqual(groups.at(-1).items.map((item) => item.id), ["2", "3"]);
});

test("keeps the order of the songs inside each group", () => {
  const items = [
    createItem("1", { artist: "Metallica", title: "Z" }),
    createItem("2", { artist: "AC/DC" }),
    createItem("3", { artist: "Metallica", title: "A" }),
  ];

  const groups = groupRepertoireItems(items, "artist", {
    unknownLabel: UNKNOWN_LABEL,
  });

  assert.deepEqual(groups[1].items.map((item) => item.id), ["1", "3"]);
});

test("returns a single group when there is nothing to group", () => {
  const items = [createItem("1", { artist: "Metallica" })];

  const groups = groupRepertoireItems(items, "none", {
    unknownLabel: UNKNOWN_LABEL,
  });

  assert.equal(groups.length, 1);
  assert.equal(groups[0].label, "");
  assert.deepEqual(groups[0].items, items);
});

test("returns no groups for an empty list", () => {
  assert.deepEqual(
    groupRepertoireItems([], "artist", { unknownLabel: UNKNOWN_LABEL }),
    [],
  );
  assert.deepEqual(
    groupRepertoireItems([], "none", { unknownLabel: UNKNOWN_LABEL }),
    [],
  );
});

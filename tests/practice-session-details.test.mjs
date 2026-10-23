import assert from "node:assert/strict";
import test from "node:test";
import {
  getLinkedLickLabel,
  getLinkedRepertoirePartName,
  getLinkedRepertoireLabel,
  getPracticeBlockTitle,
} from "../src/utils/practice-session-details.ts";

test("returns the song and part labels for a valid repertoire link", () => {
  const phase = { repertoireItemId: "song-1", repertoirePartId: "part-2" };
  const repertoireItems = [
    {
      id: "song-1",
      title: "Canción",
      parts: [
        { id: "part-1", name: "Intro" },
        { id: "part-2", name: "Solo" },
      ],
    },
  ];

  assert.equal(
    getLinkedRepertoireLabel(phase, repertoireItems),
    "Canción · Solo",
  );
});

test("returns only the song when the block has no part", () => {
  const repertoireItems = [
    { id: "song-1", title: "Canción", parts: [{ id: "part-1", name: "Intro" }] },
  ];

  assert.equal(
    getLinkedRepertoireLabel({ repertoireItemId: "song-1" }, repertoireItems),
    "Canción",
  );
});

test("falls back to the song when the stored part no longer exists", () => {
  const repertoireItems = [
    { id: "song-1", title: "Canción", parts: [{ id: "part-1", name: "Intro" }] },
  ];

  assert.equal(
    getLinkedRepertoireLabel(
      { repertoireItemId: "song-1", repertoirePartId: "unknown" },
      repertoireItems,
    ),
    "Canción",
  );
});

test("returns no linked label when the item is missing", () => {
  const repertoireItems = [
    { id: "song-1", title: "Canción", parts: [{ id: "part-1", name: "Intro" }] },
  ];

  assert.equal(getLinkedRepertoireLabel({}, repertoireItems), null);
  assert.equal(
    getLinkedRepertoireLabel(
      { repertoireItemId: "missing" },
      repertoireItems,
    ),
    null,
  );
});

test("resolves and misses a linked lick by id", () => {
  const licks = [{ id: "lick-1", title: "Frase" }];

  assert.equal(getLinkedLickLabel({ lickId: "lick-1" }, licks), "Frase");
  assert.equal(getLinkedLickLabel({ lickId: "missing" }, licks), null);
  assert.equal(getLinkedLickLabel({}, licks), null);
});

test("the block title of a repertoire block always comes from its song", () => {
  const repertoireItems = [
    { id: "song-1", title: "Canción", parts: [{ id: "part-1", name: "Intro" }] },
  ];

  assert.equal(
    getPracticeBlockTitle(
      {
        name: "Nombre viejo",
        skill: "repertoire",
        repertoireItemId: "song-1",
      },
      repertoireItems,
    ),
    "Canción",
  );
  assert.equal(
    getPracticeBlockTitle(
      { name: "Nombre viejo", skill: "repertoire", repertoireItemId: "missing" },
      repertoireItems,
    ),
    "Nombre viejo",
  );
  assert.equal(
    getPracticeBlockTitle(
      { name: "Técnica", skill: "technique" },
      repertoireItems,
    ),
    "Técnica",
  );
});

test("only resolves a part when both the song and the part exist", () => {
  const repertoireItems = [
    { id: "song-1", title: "Canción", parts: [{ id: "part-1", name: "Intro" }] },
  ];

  assert.equal(
    getLinkedRepertoirePartName(
      { repertoireItemId: "song-1", repertoirePartId: "part-1" },
      repertoireItems,
    ),
    "Intro",
  );
  assert.equal(
    getLinkedRepertoirePartName(
      { repertoireItemId: "song-1", repertoirePartId: "missing" },
      repertoireItems,
    ),
    null,
  );
  assert.equal(
    getLinkedRepertoirePartName(
      { repertoireItemId: "song-1" },
      repertoireItems,
    ),
    null,
  );
});

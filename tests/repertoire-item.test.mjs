import assert from "node:assert/strict";
import test from "node:test";
import { createRepertoireItem } from "../src/lib/repertoire-item.ts";

test("creates a song with a trimmed artist and its default part", () => {
  const item = createRepertoireItem({
    id: "song-1",
    initialPartId: "part-1",
    kind: "song",
    title: "  Master of Puppets  ",
    artist: "  Metallica  ",
    updatedAt: "2026-10-08T12:00:00.000Z",
  });

  assert.deepEqual(item, {
    id: "song-1",
    kind: "song",
    title: "Master of Puppets",
    artist: "Metallica",
    parts: [
      {
        id: "part-1",
        name: "Canción completa",
        learned: false,
        masteredBpm: null,
        targetBpm: null,
      },
    ],
    guitarPro: undefined,
    updatedAt: "2026-10-08T12:00:00.000Z",
  });
});

test("creates a lick with an optional Guitar Pro resource and no artist", () => {
  const guitarPro = {
    id: "resource-1",
    title: "Frase en La menor",
    kind: "guitarpro",
    fileName: "lick.gp5",
    assetId: "asset-1",
  };
  const item = createRepertoireItem({
    id: "lick-1",
    initialPartId: "part-2",
    kind: "lick",
    title: "Frase en La menor",
    artist: "Ignored artist",
    guitarPro,
    updatedAt: "2026-10-08T12:00:00.000Z",
  });

  assert.deepEqual(item, {
    id: "lick-1",
    kind: "lick",
    title: "Frase en La menor",
    parts: [
      {
        id: "part-2",
        name: "Lick principal",
        learned: false,
        masteredBpm: null,
        targetBpm: null,
      },
    ],
    guitarPro,
    updatedAt: "2026-10-08T12:00:00.000Z",
  });
  assert.equal(Object.hasOwn(item, "artist"), false);
});

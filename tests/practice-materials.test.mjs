import assert from "node:assert/strict";
import test from "node:test";
import { getPhaseMaterials } from "../src/utils/practice-materials.ts";

const own = {
  id: "own-1",
  title: "Propio",
  kind: "pdf",
  assetId: "asset-own",
};
const linked = {
  id: "linked-1",
  title: "De la canción",
  kind: "audio",
  assetId: "asset-linked",
};
const guitarPro = {
  id: "gp-1",
  title: "Canción.gp",
  kind: "guitarpro",
  assetId: "asset-gp",
};

function song(overrides = {}) {
  return {
    id: "song-1",
    kind: "song",
    title: "Canción",
    parts: [],
    guitarPro,
    resources: [linked],
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

test("returns the block's own resources when it has no song link", () => {
  assert.deepEqual(
    getPhaseMaterials(
      { id: 1, name: "Bloque", durationMinutes: 5, skill: "technique", resources: [own] },
      [song()],
    ),
    [own],
  );
});

test("includes the linked song's Guitar Pro and resources", () => {
  assert.deepEqual(
    getPhaseMaterials(
      {
        id: 1,
        name: "Canción",
        durationMinutes: 5,
        skill: "repertoire",
        repertoireItemId: "song-1",
      },
      [song()],
    ),
    [guitarPro, linked],
  );
});

test("merges own and linked material and removes repeated ids", () => {
  assert.deepEqual(
    getPhaseMaterials(
      {
        id: 1,
        name: "Canción",
        durationMinutes: 5,
        skill: "repertoire",
        repertoireItemId: "song-1",
        resources: [own, linked],
      },
      [song()],
    ),
    [own, linked, guitarPro],
  );
});

test("ignores a missing song or a link that is not a song", () => {
  assert.deepEqual(
    getPhaseMaterials(
      {
        id: 1,
        name: "Canción",
        durationMinutes: 5,
        skill: "repertoire",
        repertoireItemId: "missing",
      },
      [song()],
    ),
    [],
  );
  assert.deepEqual(
    getPhaseMaterials(
      {
        id: 1,
        name: "Lick",
        durationMinutes: 5,
        skill: "lick",
        lickId: "lick-1",
      },
      [{ ...song(), id: "lick-1", kind: "lick" }],
    ),
    [],
  );
});

test("returns no material for an absent phase", () => {
  assert.deepEqual(getPhaseMaterials(undefined, [song()]), []);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRepertoireDetailsUpdate,
  buildRepertoireExtraConfigUpdates,
  createRepertoirePart,
  hasRepertoireExtraConfigChanges,
  parseRepertoireBpm,
  parseRepertoireCapo,
  updateRepertoirePart,
} from "../src/utils/repertoire-item-editing.ts";
import { createRepertoireItem } from "../src/utils/repertoire-item.ts";

const UPDATED_AT = "2026-10-18T10:00:00.000Z";

function createItem(overrides = {}) {
  return {
    ...createRepertoireItem({
      id: "item-1",
      initialPartId: "part-1",
      kind: "song",
      title: "Canción",
      artist: "Artista",
      tuning: "E Standard (EADGBE)",
      updatedAt: "2026-10-17T10:00:00.000Z",
    }),
    ...overrides,
  };
}

function createDraft(item, overrides = {}) {
  return {
    tuning: item.tuning ?? "",
    customTuning: "",
    capo: item.capo !== undefined ? String(item.capo) : "",
    guitarType: item.guitarType ?? "",
    difficulty: item.difficulty ?? "",
    youtubeUrl: item.youtubeUrl ?? "",
    spotifyUrl: item.spotifyUrl ?? "",
    isFutureLearn: item.isFutureLearn ?? false,
    album: item.album ?? "",
    releaseYear: item.releaseYear?.toString() ?? "",
    coverUrl: item.coverUrl ?? "",
    ...overrides,
  };
}

test("returns nothing to save when the extra config does not change", () => {
  const item = createItem();
  const updates = buildRepertoireExtraConfigUpdates(
    createDraft(item),
    item,
    UPDATED_AT,
  );

  assert.deepEqual(updates, { updatedAt: UPDATED_AT });
  assert.equal(hasRepertoireExtraConfigChanges(updates), false);
});

test("reports a change when one field differs", () => {
  const item = createItem();
  const updates = buildRepertoireExtraConfigUpdates(
    createDraft(item, { capo: "3" }),
    item,
    UPDATED_AT,
  );

  assert.deepEqual(updates, { updatedAt: UPDATED_AT, capo: 3 });
  assert.equal(hasRepertoireExtraConfigChanges(updates), true);
});

test("clears a value by sending it back to undefined", () => {
  const item = createItem({ capo: 5, youtubeUrl: "https://youtu.be/x" });
  const updates = buildRepertoireExtraConfigUpdates(
    createDraft(item, { capo: "", youtubeUrl: "" }),
    item,
    UPDATED_AT,
  );

  assert.deepEqual(updates, {
    updatedAt: UPDATED_AT,
    capo: undefined,
    youtubeUrl: undefined,
  });
});

test("keeps a custom tuning only when the option asks for it", () => {
  const item = createItem();
  const custom = buildRepertoireExtraConfigUpdates(
    createDraft(item, { tuning: "Otra...", customTuning: "  DADGAD  " }),
    item,
    UPDATED_AT,
  );
  const ignored = buildRepertoireExtraConfigUpdates(
    createDraft(item, { tuning: "Drop D (DADGBE)", customTuning: "DADGAD" }),
    item,
    UPDATED_AT,
  );

  assert.equal(custom.tuning, "DADGAD");
  assert.equal(ignored.tuning, "Drop D (DADGBE)");
});

test("refuses a capo outside the supported range", () => {
  const item = createItem();

  assert.equal(
    buildRepertoireExtraConfigUpdates(
      createDraft(item, { capo: "-1" }),
      item,
      UPDATED_AT,
    ),
    null,
  );
  assert.equal(
    buildRepertoireExtraConfigUpdates(
      createDraft(item, { capo: "13" }),
      item,
      UPDATED_AT,
    ),
    null,
  );
  assert.equal(
    buildRepertoireExtraConfigUpdates(
      createDraft(item, { capo: "abc" }),
      item,
      UPDATED_AT,
    ),
    null,
  );
});

test("accepts the edges of the capo range and an empty capo", () => {
  const item = createItem();

  assert.equal(
    buildRepertoireExtraConfigUpdates(
      createDraft(item, { capo: "0" }),
      item,
      UPDATED_AT,
    ).capo,
    0,
  );
  assert.equal(
    buildRepertoireExtraConfigUpdates(
      createDraft(item, { capo: "12" }),
      item,
      UPDATED_AT,
    ).capo,
    12,
  );
});

test("keeps the guitar type and difficulty when they are set", () => {
  const item = createItem();
  const updates = buildRepertoireExtraConfigUpdates(
    createDraft(item, { guitarType: "acoustic", difficulty: "advanced" }),
    item,
    UPDATED_AT,
  );

  assert.equal(updates.guitarType, "acoustic");
  assert.equal(updates.difficulty, "advanced");
});

test("marks future learn only when it is on", () => {
  const item = createItem();
  const on = buildRepertoireExtraConfigUpdates(
    createDraft(item, { isFutureLearn: true }),
    item,
    UPDATED_AT,
  );
  const off = buildRepertoireExtraConfigUpdates(
    createDraft(createItem({ isFutureLearn: true })),
    createItem({ isFutureLearn: true }),
    UPDATED_AT,
  );

  assert.equal(on.isFutureLearn, true);
  assert.equal(off.isFutureLearn, undefined);
});

test("parses optional part BPM values within the supported range", () => {
  assert.deepEqual(parseRepertoireBpm(""), { isValid: true, value: null });
  assert.deepEqual(parseRepertoireBpm("0"), { isValid: true, value: 0 });
  assert.deepEqual(parseRepertoireBpm("400"), { isValid: true, value: 400 });
  assert.deepEqual(parseRepertoireBpm("120.5"), { isValid: false, value: null });
  assert.deepEqual(parseRepertoireBpm("401"), { isValid: false, value: null });
});

test("parses the capo within the supported range", () => {
  assert.deepEqual(parseRepertoireCapo(""), { isValid: true, value: undefined });
  assert.deepEqual(parseRepertoireCapo("0"), { isValid: true, value: 0 });
  assert.deepEqual(parseRepertoireCapo("12"), { isValid: true, value: 12 });
  assert.deepEqual(parseRepertoireCapo("13"), {
    isValid: false,
    value: undefined,
  });
  assert.deepEqual(parseRepertoireCapo("-1"), {
    isValid: false,
    value: undefined,
  });
  assert.deepEqual(parseRepertoireCapo("abc"), {
    isValid: false,
    value: undefined,
  });
});

test("creates a new repertoire part with its default learning and BPM state", () => {
  assert.deepEqual(createRepertoirePart("part-2", 2), {
    id: "part-2",
    name: "Parte 2",
    learned: false,
    masteredBpm: null,
    targetBpm: null,
  });
});

test("updates only the selected part and refreshes the item timestamp", () => {
  const item = {
    id: "song-1",
    parts: [
      { id: "part-1", name: "Intro", learned: false },
      { id: "part-2", name: "Solo", learned: false },
    ],
  };

  assert.deepEqual(
    updateRepertoirePart(
      item,
      "part-2",
      { learned: true },
      "2026-10-08T12:00:00.000Z",
    ),
    {
      ...item,
      parts: [
        item.parts[0],
        { ...item.parts[1], learned: true },
      ],
      updatedAt: "2026-10-08T12:00:00.000Z",
    },
  );
});

test("reverts a title that was left empty instead of saving it", () => {
  const item = createItem();

  assert.deepEqual(
    buildRepertoireDetailsUpdate(
      { title: "   ", artist: "Artista" },
      item,
      UPDATED_AT,
    ),
    { kind: "empty-title" },
  );
});

test("saves nothing when the title and artist do not change", () => {
  const item = createItem();

  assert.deepEqual(
    buildRepertoireDetailsUpdate(
      { title: " Canción ", artist: " Artista " },
      item,
      UPDATED_AT,
    ),
    { kind: "unchanged" },
  );
  assert.deepEqual(
    buildRepertoireDetailsUpdate(
      { title: "Canción", artist: "" },
      createItem({ artist: undefined }),
      UPDATED_AT,
    ),
    { kind: "unchanged" },
  );
});

test("saves the trimmed title and artist, dropping an empty artist", () => {
  const item = createItem();

  assert.deepEqual(
    buildRepertoireDetailsUpdate(
      { title: "  Otra canción  ", artist: "  Otro artista  " },
      item,
      UPDATED_AT,
    ),
    {
      kind: "save",
      updates: {
        title: "Otra canción",
        artist: "Otro artista",
        updatedAt: UPDATED_AT,
      },
    },
  );
  assert.deepEqual(
    buildRepertoireDetailsUpdate(
      { title: "Otra canción", artist: "   " },
      item,
      UPDATED_AT,
    ),
    {
      kind: "save",
      updates: {
        title: "Otra canción",
        artist: undefined,
        updatedAt: UPDATED_AT,
      },
    },
  );
});

test("saves the catalog metadata edited on the item", () => {
  const item = createItem();
  const updates = buildRepertoireExtraConfigUpdates(
    createDraft(item, {
      album: "Master of Puppets",
      releaseYear: "1986",
      coverUrl: "https://example.com/600x600bb.jpg",
    }),
    item,
    UPDATED_AT,
  );

  assert.deepEqual(updates, {
    updatedAt: UPDATED_AT,
    album: "Master of Puppets",
    releaseYear: 1986,
    coverUrl: "https://example.com/600x600bb.jpg",
  });
});

test("clears the catalog metadata when the fields are emptied", () => {
  const item = createItem({
    album: "Master of Puppets",
    releaseYear: 1986,
    coverUrl: "https://example.com/600x600bb.jpg",
  });
  const updates = buildRepertoireExtraConfigUpdates(
    createDraft(item, { album: "", releaseYear: "", coverUrl: "" }),
    item,
    UPDATED_AT,
  );

  assert.equal(updates.album, undefined);
  assert.equal(updates.releaseYear, undefined);
  assert.equal(updates.coverUrl, undefined);
});

test("drops an out-of-range release year instead of saving it", () => {
  const item = createItem();
  const updates = buildRepertoireExtraConfigUpdates(
    createDraft(item, { releaseYear: "1200" }),
    item,
    UPDATED_AT,
  );

  assert.equal(updates.releaseYear, undefined);
  assert.equal(hasRepertoireExtraConfigChanges(updates), false);
});

test("keeps the stored metadata when the draft does not mention it", () => {
  const item = createItem({ album: "Master of Puppets", releaseYear: 1986 });
  const draft = createDraft(item);
  delete draft.album;
  delete draft.releaseYear;
  delete draft.coverUrl;

  assert.deepEqual(buildRepertoireExtraConfigUpdates(draft, item, UPDATED_AT), {
    updatedAt: UPDATED_AT,
  });
});

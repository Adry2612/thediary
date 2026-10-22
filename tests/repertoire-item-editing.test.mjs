import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRepertoireExtraConfigUpdates,
  createRepertoirePart,
  hasRepertoireExtraConfigChanges,
  parseRepertoireBpm,
  updateRepertoirePart,
} from "../src/lib/repertoire-item-editing.ts";
import { createRepertoireItem } from "../src/lib/repertoire-item.ts";

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

import assert from "node:assert/strict";
import test from "node:test";
import {
  createRepertoirePart,
  parseRepertoireBpm,
  updateRepertoirePart,
} from "../src/lib/repertoire-item-editing.ts";

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

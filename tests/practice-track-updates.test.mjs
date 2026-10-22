import test from "node:test";
import assert from "node:assert/strict";
import {
  removeById,
  updateById,
} from "../src/lib/practice-track-updates.ts";

const items = [
  { id: "a", name: "uno", minutes: 10 },
  { id: "b", name: "dos", minutes: 20 },
  { id: "c", name: "tres", minutes: 30 },
];

test("updates only the element whose id matches", () => {
  const result = updateById(items, "b", { minutes: 25 });

  assert.deepEqual(result, [
    { id: "a", name: "uno", minutes: 10 },
    { id: "b", name: "dos", minutes: 25 },
    { id: "c", name: "tres", minutes: 30 },
  ]);
});

test("keeps the other elements by reference when one is updated", () => {
  const result = updateById(items, "a", { name: "primero" });

  assert.equal(result[1], items[1]);
  assert.equal(result[2], items[2]);
  assert.notEqual(result[0], items[0]);
});

test("updating a missing id leaves the list equivalent", () => {
  assert.deepEqual(updateById(items, "z", { minutes: 99 }), items);
});

test("updating an empty list returns an empty list", () => {
  assert.deepEqual(updateById([], "a", { minutes: 1 }), []);
});

test("removes only the element whose id matches", () => {
  assert.deepEqual(removeById(items, "b"), [items[0], items[2]]);
});

test("removing a missing id leaves the list equivalent", () => {
  assert.deepEqual(removeById(items, "z"), items);
});

test("removing from an empty list returns an empty list", () => {
  assert.deepEqual(removeById([], "a"), []);
});

test("never mutates the list it receives", () => {
  const original = [...items];
  updateById(items, "b", { minutes: 1 });
  removeById(items, "b");

  assert.deepEqual(items, original);
});

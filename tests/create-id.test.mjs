import test from "node:test";
import assert from "node:assert/strict";
import { createId } from "../src/lib/create-id.ts";

test("creates a UUID-shaped id", () => {
  assert.match(createId(), /^[0-9a-f]+-[0-9a-f]+-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]+$/);
});

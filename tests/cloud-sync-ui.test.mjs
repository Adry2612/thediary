import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("recording UI exposes accessible sync controls only for supported providers", async () => {
  const source = await readFile(
    new URL("../src/components/practice/PracticeRecordingItem.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /aria-haspopup='menu'/);
  assert.match(source, /role='menu'/);
  assert.match(source, /'google-drive', 'onedrive'/);
  assert.doesNotMatch(source, /icloud/i);
});

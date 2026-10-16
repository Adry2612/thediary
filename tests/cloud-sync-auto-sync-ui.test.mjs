import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  readAutoSyncPreference,
  setAutoSyncPreference,
} from "../src/lib/cloud-sync/auto-sync-preference.ts";

async function readSource(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("automatic synchronization is disabled by default", () => {
  assert.equal(readAutoSyncPreference(), false);
  assert.doesNotThrow(() => setAutoSyncPreference(true));
});

test("the root layout mounts the automatic synchronization host", async () => {
  const layout = await readSource("../src/app/layout.tsx");
  assert.match(layout, /CloudAutoSyncHost/);
  assert.match(layout, /<CloudAutoSyncHost \/>/);
});

test("settings exposes an accessible automatic synchronization toggle", async () => {
  const settings = await readSource(
    "../src/components/account/SettingsView.tsx",
  );
  assert.match(settings, /aria-pressed=\{autoSyncEnabled\}/);
  assert.match(settings, /setAutoSyncEnabled\(!autoSyncEnabled\)/);
  assert.doesNotMatch(settings, /icloud/i);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("cloud sync migration limits providers and enables user-scoped RLS", async () => {
  const migration = await readFile(
    new URL(
      "../supabase/migrations/202610160002_cloud_recording_sync.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(migration, /cloud_provider_connections/);
  assert.match(migration, /practice_recording_sync/);
  assert.match(migration, /provider in \('google-drive', 'onedrive'\)/);
  assert.match(migration, /enable row level security/gi);
  assert.match(migration, /select auth\.uid\(\)\) = user_id/);
  assert.doesNotMatch(migration, /access_token|refresh_token/i);
});

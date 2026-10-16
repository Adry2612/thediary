import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getCloudProviderConfigurations } from "../src/lib/cloud-sync/config.ts";

const PROVIDER_KEYS = [
  "GOOGLE_DRIVE_CLIENT_ID",
  "GOOGLE_DRIVE_CLIENT_SECRET",
  "GOOGLE_DRIVE_REDIRECT_URI",
  "MICROSOFT_GRAPH_CLIENT_ID",
  "MICROSOFT_GRAPH_CLIENT_SECRET",
  "MICROSOFT_GRAPH_REDIRECT_URI",
  "CLOUD_SYNC_ENCRYPTION_KEY",
];

function withIsolatedConfig(run) {
  const previous = new Map(PROVIDER_KEYS.map((key) => [key, process.env[key]]));
  const previousPath = process.env.CLOUD_SYNC_CONFIG_PATH;
  const directory = mkdtempSync(join(tmpdir(), "thediary-cloud-sync-"));
  process.env.CLOUD_SYNC_CONFIG_PATH = join(directory, "cloud-sync.json");
  for (const key of PROVIDER_KEYS) delete process.env[key];
  try {
    return run();
  } finally {
    if (previousPath === undefined) delete process.env.CLOUD_SYNC_CONFIG_PATH;
    else process.env.CLOUD_SYNC_CONFIG_PATH = previousPath;
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("cloud providers are disabled when OAuth configuration is absent", () => {
  withIsolatedConfig(() => {
    assert.deepEqual(
      getCloudProviderConfigurations().map(({ provider, enabled, clientId }) => ({
        provider,
        enabled,
        clientId,
      })),
      [
        { provider: "google-drive", enabled: false, clientId: null },
        { provider: "onedrive", enabled: false, clientId: null },
      ],
    );
  });
});

test("environment variables configure a provider", () => {
  withIsolatedConfig(() => {
    process.env.CLOUD_SYNC_ENCRYPTION_KEY = "test-key";
    process.env.GOOGLE_DRIVE_CLIENT_ID = "env-client-id";
    process.env.GOOGLE_DRIVE_CLIENT_SECRET = "env-secret";
    process.env.GOOGLE_DRIVE_REDIRECT_URI = "http://localhost:3000/callback";

    const configurations = getCloudProviderConfigurations();
    const google = configurations.find((item) => item.provider === "google-drive");
    assert.equal(google.enabled, true);
    assert.equal(google.clientId, "env-client-id");
  });
});

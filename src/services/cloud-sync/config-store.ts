import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Server-only persistence for the session encryption key. OAuth client
 * credentials come from environment variables, so this file only keeps the
 * generated key that encrypts the stored provider tokens.
 */
export interface StoredCloudSyncConfig {
  encryptionKey?: string;
}

const DATA_DIRECTORY = join(process.cwd(), ".data");
const CONFIG_PATH = join(DATA_DIRECTORY, "cloud-sync.json");

/** Allows tests to redirect persistence away from the working tree. */
function configPath(): string {
  return process.env.CLOUD_SYNC_CONFIG_PATH?.trim() || CONFIG_PATH;
}

function emptyConfig(): StoredCloudSyncConfig {
  return {};
}

export function readStoredCloudSyncConfig(): StoredCloudSyncConfig {
  try {
    const path = configPath();
    if (!existsSync(/* turbopackIgnore: true */ path)) return emptyConfig();
    const parsed = JSON.parse(
      readFileSync(/* turbopackIgnore: true */ path, "utf8"),
    ) as Partial<StoredCloudSyncConfig>;
    return { ...emptyConfig(), ...parsed };
  } catch {
    return emptyConfig();
  }
}

export function writeStoredCloudSyncConfig(config: StoredCloudSyncConfig): void {
  const path = configPath();
  mkdirSync(/* turbopackIgnore: true */ dirname(path), { recursive: true });
  writeFileSync(/* turbopackIgnore: true */ path, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
}

function environmentEncryptionKey(): string | undefined {
  return process.env.CLOUD_SYNC_ENCRYPTION_KEY?.trim() || undefined;
}

export function readEncryptionKey(): string | undefined {
  return environmentEncryptionKey() ?? readStoredCloudSyncConfig().encryptionKey;
}

/** Returns a stable key, generating and persisting one on first use. */
export function ensureEncryptionKey(): string {
  const fromEnvironment = environmentEncryptionKey();
  if (fromEnvironment) return fromEnvironment;

  const stored = readStoredCloudSyncConfig();
  if (stored.encryptionKey) return stored.encryptionKey;

  const generated = randomBytes(32).toString("base64url");
  writeStoredCloudSyncConfig({ ...stored, encryptionKey: generated });
  return generated;
}

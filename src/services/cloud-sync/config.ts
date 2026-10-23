import { CLOUD_SYNC_PROVIDERS, type CloudSyncProvider } from "../../types/cloud-sync.ts";
import { readEncryptionKey } from "./config-store.ts";

export interface CloudProviderConfiguration {
  provider: CloudSyncProvider;
  enabled: boolean;
  clientId: string | null;
  redirectUri: string | null;
}

interface ResolvedProviderCredentials {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

function environmentValue(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

function environmentKeys(provider: CloudSyncProvider): [string, string, string] {
  return provider === "google-drive"
    ? [
        "GOOGLE_DRIVE_CLIENT_ID",
        "GOOGLE_DRIVE_CLIENT_SECRET",
        "GOOGLE_DRIVE_REDIRECT_URI",
      ]
    : [
        "MICROSOFT_GRAPH_CLIENT_ID",
        "MICROSOFT_GRAPH_CLIENT_SECRET",
        "MICROSOFT_GRAPH_REDIRECT_URI",
      ];
}

function resolveProviderCredentials(
  provider: CloudSyncProvider,
): ResolvedProviderCredentials {
  const [clientIdKey, clientSecretKey, redirectUriKey] = environmentKeys(provider);
  return {
    clientId: environmentValue(clientIdKey),
    clientSecret: environmentValue(clientSecretKey),
    redirectUri: environmentValue(redirectUriKey),
  };
}

function isEnabled(credentials: ResolvedProviderCredentials): boolean {
  return Boolean(
    credentials.clientId &&
      credentials.clientSecret &&
      credentials.redirectUri &&
      readEncryptionKey(),
  );
}

export function getCloudProviderConfigurations(): CloudProviderConfiguration[] {
  return CLOUD_SYNC_PROVIDERS.map((provider) => {
    const credentials = resolveProviderCredentials(provider);
    return {
      provider,
      enabled: isEnabled(credentials),
      clientId: credentials.clientId ?? null,
      redirectUri: credentials.redirectUri ?? null,
    };
  });
}

/** Server-only accessor used when exchanging the authorization code. */
export function getCloudProviderSecret(
  provider: CloudSyncProvider,
): string | undefined {
  return resolveProviderCredentials(provider).clientSecret;
}

export function isCloudProviderConfigured(provider: CloudSyncProvider): boolean {
  return getCloudProviderConfigurations().some(
    (configuration) => configuration.provider === provider && configuration.enabled,
  );
}

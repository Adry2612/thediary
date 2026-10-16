import type { CloudSyncProvider } from "./types";
import { getCloudProviderConfigurations } from "./config";
import type { CloudProviderAdapter } from "./provider";

export function getProviderAvailability(): Record<CloudSyncProvider, boolean> {
  const configurations = getCloudProviderConfigurations();
  return {
    "google-drive": configurations.some(
      (configuration) => configuration.provider === "google-drive" && configuration.enabled,
    ),
    onedrive: configurations.some(
      (configuration) => configuration.provider === "onedrive" && configuration.enabled,
    ),
  };
}

export function getConfiguredAdapter(
  provider: CloudSyncProvider,
  adapters: Partial<Record<CloudSyncProvider, CloudProviderAdapter>> = {},
): CloudProviderAdapter | null {
  if (!getProviderAvailability()[provider]) return null;
  return adapters[provider] ?? null;
}

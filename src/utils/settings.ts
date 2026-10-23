import type {
  CloudProviderStatusSnapshot,
  CloudSyncCard,
  CloudSyncCardsOptions,
  SettingsActionMessages,
  SettingsCloudProvider,
} from "../types/settings.ts";

const PROVIDER_LABEL_KEYS = {
  "google-drive": "googleDrive",
  onedrive: "onedrive",
} as const satisfies Record<
  SettingsCloudProvider,
  keyof SettingsActionMessages
>;

export function getCloudProviderLabel(
  provider: SettingsCloudProvider,
  messages: SettingsActionMessages,
): string {
  return messages[PROVIDER_LABEL_KEYS[provider]];
}

/**
 * Convierte el estado de los proveedores en el modelo que consume la vista:
 * etiquetas, texto de estado y acción disponible.
 */
export function buildCloudSyncCards(
  statuses: readonly CloudProviderStatusSnapshot[],
  options: CloudSyncCardsOptions,
): CloudSyncCard[] {
  const { messages, connectedProvider, isLoading, workingProvider } = options;

  return statuses.map((status) => {
    const label = getCloudProviderLabel(status.provider, messages);
    const isHighlighted =
      connectedProvider === status.provider && status.connected;
    const statusText = !status.enabled
      ? messages.providerUnavailable
      : status.connected
        ? `${messages.connected}${status.accountLabel ? ` · ${status.accountLabel}` : ""}`
        : messages.syncNotConnected;

    return {
      provider: status.provider,
      label,
      statusText,
      actionLabel: isHighlighted
        ? messages.connectionSuccess
        : status.connected
          ? messages.disconnect
          : messages.connect,
      isConnected: status.connected,
      isHighlighted,
      isDisabled: isLoading || workingProvider !== null,
      isProviderEnabled: status.enabled,
    };
  });
}

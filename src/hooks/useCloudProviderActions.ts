"use client";

import { useCallback, useMemo, useState } from "react";
import { useCloudRecordingSync } from "@/hooks/useCloudRecordingSync";
import { errorMessage } from "@/utils/error-message";
import { buildCloudSyncCards } from "@/utils/settings";
import type {
  CloudSyncCard,
  CloudSyncSettingsState,
  SettingsActionMessages,
  SettingsCloudProvider,
} from "@/types/settings";

/**
 * Conectar y desconectar un proveedor de nube desde los ajustes: qué tarjeta se
 * está trabajando, qué proveedor quedó conectado en esta sesión y el error del
 * último intento.
 */
export function useCloudProviderActions(
  messages: SettingsActionMessages,
): CloudSyncSettingsState {
  const {
    statuses,
    isLoading,
    connect,
    disconnect,
  } = useCloudRecordingSync();
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [workingProvider, setWorkingProvider] =
    useState<SettingsCloudProvider | null>(null);
  const [connectedProvider, setConnectedProvider] =
    useState<SettingsCloudProvider | null>(null);

  const toggle = useCallback(
    async (card: CloudSyncCard) => {
      if (!card.isProviderEnabled) {
        setCloudError(
          `${messages.connectionFailed} ${card.label}: ${messages.providerUnavailable}`,
        );
        return;
      }

      setWorkingProvider(card.provider);
      setCloudError(null);
      try {
        if (card.isConnected) {
          await disconnect(card.provider);
          setConnectedProvider(null);
        } else {
          await connect(card.provider);
          setConnectedProvider(card.provider);
        }
      } catch (error) {
        setCloudError(
          `${messages.connectionFailed} ${card.label}. ${errorMessage(error, "")}`.trim(),
        );
      } finally {
        setWorkingProvider(null);
      }
    },
    [
      connect,
      disconnect,
      messages.connectionFailed,
      messages.providerUnavailable,
    ],
  );

  const cards = useMemo(
    () =>
      buildCloudSyncCards(statuses, {
        messages,
        connectedProvider,
        isLoading,
        workingProvider,
      }),
    [connectedProvider, isLoading, messages, statuses, workingProvider],
  );

  return {
    cards,
    error: cloudError,
    isLoading,
    workingProvider,
    toggle,
  };
}

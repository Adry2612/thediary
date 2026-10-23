"use client";

import { useCallback, useState } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useAutoSyncPreference } from "@/hooks/useAutoSyncPreference";
import { useCloudProviderActions } from "@/hooks/useCloudProviderActions";
import { useSignOut } from "@/hooks/useSignOut";
import type {
  AutoSyncSettingsState,
  SettingsActionMessages,
  SettingsDialogName,
} from "@/types/settings";

export function useSettingsView(messages: SettingsActionMessages) {
  const { user } = useAppData();
  const cloud = useCloudProviderActions(messages);
  const signOut = useSignOut(messages.signOutError);
  const { enabled: autoSyncEnabled, setEnabled: setAutoSyncEnabled } =
    useAutoSyncPreference();
  const [dialog, setDialog] = useState<SettingsDialogName>(null);

  const closeDialog = useCallback(() => setDialog(null), []);

  const toggleAutoSync = useCallback(
    () => setAutoSyncEnabled(!autoSyncEnabled),
    [autoSyncEnabled, setAutoSyncEnabled],
  );

  const autoSyncState: AutoSyncSettingsState = {
    enabled: autoSyncEnabled,
    toggle: toggleAutoSync,
  };

  return {
    user,
    dialog,
    openDialog: setDialog,
    closeDialog,
    signOut,
    cloud,
    autoSync: autoSyncState,
  };
}

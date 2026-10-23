"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readAutoSyncPreference,
  setAutoSyncPreference,
  subscribeAutoSyncPreference,
} from "@/services/cloud-sync/auto-sync-preference";

export function useAutoSyncPreference() {
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    setEnabledState(readAutoSyncPreference());
    return subscribeAutoSyncPreference(() =>
      setEnabledState(readAutoSyncPreference()),
    );
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    setAutoSyncPreference(value);
  }, []);

  return { enabled, setEnabled };
}

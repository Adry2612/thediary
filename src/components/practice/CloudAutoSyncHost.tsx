"use client";

import { useI18nSection } from "@/i18n/I18nProvider";
import { useCloudAutoSync } from "@/hooks/useCloudAutoSync";

/**
 * Aviso no bloqueante del resultado de la sincronización automática. No
 * renderiza nada mientras la función está desactivada, inactiva o no hay nada
 * que contar.
 */
export function CloudAutoSyncHost() {
  const text = useI18nSection("recordings");
  const { phase, uploaded, error } = useCloudAutoSync();

  if (phase === "error") {
    return (
      <div
        role="alert"
        className="border-b border-red-400/30 bg-red-400/5 px-5 py-2 text-center text-xs text-red-200 sm:px-8"
      >
        {text.cloudAutoSyncError}
        {error ? ` ${error}` : ""}
      </div>
    );
  }

  if (phase === "syncing") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-b border-line bg-surface px-5 py-2 text-center text-xs text-muted sm:px-8"
      >
        {text.cloudAutoSyncRunning}
      </div>
    );
  }

  if (phase === "complete" && uploaded > 0) {
    return (
      <div
        role="status"
        className="border-b border-line bg-surface px-5 py-2 text-center text-xs text-muted sm:px-8"
      >
        {text.cloudAutoSyncComplete} {uploaded}
      </div>
    );
  }

  return null;
}

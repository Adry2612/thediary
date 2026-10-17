const AUTO_SYNC_STORAGE_KEY = "thediary.cloud-sync.auto-sync";
const AUTO_SYNC_EVENT = "thediary:cloud-sync-auto-sync-changed";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

/** La sincronización automática está desactivada salvo que el usuario la active. */
export function readAutoSyncPreference(): boolean {
  if (!canUseBrowserStorage()) return false;
  return window.localStorage.getItem(AUTO_SYNC_STORAGE_KEY) === "1";
}

export function setAutoSyncPreference(enabled: boolean): void {
  if (!canUseBrowserStorage()) return;
  if (enabled) window.localStorage.setItem(AUTO_SYNC_STORAGE_KEY, "1");
  else window.localStorage.removeItem(AUTO_SYNC_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTO_SYNC_EVENT));
}

/** Reacciona tanto a los cambios hechos desde esta pestaña como desde otra. */
export function subscribeAutoSyncPreference(listener: () => void): () => void {
  if (!canUseBrowserStorage()) return () => undefined;
  window.addEventListener(AUTO_SYNC_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(AUTO_SYNC_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

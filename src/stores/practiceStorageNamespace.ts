export const PRACTICE_STORAGE_KEY = "guitar-practice-history-v1";

export function clearPracticeStorageNamespace(namespace: string): void {
  if (typeof window === "undefined") {
    throw new Error("El historial solo se puede borrar en el navegador.");
  }

  window.localStorage.removeItem(`${PRACTICE_STORAGE_KEY}:${namespace}`);
  if (namespace === "guest") {
    window.localStorage.removeItem(PRACTICE_STORAGE_KEY);
  }
}

import { createJSONStorage, type PersistStorage } from "zustand/middleware";
import type {
  PracticeTemplate,
  RepertoireItem,
  SessionRecord,
} from "@/types/practice";

export type PersistedPracticeState = {
  history: SessionRecord[];
  templates: PracticeTemplate[];
  repertoireItems?: RepertoireItem[];
};

export type PracticeStorageAdapter = PersistStorage<PersistedPracticeState>;

export function createLocalPracticeStorage(): PracticeStorageAdapter {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {
        throw new Error("El historial solo se puede guardar en el navegador.");
      },
      removeItem: () => {
        throw new Error("El historial solo se puede borrar en el navegador.");
      },
    };
  }

  const storage = createJSONStorage<PersistedPracticeState>(
    () => window.localStorage,
  );
  if (!storage) {
    throw new Error("No se pudo acceder al almacenamiento local del navegador.");
  }

  return storage;
}

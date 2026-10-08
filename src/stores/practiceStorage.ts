import {
  createJSONStorage,
  type PersistStorage,
  type StateStorage,
} from "zustand/middleware";
import type {
  PracticeTemplate,
  RepertoireItem,
  SessionRecord,
} from "@/types/practice";
import { DEFAULT_PRACTICE_GOALS } from "@/lib/practice-goals";
import { DEFAULT_WEEKLY_ROUTINE_SCHEDULE } from "@/lib/weekly-routine-schedule";
import type { WeeklyRoutineSchedule } from "@/lib/weekly-routine-schedule";
import type { PracticeGoals } from "@/lib/practice-goals";
import {
  PRACTICE_STORAGE_KEY,
  clearPracticeStorageNamespace,
} from "./practiceStorageNamespace";

export type PersistedPracticeState = {
  history: SessionRecord[];
  templates: PracticeTemplate[];
  repertoireItems: RepertoireItem[];
  weeklySchedule: WeeklyRoutineSchedule;
  practiceGoals: PracticeGoals;
};

export type PracticeStorageAdapter = PersistStorage<PersistedPracticeState>;

const PERSIST_KEY = PRACTICE_STORAGE_KEY;
let activeNamespace = "guest";

export { clearPracticeStorageNamespace };

export function setPracticeStorageNamespace(namespace: string): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(namespace)) {
    throw new Error("El espacio de almacenamiento local no es válido.");
  }
  activeNamespace = namespace;
}

export function readPracticeStorageNamespace(
  namespace: string,
): Partial<PersistedPracticeState> | undefined {
  if (typeof window === "undefined") return undefined;
  const key = `${PERSIST_KEY}:${namespace}`;
  const raw =
    window.localStorage.getItem(key) ??
    (namespace === "guest" ? window.localStorage.getItem(PERSIST_KEY) : null);
  if (!raw) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Los datos locales guardados no tienen un formato válido.");
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("state" in parsed) ||
    typeof parsed.state !== "object" ||
    parsed.state === null
  ) {
    throw new Error("No se pudieron leer los datos locales guardados.");
  }

  return parsed.state as Partial<PersistedPracticeState>;
}

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

  const namespaceStorage: StateStorage = {
    getItem: (name) => {
      const stored =
        window.localStorage.getItem(`${name}:${activeNamespace}`) ??
        (activeNamespace === "guest"
          ? window.localStorage.getItem(name)
          : null);
      if (stored !== null) return stored;

      return JSON.stringify({
        state: {
          history: [],
          templates: [],
          repertoireItems: [],
          weeklySchedule: { ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE },
          practiceGoals: { ...DEFAULT_PRACTICE_GOALS },
        },
        version: 0,
      });
    },
    setItem: (name, value) => {
      window.localStorage.setItem(`${name}:${activeNamespace}`, value);
    },
    removeItem: (name) => {
      window.localStorage.removeItem(`${name}:${activeNamespace}`);
      if (activeNamespace === "guest") window.localStorage.removeItem(name);
    },
  };
  const storage = createJSONStorage<PersistedPracticeState>(
    () => namespaceStorage,
  );
  if (!storage) {
    throw new Error("No se pudo acceder al almacenamiento local del navegador.");
  }

  return storage;
}

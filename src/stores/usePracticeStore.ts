"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type SessionRecord,
  type PracticeTemplate,
  type RepertoireItem,
} from "@/types/practice";
import {
  createLocalPracticeStorage,
  type PersistedPracticeState,
} from "@/stores/practiceStorage";
import {
  assignRoutineToWeekday,
  DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  normalizeWeeklyRoutineSchedule,
  removeRoutineFromSchedule,
} from "@/lib/weekly-routine-schedule";
import type {
  WeekdayIndex,
  WeeklyRoutineSchedule,
} from "@/lib/weekly-routine-schedule";
import {
  DEFAULT_PRACTICE_GOALS,
  normalizePracticeGoals,
  type PracticeGoals,
} from "@/lib/practice-goals";
import { normalizePracticeStorageState } from "@/stores/normalizePracticeStorageState";

type PracticeStoreState = {
  history: SessionRecord[];
  templates: PracticeTemplate[];
  repertoireItems: RepertoireItem[];
  weeklySchedule: WeeklyRoutineSchedule;
  practiceGoals: PracticeGoals;
  hasHydrated: boolean;
  persistenceError: string | null;
  addSession: (session: SessionRecord) => void;
  saveTemplate: (template: PracticeTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  setRoutineForWeekday: (
    weekday: WeekdayIndex,
    templateId: string | null,
  ) => void;
  setPracticeGoals: (goals: PracticeGoals) => void;
  saveRepertoireItem: (item: RepertoireItem) => void;
  deleteRepertoireItem: (itemId: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setPersistenceError: (message: string | null) => void;
};

export const usePracticeStore = create<PracticeStoreState>()(
  persist(
    (set) => ({
      history: [],
      templates: [],
      repertoireItems: [],
      weeklySchedule: { ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE },
      practiceGoals: { ...DEFAULT_PRACTICE_GOALS },
      hasHydrated: false,
      persistenceError: null,
      addSession: (session) =>
        set((state) => ({
          history: [...state.history, session],
          persistenceError: null,
        })),
      saveTemplate: (template) =>
        set((state) => ({
          templates: [
            ...state.templates.filter((item) => item.id !== template.id),
            template,
          ],
          persistenceError: null,
        })),
      deleteTemplate: (templateId) =>
        set((state) => ({
          templates: state.templates.filter((item) => item.id !== templateId),
          weeklySchedule: removeRoutineFromSchedule(
            state.weeklySchedule,
            templateId,
          ),
          persistenceError: null,
        })),
      setRoutineForWeekday: (weekday, templateId) =>
        set((state) => ({
          weeklySchedule: assignRoutineToWeekday(
            state.weeklySchedule,
            weekday,
            templateId,
          ),
          persistenceError: null,
        })),
      setPracticeGoals: (practiceGoals) =>
        set({
          practiceGoals: { ...practiceGoals },
          persistenceError: null,
        }),
      saveRepertoireItem: (item) =>
        set((state) => ({
          repertoireItems: [
            ...state.repertoireItems.filter(
              (candidate) => candidate.id !== item.id,
            ),
            item,
          ],
          persistenceError: null,
        })),
      deleteRepertoireItem: (itemId) =>
        set((state) => ({
          repertoireItems: state.repertoireItems.filter(
            (item) => item.id !== itemId,
          ),
          persistenceError: null,
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setPersistenceError: (persistenceError) => set({ persistenceError }),
    }),
    {
      name: "guitar-practice-history-v1",
      storage: createLocalPracticeStorage(),
      skipHydration: true,
      partialize: (state) =>
        ({
          history: state.history,
          templates: state.templates,
          repertoireItems: state.repertoireItems,
          weeklySchedule: state.weeklySchedule,
          practiceGoals: state.practiceGoals,
        }) satisfies PersistedPracticeState,
      merge: (persistedState, currentState) => {
        const persisted = normalizePracticeStorageState(
          {
            state: persistedState as
              | Partial<PersistedPracticeState>
              | undefined,
            normalizeGoals: normalizePracticeGoals,
            normalizeSchedule: normalizeWeeklyRoutineSchedule,
          },
        );
        return { ...currentState, ...persisted };
      },
      onRehydrateStorage: () => (state, error) => {
        state?.setHasHydrated(true);
        if (error) {
          state?.setPersistenceError(
            error instanceof Error
              ? error.message
              : "No se pudo recuperar el historial guardado.",
          );
        }
      },
    },
  ),
);

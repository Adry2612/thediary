"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type SessionRecord,
  type PracticeTemplate,
  type RepertoireItem,
  type UserChord,
} from "@/types/practice";
import type { GuitarLick } from "@/types/lick";
import {
  markLickPracticed as markLickPracticedNow,
  recordLickBpm as recordBpmForLick,
} from "@/utils/licks/progress";
import { createLocalPracticeStorage } from "@/stores/practiceStorage";
import type { PersistedPracticeState } from "@/types/practice-storage";
import { isSameChord } from "@/utils/chords";
import {
  assignRoutineToWeekday,
  DEFAULT_WEEKLY_ROUTINE_SCHEDULE,
  normalizeWeeklyRoutineSchedule,
  removeRoutineFromSchedule,
} from "@/utils/weekly-routine-schedule";
import type {
  WeekdayIndex,
  WeeklyRoutineSchedule,
} from "@/utils/weekly-routine-schedule";
import {
  DEFAULT_PRACTICE_GOALS,
  normalizePracticeGoals,
  type PracticeGoals,
} from "@/utils/practice-goals";
import { normalizePracticeStorageState } from "@/stores/normalizePracticeStorageState";

type PracticeStoreState = {
  history: SessionRecord[];
  templates: PracticeTemplate[];
  repertoireItems: RepertoireItem[];
  licks: GuitarLick[];
  customChords: UserChord[];
  weeklySchedule: WeeklyRoutineSchedule;
  practiceGoals: PracticeGoals;
  hasHydrated: boolean;
  persistenceError: string | null;
  addSession: (session: SessionRecord) => void;
  updateSession: (session: SessionRecord) => void;
  deleteSession: (sessionId: string) => void;
  saveTemplate: (template: PracticeTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  setRoutineForWeekday: (
    weekday: WeekdayIndex,
    templateId: string | null,
  ) => void;
  setPracticeGoals: (goals: PracticeGoals) => void;
  saveRepertoireItem: (item: RepertoireItem) => void;
  deleteRepertoireItem: (itemId: string) => void;
  saveLick: (lick: GuitarLick) => void;
  deleteLick: (lickId: string) => void;
  recordLickBpm: (lickId: string, bpm: number, notes?: string) => boolean;
  markLickPracticed: (lickId: string, practicedAt?: string) => void;
  saveCustomChord: (chord: UserChord) => void;
  deleteCustomChord: (chordId: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setPersistenceError: (message: string | null) => void;
};

export const usePracticeStore = create<PracticeStoreState>()(
  persist(
    (set) => ({
      history: [],
      templates: [],
      repertoireItems: [],
      licks: [],
      customChords: [],
      weeklySchedule: { ...DEFAULT_WEEKLY_ROUTINE_SCHEDULE },
      practiceGoals: { ...DEFAULT_PRACTICE_GOALS },
      hasHydrated: false,
      persistenceError: null,
      addSession: (session) =>
        set((state) => ({
          history: [...state.history, session],
          persistenceError: null,
        })),
      updateSession: (session) =>
        set((state) => ({
          history: state.history.map((item) =>
            item.id === session.id ? session : item,
          ),
          persistenceError: null,
        })),
      deleteSession: (sessionId) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== sessionId),
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
      saveLick: (lick) =>
        set((state) => ({
          licks: [
            ...state.licks.filter((candidate) => candidate.id !== lick.id),
            lick,
          ],
          persistenceError: null,
        })),
      deleteLick: (lickId) =>
        set((state) => ({
          licks: state.licks.filter((lick) => lick.id !== lickId),
          persistenceError: null,
        })),
      recordLickBpm: (lickId, bpm, notes) => {
        let recorded = false;
        set((state) => ({
          licks: state.licks.map((lick) => {
            if (lick.id !== lickId) return lick;
            const next = recordBpmForLick(lick, bpm, notes);
            if (!next) return lick;
            recorded = true;
            return next;
          }),
          persistenceError: null,
        }));
        return recorded;
      },
      markLickPracticed: (lickId, practicedAt) =>
        set((state) => ({
          licks: state.licks.map((lick) =>
            lick.id === lickId
              ? markLickPracticedNow(
                  lick,
                  practicedAt ? new Date(practicedAt) : undefined,
                )
              : lick,
          ),
          persistenceError: null,
        })),
      saveCustomChord: (chord) =>
        set((state) => ({
          customChords: [
            ...state.customChords.filter(
              (candidate) =>
                candidate.id !== chord.id && !isSameChord(candidate, chord),
            ),
            chord,
          ],
          persistenceError: null,
        })),
      deleteCustomChord: (chordId) =>
        set((state) => ({
          customChords: state.customChords.filter(
            (chord) => chord.id !== chordId,
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
          licks: state.licks,
          customChords: state.customChords,
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

export function getPersistedPracticeState(): PersistedPracticeState {
  const {
    history,
    templates,
    repertoireItems,
    licks,
    customChords,
    weeklySchedule,
    practiceGoals,
  } = usePracticeStore.getState();
  return {
    history,
    templates,
    repertoireItems,
    licks,
    customChords,
    weeklySchedule,
    practiceGoals,
  };
}

export function replacePracticeState(
  practiceState: PersistedPracticeState,
): void {
  const normalized = normalizePracticeStorageState({
    state: practiceState,
    normalizeGoals: normalizePracticeGoals,
    normalizeSchedule: normalizeWeeklyRoutineSchedule,
  });
  usePracticeStore.setState({
    ...normalized,
    persistenceError: null,
  });
}

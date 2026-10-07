"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PRACTICE_SKILLS,
  type DailyStats,
  type PracticeSkill,
  type SessionRecord,
  type SkillDistribution,
  type PracticeTemplate,
  type RepertoireItem,
} from "@/types/practice";
import {
  createLocalPracticeStorage,
  type PersistedPracticeState,
} from "@/stores/practiceStorage";

export type PracticeTimeRange = {
  startDate: string;
  endDate: string;
};

type PracticeStoreState = {
  history: SessionRecord[];
  templates: PracticeTemplate[];
  repertoireItems: RepertoireItem[];
  hasHydrated: boolean;
  persistenceError: string | null;
  addSession: (session: SessionRecord) => void;
  saveTemplate: (template: PracticeTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  saveRepertoireItem: (item: RepertoireItem) => void;
  deleteRepertoireItem: (itemId: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setPersistenceError: (message: string | null) => void;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSessionDateKey(session: SessionRecord) {
  return toDateKey(new Date(session.startedAt));
}

function emptySkillMinutes(): Record<PracticeSkill, number> {
  return { technique: 0, theory: 0, repertoire: 0, improvisation: 0 };
}

export function getStreakCount(
  history: SessionRecord[],
  today = new Date(),
): number {
  const practicedDates = new Set(history.map(getSessionDateKey));
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!practicedDates.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (practicedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getMonthlyHeatmapData(
  year: number,
  month: number,
  history: SessionRecord[] = usePracticeStore.getState().history,
): DailyStats[] {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError("El mes debe ser un entero entre 1 y 12.");
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, month - 1, index + 1);
    return {
      dateKey: toDateKey(date),
      sessionCount: 0,
      totalMinutes: 0,
      averageBpm: 0,
      skillMinutes: emptySkillMinutes(),
      bpmTotal: 0,
    };
  });
  const statsByDate = new Map(days.map((day) => [day.dateKey, day]));

  for (const session of history) {
    const dailyStats = statsByDate.get(getSessionDateKey(session));
    if (!dailyStats) continue;

    dailyStats.sessionCount += 1;
    dailyStats.totalMinutes += session.durationSeconds / 60;
    dailyStats.bpmTotal += session.averageBpm;
    for (const skill of PRACTICE_SKILLS) {
      dailyStats.skillMinutes[skill] += session.skillSeconds[skill] / 60;
    }
  }

  return days.map(({ bpmTotal, ...day }) => ({
    ...day,
    averageBpm: day.sessionCount
      ? Math.round(bpmTotal / day.sessionCount)
      : 0,
  }));
}

export function getSkillDistribution(
  history: SessionRecord[],
  timeRange: PracticeTimeRange,
): SkillDistribution {
  const skillSeconds = emptySkillMinutes();

  for (const session of history) {
    const sessionDate = getSessionDateKey(session);
    if (sessionDate < timeRange.startDate || sessionDate > timeRange.endDate) {
      continue;
    }

    for (const skill of PRACTICE_SKILLS) {
      skillSeconds[skill] += session.skillSeconds[skill];
    }
  }

  const totalSeconds = Object.values(skillSeconds).reduce(
    (total, seconds) => total + seconds,
    0,
  );
  const percentages = PRACTICE_SKILLS.map((skill) => {
    const exactPercentage = totalSeconds
      ? (skillSeconds[skill] / totalSeconds) * 100
      : 0;
    return {
      skill,
      percentage: Math.floor(exactPercentage),
      remainder: exactPercentage % 1,
    };
  });
  const remainder =
    (totalSeconds ? 100 : 0) -
    percentages.reduce((total, item) => total + item.percentage, 0);

  percentages
    .slice()
    .sort((left, right) => right.remainder - left.remainder)
    .slice(0, remainder)
    .forEach(({ skill }) => {
      const item = percentages.find((candidate) => candidate.skill === skill);
      if (item) item.percentage += 1;
    });

  const categories = PRACTICE_SKILLS.reduce<SkillDistribution["categories"]>(
    (result, skill) => {
      result[skill] = {
        minutes: skillSeconds[skill] / 60,
        percentage:
          percentages.find((item) => item.skill === skill)?.percentage ?? 0,
      };
      return result;
    },
    {
      technique: { minutes: 0, percentage: 0 },
      theory: { minutes: 0, percentage: 0 },
      repertoire: { minutes: 0, percentage: 0 },
      improvisation: { minutes: 0, percentage: 0 },
    },
  );

  return { totalMinutes: totalSeconds / 60, categories };
}

export const usePracticeStore = create<PracticeStoreState>()(
  persist(
    (set) => ({
      history: [],
      templates: [],
      repertoireItems: [],
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
          persistenceError: null,
        })),
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
        }) satisfies PersistedPracticeState,
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | Partial<PersistedPracticeState>
          | undefined;
        return {
          ...currentState,
          ...persisted,
          history: Array.isArray(persisted?.history) ? persisted.history : [],
          templates: Array.isArray(persisted?.templates)
            ? persisted.templates
            : [],
          repertoireItems: Array.isArray(persisted?.repertoireItems)
            ? persisted.repertoireItems
            : [],
        };
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

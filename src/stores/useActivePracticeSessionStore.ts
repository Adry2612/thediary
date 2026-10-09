"use client";

import { create } from "zustand";
import type { PracticePhase, PracticeResource } from "@/types/practice";

export interface ActivePracticeSession {
  id: string;
  name: string;
  phases: PracticePhase[];
  attachedResources?: PracticeResource[];
}

interface ActivePracticeSessionState {
  activeSession: ActivePracticeSession | null;
  setActiveSession: (session: ActivePracticeSession) => void;
  addAttachedResource: (resource: PracticeResource) => void;
  clearActiveSession: () => void;
}

export const useActivePracticeSessionStore =
  create<ActivePracticeSessionState>()((set) => ({
    activeSession: null,
    setActiveSession: (activeSession) => set({ activeSession }),
    addAttachedResource: (resource) =>
      set(({ activeSession }) =>
        activeSession
          ? {
              activeSession: {
                ...activeSession,
                attachedResources: [
                  ...(activeSession.attachedResources ?? []),
                  resource,
                ],
              },
            }
          : {},
      ),
    clearActiveSession: () => set({ activeSession: null }),
  }));

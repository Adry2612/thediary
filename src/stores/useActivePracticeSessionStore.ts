"use client";

import { create } from "zustand";
import type { PracticePhase } from "@/types/practice";

export interface ActivePracticeSession {
  id: string;
  name: string;
  phases: PracticePhase[];
}

interface ActivePracticeSessionState {
  activeSession: ActivePracticeSession | null;
  setActiveSession: (session: ActivePracticeSession) => void;
  clearActiveSession: () => void;
}

export const useActivePracticeSessionStore =
  create<ActivePracticeSessionState>()((set) => ({
    activeSession: null,
    setActiveSession: (activeSession) => set({ activeSession }),
    clearActiveSession: () => set({ activeSession: null }),
  }));

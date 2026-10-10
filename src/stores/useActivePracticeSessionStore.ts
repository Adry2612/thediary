"use client";

import { create } from "zustand";
import type { PracticePhase, PracticeResource } from "@/types/practice";

const ACTIVE_SESSION_STORAGE_KEY = "thediary.active-practice-session";

function readStoredSession(): ActivePracticeSession | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored) as ActivePracticeSession;
    if (!session?.id || !session.name || !Array.isArray(session.phases)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function persistSession(session: ActivePracticeSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export interface ActivePracticeSession {
  id: string;
  name: string;
  phases: PracticePhase[];
  attachedResources?: PracticeResource[];
  isCountUp?: boolean;
}

interface ActivePracticeSessionState {
  activeSession: ActivePracticeSession | null;
  hasHydrated: boolean;
  isSplitView: boolean;
  setActiveSession: (session: ActivePracticeSession) => void;
  hydrateActiveSession: () => void;
  setSplitView: (isSplitView: boolean) => void;
  addAttachedResource: (resource: PracticeResource) => void;
  clearActiveSession: () => void;
}

export const useActivePracticeSessionStore =
  create<ActivePracticeSessionState>()((set) => ({
  activeSession: null,
  hasHydrated: false,
  isSplitView: false,
  setActiveSession: (activeSession) => {
    persistSession(activeSession);
    set({ activeSession });
  },
  hydrateActiveSession: () =>
    set({ activeSession: readStoredSession(), hasHydrated: true }),
  setSplitView: (isSplitView) => set({ isSplitView }),
    addAttachedResource: (resource) =>
      set(({ activeSession }) => {
        if (!activeSession) return {};
        const nextSession = {
          ...activeSession,
          attachedResources: [
            ...(activeSession.attachedResources ?? []),
            resource,
          ],
        };
        persistSession(nextSession);
        return { activeSession: nextSession };
      }),
  clearActiveSession: () => {
    persistSession(null);
    set({ activeSession: null, isSplitView: false });
  },
}));

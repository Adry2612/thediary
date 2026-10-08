"use client";

import { PracticeSession } from "@/components/practice/PracticeSession";
import { useActivePracticeSessionStore } from "@/stores/useActivePracticeSessionStore";

export function ActivePracticeSessionHost() {
  const session = useActivePracticeSessionStore((state) => state.activeSession);
  if (!session) return null;

  return <PracticeSession key={session.id} session={session} />;
}

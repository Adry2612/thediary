"use client";

import { useEffect } from "react";
import { PracticeSession } from "@/components/practice/PracticeSession";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useGuardedPracticeNavigation } from "@/hooks/useGuardedPracticeNavigation";
import { useActivePracticeSessionStore } from "@/stores/useActivePracticeSessionStore";
import { useI18nSection } from "@/i18n/I18nProvider";

export function ActivePracticeSessionHost() {
  const session = useActivePracticeSessionStore((state) => state.activeSession);
  const hasHydrated = useActivePracticeSessionStore((state) => state.hasHydrated);
  const hydrateActiveSession = useActivePracticeSessionStore(
    (state) => state.hydrateActiveSession,
  );
  const text = useI18nSection("practice");
  const { pendingHref, confirmNavigation, cancelNavigation } =
    useGuardedPracticeNavigation();

  useEffect(() => {
    hydrateActiveSession();
  }, [hydrateActiveSession]);

  return (
    <>
      {hasHydrated && session && (
        <PracticeSession key={session.id} session={session} />
      )}
      {pendingHref && (
        <ConfirmDialog
          labelledBy="guard-new-practice-title"
          className="z-[110]"
          title={text.newPracticeTitle}
          description={text.newPracticeDescription}
          cancelLabel={text.cancelNewPractice}
          confirmLabel={text.confirmNewPractice}
          onCancel={cancelNavigation}
          onConfirm={confirmNavigation}
        />
      )}
    </>
  );
}

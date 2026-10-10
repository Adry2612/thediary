"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PracticeSession } from "@/components/practice/PracticeSession";
import { useActivePracticeSessionStore } from "@/stores/useActivePracticeSessionStore";
import { Button } from "@/components/ui/Button";
import { useI18nSection } from "@/i18n/I18nProvider";

export function ActivePracticeSessionHost() {
  const session = useActivePracticeSessionStore((state) => state.activeSession);
  const hasHydrated = useActivePracticeSessionStore((state) => state.hasHydrated);
  const hydrateActiveSession = useActivePracticeSessionStore(
    (state) => state.hydrateActiveSession,
  );
  const clearActiveSession = useActivePracticeSessionStore(
    (state) => state.clearActiveSession,
  );
  const router = useRouter();
  const text = useI18nSection("practice");
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    hydrateActiveSession();
  }, [hydrateActiveSession]);

  useEffect(() => {
    if (!session) return;

    function guardPracticeNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>("a[href]");
      const href = link?.getAttribute("href");
      if (!href || !href.startsWith("/practice")) return;

      const destination = new URL(href, window.location.origin);
      const startsNewPractice =
        destination.pathname === "/practice" && destination.search.length > 0;
      if (!startsNewPractice) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    }

    document.addEventListener("click", guardPracticeNavigation, true);
    return () => document.removeEventListener("click", guardPracticeNavigation, true);
  }, [session]);

  function confirmNavigation() {
    if (!pendingHref) return;
    const href = pendingHref;
    setPendingHref(null);
    clearActiveSession();
    router.push(href);
  }

  return (
    <>
      {hasHydrated && session && (
        <PracticeSession key={session.id} session={session} />
      )}
      {pendingHref && (
        <dialog
          open
          aria-labelledby="guard-new-practice-title"
          className="fixed inset-0 z-[110] m-auto w-[calc(100%-2rem)] max-w-md border border-line bg-surface p-0 text-ink shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop:bg-black/70"
        >
          <div className="p-6 sm:p-8">
            <h2 id="guard-new-practice-title" className="font-sans text-2xl font-semibold">
              {text.newPracticeTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {text.newPracticeDescription}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button onClick={() => setPendingHref(null)}>
                {text.cancelNewPractice}
              </Button>
              <Button variant="primary" onClick={confirmNavigation}>
                {text.confirmNewPractice}
              </Button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActivePracticeSessionStore } from "@/stores/useActivePracticeSessionStore";

/**
 * Intercepta los enlaces que arrancarían otra práctica mientras hay una sesión
 * activa y pide confirmación antes de tirarla.
 */
export function useGuardedPracticeNavigation() {
  const session = useActivePracticeSessionStore(
    (state) => state.activeSession,
  );
  const clearActiveSession = useActivePracticeSessionStore(
    (state) => state.clearActiveSession,
  );
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    function guardPracticeNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

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
    return () =>
      document.removeEventListener("click", guardPracticeNavigation, true);
  }, [session]);

  function confirmNavigation() {
    if (!pendingHref) return;
    const href = pendingHref;
    setPendingHref(null);
    clearActiveSession();
    router.push(href);
  }

  function cancelNavigation() {
    setPendingHref(null);
  }

  return { pendingHref, confirmNavigation, cancelNavigation };
}

"use client";

import { useEffect, useState } from "react";
import { useActivePracticeSessionStore } from "@/stores/useActivePracticeSessionStore";

/**
 * Si la pantalla admite la vista partida y cuál es su estado. Al estrecharse
 * por debajo del ancho mínimo, la vista partida se apaga sola.
 */
export function useSplitViewAvailability() {
  const isSplitView = useActivePracticeSessionStore(
    (state) => state.isSplitView,
  );
  const setSplitView = useActivePracticeSessionStore(
    (state) => state.setSplitView,
  );
  const [canUseSplitView, setCanUseSplitView] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateSplitViewAvailability = () =>
      setCanUseSplitView(mediaQuery.matches);

    updateSplitViewAvailability();
    mediaQuery.addEventListener("change", updateSplitViewAvailability);
    return () =>
      mediaQuery.removeEventListener("change", updateSplitViewAvailability);
  }, []);

  useEffect(() => {
    if (!canUseSplitView && isSplitView) setSplitView(false);
  }, [canUseSplitView, isSplitView, setSplitView]);

  return {
    canUseSplitView,
    isSplitView,
    toggleSplitView: () => setSplitView(!isSplitView),
  };
}

"use client";

import { useCallback, useState } from "react";
import { getPracticeTooltipPosition } from "@/utils/practice-tooltip";
import type { PracticeTooltipDay } from "@/types/dashboard";

type PracticeTooltipDayData = Omit<
  PracticeTooltipDay,
  "left" | "top" | "showBelow"
>;

/**
 * Día cuyo tooltip está abierto y dónde colocarlo. Comparten el estado el
 * calendario anual y el resumen semanal.
 */
export function usePracticeDayTooltip() {
  const [hoveredDay, setHoveredDay] = useState<PracticeTooltipDay | null>(null);

  const showTooltip = useCallback(
    (element: HTMLElement, day: PracticeTooltipDayData) => {
      setHoveredDay({
        ...day,
        ...getPracticeTooltipPosition(element),
      });
    },
    [],
  );

  const hideTooltip = useCallback(() => setHoveredDay(null), []);

  return { hoveredDay, showTooltip, hideTooltip };
}

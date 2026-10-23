"use client";

import { useEffect, type RefObject } from "react";
import { PRACTICE_DAY_TARGET_SIZE } from "@/utils/practice-calendar";
import type { CalendarCell } from "@/types/dashboard";

const RIGHT_PADDING = 96;

/**
 * Desplaza el calendario anual hasta la última práctica al abrirse, dejando un
 * margen a la derecha para que la columna no quede pegada al borde.
 */
export function useLatestPracticeScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  cells: CalendarCell[],
  latestPracticeDateKey: string | undefined,
) {
  useEffect(() => {
    if (!latestPracticeDateKey || !scrollRef.current) return;
    const latestCellIndex = cells.findIndex(
      (cell) => cell?.dateKey === latestPracticeDateKey,
    );
    if (latestCellIndex < 0) return;

    const scrollContainer = scrollRef.current;
    const latestColumn = Math.floor(latestCellIndex / 7);

    requestAnimationFrame(() => {
      scrollContainer.scrollTo({
        left: Math.max(
          0,
          latestColumn * PRACTICE_DAY_TARGET_SIZE -
            scrollContainer.clientWidth +
            RIGHT_PADDING,
        ),
        behavior: "smooth",
      });
    });
  }, [cells, latestPracticeDateKey, scrollRef]);
}

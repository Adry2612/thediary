import type { RefObject } from "react";
import { PracticeDaySummary } from "@/components/dashboard/PracticeDaySummary";
import type { PracticeTooltipDay } from "@/types/dashboard";

type PracticeDayTooltipProps = {
  day: PracticeTooltipDay;
  cardRef?: RefObject<HTMLDivElement | null>;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  /**
   * La ficha del resumen semanal se puede recorrer con el puntero; la vista
   * previa anual no, para que los días que quedan debajo sigan siendo
   * seleccionables.
   */
  interactive?: boolean;
  /** Vista previa acotada del calendario anual. */
  compact?: boolean;
};

export function PracticeDayTooltip({
  day,
  cardRef,
  onPointerEnter,
  onPointerLeave,
  interactive = true,
  compact = false,
}: PracticeDayTooltipProps) {
  return (
    <div
      ref={cardRef}
      id="practice-day-tooltip"
      role="tooltip"
      onPointerEnter={interactive ? onPointerEnter : undefined}
      onPointerLeave={interactive ? onPointerLeave : undefined}
      className={`${interactive ? "pointer-events-auto" : "pointer-events-none"} fixed z-300 flex w-72 max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 p-4 text-left text-zinc-200 ${day.showBelow ? "" : "-translate-y-full"}`}
      style={{ left: day.left, top: day.top, maxHeight: day.maxHeight }}
    >
      <PracticeDaySummary day={day} compact={compact} />
    </div>
  );
}

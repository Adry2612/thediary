import type { PracticeTooltipDay } from "../types/dashboard.ts";

/**
 * Posición del tooltip de un día: centrado sobre el elemento, sin salirse de la
 * ventana, y por debajo del día si no cabe encima.
 */
export function getPracticeTooltipPosition(
  element: HTMLElement,
): Pick<PracticeTooltipDay, "left" | "top" | "showBelow"> {
  const bounds = element.getBoundingClientRect();
  const tooltipWidth = 288;
  const left = Math.max(
    12,
    Math.min(
      bounds.left + bounds.width / 2 - tooltipWidth / 2,
      window.innerWidth - tooltipWidth - 12,
    ),
  );
  const tooltipHeight = Math.min(window.innerHeight * 0.65, 440);
  const showBelow = bounds.top < tooltipHeight + 12;
  const belowTop = Math.min(
    bounds.bottom + 10,
    window.innerHeight - tooltipHeight - 12,
  );

  return {
    left,
    top: showBelow ? Math.max(12, belowTop) : bounds.top - 10,
    showBelow,
  };
}

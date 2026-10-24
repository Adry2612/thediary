import type { PracticeTooltipDay } from "../types/dashboard.ts";

/** Hueco entre el día y la ficha para que el puntero pueda cruzar sin saltos. */
export const PRACTICE_TOOLTIP_GAP = 10;
/** Margen mínimo con el borde de la ventana. */
export const PRACTICE_TOOLTIP_MARGIN = 12;
const PRACTICE_TOOLTIP_WIDTH = 288;
const PRACTICE_TOOLTIP_MAX_HEIGHT = 440;

/**
 * Posición del resumen de un día: centrado sobre el elemento y sin salirse de
 * la ventana. Se coloca en el lado con más espacio y se limita su altura, de
 * modo que nunca tapa el día que lo abre y el contenido interior puede
 * desplazarse.
 */
export function getPracticeTooltipPosition(
  element: HTMLElement,
): Pick<PracticeTooltipDay, "left" | "top" | "showBelow" | "maxHeight"> {
  const bounds = element.getBoundingClientRect();
  const left = Math.max(
    PRACTICE_TOOLTIP_MARGIN,
    Math.min(
      bounds.left + bounds.width / 2 - PRACTICE_TOOLTIP_WIDTH / 2,
      window.innerWidth - PRACTICE_TOOLTIP_WIDTH - PRACTICE_TOOLTIP_MARGIN,
    ),
  );
  const heightLimit = Math.min(
    window.innerHeight * 0.65,
    PRACTICE_TOOLTIP_MAX_HEIGHT,
  );
  const spaceAbove =
    bounds.top - PRACTICE_TOOLTIP_GAP - PRACTICE_TOOLTIP_MARGIN;
  const spaceBelow =
    window.innerHeight -
    bounds.bottom -
    PRACTICE_TOOLTIP_GAP -
    PRACTICE_TOOLTIP_MARGIN;
  const showBelow = spaceBelow >= spaceAbove;
  const availableSpace = Math.max(120, showBelow ? spaceBelow : spaceAbove);

  return {
    left,
    top: showBelow
      ? bounds.bottom + PRACTICE_TOOLTIP_GAP
      : bounds.top - PRACTICE_TOOLTIP_GAP,
    showBelow,
    maxHeight: Math.min(heightLimit, availableSpace),
  };
}

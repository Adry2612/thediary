/** Tamaño fijo de la ficha de resumen de una habilidad. */
export const SKILL_SUMMARY_WIDTH = 224;
export const SKILL_SUMMARY_HEIGHT = 104;
/** Hueco entre el disparador y la ficha. */
export const SKILL_SUMMARY_GAP = 10;
/** Margen mínimo con el borde de la ventana. */
export const SKILL_SUMMARY_MARGIN = 12;

export type SkillSummaryAnchor = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type SkillSummaryViewport = {
  width: number;
  height: number;
};

export type SkillSummaryPosition = {
  left: number;
  top: number;
};

function clamp(value: number, size: number, viewportSize: number) {
  const maximum = viewportSize - size - SKILL_SUMMARY_MARGIN;
  return Math.max(SKILL_SUMMARY_MARGIN, Math.min(value, maximum));
}

/**
 * Posición fija de la ficha de una habilidad. Elige el primer lado con sitio
 * suficiente (derecha, izquierda, abajo, arriba), centra la ficha en el
 * disparador en el eje del lado elegido y la limita a la ventana. Si ningún
 * lado cabe, la centra y la recorta al margen.
 */
export function getSkillSummaryPosition(
  anchor: SkillSummaryAnchor,
  viewport: SkillSummaryViewport,
): SkillSummaryPosition {
  const centerX = (anchor.left + anchor.right) / 2;
  const centerY = (anchor.top + anchor.bottom) / 2;
  const horizontalRoom = SKILL_SUMMARY_WIDTH + SKILL_SUMMARY_GAP + SKILL_SUMMARY_MARGIN;
  const verticalRoom = SKILL_SUMMARY_HEIGHT + SKILL_SUMMARY_GAP + SKILL_SUMMARY_MARGIN;

  let left = centerX - SKILL_SUMMARY_WIDTH / 2;
  let top = centerY - SKILL_SUMMARY_HEIGHT / 2;

  if (viewport.width - anchor.right >= horizontalRoom) {
    left = anchor.right + SKILL_SUMMARY_GAP;
    top = centerY - SKILL_SUMMARY_HEIGHT / 2;
  } else if (anchor.left >= horizontalRoom) {
    left = anchor.left - SKILL_SUMMARY_GAP - SKILL_SUMMARY_WIDTH;
    top = centerY - SKILL_SUMMARY_HEIGHT / 2;
  } else if (viewport.height - anchor.bottom >= verticalRoom) {
    left = centerX - SKILL_SUMMARY_WIDTH / 2;
    top = anchor.bottom + SKILL_SUMMARY_GAP;
  } else if (anchor.top >= verticalRoom) {
    left = centerX - SKILL_SUMMARY_WIDTH / 2;
    top = anchor.top - SKILL_SUMMARY_GAP - SKILL_SUMMARY_HEIGHT;
  }

  return {
    left: clamp(left, SKILL_SUMMARY_WIDTH, viewport.width),
    top: clamp(top, SKILL_SUMMARY_HEIGHT, viewport.height),
  };
}

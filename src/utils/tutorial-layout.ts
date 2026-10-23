import type {
  ElementSize,
  TargetBounds,
  ViewportSize,
} from "../types/tutorial.ts";

/**
 * Dónde cae el diálogo del tutorial y qué hueco deja abierto alrededor del
 * elemento que señala. Es cálculo puro sobre medidas, así que vive aquí y se
 * puede probar sin montar el tutorial.
 */

/**
 * Margen que se deja alrededor del objetivo al abrir el hueco del foco. Arriba
 * es más ancho porque el objetivo suele tener un encabezado pegado.
 */
export const SPOTLIGHT_PADDING = { top: 28, horizontal: 24, bottom: 24 };

const DIALOG_HORIZONTAL_MARGIN = 16;
const DIALOG_VERTICAL_MARGIN = 8;
const DIALOG_GAP = 16;

/** Estilo con el que se centra el diálogo cuando no hay a qué apuntar. */
export function getCenteredDialogStyle(): {
  top: string;
  left: string;
  transform: string;
} {
  return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
}

/** Diferencia máxima que se ignora al comparar dos medidas del objetivo. */
const BOUNDS_TOLERANCE = 0.5;

/** Convierte un rectángulo del navegador en las medidas que usa el tutorial. */
export function toTargetBounds(rect: TargetBounds): TargetBounds {
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Si hay que volver a pintar por un cambio de medidas. Los subpíxeles que no
 * llegan a medio píxel no cuentan: observarlos provocaría un bucle de pintado.
 */
export function hasTargetBoundsChanged(
  previous: TargetBounds | null,
  next: TargetBounds,
): boolean {
  if (!previous) return true;

  return (
    Math.abs(previous.top - next.top) >= BOUNDS_TOLERANCE ||
    Math.abs(previous.left - next.left) >= BOUNDS_TOLERANCE ||
    Math.abs(previous.width - next.width) >= BOUNDS_TOLERANCE ||
    Math.abs(previous.height - next.height) >= BOUNDS_TOLERANCE
  );
}

/** Hueco que deja ver el objetivo, recortado a la pantalla. */
export interface SpotlightHole {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Hueco del foco alrededor del objetivo: los márgenes de `SPOTLIGHT_PADDING`
 * recortados a la pantalla, para que las cuatro bandas oscuras que lo rodean
 * siempre sumen la pantalla entera.
 */
export function getSpotlightHole(
  targetBounds: TargetBounds,
  viewport: ViewportSize,
): SpotlightHole {
  return {
    top: Math.max(0, targetBounds.top - SPOTLIGHT_PADDING.top),
    bottom: Math.min(
      viewport.height,
      targetBounds.bottom + SPOTLIGHT_PADDING.bottom,
    ),
    left: Math.max(0, targetBounds.left - SPOTLIGHT_PADDING.horizontal),
    right: Math.min(
      viewport.width,
      targetBounds.right + SPOTLIGHT_PADDING.horizontal,
    ),
  };
}

/**
 * Estilo de posición del diálogo.
 *
 * Sin objetivo, o con una ventana sin medidas todavía, el diálogo se centra.
 * Con objetivo se coloca debajo si cabe, si no encima, y si no cabe en ninguno
 * de los dos lados se pega al borde con más hueco. En horizontal se centra
 * sobre el objetivo sin salirse de los márgenes de la pantalla.
 *
 * Colocar y recortar son cosas distintas: el hueco del foco se recorta a la
 * pantalla, pero la colocación mira las medidas sin recortar del objetivo, para
 * que un objetivo a medio salir no mueva el diálogo.
 */
export function getDialogStyle(
  targetBounds: TargetBounds | null,
  viewport: ViewportSize,
  dialogSize: ElementSize,
): { top: string; left: string; transform: string } {
  if (!targetBounds || !viewport.width || !viewport.height) {
    return getCenteredDialogStyle();
  }

  const targetLeft = targetBounds.left - SPOTLIGHT_PADDING.horizontal;
  const targetTop = targetBounds.top - SPOTLIGHT_PADDING.top;
  const targetRight = targetBounds.right + SPOTLIGHT_PADDING.horizontal;
  const targetBottom = targetBounds.bottom + SPOTLIGHT_PADDING.bottom;

  const left = Math.max(
    DIALOG_HORIZONTAL_MARGIN,
    Math.min(
      (targetLeft + targetRight) / 2 - dialogSize.width / 2,
      viewport.width - dialogSize.width - DIALOG_HORIZONTAL_MARGIN,
    ),
  );

  const spaceAbove = targetTop - DIALOG_GAP - DIALOG_VERTICAL_MARGIN;
  const spaceBelow =
    viewport.height - targetBottom - DIALOG_GAP - DIALOG_VERTICAL_MARGIN;
  const fitsAbove = dialogSize.height <= spaceAbove;
  const fitsBelow = dialogSize.height <= spaceBelow;

  let top: number;
  if (fitsBelow) {
    top = targetBottom + DIALOG_GAP;
  } else if (fitsAbove) {
    top = targetTop - dialogSize.height - DIALOG_GAP;
  } else if (spaceAbove >= spaceBelow) {
    top = DIALOG_VERTICAL_MARGIN;
  } else {
    top = Math.max(
      DIALOG_VERTICAL_MARGIN,
      viewport.height - dialogSize.height - DIALOG_VERTICAL_MARGIN,
    );
  }

  return {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    transform: "none",
  };
}

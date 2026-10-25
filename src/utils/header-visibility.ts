/** Altura mínima de scroll antes de poder esconder el header. */
export const HEADER_HIDE_AFTER_PX = 64;
/** Movimiento hacia abajo acumulado que confirma la intención de esconderlo. */
export const HEADER_HIDE_DISTANCE_PX = 8;
/** Movimiento hacia arriba acumulado que lo devuelve. */
export const HEADER_SHOW_DISTANCE_PX = 8;

export interface HeaderVisibilityInput {
  scrollY: number;
  /** Distancia hacia abajo desde el último cambio de dirección. */
  downDistance: number;
  /** Distancia hacia arriba desde el último cambio de dirección. */
  upDistance: number;
  isHidden: boolean;
}

/**
 * Decide si el header debe seguir oculto. Se apoya en la distancia acumulada
 * en cada dirección, no en el delta de un único evento: así un scroll lento de
 * 1 px también acaba escondiendo o mostrando el header, y el temblor del dedo
 * no lo hace parpadear.
 */
export function getHeaderHidden({
  scrollY,
  downDistance,
  upDistance,
  isHidden,
}: HeaderVisibilityInput): boolean {
  // En el borde superior, o antes de cruzar el umbral, siempre visible.
  if (scrollY <= HEADER_HIDE_AFTER_PX) return false;

  if (isHidden) return upDistance < HEADER_SHOW_DISTANCE_PX;
  return downDistance >= HEADER_HIDE_DISTANCE_PX;
}

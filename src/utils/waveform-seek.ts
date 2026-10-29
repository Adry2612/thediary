/** Posición de una búsqueda sobre una onda, de 0 a 1. */

export function clampSeekRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(1, Math.max(0, ratio));
}

/** Convierte la coordenada horizontal de un puntero en una posición 0–1. */
export function getSeekRatio(
  clientX: number,
  bounds: { left: number; width: number },
): number {
  if (
    !Number.isFinite(clientX) ||
    !Number.isFinite(bounds.left) ||
    !Number.isFinite(bounds.width) ||
    bounds.width <= 0
  ) {
    return 0;
  }

  return clampSeekRatio((clientX - bounds.left) / bounds.width);
}

/** Segundos que corresponden a una posición, sin salir de la duración. */
export function getSeekSeconds(ratio: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return clampSeekRatio(ratio) * duration;
}

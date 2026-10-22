/**
 * Tintes y rellenos que comparten las superficies de la interfaz.
 *
 * Viven fuera de los componentes porque son la parte que se copiaba: en vez de
 * que cada pantalla reescriba su cadena de clases, elige un tinte y un relleno
 * de estas tablas. Cada valor reproduce exactamente la cadena que sustituye.
 */

/** Tinte de una superficie: el fondo y el borde que la delimitan. */
export type SurfaceTone = "light" | "dark" | "danger";

/** Relleno interior de una superficie. */
export type SurfacePadding =
  | "none"
  | "tight"
  | "compact"
  | "cozy"
  | "roomy"
  | "wide";

export const SURFACE_TONE_CLASSES: Record<SurfaceTone, string> = {
  light: "border-line bg-surface",
  dark: "border-zinc-800 bg-zinc-900",
  danger: "border-accent-red-fg/50 bg-accent-red-bg",
};

export const SURFACE_PADDING_CLASSES: Record<SurfacePadding, string> = {
  none: "",
  tight: "p-4",
  compact: "p-4 sm:p-6",
  cozy: "p-5 sm:p-6",
  roomy: "p-6 sm:p-8",
  wide: "p-8 sm:p-10",
};

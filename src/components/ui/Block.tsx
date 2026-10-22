import type { HTMLAttributes } from "react";
import {
  SURFACE_PADDING_CLASSES,
  SURFACE_TONE_CLASSES,
  type SurfacePadding,
  type SurfaceTone,
} from "@/components/ui/surfaces";

type BlockElement = "article" | "div" | "fieldset" | "section";

interface BlockProps extends HTMLAttributes<HTMLElement> {
  as?: BlockElement;
  tone?: SurfaceTone;
  padding?: SurfacePadding;
}

/**
 * Superficie secundaria: esquina más corta y relleno más apretado que la
 * tarjeta, para bloques dentro de una sección. Puede ser un `fieldset` para
 * agrupar controles.
 */
export function Block({
  as = "section",
  tone = "light",
  padding = "compact",
  className = "",
  ...props
}: BlockProps) {
  const Component = as;

  return (
    <Component
      {...props}
      className={`rounded-lg border ${SURFACE_TONE_CLASSES[tone]} ${SURFACE_PADDING_CLASSES[padding]} ${className}`}
    />
  );
}

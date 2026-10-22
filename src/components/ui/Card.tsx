import type { HTMLAttributes } from "react";
import {
  SURFACE_PADDING_CLASSES,
  SURFACE_TONE_CLASSES,
  type SurfacePadding,
  type SurfaceTone,
} from "@/components/ui/surfaces";

type CardElement = "article" | "div" | "section";

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Sin borde, sin fondo y sin relleno: solo el elemento. */
  bare?: boolean;
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  as?: CardElement;
}

/**
 * Superficie principal de la aplicación: esquina amplia, borde y fondo. El
 * relleno por defecto es el más holgado, para las tarjetas que ocupan el ancho
 * de una sección.
 */
export function Card({
  bare = false,
  tone = "light",
  padding = "wide",
  as = "section",
  className = "",
  ...props
}: CardProps) {
  const Component = as;

  return (
    <Component
      {...props}
      className={`${
        bare
          ? ""
          : `rounded-xl border ${SURFACE_TONE_CLASSES[tone]} ${SURFACE_PADDING_CLASSES[padding]}`
      } ${className}`}
    />
  );
}

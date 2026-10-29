import type { HTMLAttributes, ReactNode } from "react";

type PageShellElement = "main" | "div";

/** `flush` reserva el hueco de la barra flotante en la pantalla de práctica. */
type PageShellBottom = "default" | "flush";

interface PageShellProps extends HTMLAttributes<HTMLElement> {
  as?: PageShellElement;
  bottom?: PageShellBottom;
  children: ReactNode;
}

const BOTTOM_CLASSES: Record<PageShellBottom, string> = {
  default: "py-12 sm:py-16",
  flush: "pt-12 pb-0 sm:pt-16 sm:pb-0",
};

/** Columna compartida: crece una vez en ultrawide y deja de crecer. */
export const PAGE_COLUMN_CLASSES =
  "mx-auto w-full max-w-7xl px-5 sm:px-8 2xl:max-w-[96rem]";

/**
 * Columna de la cabecera: por debajo del breakpoint coincide con el contenido;
 * a partir de ahí crece de forma progresiva y se detiene antes de los bordes.
 */
export const HEADER_COLUMN_CLASSES =
  "mx-auto w-full max-w-7xl px-5 sm:px-8 2xl:max-w-[max(96rem,min(120rem,88vw))]";

/**
 * Columna única de la aplicación: el mismo ancho máximo, los mismos márgenes
 * laterales y el mismo ritmo vertical en todas las pantallas, también mientras
 * cargan. El contenido que se lee mejor estrecho se limita dentro de ella.
 */
export function PageShell({
  as = "main",
  bottom = "default",
  className = "",
  children,
  ...props
}: PageShellProps) {
  const Component = as;
  // Un `div` acompaña a otra superficie de la pantalla (la práctica activa),
  // así que no debe reservar por sí solo el alto del viewport.
  const fillsViewport = as === "main" ? "min-h-screen" : "";

  return (
    <Component
      {...props}
      className={`${PAGE_COLUMN_CLASSES} ${fillsViewport} ${BOTTOM_CLASSES[bottom]} ${className}`}
    >
      {children}
    </Component>
  );
}

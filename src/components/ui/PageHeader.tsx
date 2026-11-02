import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  /** Id del título cuando la pantalla lo necesita para `aria-labelledby`. */
  titleId?: string;
  description?: ReactNode;
  /** Acciones que acompañan al título, como registrar una práctica manual. */
  actions?: ReactNode;
  /** `none` cuando el contenedor ya separa sus hijos con `gap`. */
  bottomSpacing?: "default" | "none";
  /** `center` para pantallas de un solo formulario, centradas en la columna. */
  align?: "start" | "center";
  className?: string;
}

/**
 * Cabecera de página: título, descripción opcional y acciones. No lleva ceja
 * ni subtítulo encima del título, y mantiene la misma separación en todas las
 * pantallas.
 */
export function PageHeader({
  title,
  titleId,
  description,
  actions,
  bottomSpacing = "default",
  align = "start",
  className = "",
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <header
      className={`enter flex flex-wrap items-end gap-6 ${
        centered ? "justify-center text-center" : "justify-between"
      } ${bottomSpacing === "default" ? "mb-8" : ""} ${className}`}
    >
      <div className={`min-w-0 ${centered ? "mx-auto" : ""}`}>
        <h1
          id={titleId}
          className='font-sans text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl'
        >
          {title}
        </h1>
        {description ? (
          <div
            className={`mt-4 max-w-2xl text-base font-medium text-muted sm:text-lg ${
              centered ? "mx-auto" : ""
            }`}
          >
            {description}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div
          className={`flex flex-wrap items-center gap-3 ${
            centered ? "justify-center" : ""
          }`}
        >
          {actions}
        </div>
      ) : null}
    </header>
  );
}

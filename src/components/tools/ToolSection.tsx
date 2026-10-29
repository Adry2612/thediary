import type { ReactNode } from "react";

interface ToolSectionProps {
  /** Ancla del bloque, también base del id de su título. */
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  /** Estado o acción que acompaña al título, alineado a la derecha. */
  status?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Bloque de una herramienta: la misma tarjeta y el mismo ritmo que las
 * secciones del dashboard, con un título propio para que cada herramienta se
 * distinga dentro de una sola página.
 */
export function ToolSection({
  id,
  eyebrow,
  title,
  description,
  status,
  children,
  className = "",
}: ToolSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={`rounded-xl border border-line bg-surface p-5 sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">
            {eyebrow}
          </p>
          <h2
            id={titleId}
            className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-ink sm:text-xl sm:leading-8"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-1 max-w-prose text-sm leading-6 text-muted">
              {description}
            </p>
          )}
        </div>
        {status && <div className="shrink-0">{status}</div>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

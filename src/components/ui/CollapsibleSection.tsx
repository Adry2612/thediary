"use client";

import { useId, useState, type ReactNode } from "react";
import { useI18nSection } from "@/i18n/I18nProvider";

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Sección plegable del editor de canción. Empieza cerrada, se abre y se cierra
 * por separado de las demás y solo monta su contenido cuando está abierta, para
 * que las rejillas que miden su ancho no se calculen ocultas.
 */
export function CollapsibleSection({
  title,
  description,
  children,
}: CollapsibleSectionProps) {
  const text = useI18nSection("repertoire");
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="mt-5 rounded-xl border border-line bg-surface p-5 sm:p-6">
      <div className="min-w-0">
        <h2 className="font-sans text-lg font-semibold tracking-tight text-ink sm:text-xl">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${open ? text.collapseSection : text.expandSection}: ${title}`}
            onClick={() => setOpen((current) => !current)}
            className="inline-flex items-center gap-2 text-left transition hover:text-ink/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className={`size-4 shrink-0 text-muted transition-transform duration-200 ${
                open ? "rotate-90" : ""
              }`}
            >
              <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
            </svg>
            <span>{title}</span>
          </button>
        </h2>
        {description ?
          <p className="mt-2 text-sm text-muted">{description}</p>
        : null}
      </div>

      {open ?
        <div id={panelId}>{children}</div>
      : null}
    </section>
  );
}

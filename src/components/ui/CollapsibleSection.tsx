"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronIcon } from "@/components/ui/icons";
import { useI18nSection } from "@/i18n/I18nProvider";

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
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
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const text = useI18nSection("repertoire");
  const [open, setOpen] = useState(defaultOpen);
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
            <ChevronIcon open={open} className="text-muted" />
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

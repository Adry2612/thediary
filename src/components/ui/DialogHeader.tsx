import type { ReactNode } from "react";

interface DialogHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Id del título: el `<dialog>` lo usa en `aria-labelledby`. */
  titleId: string;
  description?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
}

/** Ceja, título y botón de cierre de un diálogo, en el orden de lectura. */
export function DialogHeader({
  eyebrow,
  title,
  titleId,
  description,
  onClose,
  closeLabel,
  className = "",
}: DialogHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={titleId}
          className="mt-2 font-sans text-xl font-semibold tracking-tight text-ink"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-prose text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {onClose ? (
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className="flex size-7 shrink-0 items-center justify-center rounded border border-line text-muted transition hover:border-white/20 hover:text-ink"
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
    </div>
  );
}

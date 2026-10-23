"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "@/hooks/useEscapeKey";

interface PortalModalProps {
  open: boolean;
  title: string;
  description: string;
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Modal por portal con `role="dialog"`. Es el mecanismo que usa la cuenta:
 * conserva el foco del documento y el cierre con Escape y clic en el fondo,
 * sin las restricciones de un `<dialog>` nativo.
 */
export function PortalModal({
  open,
  title,
  description,
  busy = false,
  onClose,
  children,
}: PortalModalProps) {
  useEscapeKey(open && !busy, onClose);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        aria-labelledby="modal-dialog-title"
        aria-describedby="modal-dialog-description"
        aria-modal="true"
        role="dialog"
        className="w-full max-w-md rounded-xl border border-line bg-surface p-6"
      >
        <h2
          id="modal-dialog-title"
          className="text-lg font-semibold text-ink"
        >
          {title}
        </h2>
        <p
          id="modal-dialog-description"
          className="mt-2 text-sm leading-6 text-muted"
        >
          {description}
        </p>
        {children}
      </section>
    </div>,
    document.body,
  );
}

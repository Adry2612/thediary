"use client";

import { useEffect, useRef, type SyntheticEvent } from "react";

/**
 * Abre y cierra un `<dialog>` nativo según `open`, bloquea el scroll del cuerpo
 * mientras está abierto y convierte Escape en `onClose` sin cerrarlo dos veces.
 */
export function useDialogModal(open: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }

  return { dialogRef, handleCancel };
}

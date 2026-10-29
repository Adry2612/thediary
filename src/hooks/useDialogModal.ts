"use client";

import type { SyntheticEvent } from "react";
import { useDialogMotion } from "@/hooks/useDialogMotion";

/**
 * Abre y cierra un `<dialog>` nativo según `open`, bloquea el scroll del cuerpo
 * mientras está abierto y convierte Escape en `onClose` sin cerrarlo dos veces.
 * La salida se retrasa lo que dura su transición.
 */
export function useDialogModal(open: boolean, onClose: () => void) {
  const { dialogRef, isClosing } = useDialogMotion(open);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }

  return { dialogRef, handleCancel, isClosing };
}

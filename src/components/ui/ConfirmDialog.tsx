import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { useDeferredClose } from "@/hooks/useDeferredClose";

interface ConfirmDialogProps {
  /** Id del `<h2>`; el `<dialog>` se nombra con él. */
  labelledBy: string;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: ReactNode;
  cancelLabel: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

/**
 * Confirmación de una decisión que tira el trabajo en curso. Es el diálogo que
 * comparten la sesión activa y las tarjetas del repertorio.
 */
export function ConfirmDialog({
  labelledBy,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  className = "",
}: ConfirmDialogProps) {
  const { isClosing, requestClose } = useDeferredClose(onCancel);

  return (
    <ModalDialog
      open
      isClosing={isClosing}
      variant="confirm"
      labelledBy={labelledBy}
      className={className}
    >
      <div className="p-6 sm:p-8">
        <h2 id={labelledBy} className="font-sans text-2xl font-semibold">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => requestClose()}>{cancelLabel}</Button>
          <Button
            variant="primary"
            onClick={() => requestClose(onConfirm)}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
}

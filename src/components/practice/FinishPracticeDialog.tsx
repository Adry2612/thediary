"use client";

import { Button } from "@/components/ui/Button";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { useDialogModal } from "@/hooks/useDialogModal";
import { useI18nSection } from "@/i18n/I18nProvider";

type FinishPracticeDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Cierra la práctica sin guardarla. */
  onDiscard: () => void;
  /** Termina la práctica y deja visible el diálogo de resumen. */
  onFinish: () => void;
};

/**
 * Confirmación compartida por la tarjeta del temporizador y la barra flotante.
 * No decide qué significa terminar: recibe las dos salidas ya resueltas.
 */
export function FinishPracticeDialog({
  open,
  onClose,
  onDiscard,
  onFinish,
}: FinishPracticeDialogProps) {
  const timerText = useI18nSection("timer");
  const { dialogRef, handleCancel, isClosing } = useDialogModal(open, onClose);

  return (
    <ModalDialog
      dialogRef={dialogRef}
      isClosing={isClosing}
      onClose={onClose}
      onCancel={handleCancel}
    >
      <div className="p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.05em] text-muted">
          {timerText.finishSession}
        </p>
        <h2 className="mt-3 font-sans text-3xl font-semibold">
          {timerText.finishPracticeTitle}
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted">
          {timerText.finishPracticeDescription}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose}>{timerText.keepPracticing}</Button>
          <Button onClick={onDiscard}>{timerText.exitWithoutSaving}</Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onFinish();
            }}
          >
            {timerText.finishAndSave}
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
}

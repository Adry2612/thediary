"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { useDialogModal } from "@/hooks/useDialogModal";
import { useI18nSection } from "@/i18n/I18nProvider";

/** Guía breve del editor. No toca la partitura: solo explica los gestos. */
export function TabScoreTutorial({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const text = useI18nSection("tabTutorial");
  const titleId = useId();
  const { dialogRef, handleCancel, isClosing } = useDialogModal(open, onClose);

  const sections: { title: string; body: string }[] = [
    { title: text.addTitle, body: text.addBody },
    { title: text.chordTitle, body: text.chordBody },
    { title: text.durationTitle, body: text.durationBody },
    { title: text.splitTitle, body: text.splitBody },
    { title: text.moveTitle, body: text.moveBody },
    { title: text.pointerTitle, body: text.pointerBody },
    { title: text.keyboardTitle, body: text.keyboardBody },
  ];

  return (
    <ModalDialog
      dialogRef={dialogRef}
      labelledBy={titleId}
      isClosing={isClosing}
      variant="lg"
      onCancel={handleCancel}
      className="rounded-2xl"
    >
      <div className="p-5 sm:p-6">
        <DialogHeader
          title={text.title}
          titleId={titleId}
          description={text.intro}
          onClose={onClose}
          closeLabel={text.close}
        />

        <div className="mt-4 space-y-4">
          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="text-sm font-semibold text-ink">
                {section.title}
              </h3>
              <p className="mt-1 max-w-prose text-sm leading-6 text-muted">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <Button
          type="button"
          variant="primary"
          size="field"
          className="mt-5 w-full sm:w-auto"
          onClick={onClose}
        >
          {text.close}
        </Button>
      </div>
    </ModalDialog>
  );
}

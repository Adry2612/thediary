"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { Field, TextField } from "@/components/ui/Field";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { StringSetFields } from "@/components/tools/StringSetFields";
import {
  draftToStringSet,
  EMPTY_STRING_SET_DRAFT,
  type StringSetDraft,
} from "@/utils/guitar-strings";
import { useDialogModal } from "@/hooks/useDialogModal";
import { useI18nSection } from "@/i18n/I18nProvider";
import { createId } from "@/utils/create-id";
import type {
  Guitar,
  GuitarEntry,
  GuitarStringKind,
} from "@/types/equipment";

interface StringChangeDialogProps {
  guitar: Guitar;
  todayKey: string;
  open: boolean;
  onClose: () => void;
  onSave: (entry: GuitarEntry) => void;
  /** Guarda el tipo elegido cuando la guitarra aún no tenía uno. */
  onRememberKind?: (kind: GuitarStringKind) => void;
}

/** Registrar un cambio de cuerdas con el juego que se ha montado y la fecha. */
export function StringChangeDialog({
  guitar,
  todayKey,
  open,
  onClose,
  onSave,
  onRememberKind,
}: StringChangeDialogProps) {
  const text = useI18nSection("equipment");
  const titleId = useId();
  const dateId = useId();
  const { dialogRef, handleCancel, isClosing } = useDialogModal(open, onClose);
  const [date, setDate] = useState(todayKey);
  const [draft, setDraft] = useState<StringSetDraft>(() => ({
    ...EMPTY_STRING_SET_DRAFT,
    ...(guitar.stringKind ? { kind: guitar.stringKind } : {}),
  }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date) return;

    const stringSet = draftToStringSet(draft);
    if (!guitar.stringKind) onRememberKind?.(draft.kind);
    const now = new Date().toISOString();
    onSave({
      id: createId(),
      guitarId: guitar.id,
      date,
      ...(stringSet ? { stringSet } : {}),
      kind: "strings",
      createdAt: now,
      updatedAt: now,
    });
    setDraft({
      ...EMPTY_STRING_SET_DRAFT,
      ...(guitar.stringKind ? { kind: guitar.stringKind } : {}),
    });
    onClose();
  }

  return (
    <ModalDialog
      dialogRef={dialogRef}
      labelledBy={titleId}
      isClosing={isClosing}
      onCancel={handleCancel}
      onClose={onClose}
      variant="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="p-5 sm:p-6">
          <DialogHeader
            titleId={titleId}
            title={text.stringChangeTitle}
            description={guitar.name}
            onClose={onClose}
            closeLabel={text.close}
          />

          <div className="mt-5 grid gap-4">
            <Field label={text.date} htmlFor={dateId} className="max-w-44">
              <TextField
                id={dateId}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>

            <StringSetFields
              value={draft}
              onChange={setDraft}
              fixedKind={guitar.stringKind}
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {text.cancel}
            </Button>
            <Button type="submit" size="field">
              {text.saveStringChange}
            </Button>
          </div>
        </div>
      </form>
    </ModalDialog>
  );
}

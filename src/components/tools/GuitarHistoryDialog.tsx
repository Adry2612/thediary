"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { Field, TextArea, TextField } from "@/components/ui/Field";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { TrashIcon } from "@/components/ui/icons";
import { StringSetFields } from "@/components/tools/StringSetFields";
import { StringSetThumb } from "@/components/tools/StringSetThumb";
import {
  draftToStringSet,
  EMPTY_STRING_SET_DRAFT,
  type StringSetDraft,
} from "@/utils/guitar-strings";import { useDialogModal } from "@/hooks/useDialogModal";
import { useI18n, useI18nSection } from "@/i18n/I18nProvider";
import { createId } from "@/utils/create-id";
import { sortEntriesNewestFirst } from "@/utils/equipment";
import { formatStringSet } from "@/utils/guitar-strings";
import type { Guitar, GuitarEntry, GuitarEntryKind } from "@/types/equipment";

interface GuitarHistoryDialogProps {
  guitar: Guitar;
  entries: GuitarEntry[];
  todayKey: string;
  open: boolean;
  onClose: () => void;
  onSaveEntry: (entry: GuitarEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

/**
 * Historial de una guitarra con un único compositor. Cuerdas y notas comparten
 * lista porque en la práctica son lo mismo: algo que le hiciste tal día.
 */
export function GuitarHistoryDialog({
  guitar,
  entries,
  todayKey,
  open,
  onClose,
  onSaveEntry,
  onDeleteEntry,
}: GuitarHistoryDialogProps) {
  const text = useI18nSection("equipment");
  const { locale } = useI18n();
  const titleId = useId();
  const dateId = useId();
  const textId = useId();
  const { dialogRef, handleCancel, isClosing } = useDialogModal(open, onClose);
  const [kind, setKind] = useState<GuitarEntryKind>("strings");
  const [date, setDate] = useState(todayKey);
  const [value, setValue] = useState("");
  const [draft, setDraft] = useState<StringSetDraft>(EMPTY_STRING_SET_DRAFT);
  const ordered = sortEntriesNewestFirst(entries);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formatDate = (dateKey: string) =>
    dateFormatter.format(new Date(`${dateKey}T00:00:00`));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date) return;

    const now = new Date().toISOString();
    const stringSet = kind === "strings" ? draftToStringSet(draft) : undefined;
    onSaveEntry({
      id: createId(),
      guitarId: guitar.id,
      date,
      ...(value.trim() ? { text: value.trim() } : {}),
      ...(stringSet ? { stringSet } : {}),
      kind,
      createdAt: now,
      updatedAt: now,
    });
    setValue("");
    setDraft(EMPTY_STRING_SET_DRAFT);
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
      <div className="p-5 sm:p-6">
        <DialogHeader
          titleId={titleId}
          title={`${text.history} · ${guitar.name}`}
          onClose={onClose}
          closeLabel={text.close}
        />

        <form onSubmit={handleSubmit} className="mt-5 border border-line p-4">
          <div
            role="group"
            aria-label={text.history}
            className="grid grid-cols-2 gap-1 border border-line p-1 sm:w-fit"
          >
            {(
              [
                { value: "strings", label: text.addStringChange },
                { value: "note", label: text.addNote },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={kind === option.value}
                onClick={() => setKind(option.value)}
                className={`min-h-9 px-3 text-sm transition ${
                  kind === option.value
                    ? "bg-ink text-canvas"
                    : "text-muted hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {kind === "strings" && (
            <div className="mt-4">
              <StringSetFields value={draft} onChange={setDraft} />
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-[10rem_1fr]">
            <Field label={text.date} htmlFor={dateId}>
              <TextField
                id={dateId}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
            <Field
              label={kind === "strings" ? text.details : text.noteLabel}
              htmlFor={textId}
            >
              <TextArea
                id={textId}
                className="mt-1 min-h-11"
                rows={2}
                value={value}
                placeholder={text.notePlaceholder}
                onChange={(event) => setValue(event.target.value)}
              />
            </Field>
          </div>

          <div className="mt-3 flex justify-end">
            <Button type="submit" size="field">
              {kind === "strings" ? text.saveStringChange : text.saveNote}
            </Button>
          </div>
        </form>

        {ordered.length > 0 ? (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {ordered.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted">
                    {formatDate(entry.date)}
                    {" · "}
                    {entry.kind === "strings"
                      ? text.stringChangeLabel
                      : text.noteLabel}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {entry.stringSet?.image && (
                      <StringSetThumb
                        image={entry.stringSet.image}
                        size="md"
                      />
                    )}
                    <p className="min-w-0 text-sm text-ink">
                      {entry.stringSet
                        ? formatStringSet(entry.stringSet)
                        : (entry.text ?? text.stringChangeLabel)}
                    </p>
                  </div>
                  {entry.stringSet && entry.text && (
                    <p className="mt-0.5 text-xs text-muted">{entry.text}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={text.deleteRecord}
                  onClick={() => {
                    if (window.confirm(text.deleteRecordConfirm)) {
                      onDeleteEntry(entry.id);
                    }
                  }}
                  className="flex size-8 shrink-0 items-center justify-center rounded border border-line text-muted transition hover:border-red-300/50 hover:text-red-300"
                >
                  <TrashIcon className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted">{text.emptyHistory}</p>
        )}

        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={onClose}>
            {text.close}
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
}

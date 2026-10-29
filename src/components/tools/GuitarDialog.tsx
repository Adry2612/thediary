"use client";

import { useEffect, useId, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import { GuitarThumbnail } from "@/components/tools/GuitarThumbnail";
import { StringKindPicker } from "@/components/tools/StringKindPicker";
import { Button } from "@/components/ui/Button";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { Field, TextField } from "@/components/ui/Field";
import { GuitarIcon } from "@/components/ui/icons";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { useDialogModal } from "@/hooks/useDialogModal";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  deletePracticeAssetForUser,
  savePracticeAssetForUser,
} from "@/services/practice-asset";
import { createId } from "@/utils/create-id";
import { normalizePositiveInteger } from "@/utils/equipment";
import {
  canDecodeImage,
  compressImage,
  IMAGE_ACCEPT,
  validateImageFile,
} from "@/utils/image";
import type { Guitar, GuitarStringKind } from "@/types/equipment";

interface GuitarDialogProps {
  guitar: Guitar | null;
  open: boolean;
  onClose: () => void;
  /** `photoFailed` avisa de que la guitarra se guardó sin la foto nueva. */
  onSave: (guitar: Guitar, photoFailed: boolean) => void;
}

export function GuitarDialog({
  guitar,
  open,
  onClose,
  onSave,
}: GuitarDialogProps) {
  const text = useI18nSection("equipment");
  const { user } = useAppData();
  const userId = user?.id;
  const titleId = useId();
  const nameId = useId();
  const daysId = useId();
  const hoursId = useId();
  const photoInputId = useId();
  const { dialogRef, handleCancel, isClosing } = useDialogModal(open, onClose);
  const [name, setName] = useState("");
  const [stringKind, setStringKind] = useState<GuitarStringKind>("electric");
  const [intervalDays, setIntervalDays] = useState("");
  const [intervalHours, setIntervalHours] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(guitar?.name ?? "");
    setStringKind(guitar?.stringKind ?? "electric");
    setIntervalDays(guitar?.intervalDays ? String(guitar.intervalDays) : "");
    setIntervalHours(
      guitar?.intervalHours ? String(guitar.intervalHours) : "",
    );
    setPhotoFile(null);
    setPreviewUrl(null);
    setRemovePhoto(false);
    setError(null);
    setIsSaving(false);
  }, [guitar, open]);

  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const validation = validateImageFile(file);
    if (validation === "unsupported") {
      setError(text.photoUnsupported);
      return;
    }
    if (validation === "too-large") {
      setError(text.photoTooLarge);
      return;
    }

    // Un formato válido que este navegador no sabe leer (HEIC en escritorio) se
    // rechaza ahora, en vez de guardar la guitarra sin foto.
    if (!(await canDecodeImage(file))) {
      setError(text.photoUnreadable);
      return;
    }

    setError(null);
    setRemovePhoto(false);
    setPhotoFile(file);
  }

  function clearPhoto() {
    setPhotoFile(null);
    setRemovePhoto(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(text.requiredName);
      return;
    }

    const days = intervalDays.trim()
      ? normalizePositiveInteger(intervalDays)
      : undefined;
    const hours = intervalHours.trim()
      ? normalizePositiveInteger(intervalHours)
      : undefined;
    if (
      (intervalDays.trim() && days === undefined) ||
      (intervalHours.trim() && hours === undefined)
    ) {
      setError(text.invalidInterval);
      return;
    }

    setIsSaving(true);
    let nextPhotoAssetId = removePhoto ? undefined : guitar?.photoAssetId;
    let photoFailed = false;

    if (photoFile) {
      try {
        const blob = await compressImage(photoFile);
        const assetId = createId();
        const extension = blob.type === "image/webp" ? "webp" : "jpg";
        await savePracticeAssetForUser(
          {
            id: assetId,
            fileName: `${trimmedName}.${extension}`,
            kind: "image",
            blob,
          },
          userId,
        );
        nextPhotoAssetId = assetId;
        if (guitar?.photoAssetId) {
          await deletePracticeAssetForUser(guitar.photoAssetId, userId);
        }
      } catch {
        photoFailed = true;
        nextPhotoAssetId = guitar?.photoAssetId;
      }
    } else if (removePhoto && guitar?.photoAssetId) {
      await deletePracticeAssetForUser(guitar.photoAssetId, userId);
    }

    const now = new Date().toISOString();
    onSave(
      {
        id: guitar?.id ?? createId(),
        name: trimmedName,
        ...(days ? { intervalDays: days } : {}),
        ...(hours ? { intervalHours: hours } : {}),
        ...(nextPhotoAssetId ? { photoAssetId: nextPhotoAssetId } : {}),
        stringKind,
        createdAt: guitar?.createdAt ?? now,
        updatedAt: now,
      },
      photoFailed,
    );
    setIsSaving(false);
  }

  const hasPhoto =
    Boolean(photoFile) || Boolean(guitar?.photoAssetId && !removePhoto);

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
            title={guitar ? text.editGuitar : text.addGuitar}
            onClose={onClose}
            closeLabel={text.close}
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={text.name} htmlFor={nameId} className="sm:col-span-2">
              <TextField
                id={nameId}
                value={name}
                maxLength={80}
                onChange={(event) => setName(event.target.value)}
                placeholder={text.namePlaceholder}
              />
            </Field>

            <div className="sm:col-span-2">
              <StringKindPicker
                value={stringKind}
                onChange={setStringKind}
                label={text.guitarKind}
              />
            </div>

            <Field label={text.intervalDays} htmlFor={daysId}>
              <TextField
                id={daysId}
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={intervalDays}
                onChange={(event) => setIntervalDays(event.target.value)}
              />
            </Field>
            <Field label={text.intervalHours} htmlFor={hoursId}>
              <TextField
                id={hoursId}
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={intervalHours}
                onChange={(event) => setIntervalHours(event.target.value)}
              />
            </Field>
            <p className="text-xs leading-5 text-muted sm:col-span-2">
              {text.intervalHint}
            </p>

            <div className="sm:col-span-2">
              <p className="text-xs text-muted">{text.photo}</p>
              <div className="mt-2 flex items-center gap-4">
                {previewUrl ? (
                  <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas">
                    {/* Vista previa local del archivo elegido, aún sin guardar. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </span>
                ) : guitar?.photoAssetId && !removePhoto ? (
                  <GuitarThumbnail assetId={guitar.photoAssetId} />
                ) : (
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas">
                    <GuitarIcon
                      aria-hidden="true"
                      className="size-6 text-muted/70"
                    />
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor={photoInputId}
                    className="inline-flex h-11 cursor-pointer items-center rounded-md border border-line px-3 text-sm text-ink transition hover:bg-white/5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink/60"
                  >
                    {hasPhoto ? text.photoChange : text.photoChoose}
                  </label>
                  <input
                    id={photoInputId}
                    type="file"
                    accept={IMAGE_ACCEPT}
                    className="sr-only"
                    disabled={isSaving}
                    onChange={handlePhotoChange}
                  />
                  {hasPhoto && (
                    <Button
                      type="button"
                      variant="link"
                      size="field"
                      onClick={clearPhoto}
                    >
                      {text.photoRemove}
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                {text.photoHint}
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-300" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" onClick={onClose} disabled={isSaving}>
              {text.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {text.saveGuitar}
            </Button>
          </div>
        </div>
      </form>
    </ModalDialog>
  );
}

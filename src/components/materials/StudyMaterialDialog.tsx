"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { TextArea, TextField } from "@/components/ui/Field";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { SelectField } from "@/components/ui/SelectField";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useDeferredClose } from "@/hooks/useDeferredClose";
import { useDialogModal } from "@/hooks/useDialogModal";
import { useI18nSection } from "@/i18n/I18nProvider";
import { savePracticeAsset } from "@/services/practice-library";
import { saveCloudPracticeAsset } from "@/services/supabase/practice-files";
import {
  getPracticeFileKind,
  normalizeSongsterrUrl,
} from "@/utils/practice-templates";
import {
  extractSpotifyTrackId,
  extractYoutubeVideoId,
  isHttpsUrl,
} from "@/utils/practice-resource-links";
import {
  getStudyMaterialSourceMode,
  isStudyMaterialFileKind,
  STUDY_MATERIAL_KINDS,
} from "@/utils/study-materials";
import { createId } from "@/utils/create-id";
import type { PracticeResourceKind, StudyMaterial } from "@/types/practice";

const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif,image/gif,.jpg,.jpeg,.png,.webp,.avif,.gif";
const GUITAR_PRO_ACCEPT = ".gp,.gpx,.gp3,.gp4,.gp5";
const TAB_FILE_ACCEPT = ".txt,text/plain";

const URL_PLACEHOLDERS: Partial<Record<PracticeResourceKind, string>> = {
  youtube: "https://www.youtube.com/watch?v=…",
  spotify: "https://open.spotify.com/track/…",
  songsterr: "https://www.songsterr.com/a/wa/song?id=…",
  link: "https://…",
};

interface Props {
  material?: StudyMaterial;
  onSave: (material: StudyMaterial, warning?: string) => void;
  onClose: () => void;
}

type MaterialChanges = {
  title: string;
  kind: PracticeResourceKind;
  notes?: string;
  updatedAt: string;
  url?: string;
  assetId?: string;
  fileName?: string;
  text?: string;
};

function isTextFile(file: File): boolean {
  return file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
}

function sourceLabel(
  kind: PracticeResourceKind,
  text: { urlField: string; tabText: string; chooseFile: string },
): string {
  if (
    kind === "youtube" ||
    kind === "spotify" ||
    kind === "songsterr" ||
    kind === "link"
  ) {
    return text.urlField;
  }
  if (kind === "tab") return text.tabText;
  return text.chooseFile;
}

export function StudyMaterialDialog({ material, onSave, onClose }: Props) {
  const text = useI18nSection("materials");
  const { user, isReady } = useAppData();
  const titleId = useId();
  const closeDialog = useDeferredClose(onClose);
  const { dialogRef, handleCancel } = useDialogModal(true, () =>
    closeDialog.requestClose(),
  );

  const [title, setTitle] = useState(material?.title ?? "");
  const [kind, setKind] = useState<PracticeResourceKind>(material?.kind ?? "tab");
  const [notes, setNotes] = useState(material?.notes ?? "");
  const [url, setUrl] = useState(material?.url ?? "");
  const [tabText, setTabText] = useState(
    material?.kind === "tab" ? (material.text ?? "") : "",
  );
  const [tabMode, setTabMode] = useState<"text" | "file">("text");
  const [file, setFile] = useState<File | null>(null);
  const [assetId, setAssetId] = useState(material?.assetId);
  const [fileName, setFileName] = useState(material?.fileName);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const mode = getStudyMaterialSourceMode(kind);
  const isTab = kind === "tab";
  const isFileKind = isStudyMaterialFileKind(kind);
  const isUrlKind = mode === "url";

  function changeKind(next: PracticeResourceKind) {
    if (next === kind) return;
    setKind(next);
    setUrl("");
    setTabText("");
    setTabMode("text");
    setFile(null);
    setAssetId(undefined);
    setFileName(undefined);
    setError(null);
  }

  function acceptForFileKind(): string {
    if (kind === "image") return IMAGE_ACCEPT;
    if (kind === "guitarpro") return GUITAR_PRO_ACCEPT;
    if (kind === "pdf") return ".pdf,application/pdf";
    return TAB_FILE_ACCEPT;
  }

  function fileKindError(): string | null {
    if (kind === "pdf") return text.pdfFileError;
    if (kind === "image") return text.imageFileError;
    if (kind === "guitarpro") return text.guitarProFileError;
    return text.tabFileError;
  }

  async function saveMaterial() {
    const cleanTitle = title.trim();
    if (!cleanTitle) return setError(text.titleRequired);

    setError(null);
    setIsSaving(true);

    try {
      const changes: MaterialChanges = {
        title: cleanTitle,
        kind,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      if (isUrlKind) {
        const value = url.trim();
        if (kind === "youtube" && !extractYoutubeVideoId(value)) {
          return setError(text.youtubeInvalid);
        }
        if (kind === "spotify" && !extractSpotifyTrackId(value)) {
          return setError(text.spotifyInvalid);
        }
        if (kind === "songsterr") {
          const normalized = normalizeSongsterrUrl(value);
          if (!normalized) return setError(text.songsterrInvalid);
          changes.url = normalized;
        } else if (kind === "link") {
          if (!isHttpsUrl(value)) return setError(text.urlInvalid);
          changes.url = value;
        } else {
          changes.url = value;
        }
        changes.text = undefined;
        changes.assetId = undefined;
        changes.fileName = undefined;
      } else if (isTab) {
        let value = tabText;
        let nextFileName: string | undefined;

        if (tabMode === "file" && file) {
          if (!isTextFile(file)) return setError(text.tabFileError);
          value = await file.text();
          nextFileName = file.name;
        }

        if (!value.trim()) return setError(text.textRequired);
        changes.text = value;
        changes.fileName = nextFileName;
        changes.assetId = undefined;
        changes.url = undefined;
      } else if (isFileKind) {
        if (file) {
          const detected = getPracticeFileKind(file.name, file.type);
          if (detected !== kind) return setError(fileKindError());
          if (kind === "image" && file.size > IMAGE_MAX_BYTES) {
            return setError(text.fileTooLarge);
          }
          if (!isReady) {
            return setError(
              "Espera a que se carguen tus datos antes de subir archivos.",
            );
          }

          const nextAssetId = createId();
          const asset = {
            id: nextAssetId,
            fileName: file.name,
            kind: detected,
            blob: file,
          };
          await savePracticeAsset(asset);
          let warning: string | undefined;
          if (user) {
            try {
              await saveCloudPracticeAsset(user.id, asset);
            } catch (cloudError) {
              console.warn(
                "No se pudo subir el material a la nube; se conserva en este dispositivo.",
                cloudError,
              );
              warning = text.cloudWarning;
            }
          }
          changes.assetId = nextAssetId;
          changes.fileName = file.name;
          changes.url = undefined;
          changes.text = undefined;
          onSave(
            material
              ? { ...material, ...changes }
              : {
                  id: createId(),
                  createdAt: new Date().toISOString(),
                  ...changes,
                },
            warning,
          );
          return;
        }

        if (!assetId) return setError(text.fileRequired);
        changes.assetId = assetId;
        changes.fileName = fileName;
        changes.url = undefined;
        changes.text = undefined;
      }

      onSave(
        material
          ? { ...material, ...changes }
          : {
              id: createId(),
              createdAt: new Date().toISOString(),
              ...changes,
            },
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : text.fileRequired,
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ModalDialog
      dialogRef={dialogRef}
      labelledBy={titleId}
      onCancel={handleCancel}
      isClosing={closeDialog.isClosing}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDialog.requestClose();
      }}
      variant="lg"
    >
      <div className="p-5 sm:p-6">
        <DialogHeader
          titleId={titleId}
          title={material ? text.editMaterial : text.newMaterial}
          description={text.formDescription}
          onClose={() => closeDialog.requestClose()}
          closeLabel={text.close}
        />

        <div className="mt-5 space-y-4">
          <label className="block text-xs text-muted">
            {text.titleField}
            <TextField
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={text.titlePlaceholder}
              maxLength={120}
              autoFocus
              className="mt-1"
            />
          </label>

          <label className="block text-xs text-muted">
            {text.kindField}
            <SelectField
              value={kind}
              onChange={(value) => changeKind(value as PracticeResourceKind)}
              ariaLabel={text.kindField}
              className="mt-1"
              options={STUDY_MATERIAL_KINDS.map((value) => ({
                value,
                label: text.kindLabels[value],
              }))}
            />
          </label>

          {isTab && (
            <div
              role="group"
              aria-label={text.source}
              className="grid grid-cols-2 gap-1 rounded-md border border-line p-1 sm:w-fit"
            >
              {(
                [
                  { mode: "text" as const, label: text.tabTextMode },
                  { mode: "file" as const, label: text.tabFileMode },
                ]
              ).map((option) => (
                <button
                  key={option.mode}
                  type="button"
                  aria-pressed={tabMode === option.mode}
                  onClick={() => setTabMode(option.mode)}
                  className={`min-h-10 rounded px-4 text-sm transition ${
                    tabMode === option.mode
                      ? "bg-white/10 text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <div>
            <p className="text-xs text-muted">
              {sourceLabel(kind, text)}
            </p>
            {isUrlKind && (
              <TextField
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder={URL_PLACEHOLDERS[kind] ?? text.urlPlaceholder}
                aria-label={text.urlField}
                className="mt-1"
              />
            )}

            {isTab && tabMode === "text" && (
              <TextArea
                value={tabText}
                onChange={(event) => setTabText(event.target.value)}
                placeholder={text.tabTextPlaceholder}
                aria-label={text.tabText}
                spellCheck={false}
                className="mt-1 min-h-40 font-mono text-xs sm:text-sm"
              />
            )}

            {((isTab && tabMode === "file") || isFileKind) && (
              <div className="mt-1 space-y-2">
                <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line px-4 py-5 text-center text-sm transition hover:bg-white/5 focus-within:outline focus-within:outline-2 focus-within:outline-ink/60">
                  <span className="font-medium">
                    {file || assetId ? text.changeFile : text.chooseFile}
                  </span>
                  <span className="text-xs text-muted">{text.fileHint}</span>
                  <input
                    type="file"
                    accept={
                      isTab && tabMode === "file" ? TAB_FILE_ACCEPT : acceptForFileKind()
                    }
                    disabled={isSaving}
                    className="sr-only"
                    onChange={(event) => {
                      setFile(event.target.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {(file?.name ?? fileName) && (
                  <p className="truncate text-xs text-muted">
                    {file?.name ?? `${text.currentFile}: ${fileName}`}
                  </p>
                )}
              </div>
            )}
          </div>

          <label className="block text-xs text-muted">
            {text.notesField}
            <TextArea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={text.notesPlaceholder}
              maxLength={500}
              className="mt-1 min-h-20"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:justify-end">
            <Button type="button" onClick={() => closeDialog.requestClose()}>
              {text.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isSaving}
              onClick={() => void saveMaterial()}
            >
              {isSaving ? text.saving : text.save}
            </Button>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
}

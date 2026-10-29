"use client";

import { useState } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import {
  extractSpotifyTrackId,
  extractYoutubeVideoId,
} from "@/utils/practice-resource-links";
import { savePracticeAsset } from "@/services/practice-library";
import {
  getPracticeFileKind,
  normalizeSongsterrUrl,
} from "@/utils/practice-templates";
import { createId as createIdentifier } from "@/utils/create-id";
import { saveCloudPracticeAsset } from "@/services/supabase/practice-files";
import {
  ATTACHMENT_OPTIONS,
  type StoredFileKind,
} from "@/utils/practice-attachments";
import type {
  AttachmentDraft,
  AttachmentType,
  TabInputMode,
} from "@/types/practice-attachment";
import type { PracticeResource } from "@/types/practice";

const EMPTY_DRAFT: AttachmentDraft = { title: "", url: "", text: "" };

function createId() {
  return createIdentifier();
}

function isTextFile(file: File): boolean {
  return file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
}

export function usePracticeAttachment(
  onAttach: (resource: PracticeResource) => void,
) {
  const { user, isReady } = useAppData();
  const [activeType, setActiveType] = useState<AttachmentType | null>(null);
  const [tabMode, setTabMode] = useState<TabInputMode>("text");
  const [draft, setDraft] = useState<AttachmentDraft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function open(type: AttachmentType) {
    setActiveType(type);
    setTabMode("text");
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  function close() {
    setActiveType(null);
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  function updateDraft(changes: Partial<AttachmentDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function attach(type: AttachmentType, resource: Omit<PracticeResource, "id" | "title">) {
    const title =
      draft.title.trim() ||
      resource.fileName ||
      ATTACHMENT_OPTIONS[type].defaultTitle;
    onAttach({ ...resource, id: createId(), title });
    close();
  }

  function submitTabText() {
    const text = draft.text.trim();
    if (!text) return setError("Escribe o pega la tablatura.");
    attach("tab", { kind: "tab", text });
  }

  function submitYoutube() {
    if (!extractYoutubeVideoId(draft.url)) {
      return setError("Introduce un enlace HTTPS válido de YouTube.");
    }
    attach("youtube", { kind: "youtube", url: draft.url.trim() });
  }

  function submitSpotify() {
    if (!extractSpotifyTrackId(draft.url)) {
      return setError("Introduce un enlace válido de una canción de Spotify.");
    }
    attach("spotify", { kind: "spotify", url: draft.url.trim() });
  }

  function submitSongsterr() {
    const url = normalizeSongsterrUrl(draft.url);
    if (!url) {
      return setError(
        "Introduce un enlace HTTPS válido de Songsterr (songsterr.com).",
      );
    }
    attach("songsterr", { kind: "songsterr", url });
  }

  function submit() {
    if (activeType === "songsterr") return submitSongsterr();
    if (activeType === "youtube") return submitYoutube();
    if (activeType === "spotify") return submitSpotify();
    if (activeType === "tab" && tabMode === "text") return submitTabText();
  }

  async function saveFileAsset(file: File, kind: StoredFileKind) {
    const assetId = createId();
    const asset = { id: assetId, fileName: file.name, kind, blob: file };
    // El archivo vive primero en este dispositivo; la nube es best-effort para
    // que un bucket mal configurado no impida adjuntar el material.
    await savePracticeAsset(asset);
    if (user) {
      try {
        await saveCloudPracticeAsset(user.id, asset);
      } catch (cloudError) {
        console.warn(
          "No se pudo subir el material a la nube; se conserva en este dispositivo.",
          cloudError,
        );
      }
    }
    return assetId;
  }

  async function submitFile(file: File | undefined) {
    if (!file || !activeType) return;
    const option = ATTACHMENT_OPTIONS[activeType];
    const isTabText = activeType === "tab" && isTextFile(file);
    const kind = getPracticeFileKind(file.name, file.type);
    const isAllowed = kind !== null && option.fileKinds.includes(kind);
    if (!isTabText && !isAllowed) return setError(option.fileError);
    if (
      !isTabText &&
      option.maxBytes !== undefined &&
      file.size > option.maxBytes
    ) {
      return setError(option.sizeError ?? "El archivo es demasiado grande.");
    }
    if (!isReady) {
      return setError("Espera a que se carguen tus datos antes de subir archivos.");
    }

    setIsSaving(true);
    setError(null);
    try {
      if (isTabText) {
        attach("tab", { kind: "tab", text: await file.text(), fileName: file.name });
        return;
      }
      const assetId = await saveFileAsset(file, kind!);
      attach(activeType, { kind: kind!, fileName: file.name, assetId });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el archivo.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return {
    activeType,
    tabMode,
    setTabMode,
    draft,
    updateDraft,
    error,
    isSaving,
    open,
    close,
    submit,
    submitFile,
  };
}

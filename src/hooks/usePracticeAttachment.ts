"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import {
  extractSpotifyTrackId,
  extractYoutubeVideoId,
} from "@/lib/practice-resource-links";
import { savePracticeAsset } from "@/lib/practice-library";
import { getPracticeFileKind } from "@/lib/practice-templates";
import { saveCloudPracticeAsset } from "@/lib/supabase/practice-files";
import type {
  AttachmentDraft,
  AttachmentType,
  TabInputMode,
} from "@/types/practice-attachment";
import type { PracticeResource } from "@/types/practice";

const EMPTY_DRAFT: AttachmentDraft = { title: "", url: "", text: "" };

const DEFAULT_TITLES: Record<AttachmentType, string> = {
  tab: "Tablatura",
  pdf: "Documento PDF",
  youtube: "Vídeo de YouTube",
  spotify: "Canción de Spotify",
};

type StoredFileKind = NonNullable<ReturnType<typeof getPracticeFileKind>>;

const ALLOWED_FILE_KINDS: Record<AttachmentType, StoredFileKind[]> = {
  tab: ["guitarpro"],
  pdf: ["pdf"],
  youtube: [],
  spotify: [],
};

const FILE_ERRORS: Record<AttachmentType, string> = {
  tab: "Sube un archivo Guitar Pro (.gp, .gpx, .gp3–.gp5) o de texto (.txt).",
  pdf: "Sube un archivo PDF.",
  youtube: "",
  spotify: "",
};

function createId() {
  return crypto.randomUUID();
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
    const title = draft.title.trim() || resource.fileName || DEFAULT_TITLES[type];
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeType === "youtube") return submitYoutube();
    if (activeType === "spotify") return submitSpotify();
    if (activeType === "tab" && tabMode === "text") return submitTabText();
  }

  async function saveFileAsset(file: File, kind: StoredFileKind) {
    const assetId = createId();
    const asset = { id: assetId, fileName: file.name, kind, blob: file };
    if (user) await saveCloudPracticeAsset(user.id, asset);
    else await savePracticeAsset(asset);
    return assetId;
  }

  async function submitFile(file: File | undefined) {
    if (!file || !activeType) return;
    const isTabText = activeType === "tab" && isTextFile(file);
    const kind = getPracticeFileKind(file.name, file.type);
    const isAllowed = kind !== null && ALLOWED_FILE_KINDS[activeType].includes(kind);
    if (!isTabText && !isAllowed) return setError(FILE_ERRORS[activeType]);
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

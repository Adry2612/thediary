"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import {
  getPracticeFileKind,
  normalizeSongsterrUrl,
} from "@/lib/practice-templates";
import { savePracticeAsset } from "@/lib/practice-library";
import type { PracticePhase, PracticeResource } from "@/types/practice";

interface PracticeResourceEditorProps {
  phaseId: PracticePhase["id"];
  resources: PracticeResource[];
  onChange: (
    phaseId: PracticePhase["id"],
    changes: Partial<PracticePhase>,
  ) => void;
}

function createId() {
  return crypto.randomUUID();
}

export function PracticeResourceEditor({
  phaseId,
  resources,
  onChange,
}: PracticeResourceEditorProps) {
  const [songsterrUrl, setSongsterrUrl] = useState("");
  const [songsterrTitle, setSongsterrTitle] = useState("");
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [isSavingFile, setIsSavingFile] = useState(false);

  function addResource(resource: PracticeResource) {
    onChange(phaseId, { resources: [...resources, resource] });
  }

  function removeResource(resourceId: string) {
    onChange(phaseId, {
      resources: resources.filter((resource) => resource.id !== resourceId),
    });
  }

  function addSongsterrLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = normalizeSongsterrUrl(songsterrUrl);
    if (!url) {
      setResourceError("Introduce un enlace HTTPS válido de Songsterr.");
      return;
    }

    addResource({
      id: createId(),
      title: songsterrTitle.trim() || "Tab de Songsterr",
      kind: "songsterr",
      url,
    });
    setSongsterrUrl("");
    setSongsterrTitle("");
    setResourceError(null);
  }

  async function addFile(file: File | undefined) {
    if (!file) return;
    const kind = getPracticeFileKind(file.name, file.type);
    if (!kind) {
      setResourceError(
        "Sube un audio o un archivo PDF o Guitar Pro (.gp, .gpx, .gp3–.gp5).",
      );
      return;
    }

    setIsSavingFile(true);
    setResourceError(null);
    try {
      const assetId = createId();
      await savePracticeAsset({
        id: assetId,
        fileName: file.name,
        kind,
        blob: file,
      });
      addResource({
        id: createId(),
        title: file.name,
        kind,
        fileName: file.name,
        assetId,
      });
    } catch (error) {
      setResourceError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el archivo en este dispositivo.",
      );
    } finally {
      setIsSavingFile(false);
    }
  }

  return (
    <div className="mt-5">
      <p className="mb-2 text-xs uppercase tracking-[0.05em] text-muted">
        Tablaturas y partituras
      </p>
      {resources.length > 0 && (
        <ul className="mb-3 space-y-2">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="flex items-center justify-between gap-3 border border-line px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">
                {resource.title}
                <span className="ml-2 text-xs text-muted">
                  {resource.kind === "songsterr"
                    ? "Songsterr"
                    : resource.kind === "pdf"
                      ? "PDF"
                      : resource.kind === "audio"
                        ? "Backing track"
                        : "Guitar Pro"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => removeResource(resource.id)}
                aria-label={`Quitar ${resource.title}`}
                className="shrink-0 text-xs text-muted hover:text-ink"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={addSongsterrLink}
        className="grid gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]"
      >
        <TextField
          value={songsterrTitle}
          onChange={(event) => setSongsterrTitle(event.target.value)}
          placeholder="Nombre de la canción"
          aria-label="Nombre del material de Songsterr"
          className="min-w-0"
        />
        <TextField
          type="url"
          value={songsterrUrl}
          onChange={(event) => setSongsterrUrl(event.target.value)}
          placeholder="https://www.songsterr.com/…"
          aria-label="Enlace de Songsterr"
          className="min-w-0"
        />
        <Button type="submit">Añadir enlace</Button>
      </form>
      <label className="mt-2 inline-flex h-11 cursor-pointer items-center border border-line px-4 text-sm transition hover:bg-white/5">
        {isSavingFile ? "Guardando archivo…" : "Subir audio, PDF o Guitar Pro"}
        <input
          type="file"
          accept="audio/*,.pdf,.gp,.gpx,.gp3,.gp4,.gp5"
          className="sr-only"
          disabled={isSavingFile}
          onChange={(event) => {
            void addFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
      </label>
      {resourceError && (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {resourceError}
        </p>
      )}
    </div>
  );
}

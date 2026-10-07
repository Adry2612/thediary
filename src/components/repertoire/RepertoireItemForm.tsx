"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { getPracticeFileKind } from "@/lib/practice-templates";
import { savePracticeAsset } from "@/lib/practice-library";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { RepertoireItemKind } from "@/types/practice";

function createId() {
  return crypto.randomUUID();
}

export function RepertoireItemForm() {
  const saveRepertoireItem = usePracticeStore(
    (state) => state.saveRepertoireItem,
  );
  const [kind, setKind] = useState<RepertoireItemKind>("song");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [guitarProFile, setGuitarProFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Escribe el nombre de la canción o del lick.");
      return;
    }
    if (guitarProFile && getPracticeFileKind(guitarProFile.name) !== "guitarpro") {
      setError("El archivo debe ser un formato Guitar Pro compatible.");
      return;
    }

    setIsSaving(true);
    setError(null);
    const itemId = createId();
    let guitarPro:
      | {
          id: string;
          title: string;
          kind: "guitarpro";
          fileName: string;
          assetId: string;
        }
      | undefined;
    try {
      if (kind === "lick" && guitarProFile) {
        const assetId = createId();
        await savePracticeAsset({
          id: assetId,
          fileName: guitarProFile.name,
          kind: "guitarpro",
          blob: guitarProFile,
        });
        guitarPro = {
          id: createId(),
          title: cleanTitle,
          kind: "guitarpro",
          fileName: guitarProFile.name,
          assetId,
        };
      }

      const initialPartId = createId();
      saveRepertoireItem({
        id: itemId,
        kind,
        title: cleanTitle,
        ...(kind === "song" && artist.trim()
          ? { artist: artist.trim() }
          : {}),
        parts: [
          {
            id: initialPartId,
            name: kind === "song" ? "Canción completa" : "Lick principal",
            learned: false,
            masteredBpm: null,
            targetBpm: null,
          },
        ],
        guitarPro,
        updatedAt: new Date().toISOString(),
      });
      setTitle("");
      setArtist("");
      setGuitarProFile(null);
      const fileInput = event.currentTarget.querySelector<HTMLInputElement>(
        'input[type="file"]',
      );
      if (fileInput) fileInput.value = "";
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el elemento del repertorio.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="enter rounded-xl border border-line bg-surface p-6 sm:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-muted">
          Biblioteca personal
        </p>
        <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em]">
          Añadir al repertorio
        </h2>
      </div>

      <form
        onSubmit={(event) => void addItem(event)}
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      >
        <label className="block text-xs text-muted">
          Tipo
          <select
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as RepertoireItemKind)
            }
            className="mt-1 h-12 w-full rounded-md border border-line bg-canvas px-4 text-sm text-ink transition-colors hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg"
          >
            <option value="song">Canción</option>
            <option value="lick">Lick</option>
          </select>
        </label>

        <label className="block text-xs text-muted">
          {kind === "song" ? "Nombre de la canción" : "Nombre del lick"}
          <TextField
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            placeholder={kind === "song" ? "Master of Puppets" : "Frase en La menor"}
            required
            className="mt-1"
          />
        </label>

        {kind === "song" ? (
          <label className="block text-xs text-muted">
            Artista
            <TextField
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              maxLength={100}
              placeholder="Metallica"
              className="mt-1"
            />
          </label>
        ) : (
          <label className="block cursor-pointer text-xs text-muted">
            Archivo Guitar Pro · opcional
            <span className="mt-1 flex h-12 items-center truncate rounded-md border border-line px-4 text-sm text-muted transition-colors hover:border-white/20">
              {guitarProFile?.name ?? "Seleccionar archivo .gp"}
            </span>
            <input
              type="file"
              accept=".gp,.gpx,.gp3,.gp4,.gp5"
              className="sr-only"
              onChange={(event) =>
                setGuitarProFile(event.target.files?.[0] ?? null)
              }
            />
          </label>
        )}

        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? "Guardando…" : `Añadir ${kind === "song" ? "canción" : "lick"}`}
        </Button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

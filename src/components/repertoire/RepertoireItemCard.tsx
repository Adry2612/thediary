"use client";

import { useEffect, useState } from "react";
import { PracticeMaterials } from "@/components/practice/PracticeMaterials";
import { RepertoirePartEditor } from "@/components/repertoire/RepertoirePartEditor";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { formatPracticeDuration } from "@/lib/dashboard-data";
import type { RepertoirePartPracticeStats } from "@/lib/repertoire-analytics";
import {
  createRepertoirePart,
  parseRepertoireBpm,
  updateRepertoirePart,
} from "@/lib/repertoire-item-editing";
import type {
  PracticePhase,
  RepertoireItem,
} from "@/types/practice";

function createId() {
  return crypto.randomUUID();
}

export function RepertoireItemCard({
  item,
  practiceStats,
  onSave,
  onDelete,
}: {
  item: RepertoireItem;
  practiceStats: Map<string, RepertoirePartPracticeStats> | undefined;
  onSave: (item: RepertoireItem) => void;
  onDelete: (itemId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [artist, setArtist] = useState(item.artist ?? "");

  useEffect(() => {
    setTitle(item.title);
    setArtist(item.artist ?? "");
  }, [item.title, item.artist]);

  function saveDetails() {
    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();
    if (!cleanTitle) {
      setTitle(item.title);
      return;
    }
    if (cleanTitle === item.title && cleanArtist === (item.artist ?? "")) return;

    onSave({
      ...item,
      title: cleanTitle,
      artist: cleanArtist || undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  function addPart() {
    const newPart = createRepertoirePart(createId(), item.parts.length + 1);
    onSave({
      ...item,
      parts: [...item.parts, newPart],
      updatedAt: new Date().toISOString(),
    });
  }

  const materialPhase: PracticePhase[] = item.guitarPro
    ? [
        {
          id: item.id,
          name: item.title,
          durationMinutes: 1,
          skill: "repertoire",
          resources: [item.guitarPro],
        },
      ]
    : [];
  const totalSeconds = item.parts.reduce(
    (total, part) =>
      total + (practiceStats?.get(part.id)?.practiceSeconds ?? 0),
    0,
  );
  const learnedParts = item.parts.filter((part) => part.learned).length;

  return (
    <article className="enter overflow-hidden rounded-xl border border-line bg-surface">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={`repertoire-details-${item.id}`}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 text-left transition hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-ink/60 sm:p-5"
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="hidden size-10 shrink-0 items-center justify-center border border-line font-mono text-xs text-muted sm:flex">
            {item.kind === "song" ? "♫" : "L"}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-sans text-xl font-semibold text-ink sm:text-2xl">
              {item.title}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <span className="uppercase tracking-[0.08em]">
                {item.kind === "song" ? "Canción" : "Lick"}
              </span>
              {item.artist && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{item.artist}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{item.parts.length} partes</span>
            </span>
          </span>
        </span>
        <span className="flex items-center gap-3 sm:gap-6">
          <span className="text-right font-mono text-xs text-muted">
            {formatPracticeDuration(totalSeconds / 60)}
            <span className="mt-1 block">
              {learnedParts}/{item.parts.length} aprendidas
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center border border-line text-lg text-muted"
          >
            {isExpanded ? "−" : "+"}
          </span>
        </span>
      </button>

      {isExpanded && (
        <div
          id={`repertoire-details-${item.id}`}
          className="border-t border-line bg-canvas/40 p-4 sm:p-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-wrap gap-3">
              <label className="min-w-48 flex-1 text-xs text-muted">
                Nombre
                <TextField
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onBlur={saveDetails}
                  maxLength={100}
                  className="mt-1 h-11 font-sans text-xl font-semibold"
                />
              </label>
              {item.kind === "song" && (
                <label className="min-w-40 flex-1 text-xs text-muted sm:max-w-64">
                  Artista
                  <TextField
                    value={artist}
                    onChange={(event) => setArtist(event.target.value)}
                    onBlur={saveDetails}
                    maxLength={100}
                    placeholder="Artista"
                    className="mt-1 h-11 text-sm"
                  />
                </label>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  `¿Eliminar «${item.title}» del repertorio? Las sesiones permanecerán en el historial general, pero sus horas dejarán de mostrarse aquí.`,
                );
                if (confirmed) onDelete(item.id);
              }}
              className="h-11 px-2 text-xs text-muted underline decoration-line underline-offset-4 transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/60"
            >
              Eliminar elemento
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-xs uppercase tracking-[0.1em] text-muted">
              Partes · {item.parts.length}
            </p>
            <Button type="button" onClick={addPart} className="h-11 min-w-11 px-4">
              Añadir parte
            </Button>
          </div>

          <ul className="mt-3 space-y-3">
            {item.parts.map((part) => (
              <RepertoirePartEditor
                key={part.id}
                item={item}
                part={part}
                stats={practiceStats?.get(part.id)}
                onSave={onSave}
              />
            ))}
          </ul>

          {item.guitarPro && (
            <details className="mt-4 rounded-lg border border-line">
              <summary className="cursor-pointer px-4 py-3 text-sm text-muted transition hover:text-ink">
                Ver Guitar Pro · {item.guitarPro.fileName}
              </summary>
              <div className="border-t border-line p-3 sm:p-4">
                <PracticeMaterials phases={materialPhase} />
              </div>
            </details>
          )}
        </div>
      )}
    </article>
  );
}

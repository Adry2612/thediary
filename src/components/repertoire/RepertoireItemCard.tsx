"use client";

import { useEffect, useState } from "react";
import { PracticeMaterials } from "@/components/practice/PracticeMaterials";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { formatPracticeDuration } from "@/lib/dashboard-data";
import type { RepertoirePartPracticeStats } from "@/lib/repertoire-analytics";
import type {
  PracticePhase,
  RepertoireItem,
  RepertoirePart,
} from "@/types/practice";

function createId() {
  return crypto.randomUUID();
}

function PartEditor({
  item,
  part,
  stats,
  onSave,
}: {
  item: RepertoireItem;
  part: RepertoirePart;
  stats: RepertoirePartPracticeStats | undefined;
  onSave: (item: RepertoireItem) => void;
}) {
  const [name, setName] = useState(part.name);
  const [masteredBpm, setMasteredBpm] = useState(
    part.masteredBpm?.toString() ?? "",
  );
  const [targetBpm, setTargetBpm] = useState(
    part.targetBpm?.toString() ?? "",
  );

  useEffect(() => {
    setName(part.name);
    setMasteredBpm(part.masteredBpm?.toString() ?? "");
    setTargetBpm(part.targetBpm?.toString() ?? "");
  }, [part]);

  function updatePart(changes: Partial<RepertoirePart>) {
    onSave({
      ...item,
      parts: item.parts.map((candidate) =>
        candidate.id === part.id ? { ...candidate, ...changes } : candidate,
      ),
      updatedAt: new Date().toISOString(),
    });
  }

  function saveBpm(field: "masteredBpm" | "targetBpm", value: string) {
    const parsed = value.trim() ? Number(value) : null;
    if (
      parsed !== null &&
      (!Number.isInteger(parsed) || parsed < 0 || parsed > 400)
    ) {
      if (field === "masteredBpm") setMasteredBpm("");
      if (field === "targetBpm") setTargetBpm("");
      updatePart({ [field]: null });
      return;
    }
    updatePart({ [field]: parsed });
  }

  return (
    <li className="rounded-lg border border-line bg-canvas/50 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_auto_minmax(6rem,0.7fr)_minmax(6rem,0.7fr)_auto] sm:items-end">
        <label className="block text-xs text-muted">
          Parte
          <TextField
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => {
              const cleanName = name.trim();
              if (!cleanName) {
                setName(part.name);
                return;
              }
              if (cleanName !== part.name) updatePart({ name: cleanName });
            }}
            maxLength={80}
            className="mt-1"
          />
        </label>

        <label className="flex h-12 items-center gap-2 rounded-md border border-line px-3 text-sm">
          <input
            type="checkbox"
            checked={part.learned}
            onChange={(event) =>
              updatePart({ learned: event.target.checked })
            }
            className="size-4 accent-accent-green-fg"
          />
          Aprendido
        </label>

        <label className="block text-xs text-muted">
          BPM dominado
          <TextField
            type="number"
            min={0}
            max={400}
            step={1}
            value={masteredBpm}
            onChange={(event) => setMasteredBpm(event.target.value)}
            onBlur={() => saveBpm("masteredBpm", masteredBpm)}
            placeholder="—"
            className="mt-1 font-mono"
          />
        </label>

        <label className="block text-xs text-muted">
          BPM objetivo
          <TextField
            type="number"
            min={0}
            max={400}
            step={1}
            value={targetBpm}
            onChange={(event) => setTargetBpm(event.target.value)}
            onBlur={() => saveBpm("targetBpm", targetBpm)}
            placeholder="—"
            className="mt-1 font-mono"
          />
        </label>

        <p className="whitespace-nowrap font-mono text-xs text-muted sm:pb-3">
          {formatPracticeDuration((stats?.practiceSeconds ?? 0) / 60)}
          <span className="ml-1">· {stats?.sessionCount ?? 0} sesiones</span>
        </p>
      </div>
    </li>
  );
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
    const newPart: RepertoirePart = {
      id: createId(),
      name: `Parte ${item.parts.length + 1}`,
      learned: false,
      masteredBpm: null,
      targetBpm: null,
    };
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
    <article className="enter rounded-xl border border-line bg-surface p-5 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <span className="rounded-full border border-line px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-muted">
            {item.kind === "song" ? "Canción" : "Lick"}
          </span>
          <label className="min-w-48 flex-1 text-xs text-muted">
            <span className="sr-only">Nombre de {item.title}</span>
            <TextField
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={saveDetails}
              maxLength={100}
              className="h-11 font-serif text-2xl"
            />
          </label>
          {item.kind === "song" && (
            <label className="w-full max-w-56 text-xs text-muted">
              <span className="sr-only">Artista de {item.title}</span>
              <TextField
                value={artist}
                onChange={(event) => setArtist(event.target.value)}
                onBlur={saveDetails}
                maxLength={100}
                placeholder="Artista"
                className="h-10 text-sm"
              />
            </label>
          )}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-right font-mono text-xs text-muted">
            {formatPracticeDuration(totalSeconds / 60)}
            <span className="mt-1 block">
              {learnedParts}/{item.parts.length} aprendidas
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              const confirmed = window.confirm(
                `¿Eliminar «${item.title}» del repertorio? Las sesiones permanecerán en el historial general, pero sus horas dejarán de mostrarse aquí.`,
              );
              if (confirmed) onDelete(item.id);
            }}
            className="text-xs text-muted underline decoration-line underline-offset-4 transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/60"
          >
            Eliminar
          </button>
        </div>
      </header>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-xs uppercase tracking-[0.1em] text-muted">
          Partes · {item.parts.length}
        </p>
        <Button type="button" onClick={addPart} className="h-11 min-w-11 px-4">
          Añadir parte
        </Button>
      </div>

      <ul className="mt-3 space-y-3">
        {item.parts.map((part) => (
          <PartEditor
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
    </article>
  );
}

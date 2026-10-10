"use client";

import { useEffect, useState } from "react";
import { TextField } from "@/components/ui/Field";
import { formatPracticeDuration } from "@/lib/dashboard-data";
import {
  parseRepertoireBpm,
  updateRepertoirePart,
} from "@/lib/repertoire-item-editing";
import type { RepertoirePartPracticeStats } from "@/lib/repertoire-analytics";
import type { RepertoireItem, RepertoirePart } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

interface RepertoirePartEditorProps {
  item: RepertoireItem;
  part: RepertoirePart;
  stats: RepertoirePartPracticeStats | undefined;
  onSave: (item: RepertoireItem) => void;
}

export function RepertoirePartEditor({
  item,
  part,
  stats,
  onSave,
}: RepertoirePartEditorProps) {
  const text = useI18nSection("repertoire");
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
    onSave(
      updateRepertoirePart(item, part.id, changes, new Date().toISOString()),
    );
  }

  function saveBpm(field: "masteredBpm" | "targetBpm", value: string) {
    const parsed = parseRepertoireBpm(value);
    if (!parsed.isValid) {
      if (field === "masteredBpm") setMasteredBpm("");
      if (field === "targetBpm") setTargetBpm("");
    }
    updatePart({ [field]: parsed.value });
  }

  return (
    <li className="rounded-lg border border-line bg-canvas/50 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_auto_minmax(6rem,0.7fr)_minmax(6rem,0.7fr)_auto] sm:items-end">
        <label className="block text-xs text-muted">
           {text.learnedParts}
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

        <label className="flex h-12 cursor-pointer items-center gap-2 rounded-md border border-line px-3 text-sm">
          <input
            type="checkbox"
            checked={part.learned}
            onChange={(event) => updatePart({ learned: event.target.checked })}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="flex size-4 items-center justify-center border border-muted text-transparent transition peer-checked:border-accent-green-fg peer-checked:bg-accent-green-fg peer-checked:text-canvas peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-green-fg"
          >
            <svg viewBox="0 0 12 12" className="size-3" fill="none">
              <path
                d="m2 6 2.5 2.5L10 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
           <span>{text.learned}</span>
        </label>

        <label className="block text-xs text-muted">
           {text.masteredBpm}
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
           {text.targetBpm}
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
           <span className="ml-1">· {stats?.sessionCount ?? 0} {text.sessions}</span>
        </p>
      </div>
    </li>
  );
}

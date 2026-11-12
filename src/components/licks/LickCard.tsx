"use client";

import Link from "next/link";
import { TechniqueBadges } from "@/components/licks/TechniqueBadges";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { useI18nSection } from "@/i18n/I18nProvider";
import { getLickProgress } from "@/utils/licks/progress";
import { RESOURCE_LABELS } from "@/utils/practice-resources";
import {
  getLastPracticedLabel,
  getLickTitle,
} from "@/utils/licks/presentation";
import type { GuitarLick } from "@/types/lick";
import type { RepertoireItem } from "@/types/practice";

export function LickCard({
  lick,
  song,
  today,
  onDelete,
}: {
  lick: GuitarLick;
  song?: RepertoireItem;
  today: Date;
  onDelete: (lickId: string) => void;
}) {
  const text = useI18nSection("licks");
  const title = getLickTitle(text, lick);
  const progress = getLickProgress(lick);
  const lastPractised = getLastPracticedLabel(text, lick.lastPracticedAt, today);

  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border border-line bg-surface p-5 transition hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              {lick.key ?? text.noKey}
            </span>
            {song ? (
              <Link
                href={`/repertoire/${song.id}`}
                className="truncate text-[11px] text-muted underline underline-offset-4 transition hover:text-ink"
              >
                {song.title}
              </Link>
            ) : null}
          </div>
          <h2 className="mt-3 truncate font-sans text-lg font-semibold tracking-tight text-ink">
            <Link
              href={`/licks/${lick.id}`}
              className="transition hover:text-ink/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink/60"
            >
              {title}
            </Link>
          </h2>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-xs tabular-nums text-ink">
            {progress.currentBpm !== undefined
              ? `${progress.currentBpm} BPM`
              : text.noBpm}
          </p>
          {progress.targetBpm !== undefined ? (
            <p className="mt-1 text-[11px] text-muted">
              {text.target}: {progress.targetBpm} BPM
            </p>
          ) : null}
        </div>
      </div>

      {progress.percentage !== undefined ? (
        <div className="mt-3">
          <div className="h-1 overflow-hidden rounded-full bg-line">
            <span
              className="block h-full rounded-full bg-accent-green-fg"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-[10px] text-muted">
            {progress.percentage}% {text.progressOfTarget}
          </p>
        </div>
      ) : null}

      {lick.resources?.length ? (
        <div className="mt-4 min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted">
            {text.materialsLabel}
          </p>
          <ul className="mt-1 space-y-1">
            {lick.resources.slice(0, 3).map((resource) => (
              <li key={resource.id} className="truncate text-xs text-muted">
                {resource.title}
                <span className="ml-2 text-[10px] uppercase tracking-[0.08em]">
                  {RESOURCE_LABELS[resource.kind]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="min-w-0">
          <TechniqueBadges techniques={lick.techniques} />
          <p className="mt-2 text-[11px] text-muted">{lastPractised}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/licks/${lick.id}`}
            className="inline-flex h-9 items-center rounded-md border border-line px-3 text-xs text-ink transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
          >
            {text.open}
          </Link>
          <Link
            href={`/licks/${lick.id}/edit`}
            aria-label={`${text.edit}: ${title}`}
            className="inline-flex size-9 items-center justify-center rounded-md border border-line text-muted transition hover:bg-white/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
          >
            <EditIcon className="size-4" />
          </Link>
          <button
            type="button"
            aria-label={`${text.delete}: ${title}`}
            onClick={() => {
              if (window.confirm(text.deleteConfirm)) onDelete(lick.id);
            }}
            className="inline-flex size-9 items-center justify-center rounded-md border border-line text-muted transition hover:border-red-300/50 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

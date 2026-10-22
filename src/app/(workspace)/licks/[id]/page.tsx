"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LickBpmChart } from "@/components/licks/LickBpmChart";
import { LickBpmPanel } from "@/components/licks/LickBpmPanel";
import { LickEditorModal } from "@/components/licks/LickEditorModal";
import { LickTab } from "@/components/licks/LickTab";
import { TechniqueBadges } from "@/components/licks/TechniqueBadges";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  findLinkedSong,
  getLastPracticedLabel,
  getLickTitle,
} from "@/lib/licks/presentation";
import { usePracticeStore } from "@/stores/usePracticeStore";

interface Props {
  params: Promise<{ id: string }>;
}

export default function LickDetailPage({ params }: Props) {
  const text = useI18nSection("licks");
  const router = useRouter();
  const { id } = use(params);
  const licks = usePracticeStore((state) => state.licks);
  const items = usePracticeStore((state) => state.repertoireItems);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const saveLick = usePracticeStore((state) => state.saveLick);
  const deleteLick = usePracticeStore((state) => state.deleteLick);
  const [editing, setEditing] = useState(false);
  const today = useMemo(() => new Date(), []);
  const lick = licks.find((candidate) => candidate.id === id);

  if (!hasHydrated) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-16 text-sm text-muted">
        {text.loading}
      </main>
    );
  }

  if (!lick) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <BackLink href="/licks">{text.back}</BackLink>
        <h1 className="mt-8 font-sans text-3xl font-semibold tracking-tight text-ink">
          {text.notFound}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          {text.notFoundDescription}
        </p>
      </main>
    );
  }

  const title = getLickTitle(text, lick);
  const song = findLinkedSong(items, lick.associatedSongId);
  const lastPractised = getLastPracticedLabel(text, lick.lastPracticedAt, today);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <BackLink href="/licks">{text.back}</BackLink>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {text.editorEyebrow}
          </p>
          <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              {lick.key ?? text.noKey}
            </span>
            <TechniqueBadges techniques={lick.techniques} />
          </div>
          <p className="mt-3 text-xs text-muted">
            {text.lastPracticed}: {lastPractised} · {text.practiceCount}:{" "}
            {lick.practiceCount}
          </p>
          {song ? (
            <p className="mt-2 text-xs text-muted">
              {text.linkedSong}:{" "}
              <Link
                href={`/repertoire/${song.id}`}
                className="text-ink underline underline-offset-4 hover:text-ink/80"
              >
                {song.title}
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">{text.noLinkedSong}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="field"
            onClick={() => setEditing(true)}
          >
            <EditIcon className="size-4" />
            {text.edit}
          </Button>
          <button
            type="button"
            aria-label={`${text.delete}: ${title}`}
            onClick={() => {
              if (!window.confirm(text.deleteConfirm)) return;
              deleteLick(lick.id);
              router.push("/licks");
            }}
            className="inline-flex size-11 items-center justify-center rounded-md border border-line text-muted transition hover:border-red-300/50 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </header>

      <section className="mt-8">
        <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">
          {text.tabTitle}
        </h2>
        <LickTab
          content={lick.tabContent}
          emptyLabel={text.tabEmpty}
          ariaLabel={`${text.tabTitle}: ${title}`}
          className="mt-3"
        />
      </section>

      <div className="mt-6">
        <LickBpmChart lick={lick} />
      </div>

      <div className="mt-6">
        <LickBpmPanel lick={lick} />
      </div>

      {editing ? (
        <LickEditorModal
          lick={lick}
          songs={items.filter((item) => item.kind === "song")}
          onSave={saveLick}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </main>
  );
}

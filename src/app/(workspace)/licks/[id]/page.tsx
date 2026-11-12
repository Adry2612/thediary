"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LickBpmChart } from "@/components/licks/LickBpmChart";
import { LickBpmPanel } from "@/components/licks/LickBpmPanel";
import { LickMaterials } from "@/components/licks/LickMaterials";
import { LickReferenceVideo } from "@/components/licks/LickReferenceVideo";
import { TechniqueBadges } from "@/components/licks/TechniqueBadges";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  findLinkedSong,
  getLastPracticedLabel,
  getLickTitle,
} from "@/utils/licks/presentation";
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
  const deleteLick = usePracticeStore((state) => state.deleteLick);
  const today = useMemo(() => new Date(), []);
  const lick = licks.find((candidate) => candidate.id === id);

  if (!hasHydrated) {
    return (
      <PageShell>
        <p className="text-sm text-muted">{text.loading}</p>
      </PageShell>
    );
  }

  if (!lick) {
    return (
      <PageShell>
        <BackLink href="/licks">{text.back}</BackLink>
        <PageHeader className="mt-8" title={text.notFound} description={text.notFoundDescription} />
      </PageShell>
    );
  }

  const title = getLickTitle(text, lick);
  const song = findLinkedSong(items, lick.associatedSongId);
  const lastPractised = getLastPracticedLabel(text, lick.lastPracticedAt, today);

  return (
    <PageShell>
      <BackLink href="/licks">{text.back}</BackLink>

      <PageHeader
        className="mt-6"
        title={title}
        description={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-line px-2 py-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                {lick.key ?? text.noKey}
              </span>
              <TechniqueBadges techniques={lick.techniques} />
            </div>
            <p className="mt-3 text-sm text-muted">
              {text.lastPracticed}: {lastPractised} · {text.practiceCount}:{" "}
              {lick.practiceCount}
            </p>
            {song ? (
              <p className="mt-2 text-sm text-muted">
                {text.linkedSong}:{" "}
                <Link
                  href={`/repertoire/${song.id}`}
                  className="text-ink underline underline-offset-4 hover:text-ink/80"
                >
                  {song.title}
                </Link>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">{text.noLinkedSong}</p>
            )}
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <ButtonLink
              href={`/licks/${lick.id}/edit`}
              variant="ghost"
            >
              <EditIcon className="size-4" />
              {text.edit}
            </ButtonLink>
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
        }
      />

      {lick.referenceVideo ? (
        <section className="mt-8">
          <LickReferenceVideo video={lick.referenceVideo} />
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">
          {text.materialsLabel}
        </h2>
        <LickMaterials
          resources={lick.resources}
          emptyLabel={text.materialsEmpty}
          className="mt-3"
        />
      </section>

      <div className="mt-6">
        <LickBpmChart lick={lick} />
      </div>

      <div className="mt-6">
        <LickBpmPanel lick={lick} />
      </div>

    </PageShell>
  );
}

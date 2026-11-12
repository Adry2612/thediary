"use client";

import { use, useMemo, useState } from "react";
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
  const [selectedMaterialId, setSelectedMaterialId] = useState<
    string | undefined
  >();
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
  const hasMaterial = Boolean(lick.resources?.length);
  const hasVideo = Boolean(lick.referenceVideo);
  const hasBoth = hasMaterial && hasVideo;
  const materialSection = (
    <section className="mt-8 min-w-0">
      <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">
        {text.materialsLabel}
      </h2>
      <LickMaterials
        resources={lick.resources}
        emptyLabel={text.materialsEmpty}
        className="mt-3"
      />
    </section>
  );
  const videoSection = lick.referenceVideo ? (
    <section className="mt-8 min-w-0">
      <LickReferenceVideo video={lick.referenceVideo} />
    </section>
  ) : null;
  const splitMedia =
    hasBoth && lick.referenceVideo ? (
      <div className="mt-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,1fr)]">
          <div className="min-w-0">
            <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">
              {text.materialsLabel}
            </h2>
            <LickMaterials
              resources={lick.resources}
              layout="stacked"
              part="selector"
              selectedId={selectedMaterialId}
              onSelect={setSelectedMaterialId}
              className="mt-3"
            />
          </div>
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,1fr)]">
          <LickMaterials
            resources={lick.resources}
            part="preview"
            selectedId={selectedMaterialId}
            className="min-w-0"
          />
          <section className="min-w-0">
            <LickReferenceVideo video={lick.referenceVideo} />
          </section>
        </div>
      </div>
    ) : null;

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
              {lick.keySource === "auto" ? (
                <span className="rounded-md border border-amber-300/40 bg-amber-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-200">
                  {text.keyAutoBadge}
                </span>
              ) : null}
              <TechniqueBadges techniques={lick.techniques} />
            </div>
            {lick.keySource === "auto" ? (
              <p className="mt-2 text-xs text-amber-200/90">
                {text.keyAutoHint}
              </p>
            ) : null}
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

      {splitMedia ?? (
        <>
          {videoSection}
          {materialSection}
        </>
      )}

      <div className="mt-6">
        <LickBpmChart lick={lick} />
      </div>

      <div className="mt-6">
        <LickBpmPanel lick={lick} />
      </div>

    </PageShell>
  );
}

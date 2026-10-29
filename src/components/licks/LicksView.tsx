"use client";

import { useMemo, useState } from "react";
import { ForgottenLickWidget } from "@/components/licks/ForgottenLickWidget";
import { LickBpmChart } from "@/components/licks/LickBpmChart";
import { LickCard } from "@/components/licks/LickCard";
import { LickEditorModal } from "@/components/licks/LickEditorModal";
import { TechniquesHeatmap } from "@/components/licks/TechniquesHeatmap";
import { Button } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/SearchField";
import { PlusIcon } from "@/components/ui/icons";
import { SelectField } from "@/components/ui/SelectField";
import { LicksSkeleton } from "@/components/ui/Skeletons";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { useLicksLibrary } from "@/hooks/useLicksLibrary";
import { useI18nSection } from "@/i18n/I18nProvider";
import { findLinkedSong, getLickTitle } from "@/utils/licks/presentation";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { GuitarLick } from "@/types/lick";

export function LicksView({ todayKey }: { todayKey: string }) {
  const text = useI18nSection("licks");
  const {
    visible,
    sorted,
    summary,
    songs,
    forgotten,
    selectedLick,
    selectedLickId,
    setSelectedLickId,
    query,
    setQuery,
    hasHydrated,
    persistenceError,
    today,
  } = useLicksLibrary(todayKey);
  const saveLick = usePracticeStore((state) => state.saveLick);
  const deleteLick = usePracticeStore((state) => state.deleteLick);
  const markLickPracticed = usePracticeStore((state) => state.markLickPracticed);
  const [editor, setEditor] = useState<{ lick: GuitarLick | null } | null>(
    null,
  );

  const chartOptions = useMemo(
    () =>
      sorted.map((lick) => ({
        value: lick.id,
        label: getLickTitle(text, lick),
      })),
    [sorted, text],
  );

  if (!hasHydrated) return <LicksSkeleton />;

  const summaryItems = [
    { label: text.summaryLicks, value: summary.total },
    { label: text.summaryWithBpm, value: summary.withBpm },
    { label: text.summaryTechniques, value: summary.techniques },
    { label: text.summaryKeys, value: summary.keys },
  ];

  return (
    <PageShell>
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          <Button
            type="button"
            variant="primary"
            onClick={() => setEditor({ lick: null })}
          >
            <PlusIcon className="size-4" />
            {text.newLick}
          </Button>
        }
      />

      {persistenceError ? (
        <p role="alert" className="mt-6 rounded-md border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {persistenceError}
        </p>
      ) : null}

      {summary.total === 0 ? (
        <section className="mt-10 rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center">
          <h2 className="font-sans text-xl font-semibold tracking-tight text-ink">
            {text.emptyTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            {text.emptyDescription}
          </p>
          <Button
            type="button"
            variant="primary"
            className="mt-6"
            onClick={() => setEditor({ lick: null })}
          >
            <PlusIcon className="size-4" />
            {text.newLick}
          </Button>
        </section>
      ) : (
        <>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-line bg-surface p-5"
              >
                <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">
                  {item.label}
                </dt>
                <dd className="mt-2 font-mono text-2xl tabular-nums text-ink">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className={`mt-5 grid gap-5 ${forgotten ? "xl:grid-cols-2" : ""}`}>
            <ForgottenLickWidget
              forgotten={forgotten}
              today={today}
              onMarkPracticed={markLickPracticed}
            />
            {selectedLick ? (
              <LickBpmChart
                lick={selectedLick}
                selector={
                  <div className="min-w-40 text-xs text-muted">
                    {text.selectLick}
                    <SelectField
                      className="mt-1"
                      value={selectedLickId}
                      onChange={setSelectedLickId}
                      ariaLabel={text.selectLick}
                      options={chartOptions}
                    />
                  </div>
                }
              />
            ) : null}
          </div>

          <div className="mt-5">
            <TechniquesHeatmap licks={sorted} />
          </div>

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="w-full max-w-sm">
                <SearchField
                  label={text.search}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={text.searchPlaceholder}
                />
              </div>
              <p className="text-xs text-muted">
                {visible.length} / {summary.total} {text.licksCount}
              </p>
            </div>

            {visible.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
                <h2 className="font-sans text-lg font-semibold text-ink">
                  {text.noResults} “{query.trim()}”
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {text.noResultsDescription}
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((lick) => (
                  <LickCard
                    key={lick.id}
                    lick={lick}
                    song={findLinkedSong(songs, lick.associatedSongId)}
                    today={today}
                    onEdit={(candidate) => setEditor({ lick: candidate })}
                    onDelete={deleteLick}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {editor ? (
        <LickEditorModal
          key={editor.lick?.id ?? "new"}
          lick={editor.lick}
          songs={songs}
          onSave={saveLick}
          onClose={() => setEditor(null)}
        />
      ) : null}
    </PageShell>
  );
}

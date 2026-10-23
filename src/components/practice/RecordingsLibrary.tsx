"use client";

import Link from "next/link";
import { PracticeRecordingItem } from "@/components/practice/PracticeRecordingItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { RecordingsListSkeleton } from "@/components/ui/Skeletons";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/Field";
import { useI18n, useI18nSection } from "@/i18n/I18nProvider";
import { useRecordingsLibrary } from "@/hooks/useRecordingsLibrary";
import { formatDateLabel } from "@/utils/format";
import { isPracticeRecordingSort } from "@/utils/practice-recording-filtering";

export function RecordingsLibrary() {
  const { locale } = useI18n();
  const text = useI18nSection("recordings");
  const {
    recordings,
    filters,
    updateFilter,
    clearFilters,
    blockOptions,
    filteredRecordings,
    recordingGroups,
    isLoading,
    loadError,
    deleteError,
    removeRecording,
    updateRecording,
    isCloudPending,
  } = useRecordingsLibrary(text.block);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          {text.eyebrow}
        </p>
        <h1
          className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
        >
          {text.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          {text.description}
        </p>
        <p className="mt-3 max-w-2xl rounded-md border border-line bg-surface px-4 py-3 text-sm text-muted" role="note">
          {text.cloudStorageNotice}
        </p>
      </header>

      {(loadError || deleteError) && (
        <p className="mb-5 text-sm text-red-300" role="alert">
          {loadError ?? deleteError}
        </p>
      )}

      <section
        aria-label={text.filters}
        className="rounded-xl border border-line bg-surface p-5 sm:p-6"
      >
        <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted">{text.block}</p>
            <SelectField
              value={filters.phaseOrder}
              ariaLabel={text.filterBlock}
              onChange={(value) => updateFilter("phaseOrder", value)}
              className="mt-1"
              options={[
                { value: "", label: text.allBlocks },
                ...blockOptions,
              ]}
            />
          </div>
          <div>
            <label
              htmlFor="recording-phase-name"
              className="text-xs text-muted"
            >
              {text.blockName}
            </label>
            <TextField
              id="recording-phase-name"
              value={filters.phaseName}
              onChange={(event) => updateFilter("phaseName", event.target.value)}
              placeholder={text.searchBlock}
              aria-label={text.filterBlockName}
              className="mt-1"
            />
          </div>
          <div>
            <p className="text-xs text-muted">{text.sortBy}</p>
            <SelectField
              value={filters.sort}
              ariaLabel={text.sortAria}
              onChange={(value) => {
                if (isPracticeRecordingSort(value)) {
                  updateFilter("sort", value);
                }
              }}
              className="mt-1"
              options={[
                { value: "newest", label: text.newest },
                { value: "oldest", label: text.oldest },
                { value: "type", label: text.type },
                { value: "name", label: text.name },
                { value: "block", label: text.blockOrder },
              ]}
            />
          </div>
        </div>
        <p className="mt-4 text-xs text-muted" aria-live="polite">
          {filteredRecordings.length}{" "}
          {filteredRecordings.length === 1
            ? text.found
            : text.foundMany}
        </p>
      </section>

      {isLoading ? (
        <RecordingsListSkeleton label={text.loading} rows={3} />
      ) : filteredRecordings.length > 0 ? (
        <>
          {isCloudPending && (
            <RecordingsListSkeleton
              label={text.loadingCloudRecordings}
              rows={0}
            />
          )}
          <div className="mt-8 space-y-10">
          {recordingGroups.map((group) => (
            <section
              key={group.dateKey || "unknown-date"}
              aria-labelledby={`recordings-${group.dateKey || "unknown-date"}`}
            >
              <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                <h2
                  id={`recordings-${group.dateKey || "unknown-date"}`}
                  className="font-sans text-2xl font-semibold capitalize tracking-tight text-ink sm:text-3xl"
                >
                  {group.dateKey
                    ? formatDateLabel(group.dateKey, locale, true)
                    : text.unavailableDate}
                </h2>
                <span className="font-mono text-xs text-muted">
                  {group.recordings.length}{" "}
                  {group.recordings.length === 1 ? text.recording : text.recordings}
                </span>
              </header>
              <ul className="mt-4 space-y-3">
                {group.recordings.map((recording) => (
                  <PracticeRecordingItem
                    key={recording.id}
                    recording={recording}
                    onDelete={(recordingId) =>
                      void removeRecording(recordingId)
                    }
                    onUpdate={updateRecording}
                  />
                ))}
              </ul>
            </section>
          ))}
          </div>
        </>
      ) : isCloudPending ? (
        <RecordingsListSkeleton label={text.loadingCloudRecordings} rows={2} />
      ) : recordings.length > 0 ? (
        <EmptyState
          as="section"
          variant="plain"
          size="compact"
          className="mt-8 border-y border-line py-8"
          title={text.noMatches}
          description={text.tryOther}
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-ink underline underline-offset-4"
            >
              {text.clear}
            </button>
          }
        />
      ) : (
        <EmptyState
          as="section"
          variant="plain"
          size="compact"
          className="mt-8 border-y border-line py-8"
          title={text.emptyTitle}
          description={text.emptyDescription}
          action={
            <Link
              href="/practice"
              className="inline-flex text-sm text-ink underline underline-offset-4"
            >
              {text.goPractice}
            </Link>
          }
        />
      )}
    </main>
  );
}

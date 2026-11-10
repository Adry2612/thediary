"use client";

import { useState } from "react";
import { LickPickerDialog } from "@/components/practice/LickPickerDialog";
import { SongPickerDialog } from "@/components/practice/SongPickerDialog";
import { TechniquePickerDialog } from "@/components/practice/TechniquePickerDialog";
import { TheoryPickerDialog } from "@/components/practice/TheoryPickerDialog";
import { TextField } from "@/components/ui/Field";
import { SearchIcon } from "@/components/ui/icons";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  getCatalogSongChanges,
  getRepertoireSongChanges,
  shouldAdoptLinkedTitle,
} from "@/utils/practice-block-editor";
import {
  getRepertoirePartIds,
  repertoirePartChanges,
  toggleRepertoirePartId,
} from "@/utils/practice-parts";
import type { GuitarLick } from "@/types/lick";
import type {
  PracticeSkill,
  RepertoireItem,
} from "@/types/practice";
import type { CatalogCandidate } from "@/types/catalog";

export interface PracticeBlockLinkValue {
  name: string;
  skill: PracticeSkill;
  repertoireItemId?: string;
  repertoirePartId?: string;
  repertoirePartIds?: string[];
  catalogSong?: CatalogCandidate;
  lickId?: string;
}

interface PracticeBlockLinkFieldsProps {
  index: number;
  value: PracticeBlockLinkValue;
  songs: readonly RepertoireItem[];
  licks: readonly GuitarLick[];
  onChange: (changes: Partial<PracticeBlockLinkValue>) => void;
}

const pickerTriggerClass =
  "mt-1 flex min-h-12 w-full items-center justify-between gap-3 border border-line bg-canvas px-4 py-3 text-left text-sm leading-tight text-ink transition hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg";

/**
 * Campos de identidad de un bloque de práctica: el nombre según la categoría y
 * el vínculo con la canción, sus partes o el lick. Lo comparten el editor de
 * una práctica guardada y el formulario de práctica anterior.
 */
export function PracticeBlockLinkFields({
  index,
  value,
  songs,
  licks,
  onChange,
}: PracticeBlockLinkFieldsProps) {
  const text = useI18nSection("practice");
  const [isTechniquePickerOpen, setIsTechniquePickerOpen] = useState(false);
  const [isTheoryPickerOpen, setIsTheoryPickerOpen] = useState(false);
  const [isSongPickerOpen, setIsSongPickerOpen] = useState(false);
  const [isLickPickerOpen, setIsLickPickerOpen] = useState(false);

  const selectedSong = songs.find(
    (song) => song.id === value.repertoireItemId && song.kind === "song",
  );
  const selectedLick = licks.find((lick) => lick.id === value.lickId);
  const songLabel =
    selectedSong?.title ?? value.catalogSong?.title ?? text.selectSong;
  const lickLabel =
    selectedLick?.title ?? (value.name.trim() || text.selectLick);
  const partIds = getRepertoirePartIds(value);
  const missingPartIds = selectedSong
    ? partIds.filter(
        (partId) => !selectedSong.parts.some((part) => part.id === partId),
      )
    : [];

  function chooseSong(songId: string) {
    const song = songs.find(
      (candidate) => candidate.id === songId && candidate.kind === "song",
    );
    if (song) onChange(getRepertoireSongChanges(song));
  }

  function chooseLick(lick: GuitarLick) {
    const changes: Partial<PracticeBlockLinkValue> = { lickId: lick.id };
    if (shouldAdoptLinkedTitle(value.name, selectedLick?.title)) {
      changes.name = lick.title;
    }
    onChange(changes);
  }

  return (
    <>
      {value.skill === "repertoire" ? (
        <div className="text-xs text-muted">
          <span className="block">{text.repertoireSong}</span>
          <button
            type="button"
            onClick={() => setIsSongPickerOpen(true)}
            aria-label={`${text.repertoireSong} ${index + 1}: ${songLabel}`}
            className={pickerTriggerClass}
          >
            <span className="min-w-0 break-words">{songLabel}</span>
            <SearchIcon className="size-4 shrink-0 text-muted" />
          </button>
          {value.catalogSong ? (
            <span className="mt-1 block text-[11px] text-muted">
              {value.catalogSong.artist}
            </span>
          ) : null}
          {!selectedSong && !value.catalogSong ? (
            <span
              role="status"
              aria-live="polite"
              className="mt-2 block text-xs text-red-300"
            >
              {text.missingSongLink}
            </span>
          ) : (
            <button
              type="button"
              onClick={() =>
                onChange({
                  repertoireItemId: undefined,
                  repertoirePartId: undefined,
                  repertoirePartIds: undefined,
                  catalogSong: undefined,
                })
              }
              className="mt-2 text-[11px] text-muted underline underline-offset-4 transition hover:text-ink"
            >
              {text.clearSongLink}
            </button>
          )}
        </div>
      ) : value.skill === "technique" ? (
        <div className="text-xs text-muted">
          <span className="block">{text.techniqueName}</span>
          <button
            type="button"
            onClick={() => setIsTechniquePickerOpen(true)}
            aria-label={`${text.techniqueName} ${index + 1}: ${
              value.name.trim() || text.selectTechnique
            }`}
            className={pickerTriggerClass}
          >
            <span className="min-w-0 break-words">
              {value.name.trim() || text.selectTechnique}
            </span>
            <SearchIcon className="size-4 shrink-0 text-muted" />
          </button>
          {!value.name.trim() ? (
            <span
              role="status"
              aria-live="polite"
              className="mt-2 block text-xs text-red-300"
            >
              {text.missingTechnique}
            </span>
          ) : null}
        </div>
      ) : value.skill === "theory" ? (
        <div className="text-xs text-muted">
          <span className="block">{text.theoryTopic}</span>
          <button
            type="button"
            onClick={() => setIsTheoryPickerOpen(true)}
            aria-label={`${text.theoryTopic} ${index + 1}: ${
              value.name.trim() || text.selectTheoryTopic
            }`}
            className={pickerTriggerClass}
          >
            <span className="min-w-0 break-words">
              {value.name.trim() || text.selectTheoryTopic}
            </span>
            <SearchIcon className="size-4 shrink-0 text-muted" />
          </button>
          {!value.name.trim() ? (
            <span
              role="status"
              aria-live="polite"
              className="mt-2 block text-xs text-red-300"
            >
              {text.missingTheoryTopic}
            </span>
          ) : null}
        </div>
      ) : value.skill === "lick" ? (
        <div className="text-xs text-muted">
          <span className="block">{text.lick}</span>
          <button
            type="button"
            onClick={() => setIsLickPickerOpen(true)}
            aria-label={`${text.lick} ${index + 1}: ${lickLabel}`}
            className={pickerTriggerClass}
          >
            <span className="min-w-0 break-words">{lickLabel}</span>
            <SearchIcon className="size-4 shrink-0 text-muted" />
          </button>
          {!selectedLick ? (
            <span
              role="status"
              aria-live="polite"
              className="mt-2 block text-xs text-red-300"
            >
              {value.lickId ? text.missingReference : text.missingLickLink}
            </span>
          ) : null}
        </div>
      ) : (
        <label className="block text-xs text-muted">
          {text.phaseName}
          <TextField
            value={value.name}
            maxLength={100}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder={text.phaseName}
            className="mt-1"
          />
        </label>
      )}

      {value.skill === "repertoire" && selectedSong ? (
        <div className="text-xs text-muted sm:col-span-2">
          <span className="block">{text.partsPracticed}</span>
          {selectedSong.parts.length > 0 ? (
            <div
              role="group"
              aria-label={`${text.partsPracticed} ${index + 1}`}
              className="mt-1 flex flex-wrap gap-2"
            >
              {selectedSong.parts.map((part) => {
                const active = partIds.includes(part.id);
                return (
                  <button
                    key={part.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      onChange(
                        repertoirePartChanges(
                          toggleRepertoirePartId(partIds, part.id),
                        ),
                      )
                    }
                    className={`min-h-9 border px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg ${
                      active
                        ? "border-accent-green-fg/60 bg-accent-green-bg/20 text-ink"
                        : "border-line bg-canvas text-muted hover:border-white/20 hover:text-ink"
                    }`}
                  >
                    {part.name}
                  </button>
                );
              })}
              {missingPartIds.map((partId) => (
                <button
                  key={partId}
                  type="button"
                  aria-pressed
                  onClick={() =>
                    onChange(
                      repertoirePartChanges(
                        toggleRepertoirePartId(partIds, partId),
                      ),
                    )
                  }
                  className="min-h-9 border border-accent-green-fg/60 bg-accent-green-bg/20 px-3 py-1.5 text-xs text-ink transition hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg"
                >
                  {text.missingReference}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted">{text.songWithoutParts}</p>
          )}
          <span className="mt-1 block text-[11px] text-muted">
            {text.partsHint}
          </span>
        </div>
      ) : null}

      <TechniquePickerDialog
        open={isTechniquePickerOpen}
        selectedTechnique={value.name}
        onSelect={(technique) => onChange({ name: technique })}
        onClose={() => setIsTechniquePickerOpen(false)}
      />
      <TheoryPickerDialog
        open={isTheoryPickerOpen}
        selectedTheory={value.name}
        onSelect={(theory) => onChange({ name: theory })}
        onClose={() => setIsTheoryPickerOpen(false)}
      />
      <LickPickerDialog
        open={isLickPickerOpen}
        licks={licks}
        selectedLickId={value.lickId}
        onSelect={chooseLick}
        onClose={() => setIsLickPickerOpen(false)}
      />
      <SongPickerDialog
        open={isSongPickerOpen}
        songs={songs}
        selectedSongId={value.repertoireItemId}
        onSelect={(song) => chooseSong(song.id)}
        onSelectCatalog={(candidate) =>
          onChange(getCatalogSongChanges(candidate))
        }
        onClose={() => setIsSongPickerOpen(false)}
      />
    </>
  );
}

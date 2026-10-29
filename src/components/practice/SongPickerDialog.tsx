"use client";

import { useMemo } from "react";
import { SearchPickerDialog } from "@/components/practice/SearchPickerDialog";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { RepertoireItem } from "@/types/practice";
import type { SearchPickerItem } from "@/utils/search-picker";

interface SongPickerDialogProps {
  open: boolean;
  /** Colección completa; el diálogo se queda solo con las canciones. */
  songs: readonly RepertoireItem[];
  selectedSongId?: string;
  onSelect: (song: RepertoireItem) => void;
  onClose: () => void;
}

/**
 * Buscador dedicado de canciones del repertorio. Filtra por título, artista o
 * parte y devuelve la canción elegida, sin mezclar licks ni otros elementos.
 */
export function SongPickerDialog({
  open,
  songs,
  selectedSongId,
  onSelect,
  onClose,
}: SongPickerDialogProps) {
  const text = useI18nSection("practice");
  const items = useMemo<SearchPickerItem[]>(
    () =>
      songs
        .filter((song) => song.kind === "song")
        .map((song) => ({
          id: song.id,
          label: song.title,
          description: song.artist?.trim() || undefined,
          searchText: [
            song.title,
            song.artist ?? "",
            ...song.parts.map((part) => part.name),
          ].join(" "),
        })),
    [songs],
  );

  function chooseSong(songId: string) {
    const song = songs.find(
      (candidate) => candidate.id === songId && candidate.kind === "song",
    );
    if (song) onSelect(song);
  }

  return (
    <SearchPickerDialog
      open={open}
      title={text.songPickerTitle}
      description={text.songPickerDescription}
      searchLabel={text.songPickerSearch}
      searchPlaceholder={text.songPickerSearchPlaceholder}
      emptyMessage={text.songPickerEmpty}
      noResultsMessage={text.songPickerNoResults}
      closeLabel={text.songPickerClose}
      items={items}
      selectedId={selectedSongId}
      onSelect={chooseSong}
      onClose={onClose}
    />
  );
}

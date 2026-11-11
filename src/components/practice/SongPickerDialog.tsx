"use client";

import { useMemo, useState } from "react";
import { SearchPickerDialog } from "@/components/practice/SearchPickerDialog";
import { CatalogSearchDialog } from "@/components/repertoire/CatalogSearchDialog";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { CatalogCandidate } from "@/types/catalog";
import type { RepertoireItem } from "@/types/practice";
import type { SearchPickerItem } from "@/utils/search-picker";

interface SongPickerDialogProps {
  open: boolean;
  /** Colección completa; el diálogo se queda solo con las canciones. */
  songs: readonly RepertoireItem[];
  selectedSongId?: string;
  onSelect: (song: RepertoireItem) => void;
  /** Elige una canción del catálogo que aún no está en el repertorio. */
  onSelectCatalog?: (candidate: CatalogCandidate) => void;
  onClose: () => void;
}

/**
 * Buscador dedicado de canciones del repertorio. Filtra por título, artista o
 * parte y devuelve la canción elegida, sin mezclar licks ni otros elementos.
 * Con `onSelectCatalog` permite buscar además en el catálogo global.
 */
export function SongPickerDialog({
  open,
  songs,
  selectedSongId,
  onSelect,
  onSelectCatalog,
  onClose,
}: SongPickerDialogProps) {
  const text = useI18nSection("practice");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState("");
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
    <>
      <SearchPickerDialog
        open={open}
        title={text.songPickerTitle}
        description={text.songPickerDescription}
        searchLabel={text.songPickerSearch}
        searchPlaceholder={text.songPickerSearchPlaceholder}
        emptyMessage={text.songPickerEmpty}
        noResultsMessage={text.songPickerNoResults}
        closeLabel={text.songPickerClose}
        footerAction={
          onSelectCatalog
            ? {
                label: text.songPickerCatalogSearch,
                onClick: (query) => {
                  setCatalogQuery(query);
                  setCatalogOpen(true);
                },
              }
            : undefined
        }
        items={items}
        selectedId={selectedSongId}
        onSelect={chooseSong}
        onClose={onClose}
      />

      {catalogOpen && (
        <CatalogSearchDialog
          initialQuery={catalogQuery}
          onSelect={(candidate) => {
            setCatalogOpen(false);
            onSelectCatalog?.(candidate);
            onClose();
          }}
          onClose={() => setCatalogOpen(false)}
        />
      )}
    </>
  );
}

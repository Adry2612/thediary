import type { CatalogCandidate } from "../types/catalog.ts";

/** Identidad estable de una canción del catálogo. */
export function getCatalogSongKey(song: CatalogCandidate): string {
  return `${song.source}:${song.id}`;
}

/**
 * Canciones del catálogo que se practicaron sin estar todavía en el repertorio.
 * Solo cuentan los bloques con tiempo real; una canción repetida se ofrece una
 * sola vez.
 */
export function collectPracticedCatalogSongs(
  phases: readonly { catalogSong?: CatalogCandidate }[],
  elapsedSeconds: readonly number[],
): CatalogCandidate[] {
  const songs = new Map<string, CatalogCandidate>();

  phases.forEach((phase, index) => {
    if (!phase.catalogSong) return;
    if ((elapsedSeconds[index] ?? 0) <= 0) return;
    songs.set(getCatalogSongKey(phase.catalogSong), {
      ...phase.catalogSong,
    });
  });

  return [...songs.values()];
}

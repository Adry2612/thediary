"use client";

import { useCallback, useState } from "react";
import { emptyChordChart } from "@/utils/repertoire-chord-chart";
import { normalizeTab } from "@/utils/repertoire-tab";
import type { CatalogCandidate, CatalogSource } from "@/types/catalog";
import type {
  GuitarType,
  PracticeResource,
  RepertoireDifficulty,
} from "@/types/practice";

/**
 * Lo que el usuario lleva escrito en el formulario de canción nueva: los
 * campos, los recursos adjuntos, el cifrado y la tablatura.
 */
export function useRepertoireSongDraft() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [tuning, setTuning] = useState("");
  const [customTuning, setCustomTuning] = useState("");
  const [capo, setCapo] = useState("");
  const [guitarType, setGuitarType] = useState<GuitarType | "">("");
  const [difficulty, setDifficulty] = useState<RepertoireDifficulty | "">("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [album, setAlbum] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [catalogSource, setCatalogSource] = useState<
    CatalogSource | undefined
  >();
  const [catalogId, setCatalogId] = useState<string | undefined>();
  const [isFutureLearn, setIsFutureLearn] = useState(false);
  const [resources, setResources] = useState<PracticeResource[]>([]);
  const [chordChart, setChordChart] = useState(() => emptyChordChart());
  const [tab, setTab] = useState(() => normalizeTab(undefined));

  const finalTuning = tuning === "Otra..." ? customTuning.trim() : tuning.trim();

  /**
   * Vuelca un resultado del catálogo en el borrador. Solo escribe los datos que
   * el catálogo posee: afinación, capo, dificultad y material siguen intactos.
   */
  const applyCatalogCandidate = useCallback((candidate: CatalogCandidate) => {
    setTitle(candidate.title);
    setArtist(candidate.artist);
    setAlbum(candidate.album ?? "");
    setReleaseYear(
      candidate.releaseYear !== undefined ? String(candidate.releaseYear) : "",
    );
    setCoverUrl(candidate.coverUrl ?? "");
    setCatalogSource(candidate.source);
    setCatalogId(candidate.id);
  }, []);

  return {
    title,
    setTitle,
    artist,
    setArtist,
    tuning,
    setTuning,
    customTuning,
    setCustomTuning,
    capo,
    setCapo,
    guitarType,
    setGuitarType,
    difficulty,
    setDifficulty,
    youtubeUrl,
    setYoutubeUrl,
    spotifyUrl,
    setSpotifyUrl,
    album,
    setAlbum,
    releaseYear,
    setReleaseYear,
    coverUrl,
    setCoverUrl,
    catalogSource,
    catalogId,
    applyCatalogCandidate,
    isFutureLearn,
    setIsFutureLearn,
    resources,
    setResources,
    chordChart,
    setChordChart,
    tab,
    setTab,
    finalTuning,
  };
}

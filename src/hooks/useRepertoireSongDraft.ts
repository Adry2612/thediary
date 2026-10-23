"use client";

import { useState } from "react";
import { emptyChordChart } from "@/utils/repertoire-chord-chart";
import { normalizeTab } from "@/utils/repertoire-tab";
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
  const [isFutureLearn, setIsFutureLearn] = useState(false);
  const [resources, setResources] = useState<PracticeResource[]>([]);
  const [chordChart, setChordChart] = useState(() => emptyChordChart());
  const [tab, setTab] = useState(() => normalizeTab(undefined));

  const finalTuning = tuning === "Otra..." ? customTuning.trim() : tuning.trim();

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

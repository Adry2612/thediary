"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTabColumnSeconds } from "@/utils/tab-playback";
import { getTabColumns } from "@/utils/repertoire-tab";
import type { RepertoireTab } from "@/types/practice";

/**
 * Reproducción visual de una tablatura. No sintetiza audio: avanza el playhead
 * con el reloj del navegador para poder seguir la tablatura sin el SoundFont.
 */
export function useTabPlayback({
  tab,
  bpm,
}: {
  tab: RepertoireTab;
  bpm: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const lastColumnRef = useRef(-1);
  const columns = getTabColumns(tab);
  const columnDuration = getTabColumnSeconds(tab, bpm);

  const stop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    lastColumnRef.current = -1;
    setIsPlaying(false);
    setPlayhead(null);
  }, []);

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const column = Math.floor(elapsed / columnDuration);

    if (column >= columns) {
      frameRef.current = null;
      lastColumnRef.current = -1;
      setIsPlaying(false);
      setPlayhead(null);
      return;
    }

    if (column !== lastColumnRef.current) {
      lastColumnRef.current = column;
      setPlayhead(column);
    }
    frameRef.current = requestAnimationFrame(tick);
  }, [columnDuration, columns]);

  const play = useCallback(() => {
    if (frameRef.current !== null || tab.notes.length === 0) return;

    lastColumnRef.current = 0;
    startTimeRef.current = performance.now();
    setPlayhead(0);
    setIsPlaying(true);
    frameRef.current = requestAnimationFrame(tick);
  }, [tab.notes.length, tick]);

  // Cambiar el contenido o el tempo detiene la reproducción actual.
  useEffect(() => {
    if (frameRef.current !== null) stop();
  }, [bpm, stop, tab]);

  useEffect(() => stop, [stop]);

  return { isPlaying, playhead, play, stop };
}

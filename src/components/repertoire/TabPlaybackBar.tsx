"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useI18nSection } from "@/i18n/I18nProvider";
import { useTabPlayback } from "@/hooks/useTabPlayback";
import {
  clampMetronomeBpm,
  MAX_BPM,
  MIN_BPM,
} from "@/utils/metronome-tempo";
import type { RepertoireTab } from "@/types/practice";

function safeBpm(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ?
      clampMetronomeBpm(value)
    : 90;
}

/**
 * Controles de reproducción visual de una tablatura. El tempo es independiente
 * del BPM objetivo del lick: sirve para seguir la tablatura más despacio sin
 * modificar sus datos. No reproduce audio.
 */
export function TabPlaybackBar({
  tab,
  initialBpm,
  onPlayheadChange,
  className = "",
}: {
  tab: RepertoireTab;
  initialBpm?: number;
  onPlayheadChange?: (column: number | null) => void;
  className?: string;
}) {
  const text = useI18nSection("repertoire");
  const [bpm, setBpm] = useState(() => safeBpm(initialBpm));
  const [bpmDraft, setBpmDraft] = useState(() => String(bpm));
  const { isPlaying, playhead, play, stop } = useTabPlayback({ tab, bpm });

  useEffect(() => {
    const next = safeBpm(initialBpm);
    setBpm(next);
    setBpmDraft(String(next));
  }, [initialBpm]);

  useEffect(() => {
    onPlayheadChange?.(playhead);
  }, [onPlayheadChange, playhead]);

  useEffect(() => {
    return () => onPlayheadChange?.(null);
  }, [onPlayheadChange]);

  function commitBpm() {
    const parsed = Number(bpmDraft);
    const next =
      bpmDraft.trim() && Number.isFinite(parsed) ?
        clampMetronomeBpm(parsed)
      : bpm;
    setBpm(next);
    setBpmDraft(String(next));
  }

  const canPlay = tab.notes.length > 0;

  return (
    <div className={`flex flex-wrap items-end gap-2 ${className}`}>
      <Button
        type="button"
        size="field"
        variant={isPlaying ? "primary" : "ghost"}
        disabled={!canPlay}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? text.tabStop : text.tabPlay}
        onClick={() => {
          if (isPlaying) stop();
          else play();
        }}
      >
        <span aria-hidden="true">{isPlaying ? "■" : "▶"}</span>
        {isPlaying ? text.tabStop : text.tabPlay}
      </Button>

      <label className="text-xs text-muted">
        <span className="block">BPM</span>
        <TextField
          type="number"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpmDraft}
          aria-label={text.tabPlaybackBpm}
          disabled={isPlaying}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "").slice(0, 3);
            setBpmDraft(next);
            const parsed = Number(next);
            if (
              next &&
              Number.isFinite(parsed) &&
              parsed >= MIN_BPM &&
              parsed <= MAX_BPM
            ) {
              setBpm(parsed);
            }
          }}
          onBlur={commitBpm}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          className="mt-1 w-20"
        />
      </label>
    </div>
  );
}

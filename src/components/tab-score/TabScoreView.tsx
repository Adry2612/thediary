"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  TabScoreCanvas,
  type TabScorePlaybackState,
  type TabScorePlayerControls,
  type TabScoreRenderStatus,
} from "@/components/tab-score/TabScoreCanvas";
import {
  readShowStandardNotation,
  saveShowStandardNotation,
} from "@/services/tab-score-preferences";
import type { TabScore } from "@/types/tab-score";
import { buildAlphaTex } from "@/utils/tab-score/alphatex";
import { getStringCount } from "@/utils/tab-score/model";
import { scoreToText } from "@/utils/tab-score/text";

export function TabScoreView({
  score,
  label,
  maxBars,
  variant = "full",
  showNotationToggle = false,
  playback = false,
  className = "",
}: {
  score: TabScore;
  label?: string;
  /** Recorta la partitura para una vista previa. */
  maxBars?: number;
  variant?: "full" | "compact";
  showNotationToggle?: boolean;
  playback?: boolean;
  className?: string;
}) {
  const text = useI18nSection("tabScore");
  const playbackText = useI18nSection("tabPlayback");
  const playerRef = useRef<TabScorePlayerControls | null>(null);
  const [playbackState, setPlaybackState] = useState<TabScorePlaybackState>({
    ready: false,
    playing: false,
    error: null,
  });
  const [showStandardNotation, setShowStandardNotation] = useState(false);
  const [status, setStatus] = useState<TabScoreRenderStatus>({
    loading: true,
    error: null,
  });
  const compact = variant === "compact";

  useEffect(() => {
    setShowStandardNotation(readShowStandardNotation());
  }, []);

  const visibleScore = useMemo(
    () =>
      maxBars === undefined
        ? score
        : { ...score, bars: score.bars.slice(0, Math.max(1, maxBars)) },
    [score, maxBars],
  );

  const textAlternative = useMemo(
    () => scoreToText(visibleScore),
    [visibleScore],
  );
  const alphaTex = useMemo(
    () =>
      buildAlphaTex(visibleScore, { standardNotation: showStandardNotation }),
    [visibleScore, showStandardNotation],
  );
  const stringCount = useMemo(
    () => getStringCount(visibleScore.tuning),
    [visibleScore.tuning],
  );

  function toggleStandardNotation() {
    setShowStandardNotation((current) => {
      const next = !current;
      saveShowStandardNotation(next);
      return next;
    });
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={`overflow-hidden rounded-xl border border-line bg-white p-3 text-zinc-900 sm:p-4 ${className}`}
    >
      {showNotationToggle && (
        <div className="mb-3 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={toggleStandardNotation}
            aria-pressed={showStandardNotation}
            className={`text-xs ${
              showStandardNotation
                ? "border-zinc-800 bg-zinc-800 text-white hover:bg-zinc-700"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {text.standardNotation}
          </Button>
        </div>
      )}

      {playback && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="field"
            variant={playbackState.playing ? "primary" : "ghost"}
            onClick={() => {
              if (playbackState.playing) playerRef.current?.pause();
              else playerRef.current?.play();
            }}
            className={
              playbackState.playing
                ? ""
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }
          >
            {playbackState.playing
              ? "■ " + playbackText.pause
              : "▶ " + playbackText.play}
          </Button>
          <Button
            type="button"
            size="field"
            variant="ghost"
            onClick={() => playerRef.current?.stop()}
            className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          >
            {playbackText.stop}
          </Button>
          {playbackState.error && (
            <span role="alert" className="text-xs text-red-700">
              {playbackText.soundUnavailable}
            </span>
          )}
        </div>
      )}

      <TabScoreCanvas
        alphaTex={alphaTex}
        stringCount={stringCount}
        compact={compact}
        playback={playback}
        onControls={(controls) => {
          playerRef.current = controls;
        }}
        onPlaybackState={setPlaybackState}
        onStatus={setStatus}
        className={status.loading || status.error ? "invisible" : ""}
      />

      {status.loading &&
        (compact ? (
          <div
            aria-hidden="true"
            className="h-24 animate-pulse rounded-md bg-zinc-100"
          />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-xs leading-5 text-zinc-700">
            {textAlternative}
          </pre>
        ))}

      {status.error && (
        <div className="mt-2">
          <p role="alert" className="text-sm text-red-700">
            {text.error}
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-5 text-zinc-700">
            {textAlternative}
          </pre>
        </div>
      )}

      {!status.loading && !status.error && (
        <pre className="sr-only">{textAlternative}</pre>
      )}
    </div>
  );
}

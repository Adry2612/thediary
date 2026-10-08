"use client";

import { RangeSlider } from "@/components/ui/RangeSlider";
import { usePracticeAudioPlayer } from "@/hooks/usePracticeAudioPlayer";

function formatAudioTime(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) {
    return "--:--";
  }

  const wholeSeconds = Math.round(seconds);
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

export function PracticeAudioPlayer({
  src,
  title,
  durationSeconds,
  showVolumeControl = false,
}: {
  src: string;
  title: string;
  durationSeconds?: number;
  showVolumeControl?: boolean;
}) {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    isSeekReady,
    volume,
    isVolumeOpen,
    playbackError,
    toggleVolumeControl,
    togglePlayback,
    seek,
    changeVolume,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleDurationChange,
    handleSeek,
    handleCanPlay,
    handlePlay,
    handleError,
    handleEnded,
    handlePause,
  } = usePracticeAudioPlayer({
    src,
    durationSeconds,
    showVolumeControl,
  });

  return (
    <div>
      <audio
        ref={audioRef}
        aria-hidden="true"
        tabIndex={-1}
        preload="metadata"
        src={src}
        className="hidden"
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeek}
        onSeeked={handleSeek}
        onCanPlay={handleCanPlay}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void togglePlayback()}
          aria-label={isPlaying ? `Pausar ${title}` : `Reproducir ${title}`}
          className="flex size-10 shrink-0 items-center justify-center border border-line text-ink transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-green-fg"
        >
          {isPlaying ? (
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
              <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
              <path d="M4 2.5 13 8l-9 5.5z" fill="currentColor" />
            </svg>
          )}
        </button>
        <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-muted">
          {formatAudioTime(currentTime)}
        </span>
        <RangeSlider
          min={0}
          max={Math.max(duration ?? 0, 1)}
          step={0.1}
          value={Math.min(currentTime, Math.max(duration ?? 0, 1))}
          ariaLabel={`Progreso de ${title}`}
          ariaValueText={`${formatAudioTime(currentTime)} de ${formatAudioTime(duration)}`}
          disabled={!duration || !isSeekReady}
          onChange={seek}
          className="min-w-32 flex-1"
        />
        <span className="w-12 shrink-0 font-mono text-xs tabular-nums text-muted">
          {formatAudioTime(duration)}
        </span>
        {showVolumeControl && (
          <button
            type="button"
            aria-label={isVolumeOpen ? "Ocultar volumen" : "Ajustar volumen"}
            aria-expanded={isVolumeOpen}
            onClick={toggleVolumeControl}
            className="flex size-9 shrink-0 items-center justify-center border border-line text-muted transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-green-fg"
          >
            <svg
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8v4h3l4 3V5L6 8H3Z"
                fill="currentColor"
                stroke="currentColor"
                strokeLinejoin="round"
              />
              <path
                d="M13 7a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        )}
      </div>
      {showVolumeControl && isVolumeOpen && (
        <div
          className="mt-3 flex items-center gap-3"
          role="group"
          aria-label="Volumen del backing track"
        >
          <span className="text-[10px] uppercase tracking-[0.1em] text-muted">
            Volumen
          </span>
          <RangeSlider
            min={0}
            max={1}
            step={0.01}
            value={volume}
            ariaLabel={`Volumen de ${title}`}
            ariaValueText={`${Math.round(volume * 100)}%`}
            onChange={changeVolume}
            className="max-w-48"
          />
          <span className="w-10 font-mono text-xs tabular-nums text-muted">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
      {playbackError && (
        <p className="mt-2 text-xs text-red-300" role="alert">
          {playbackError}
        </p>
      )}
    </div>
  );
}

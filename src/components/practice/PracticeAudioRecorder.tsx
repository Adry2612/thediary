"use client";

import { ForwardIcon, PauseIcon, PlayIcon, RecordIcon, RewindIcon, StopIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/Field";
import { PracticeRecorderDisplay } from "@/components/practice/PracticeRecorderDisplay";
import { PracticeRecordingItem } from "@/components/practice/PracticeRecordingItem";
import { usePracticeAudioRecorder } from "@/hooks/usePracticeAudioRecorder";
import { usePracticeAudioPlayer } from "@/hooks/usePracticeAudioPlayer";
import { useRecordingPeaks } from "@/hooks/useRecordingPeaks";
import { useRecordingUrl } from "@/hooks/useRecordingUrl";
import { useRecordingWaveformLevels } from "@/hooks/useRecordingWaveformLevels";
import { formatClock } from "@/utils/format";
import {
  WAVEFORM_BAR_COUNT,
  WAVEFORM_BASELINE_HEIGHT,
} from "@/utils/recording-waveform";
import type { PracticeSkill } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

const SEEK_STEP_SECONDS = 5;

const TRANSPORT_BUTTON =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-line bg-canvas/60 px-3 text-ink transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 disabled:cursor-not-allowed disabled:opacity-35";
const ROUND_BUTTON =
  "inline-flex size-12 items-center justify-center rounded-full border text-ink transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 disabled:cursor-not-allowed disabled:opacity-35";

export function PracticeAudioRecorder({
  sessionName,
  sessionId,
  practiceDate,
  phase,
  shouldStop = false,
}: {
  sessionName: string;
  sessionId: string;
  practiceDate?: string;
  phase?: {
    id: string | number;
    name: string;
    order: number;
    skill: PracticeSkill;
  };
  shouldStop?: boolean;
}) {
  const text = useI18nSection("practice");
  const {
    recordingStream,
    recordings,
    isReady,
    recordingTitle,
    setRecordingTitle,
    isRecording,
    isSaving,
    elapsedSeconds,
    error,
    storageError,
    handleWaveformError,
    startRecording,
    stopRecording,
    removeRecording,
  } = usePracticeAudioRecorder({
    sessionName,
    sessionId,
    practiceDate,
    phase,
    shouldStop,
  });

  const latestRecording = recordings.reduce<(typeof recordings)[number] | null>(
    (latest, recording) =>
      !latest || recording.createdAt > latest.createdAt ? recording : latest,
    null,
  );
  const liveLevels = useRecordingWaveformLevels(
    recordingStream,
    isRecording,
    handleWaveformError,
  );
  const playbackUrl = useRecordingUrl(latestRecording);
  const peaks = useRecordingPeaks(
    latestRecording?.id ?? null,
    latestRecording?.blob,
  );
  const player = usePracticeAudioPlayer({
    src: playbackUrl ?? "",
    durationSeconds: latestRecording?.durationSeconds,
    showVolumeControl: false,
  });

  const hasTake = Boolean(latestRecording && playbackUrl);
  const canPlay = hasTake && !isRecording && !isSaving && !shouldStop;
  const progress =
    player.duration && player.duration > 0 ?
      Math.min(1, Math.max(0, player.currentTime / player.duration))
    : 0;
  const isPlaying = player.isPlaying;
  const levels =
    isRecording ? liveLevels
    : peaks && peaks.length > 0 ? peaks
    : Array.from(
        { length: WAVEFORM_BAR_COUNT },
        () => WAVEFORM_BASELINE_HEIGHT,
      );
  const tone =
    isRecording ? "recording"
    : isSaving ? "saving"
    : isPlaying ? "playing"
    : "idle";
  const statusLabel =
    shouldStop ? text.recorderCompleted
    : isSaving ? text.recorderSaving
    : isRecording ? text.recorderRecording
    : isPlaying ? text.recorderPlaying
    : hasTake ? text.recorderReady
    : text.recorderNoTake;
  const timeLabel =
    isRecording ? formatClock(elapsedSeconds)
    : hasTake && player.duration !== null ?
      `${formatClock(Math.round(player.currentTime))} / ${formatClock(Math.round(player.duration))}`
    : formatClock(Math.round(latestRecording?.durationSeconds ?? 0));

  const takeCountLabel = `${recordings.length} ${
    recordings.length === 1 ? text.recorderTakeOne : text.recorderTakeMany
  }`;

  return (
    <section className="enter rounded-xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.05em] text-muted">
            {text.recorderEyebrow}
          </p>
          <h3 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8">
            {text.recorderTitle}
          </h3>
          <p className="mt-2 max-w-prose text-sm text-muted">
            {text.recorderDescription}
          </p>
        </div>
        <span
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
            isRecording ?
              "border-red-400/40 bg-red-500/10 text-red-300"
            : isPlaying ?
              "border-accent-green-fg/30 bg-accent-green-bg text-accent-green-fg"
            : "border-line text-muted"
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${
              isRecording ?
                "animate-pulse bg-red-400"
              : isPlaying ? "bg-accent-green-fg"
              : "bg-muted"
            }`}
          />
          {statusLabel}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <label className="block w-full min-w-0 text-xs text-muted md:flex-1">
          {text.recorderNameLabel}
          <TextField
            value={recordingTitle}
            onChange={(event) => setRecordingTitle(event.target.value)}
            maxLength={100}
            className="mt-1"
          />
        </label>

        <div
          role="group"
          aria-label={text.recorderTransport}
          className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end"
        >
          <button
            type="button"
            onClick={() => void startRecording()}
            disabled={!isReady || isRecording || isSaving || shouldStop}
            aria-label={text.record}
            title={text.record}
            className={`${ROUND_BUTTON} border-red-400/50 bg-red-500/10 text-red-300 hover:bg-red-500/20`}
          >
            <RecordIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={stopRecording}
            disabled={!isRecording}
            aria-label={text.stopAndSave}
            title={text.stopAndSave}
            className={`${ROUND_BUTTON} border-line bg-canvas/60 hover:bg-white/5`}
          >
            <StopIcon className="size-5" />
          </button>

          <span aria-hidden="true" className="mx-1 h-8 w-px bg-line" />

          <button
            type="button"
            onClick={() => player.seekBy(-SEEK_STEP_SECONDS)}
            disabled={!canPlay || !player.duration || !player.isSeekReady}
            aria-label={text.rewindStep}
            title={text.rewindStep}
            className={TRANSPORT_BUTTON}
          >
            <RewindIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => void player.togglePlayback()}
            disabled={!canPlay}
            aria-label={text.playTake}
            title={text.playTake}
            className={TRANSPORT_BUTTON}
          >
            <PlayIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => void player.togglePlayback()}
            disabled={!isPlaying}
            aria-label={text.pauseTake}
            title={text.pauseTake}
            className={TRANSPORT_BUTTON}
          >
            <PauseIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => player.seekBy(SEEK_STEP_SECONDS)}
            disabled={!canPlay || !player.duration || !player.isSeekReady}
            aria-label={text.forwardStep}
            title={text.forwardStep}
            className={TRANSPORT_BUTTON}
          >
            <ForwardIcon className="size-4" />
          </button>
        </div>
      </div>

      <PracticeRecorderDisplay
        levels={levels}
        progress={isPlaying || player.currentTime > 0 ? progress : null}
        statusLabel={statusLabel}
        timeLabel={timeLabel}
        tone={tone}
        ariaLabel={text.recorderWaveformAria}
      />

      <audio
        ref={player.audioRef}
        aria-hidden="true"
        tabIndex={-1}
        preload="metadata"
        src={playbackUrl ?? undefined}
        className="hidden"
        onLoadedMetadata={player.handleLoadedMetadata}
        onDurationChange={player.handleDurationChange}
        onTimeUpdate={player.handleTimeUpdate}
        onSeeking={player.handleSeek}
        onSeeked={player.handleSeek}
        onCanPlay={player.handleCanPlay}
        onPlay={player.handlePlay}
        onPause={player.handlePause}
        onEnded={player.handleEnded}
        onError={player.handleError}
      />

      {error && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
      {storageError && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {storageError}
        </p>
      )}
      {player.playbackError && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {player.playbackError}
        </p>
      )}

      <div className="mt-8 border-t border-line pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-xs uppercase tracking-[0.05em] text-muted">
            {text.recorderSavedTitle}
          </h4>
          <span className="font-mono text-xs text-muted">{takeCountLabel}</span>
        </div>
        {recordings.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {recordings.map((recording) => (
              <PracticeRecordingItem
                key={recording.id}
                recording={recording}
                onDelete={(id) => void removeRecording(id)}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-line px-4 py-6 text-sm text-muted">
            {text.recorderEmpty}
          </p>
        )}
      </div>
    </section>
  );
}

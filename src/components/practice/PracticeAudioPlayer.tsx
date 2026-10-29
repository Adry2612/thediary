'use client';

import { RangeSlider } from '@/components/ui/RangeSlider';
import { ForwardIcon, PauseIcon, PlayIcon, RewindIcon } from '@/components/ui/icons';
import { PracticeWaveformSeeker } from '@/components/practice/PracticeWaveformSeeker';
import { usePracticeAudioPlayer } from '@/hooks/usePracticeAudioPlayer';
import { useI18nSection } from '@/i18n/I18nProvider';

function formatAudioTime(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) {
    return '--:--';
  }

  const wholeSeconds = Math.round(seconds);
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, '0')}`;
}

export function PracticeAudioPlayer({
  src,
  title,
  durationSeconds,
  showVolumeControl = false,
  peaks,
  seekStepSeconds,
}: {
  src: string;
  title: string;
  durationSeconds?: number;
  showVolumeControl?: boolean;
  /** Picos de la toma para dibujar su onda sobre la barra de progreso. */
  peaks?: number[];
  /** Si se indica, aparecen los botones de retroceso y avance de ese salto. */
  seekStepSeconds?: number;
}) {
  const text = useI18nSection('recordings');
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
    seekBy,
    seekToRatio,
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

  const hasWaveform = Boolean(peaks && peaks.length > 0);
  const durationValue = duration ?? 0;

  const rewindButton = seekStepSeconds !== undefined && (
    <button
      type='button'
      onClick={() => seekBy(-seekStepSeconds)}
      disabled={!duration || !isSeekReady}
      aria-label={`${text.rewind} ${title}`}
      title={text.rewind}
      className='flex size-10 shrink-0 items-center justify-center border border-line text-ink transition hover:bg-white/5 focus-visible:outline-accent-green-fg disabled:opacity-40'
    >
      <RewindIcon className='size-4' />
    </button>
  );

  const playButton = (
    <button
      type='button'
      onClick={() => void togglePlayback()}
      aria-label={`${isPlaying ? text.pause : text.playback} ${title}`}
      className='flex size-10 shrink-0 items-center justify-center border border-line text-ink transition hover:bg-white/5 focus-visible:outline-accent-green-fg'
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );

  const forwardButton = seekStepSeconds !== undefined && (
    <button
      type='button'
      onClick={() => seekBy(seekStepSeconds)}
      disabled={!duration || !isSeekReady}
      aria-label={`${text.forward} ${title}`}
      title={text.forward}
      className='flex size-10 shrink-0 items-center justify-center border border-line text-ink transition hover:bg-white/5 focus-visible:outline-accent-green-fg disabled:opacity-40'
    >
      <ForwardIcon className='size-4' />
    </button>
  );

  const volumeButton = showVolumeControl && (
    <button
      type='button'
      aria-label={isVolumeOpen ? text.hideVolume : text.adjustVolume}
      aria-expanded={isVolumeOpen}
      onClick={toggleVolumeControl}
      className='flex size-9 shrink-0 items-center justify-center border border-line text-muted transition hover:text-ink focus-visible:outline-accent-green-fg'
    >
      <svg viewBox='0 0 20 20' className='size-4' fill='none' aria-hidden='true'>
        <path
          d='M3 8v4h3l4 3V5L6 8H3Z'
          fill='currentColor'
          stroke='currentColor'
          strokeLinejoin='round'
        />
        <path
          d='M13 7a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10'
          stroke='currentColor'
          strokeLinecap='round'
          strokeWidth='1.5'
        />
      </svg>
    </button>
  );

  return (
    <div>
      <audio
        ref={audioRef}
        aria-hidden='true'
        tabIndex={-1}
        preload='metadata'
        src={src}
        className='hidden'
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

      {hasWaveform ? (
        <div className='rounded-lg border border-line bg-canvas/60 p-3'>
          <div className='flex items-center gap-3'>
            <span className='w-12 shrink-0 text-right font-mono text-xs tabular-nums text-muted'>
              {formatAudioTime(currentTime)}
            </span>
            <PracticeWaveformSeeker
              levels={peaks ?? []}
              currentTime={currentTime}
              duration={durationValue}
              onSeekRatio={seekToRatio}
              onSeekBy={seekBy}
              ariaLabel={`${text.progress} ${title}`}
              ariaValueText={`${formatAudioTime(currentTime)} de ${formatAudioTime(duration)}`}
              className='min-w-0 flex-1'
            />
            <span className='w-12 shrink-0 font-mono text-xs tabular-nums text-muted'>
              {formatAudioTime(duration)}
            </span>
          </div>
          <div className='mt-2 flex flex-wrap items-center gap-2'>
            {rewindButton}
            {playButton}
            {forwardButton}
            {volumeButton}
          </div>
        </div>
      ) : (
        <div className='flex flex-wrap items-center gap-3'>
          {rewindButton}
          {playButton}
          <span className='w-12 shrink-0 text-right font-mono text-xs tabular-nums text-muted'>
            {formatAudioTime(currentTime)}
          </span>
          <RangeSlider
            min={0}
            max={Math.max(durationValue, 1)}
            step={0.1}
            value={Math.min(currentTime, Math.max(durationValue, 1))}
            ariaLabel={`${text.progress} ${title}`}
            ariaValueText={`${formatAudioTime(currentTime)} de ${formatAudioTime(duration)}`}
            disabled={!duration || !isSeekReady}
            onChange={seek}
            className='min-w-32 flex-1'
          />
          <span className='w-12 shrink-0 font-mono text-xs tabular-nums text-muted'>
            {formatAudioTime(duration)}
          </span>
          {forwardButton}
          {volumeButton}
        </div>
      )}
      {showVolumeControl && isVolumeOpen && (
        <div
          className='mt-3 flex items-center gap-3'
          role='group'
          aria-label={text.volume}
        >
          <span className='text-[10px] uppercase text-muted'>
            {text.volume}
          </span>
          <RangeSlider
            min={0}
            max={1}
            step={0.01}
            value={volume}
            ariaLabel={`Volumen de ${title}`}
            ariaValueText={`${Math.round(volume * 100)}%`}
            onChange={changeVolume}
            className='max-w-48'
          />
          <span className='w-10 font-mono text-xs tabular-nums text-muted'>
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
      {playbackError && (
        <p
          className='mt-2 text-xs text-red-300'
          role='alert'
        >
          {playbackError}
        </p>
      )}
    </div>
  );
}

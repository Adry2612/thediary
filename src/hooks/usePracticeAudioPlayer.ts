"use client";

import { useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import {
  activateExclusiveAudio,
  releaseExclusiveAudio,
} from "@/lib/practice-audio-playback";
import { getPlaybackDurationSeconds } from "@/lib/recording-duration";

interface UsePracticeAudioPlayerOptions {
  src: string;
  durationSeconds?: number;
  showVolumeControl: boolean;
}

export function usePracticeAudioPlayer({
  src,
  durationSeconds,
  showVolumeControl,
}: UsePracticeAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(() =>
    getPlaybackDurationSeconds(NaN, durationSeconds),
  );
  const [isSeekReady, setIsSeekReady] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    audio?.pause();
    if (audio) audio.currentTime = 0;
    setDuration(getPlaybackDurationSeconds(NaN, durationSeconds));
    setCurrentTime(0);
    setIsSeekReady(false);
  }, [durationSeconds, src]);

  useEffect(
    () => () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      releaseExclusiveAudio(audio);
    },
    [],
  );

  function updateDuration(audio: HTMLAudioElement) {
    setDuration(getPlaybackDurationSeconds(audio.duration, durationSeconds));
  }

  function syncCurrentTime(audio: HTMLAudioElement) {
    if (Number.isFinite(audio.currentTime) && audio.currentTime >= 0) {
      setCurrentTime(audio.currentTime);
    }
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    setPlaybackError(null);
    if (!audio.paused) {
      audio.pause();
      return;
    }

    audio.volume = showVolumeControl ? volume : 1;
    activateExclusiveAudio(audio);
    try {
      await audio.play();
    } catch (error) {
      releaseExclusiveAudio(audio);
      setPlaybackError(
        error instanceof Error
          ? error.message
          : "No se pudo reproducir este audio.",
      );
    }
  }

  function seek(nextTime: number) {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = nextTime;
      syncCurrentTime(audio);
      setPlaybackError(null);
    } catch (error) {
      setPlaybackError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la posición del audio.",
      );
    }
  }

  function changeVolume(nextVolume: number) {
    setVolume(nextVolume);
    if (audioRef.current) audioRef.current.volume = nextVolume;
  }

  function handleLoadedMetadata(event: SyntheticEvent<HTMLAudioElement>) {
    setIsSeekReady(true);
    updateDuration(event.currentTarget);
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLAudioElement>) {
    syncCurrentTime(event.currentTarget);
    updateDuration(event.currentTarget);
  }

  function handleDurationChange(event: SyntheticEvent<HTMLAudioElement>) {
    updateDuration(event.currentTarget);
  }

  function handleSeek(event: SyntheticEvent<HTMLAudioElement>) {
    syncCurrentTime(event.currentTarget);
  }

  function toggleVolumeControl() {
    setIsVolumeOpen((current) => !current);
  }

  function handleCanPlay() {
    setIsSeekReady(true);
  }

  function handlePlay() {
    setIsPlaying(true);
  }

  function handleError() {
    setPlaybackError("No se pudo cargar este audio.");
  }

  function handleEnded() {
    setIsPlaying(false);
    setCurrentTime(duration ?? audioRef.current?.currentTime ?? 0);
    if (audioRef.current) releaseExclusiveAudio(audioRef.current);
  }

  function handlePause() {
    setIsPlaying(false);
    if (audioRef.current) releaseExclusiveAudio(audioRef.current);
  }

  return {
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
  };
}

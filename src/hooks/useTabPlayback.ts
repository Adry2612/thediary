"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  closeMetronomeAudioContext,
  getOrCreateMetronomeAudioContext,
} from "@/lib/metronome-audio-context";
import {
  getTabColumnSeconds,
  getTabPlaybackDuration,
  getTabPlaybackEvents,
  midiToFrequency,
  type TabPlaybackEvent,
} from "@/lib/tab-playback";
import { getTabColumns } from "@/lib/repertoire-tab";
import type { RepertoireTab } from "@/types/practice";

const SCHEDULE_INTERVAL_MS = 40;
const SCHEDULE_AHEAD_SECONDS = 0.2;
const START_DELAY_SECONDS = 0.08;

interface PlaybackSession {
  context: AudioContext;
  master: GainNode;
  output: DynamicsCompressorNode;
  events: TabPlaybackEvent[];
  nextEventIndex: number;
  startTime: number;
  finishedAt: number;
  columnDuration: number;
  columns: number;
  intervalId: number;
  rafId: number;
  activeNodes: Set<AudioScheduledSourceNode>;
}

function releaseSession(session: PlaybackSession) {
  window.clearInterval(session.intervalId);
  window.cancelAnimationFrame(session.rafId);
  for (const node of session.activeNodes) {
    try {
      node.stop();
    } catch {
      // El nodo ya había terminado.
    }
    node.disconnect();
  }
  session.activeNodes.clear();
  session.master.disconnect();
  session.output.disconnect();
}

function schedulePlaybackNote(
  session: PlaybackSession,
  event: TabPlaybackEvent,
) {
  const { context, master, activeNodes } = session;
  const when = session.startTime + event.time;
  if (when < context.currentTime - 0.05) return;

  const note = event.note;
  const duration = Math.max(0.05, event.duration);
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  oscillator.type = note.dead ? "square" : "triangle";
  const baseFrequency = note.dead ? 95 : midiToFrequency(event.midi);
  oscillator.frequency.setValueAtTime(baseFrequency, when);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(
    note.dead ? 650
    : note.palmMute ? 1_100
    : note.slap || note.pop ? 5_000
    : 3_200,
    when,
  );
  filter.Q.value = 0.7;

  const peak =
    note.dead ? 0.035
    : note.palmMute ? 0.1
    : note.slap || note.pop ? 0.24
    : 0.16;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(peak, when + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  if (note.bend && !note.dead) {
    const target = baseFrequency * Math.pow(2, note.bend.semitones / 12);
    const releaseAt = when + duration * 0.7;
    if (note.bend.prebend) {
      oscillator.frequency.setValueAtTime(target, when);
      if (note.bend.release) {
        oscillator.frequency.setValueAtTime(target, releaseAt);
        oscillator.frequency.exponentialRampToValueAtTime(
          baseFrequency,
          when + duration,
        );
      }
    } else {
      oscillator.frequency.exponentialRampToValueAtTime(
        target,
        when + Math.min(0.3, duration * 0.5),
      );
      if (note.bend.release) {
        oscillator.frequency.setValueAtTime(target, releaseAt);
        oscillator.frequency.exponentialRampToValueAtTime(
          baseFrequency,
          when + duration,
        );
      }
    }
  }

  activeNodes.add(oscillator);
  oscillator.addEventListener(
    "ended",
    () => {
      activeNodes.delete(oscillator);
      oscillator.disconnect();
      filter.disconnect();
      gain.disconnect();
    },
    { once: true },
  );
  oscillator.start(when);
  oscillator.stop(when + duration + 0.02);

  if (
    !note.dead &&
    (note.vibrato === "slight" || note.vibrato === "wide")
  ) {
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.value = 5.5;
    lfoGain.gain.value = note.vibrato === "wide" ? 11 : 4;
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    activeNodes.add(lfo);
    lfo.addEventListener(
      "ended",
      () => {
        activeNodes.delete(lfo);
        lfo.disconnect();
        lfoGain.disconnect();
      },
      { once: true },
    );
    lfo.start(when);
    lfo.stop(when + duration);
  }
}

/**
 * Reproductor MIDI sintetizado para la tablatura estructurada. Programa las
 * notas con un pequeño margen de antelación y actualiza la columna activa.
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
  const [error, setError] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<PlaybackSession | null>(null);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);

  const stop = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    startingRef.current = false;
    if (session) releaseSession(session);
    setIsPlaying(false);
    setPlayhead(null);
  }, []);

  const play = useCallback(async () => {
    if (sessionRef.current || startingRef.current || tab.notes.length === 0) {
      return;
    }

    setError(false);
    startingRef.current = true;
    try {
      const AudioContextConstructor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextConstructor) throw new Error("AudioContext no disponible");

      const context = getOrCreateMetronomeAudioContext(
        contextRef.current,
        AudioContextConstructor,
      );
      contextRef.current = context;
      if (context.state !== "running") await context.resume();
      if (!mountedRef.current) return;

      const master = context.createGain();
      master.gain.value = 0.55;
      const output = context.createDynamicsCompressor();
      output.threshold.value = -18;
      output.knee.value = 12;
      output.ratio.value = 5;
      output.attack.value = 0.003;
      output.release.value = 0.2;
      master.connect(output);
      output.connect(context.destination);

      const startTime = context.currentTime + START_DELAY_SECONDS;
      const columnDuration = getTabColumnSeconds(tab, bpm);
      const columns = getTabColumns(tab);
      const events = getTabPlaybackEvents(tab, bpm);
      const session: PlaybackSession = {
        context,
        master,
        output,
        events,
        nextEventIndex: 0,
        startTime,
        finishedAt:
          startTime + getTabPlaybackDuration(tab, bpm) + 0.08,
        columnDuration,
        columns,
        intervalId: 0,
        rafId: 0,
        activeNodes: new Set(),
      };

      const scheduleAhead = () => {
        const horizon = context.currentTime + SCHEDULE_AHEAD_SECONDS;
        while (
          session.nextEventIndex < session.events.length &&
          startTime + session.events[session.nextEventIndex].time <= horizon
        ) {
          schedulePlaybackNote(
            session,
            session.events[session.nextEventIndex],
          );
          session.nextEventIndex += 1;
        }
      };

      const finish = () => {
        if (sessionRef.current !== session) return;
        sessionRef.current = null;
        releaseSession(session);
        setIsPlaying(false);
        setPlayhead(null);
      };

      const update = () => {
        if (sessionRef.current !== session) return;
        const now = context.currentTime;
        if (now >= session.finishedAt) {
          finish();
          return;
        }
        const elapsed = Math.max(0, now - session.startTime);
        const column = Math.min(
          session.columns - 1,
          Math.max(0, Math.floor(elapsed / session.columnDuration)),
        );
        setPlayhead(column);
        session.rafId = window.requestAnimationFrame(update);
      };

      sessionRef.current = session;
      startingRef.current = false;
      setIsPlaying(true);
      setPlayhead(0);
      scheduleAhead();
      session.intervalId = window.setInterval(
        scheduleAhead,
        SCHEDULE_INTERVAL_MS,
      );
      session.rafId = window.requestAnimationFrame(update);
    } catch {
      startingRef.current = false;
      if (!mountedRef.current) return;
      stop();
      setError(true);
    }
  }, [bpm, stop, tab]);

  // Al cambiar la tablatura o el tempo, la reproducción en curso deja de ser
  // válida: es mejor detenerla que escuchar una versión antigua.
  useEffect(() => {
    if (sessionRef.current) stop();
  }, [bpm, stop, tab]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const session = sessionRef.current;
      sessionRef.current = null;
      if (session) releaseSession(session);
      if (contextRef.current) {
        closeMetronomeAudioContext(contextRef.current);
        contextRef.current = null;
      }
    };
  }, []);

  return { isPlaying, playhead, play, stop, error };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as AlphaTab from "@coderline/alphatab";
import { buildTabAlphaTex } from "@/lib/tab-alphatex";
import { getTabColumnSeconds } from "@/lib/tab-playback";
import { getTabColumns } from "@/lib/repertoire-tab";
import type { RepertoireTab } from "@/types/practice";

const SOUND_FONT_URL = "/alphatab/soundfont/sonivox.sf2";
const SYNTH_BUFFER_MS = 200;
const READY_TIMEOUT_MS = 8_000;

let soundFontPromise: Promise<Uint8Array> | null = null;

function loadSoundFontBytes(): Promise<Uint8Array> {
  if (!soundFontPromise) {
    soundFontPromise = fetch(SOUND_FONT_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`SoundFont ${response.status}`);
        }
        return new Uint8Array(await response.arrayBuffer());
      })
      .catch((error: unknown) => {
        soundFontPromise = null;
        throw error;
      });
  }
  return soundFontPromise;
}

function waitForPlaybackReady(synth: AlphaTab.synth.AlphaSynth) {
  if (synth.isReadyForPlayback) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("La síntesis no ha terminado de cargar."));
    }, READY_TIMEOUT_MS);
    const offReady = synth.readyForPlayback.on(() => {
      cleanup();
      resolve();
    });
    const offSoundFontFailure = synth.soundFontLoadFailed.on((error) => {
      cleanup();
      reject(error);
    });
    const offMidiFailure = synth.midiLoadFailed.on((error) => {
      cleanup();
      reject(error);
    });

    function cleanup() {
      window.clearTimeout(timeoutId);
      offReady();
      offSoundFontFailure();
      offMidiFailure();
    }
  });
}

interface PlaybackSession {
  synth: AlphaTab.synth.AlphaSynth;
  columnDuration: number;
  columns: number;
}

/**
 * Reproductor de la tablatura con el sintetizador de alphaTab y su SoundFont
 * local. La partitura AlphaTex se genera solo para el audio; la rejilla visual
 * y la edición siguen siendo las de la app.
 */
export function useTabPlayback({
  tab,
  bpm,
  program = 25,
}: {
  tab: RepertoireTab;
  bpm: number;
  program?: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const synthRef = useRef<AlphaTab.synth.AlphaSynth | null>(null);
  const moduleRef = useRef<typeof AlphaTab | null>(null);
  const sessionRef = useRef<PlaybackSession | null>(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);
  const soundFontLoadedRef = useRef(false);
  const midiLoadedRef = useRef(false);
  const startingRef = useRef(false);
  const requestIdRef = useRef(0);

  const ensureSynth = useCallback(async () => {
    if (synthRef.current && moduleRef.current) {
      return { synth: synthRef.current, alphaTab: moduleRef.current };
    }

    const alphaTab = await import("@coderline/alphatab");
    // alphaTab expone este output en tiempo de ejecución, pero no lo declara
    // en sus tipos públicos.
    const OutputClass = (
      alphaTab.synth as unknown as {
        AlphaSynthScriptProcessorOutput: new () => AlphaTab.synth.ISynthOutput;
      }
    ).AlphaSynthScriptProcessorOutput;
    const synth = new alphaTab.synth.AlphaSynth(
      new OutputClass(),
      SYNTH_BUFFER_MS,
    );
    synth.masterVolume = 0.65;
    synth.isLooping = false;
    synthRef.current = synth;
    moduleRef.current = alphaTab;

    unsubscribersRef.current.push(
      synth.positionChanged.on((position) => {
        const session = sessionRef.current;
        if (!session) return;
        const column = Math.min(
          session.columns - 1,
          Math.max(
            0,
            Math.floor(
              position.currentTime / (session.columnDuration * 1_000),
            ),
          ),
        );
        setPlayhead(column);
      }),
      synth.finished.on(() => {
        if (sessionRef.current?.synth !== synth) return;
        sessionRef.current = null;
        setIsPlaying(false);
        setPlayhead(null);
      }),
      synth.soundFontLoaded.on(() => {
        soundFontLoadedRef.current = true;
      }),
      synth.midiLoaded.on(() => {
        midiLoadedRef.current = true;
      }),
      synth.soundFontLoadFailed.on(() => {
        soundFontLoadedRef.current = false;
        sessionRef.current = null;
        setIsPlaying(false);
        setIsLoading(false);
        setPlayhead(null);
        setError(true);
      }),
      synth.midiLoadFailed.on(() => {
        midiLoadedRef.current = false;
        sessionRef.current = null;
        setIsPlaying(false);
        setIsLoading(false);
        setPlayhead(null);
        setError(true);
      }),
    );

    return { synth, alphaTab };
  }, []);

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    startingRef.current = false;
    sessionRef.current = null;
    synthRef.current?.stop();
    setIsPlaying(false);
    setIsLoading(false);
    setPlayhead(null);
  }, []);

  const play = useCallback(async () => {
    if (
      startingRef.current ||
      sessionRef.current ||
      tab.notes.length === 0
    ) {
      return;
    }

    const requestId = ++requestIdRef.current;
    startingRef.current = true;
    setError(false);
    setIsLoading(true);
    try {
      const [{ synth, alphaTab }, soundFont] = await Promise.all([
        ensureSynth(),
        loadSoundFontBytes(),
      ]);
      if (requestId !== requestIdRef.current) return;

      if (!soundFontLoadedRef.current) {
        synth.loadSoundFont(soundFont, false);
      }
      if (!soundFontLoadedRef.current) {
        throw new Error("No se pudo cargar el SoundFont.");
      }

      const importer = new alphaTab.importer.AlphaTexImporter();
      const settings = new alphaTab.Settings();
      importer.initFromString(buildTabAlphaTex(tab, bpm, program), settings);
      const score = importer.readScore();
      const midi = new alphaTab.midi.MidiFile();
      const handler = new alphaTab.midi.AlphaSynthMidiFileHandler(midi);
      new alphaTab.midi.MidiFileGenerator(score, settings, handler).generate();
      if (requestId !== requestIdRef.current) return;

      const columnDuration = getTabColumnSeconds(tab, bpm);
      sessionRef.current = {
        synth,
        columnDuration,
        columns: getTabColumns(tab),
      };
      synth.stop();
      midiLoadedRef.current = false;
      synth.loadMidiFile(midi);
      if (!midiLoadedRef.current) {
        throw new Error("No se pudo cargar el MIDI.");
      }
      if (!synth.isReadyForPlayback) {
        await waitForPlaybackReady(synth);
      }
      if (requestId !== requestIdRef.current) return;

      if (!synth.play()) {
        throw new Error("No se pudo iniciar el sintetizador.");
      }
      setIsPlaying(true);
      setIsLoading(false);
      setPlayhead(0);
    } catch {
      if (requestId !== requestIdRef.current) return;
      sessionRef.current = null;
      synthRef.current?.stop();
      setIsPlaying(false);
      setIsLoading(false);
      setPlayhead(null);
      setError(true);
    } finally {
      if (requestId === requestIdRef.current) {
        startingRef.current = false;
      }
    }
  }, [bpm, ensureSynth, program, tab]);

  // Cambiar el contenido o el tempo invalida el MIDI ya cargado.
  useEffect(() => {
    if (sessionRef.current || startingRef.current) stop();
  }, [bpm, program, stop, tab]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      sessionRef.current = null;
      startingRef.current = false;
      for (const unsubscribe of unsubscribersRef.current) unsubscribe();
      unsubscribersRef.current = [];
      synthRef.current?.destroy();
      synthRef.current = null;
      moduleRef.current = null;
    };
  }, []);

  return { isPlaying, isLoading, playhead, play, stop, error };
}

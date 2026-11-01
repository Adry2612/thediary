"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ALPHA_TAB_FONT_DIRECTORY,
  ALPHA_TAB_SOUNDFONT_URL,
  ALPHA_TAB_WORKER_URL,
  configureAlphaTabEnvironment,
} from "@/services/alpha-tab-environment";
import type { TabSelection } from "@/utils/tab-score/selection";

type AlphaTabApi = import("@coderline/alphatab").AlphaTabApi;

type Rect = { x: number; y: number; w: number; h: number };

export type TabScoreLayoutBeat = Rect & {
  index: number;
  notes: Map<number, Rect>;
};

export type TabScoreLayoutBar = Rect & {
  index: number;
  beats: TabScoreLayoutBeat[];
};
export type TabScoreLayout = TabScoreLayoutBar[];

export type TabScoreRenderStatus = {
  loading: boolean;
  error: string | null;
};

export type TabScorePlaybackState = {
  ready: boolean;
  playing: boolean;
  error: string | null;
};

export type TabScorePlayerControls = {
  play: () => void;
  playFrom: (position: { bar: number; beat: number }) => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
};

export type TabScorePreviewRequest = {
  bar: number;
  beat: number;
  string: number;
  token: number;
};

const INITIAL_PLAYBACK_STATE: TabScorePlaybackState = {
  ready: false,
  playing: false,
  error: null,
};

function toRect(bounds: Rect): Rect {
  return { x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h };
}

export function TabScoreCanvas({
  alphaTex,
  stringCount,
  label,
  compact = false,
  interactive = false,
  playback = false,
  selection,
  selectedBeats = [],
  previewRequest,
  onSelect,
  onStatus,
  onRender,
  onLayout,
  onFocusBox,
  focusBoxVersion = 0,
  onControls,
  onPlaybackState,
  className = "",
}: {
  alphaTex: string;
  stringCount: number;
  label?: string;
  compact?: boolean;
  interactive?: boolean;
  playback?: boolean;
  selection?: TabSelection;
  selectedBeats?: { bar: number; beat: number }[];
  previewRequest?: TabScorePreviewRequest | null;
  onSelect?: (
    position: { bar: number; beat: number; string: number },
    extend: boolean,
  ) => void;
  onStatus?: (status: TabScoreRenderStatus) => void;
  onRender?: () => void;
  onLayout?: (layout: TabScoreLayout) => void;
  /** Caja de la selección en coordenadas de viewport, para anclar la paleta. */
  onFocusBox?: (box: Rect | null) => void;
  /** Cambia para forzar una nueva medición de la caja (p. ej. al abrir la paleta). */
  focusBoxVersion?: number;
  onControls?: (controls: TabScorePlayerControls | null) => void;
  onPlaybackState?: (state: TabScorePlaybackState) => void;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<AlphaTabApi | null>(null);
  const createdTexRef = useRef<string | null>(null);
  const alphaTexRef = useRef(alphaTex);
  alphaTexRef.current = alphaTex;
  const soundFontRequested = useRef(false);
  const lastPreviewToken = useRef(0);
  const previewRef = useRef(previewRequest);
  previewRef.current = previewRequest;
  const playbackState = useRef<TabScorePlaybackState>(INITIAL_PLAYBACK_STATE);
  const callbacks = useRef({
    onStatus,
    onRender,
    onSelect,
    onLayout,
    onFocusBox,
    onControls,
    onPlaybackState,
  });
  callbacks.current = {
    onStatus,
    onRender,
    onSelect,
    onLayout,
    onFocusBox,
    onControls,
    onPlaybackState,
  };
  const [layout, setLayout] = useState<TabScoreLayout>([]);
  const [renderCount, setRenderCount] = useState(0);
  const previousSelection = useRef<string>("");

  const emitPlayback = useCallback((patch: Partial<TabScorePlaybackState>) => {
    playbackState.current = { ...playbackState.current, ...patch };
    callbacks.current.onPlaybackState?.(playbackState.current);
  }, []);

  const measure = useCallback((api: AlphaTabApi) => {
    const lookup = api.boundsLookup;
    if (!lookup) return [];

    const bars: TabScoreLayout = [];
    for (const system of lookup.staffSystems) {
      for (const masterBar of system.bars) {
        const staffBar =
          masterBar.bars.find((bar) => bar.bar.staff.showTablature) ??
          masterBar.bars[0];
        if (!staffBar) continue;

        const beats: TabScoreLayoutBeat[] = [];
        for (const beatBounds of staffBar.beats) {
          const notes = new Map<number, Rect>();
          for (const noteBounds of beatBounds.notes ?? []) {
            notes.set(
              noteBounds.note.string - 1,
              toRect(noteBounds.noteHeadBounds),
            );
          }
          beats.push({
            ...toRect(beatBounds.realBounds),
            index: beatBounds.beat.index,
            notes,
          });
        }

        bars.push({
          ...toRect(staffBar.realBounds),
          index: masterBar.index,
          beats,
        });
      }
    }
    return bars;
  }, []);

  const ensureSoundFont = useCallback(
    async (api: AlphaTabApi) => {
      if (api.isReadyForPlayback) return true;
      if (!soundFontRequested.current) {
        soundFontRequested.current = true;
        try {
          // Se descarga aquí y no con `loadSoundFontFromUrl` para poder avisar
          // del fallo en cuanto ocurre y no depender de eventos internos.
          const response = await fetch(ALPHA_TAB_SOUNDFONT_URL);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = new Uint8Array(await response.arrayBuffer());
          api.loadSoundFont(data, false);
        } catch {
          emitPlayback({ ready: false, error: "soundFont" });
          return false;
        }
      }
      const deadline = performance.now() + 15000;
      return new Promise<boolean>((resolve) => {
        const check = () => {
          if (api.isReadyForPlayback) resolve(true);
          else if (performance.now() > deadline) {
            emitPlayback({ ready: false, error: "soundFont" });
            resolve(false);
          } else window.setTimeout(check, 100);
        };
        check();
      });
    },
    [emitPlayback],
  );

  const playNoteAt = useCallback(
    (api: AlphaTabApi, request: TabScorePreviewRequest) => {
      const bar = api.score?.tracks?.[0]?.staves?.[0]?.bars?.[request.bar];
      const beat = bar?.voices?.[0]?.beats?.[request.beat];
      const note = beat?.notes?.find(
        (candidate) => candidate.string === request.string + 1,
      );
      if (!note) return;
      void ensureSoundFont(api).then((ready) => {
        if (!ready) return;
        api.playNote(note);
      });
    },
    [ensureSoundFont],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    callbacks.current.onStatus?.({ loading: true, error: null });
    host.replaceChildren();

    void (async () => {
      try {
        const alphaTab = await import("@coderline/alphatab");
        if (disposed) return;
        configureAlphaTabEnvironment(alphaTab);
        const api = new alphaTab.AlphaTabApi(host, {
          core: {
            useWorkers: false,
            includeNoteBounds: true,
            fontDirectory: ALPHA_TAB_FONT_DIRECTORY,
            scriptFile: ALPHA_TAB_WORKER_URL,
          },
          display: {
            // Sin justificar, la última línea se queda a media anchura.
            justifyLastSystem: true,
          },
          player: playback
            ? {
                enablePlayer: true,
                enableCursor: true,
                outputMode: 1,
                scrollElement: "html,body",
              }
            : { enablePlayer: false },
        });
        apiRef.current = api;

        api.error.on((renderError) => {
          if (disposed) return;
          callbacks.current.onStatus?.({
            loading: false,
            error: renderError.message,
          });
        });

        if (compact) {
          // En una tarjeta el nombre de la afinación ocupa más que la propia
          // tablatura; se omite y se deja solo la pauta.
          api.scoreLoaded.on((loadedScore) => {
            for (const track of loadedScore.tracks) {
              for (const staff of track.staves) {
                staff.stringTuning.name = "";
              }
            }
          });
        }

        api.renderFinished.on(() => {
          if (disposed || !apiRef.current) return;
          callbacks.current.onStatus?.({ loading: false, error: null });
          callbacks.current.onRender?.();
          const nextLayout = measure(apiRef.current);
          callbacks.current.onLayout?.(nextLayout);
          setLayout(nextLayout);
          setRenderCount((count) => count + 1);

          const request = previewRef.current;
          if (playback && request && request.token !== lastPreviewToken.current) {
            lastPreviewToken.current = request.token;
            playNoteAt(apiRef.current, request);
          }
        });

        if (playback) {
          api.playerReady.on(() => {
            if (disposed) return;
            emitPlayback({ ready: true, error: null });
          });
          api.playerStateChanged.on(() => {
            if (disposed) return;
            emitPlayback({ playing: api.playerState === 1 });
          });
          api.soundFontLoaded.on(() => {
            if (disposed) return;
            emitPlayback({ error: null });
          });
          callbacks.current.onControls?.({
            play: () => {
              void ensureSoundFont(api).then((ready) => {
                if (ready) api.play();
              });
            },
            playFrom: ({ bar, beat }) => {
              const master = api.boundsLookup?.findMasterBarByIndex(bar);
              const target = master?.bars[0]?.beats.find(
                (bounds) => bounds.beat.index === beat,
              );
              if (target) api.tickPosition = target.beat.absolutePlaybackStart;
              void ensureSoundFont(api).then((ready) => {
                if (ready) api.play();
              });
            },
            pause: () => api.pause(),
            stop: () => api.stop(),
            setSpeed: (speed) => {
              api.playbackSpeed = Math.min(2, Math.max(0.25, speed));
            },
          });
        }

        createdTexRef.current = alphaTexRef.current;
        api.tex(alphaTexRef.current);
      } catch (renderError) {
        if (disposed) return;
        callbacks.current.onStatus?.({
          loading: false,
          error:
            renderError instanceof Error
              ? renderError.message
              : "No se pudo dibujar la tablatura.",
        });
      }
    })();

    return () => {
      disposed = true;
      apiRef.current?.destroy();
      apiRef.current = null;
      callbacks.current.onControls?.(null);
      host.replaceChildren();
    };
  }, [compact, playback, measure, emitPlayback, ensureSoundFont, playNoteAt]);

  // Los cambios de partitura reaprovechan la instancia: recrearla en cada
  // edición perdería el reproductor y el SoundFont ya cargado.
  useEffect(() => {
    const api = apiRef.current;
    if (!api || createdTexRef.current === alphaTex) return;
    createdTexRef.current = alphaTex;
    api.tex(alphaTex);
  }, [alphaTex]);

  // Acerca la selección a la vista cuando el usuario se mueve con el teclado o
  // elige un pulso fuera de pantalla.
  useEffect(() => {
    if (!interactive || !selection) return;
    const key = `${selection.bar}:${selection.beat}:${selection.string}`;
    if (previousSelection.current === "") {
      previousSelection.current = key;
      return;
    }
    if (previousSelection.current === key) return;
    previousSelection.current = key;
    focusRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [interactive, selection, layout]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!interactive || !onSelect || !surfaceRef.current) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const bar = layout.find(
      (entry) =>
        x >= entry.x - 4 &&
        x <= entry.x + entry.w + 4 &&
        y >= entry.y - 10 &&
        y <= entry.y + entry.h + 10,
    );
    if (!bar || bar.beats.length === 0) return;

    const rowHeight = bar.h / Math.max(1, stringCount);
    const row = Math.min(
      Math.max(0, Math.floor((y - bar.y) / rowHeight)),
      stringCount - 1,
    );
    const string = stringCount - 1 - row;

    const beat = bar.beats.reduce((best, candidate) => {
      const bestDistance = Math.abs(best.x + best.w / 2 - x);
      const distance = Math.abs(candidate.x + candidate.w / 2 - x);
      return distance < bestDistance ? candidate : best;
    });

    onSelect({ bar: bar.index, beat: beat.index, string }, event.shiftKey);
  }

  const focusBar = selection
    ? layout.find((bar) => bar.index === selection.bar)
    : undefined;
  const focusBeat =
    focusBar && selection
      ? focusBar.beats.find((beat) => beat.index === selection.beat)
      : undefined;
  const focusBox =
    focusBar && focusBeat && selection
      ? focusBeat.notes.get(selection.string) ?? {
          x: focusBeat.x + 2,
          y:
            focusBar.y +
            (stringCount - 1 - selection.string) * (focusBar.h / stringCount) +
            2,
          w: Math.max(8, focusBeat.w - 4),
          h: Math.max(8, focusBar.h / stringCount - 4),
        }
      : undefined;

  const focusX = focusBox?.x;
  const focusY = focusBox?.y;
  const focusW = focusBox?.w;
  const focusH = focusBox?.h;

  useEffect(() => {
    if (!interactive || !selection) {
      callbacks.current.onFocusBox?.(null);
      return;
    }
    if (
      focusX === undefined ||
      focusY === undefined ||
      focusW === undefined ||
      focusH === undefined ||
      !surfaceRef.current
    ) {
      return;
    }
    const rect = surfaceRef.current.getBoundingClientRect();
    callbacks.current.onFocusBox?.({
      x: rect.left + focusX,
      y: rect.top + focusY,
      w: focusW,
      h: focusH,
    });
  }, [interactive, selection, focusX, focusY, focusW, focusH, focusBoxVersion]);

  return (
    <div className={className}>
      <div
        ref={surfaceRef}
        className="relative w-full"
        data-render-count={renderCount}
        data-testid="tab-score-canvas"
      >
        <div ref={hostRef} className="w-full" />

        {interactive && (
          <div
            role="presentation"
            onPointerDown={handlePointerDown}
            className="absolute inset-0 z-10 cursor-pointer"
          />
        )}

        {interactive &&
          selection &&
          selectedBeats.map(({ bar, beat }) => {
            const barLayout = layout.find((entry) => entry.index === bar);
            const beatLayout = barLayout?.beats.find(
              (entry) => entry.index === beat,
            );
            if (!barLayout || !beatLayout) return null;
            const isFocus = bar === selection.bar && beat === selection.beat;
            if (isFocus) return null;
            return (
              <div
                key={`${bar}:${beat}`}
                aria-hidden="true"
                className="pointer-events-none absolute z-20 rounded-sm bg-emerald-500/20"
                style={{
                  left: beatLayout.x,
                  top: beatLayout.y,
                  width: beatLayout.w,
                  height: beatLayout.h,
                }}
              />
            );
          })}

        {interactive && focusBox && (
          <div
            ref={focusRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-30 rounded-[3px] border-2 border-emerald-600 bg-emerald-500/15"
            style={{
              left: focusBox.x - 2,
              top: focusBox.y - 2,
              width: focusBox.w + 4,
              height: focusBox.h + 4,
            }}
          />
        )}

        {interactive && label && (
          <span className="sr-only" data-testid="tab-score-canvas-label">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

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

export type TabScoreHit = {
  position: { bar: number; beat: number; string: number };
  /** Caja de la nota (o del hueco) en coordenadas de viewport. */
  box: Rect;
  /** Punto horizontal pulsado dentro del pulso, de 0 (inicio) a 1 (final). */
  fraction: number;
  /** Si el clic cae sobre una nota ya dibujada (para acordes, no para mover). */
  nearNote: boolean;
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
  selectedNotes = [],
  previewRequest,
  onSelect,
  onNoteMenu,
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
  selectedNotes?: { bar: number; beat: number; string: number }[];
  previewRequest?: TabScorePreviewRequest | null;
  onSelect?: (
    position: { bar: number; beat: number; string: number },
    extend: boolean,
    hit?: TabScoreHit,
  ) => void;
  /**
   * Se dispara al hacer doble clic, clic derecho o pulsación larga sobre una
   * nota o un hueco: la app abre el menú de esa nota sin pasar por «Opciones».
   */
  onNoteMenu?: (hit: TabScoreHit) => void;
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
    onNoteMenu,
    onLayout,
    onFocusBox,
    onControls,
    onPlaybackState,
  });
  callbacks.current = {
    onStatus,
    onRender,
    onSelect,
    onNoteMenu,
    onLayout,
    onFocusBox,
    onControls,
    onPlaybackState,
  };
  const [layout, setLayout] = useState<TabScoreLayout>([]);
  const [renderCount, setRenderCount] = useState(0);
  const previousSelection = useRef<string>("");
  const longPress = useRef<{
    timer: number;
    pointerId: number;
    x: number;
    y: number;
    opened: boolean;
  } | null>(null);
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    string: number;
    dragging: boolean;
  } | null>(null);

  /**
   * En táctil, el menú aparece bajo el dedo antes de que llegue el `click`
   * sintético; se descarta ese clic para no activar una opción sin querer.
   */
  const swallowNextClick = useCallback(() => {
    const handler = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("click", handler, true);
    window.setTimeout(
      () => window.removeEventListener("click", handler, true),
      450,
    );
  }, []);

  const clearLongPress = useCallback(() => {
    if (longPress.current) {
      window.clearTimeout(longPress.current.timer);
      longPress.current = null;
    }
  }, []);

  useEffect(() => clearLongPress, [clearLongPress]);

  const endDrag = useCallback(() => {
    drag.current = null;
    clearLongPress();
  }, [clearLongPress]);

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

  /**
   * Traduce un punto de la pantalla a un pulso y una cuerda. Es deliberadamente
   * tolerante: sirve para colocar notas en cualquier punto del compás, no solo
   * encima de una nota ya dibujada.
   */
  const hitTest = useCallback(
    (clientX: number, clientY: number): TabScoreHit | null => {
      const surface = surfaceRef.current;
      if (!surface || layout.length === 0) return null;
      const rect = surface.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      let bar = layout[0];
      let bestDistance = Number.POSITIVE_INFINITY;
      for (const entry of layout) {
        const dx =
          x < entry.x
            ? entry.x - x
            : x > entry.x + entry.w
              ? x - (entry.x + entry.w)
              : 0;
        const dy =
          y < entry.y
            ? entry.y - y
            : y > entry.y + entry.h
              ? y - (entry.y + entry.h)
              : 0;
        // La distancia vertical pesa más para no saltar de sistema al pulsar.
        const distance = dx + dy * 2;
        if (distance < bestDistance) {
          bestDistance = distance;
          bar = entry;
        }
      }
      if (!bar || bar.beats.length === 0) return null;

      const rowHeight = bar.h / Math.max(1, stringCount);
      const row = Math.min(
        Math.max(0, Math.floor((y - bar.y) / rowHeight)),
        stringCount - 1,
      );
      const rowString = stringCount - 1 - row;

      const inside = bar.beats.find(
        (beat) => x >= beat.x && x <= beat.x + beat.w,
      );
      const beat =
        inside ??
        bar.beats.reduce((best, candidate) => {
          const bestDistance = Math.abs(best.x + best.w / 2 - x);
          const distance = Math.abs(candidate.x + candidate.w / 2 - x);
          return distance < bestDistance ? candidate : best;
        });

      // Cerca de una nota, la pulsación se pega a la nota: así se puede marcar
      // sin acertar con la fila exacta de la cuerda.
      let snappedString: number | null = null;
      let snappedBox: Rect | null = null;
      let bestNoteDistance = 12;
      for (const [noteString, box] of beat.notes) {
        const dx =
          x < box.x ? box.x - x : x > box.x + box.w ? x - (box.x + box.w) : 0;
        const dy =
          y < box.y ? box.y - y : y > box.y + box.h ? y - (box.y + box.h) : 0;
        const distance = Math.hypot(dx, dy);
        if (distance <= bestNoteDistance) {
          bestNoteDistance = distance;
          snappedString = noteString;
          snappedBox = box;
        }
      }

      const string = snappedString ?? rowString;
      const localBox = snappedBox ??
        beat.notes.get(string) ?? {
          x: beat.x + 2,
          y: bar.y + (stringCount - 1 - string) * rowHeight + 2,
          w: Math.max(8, beat.w - 4),
          h: Math.max(8, rowHeight - 4),
        };

      return {
        position: { bar: bar.index, beat: beat.index, string },
        box: {
          x: rect.left + localBox.x,
          y: rect.top + localBox.y,
          w: localBox.w,
          h: localBox.h,
        },
        fraction: Math.min(
          0.999,
          Math.max(0, (x - beat.x) / Math.max(1, beat.w)),
        ),
        nearNote:
          snappedString !== null ||
          [...beat.notes.values()].some(
            (note) => x >= note.x - 6 && x <= note.x + note.w + 6,
          ),
      };
    },
    [layout, stringCount],
  );

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!interactive && !onNoteMenu) return;
    const hit = hitTest(event.clientX, event.clientY);
    if (!hit) return;

    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      string: hit.position.string,
      dragging: false,
    };

    if (interactive && onSelect) {
      onSelect(hit.position, event.shiftKey, hit);
    }

    clearLongPress();
    if (event.pointerType !== "touch" || !onNoteMenu) return;

    longPress.current = {
      timer: window.setTimeout(() => {
        if (longPress.current) longPress.current.opened = true;
        swallowNextClick();
        callbacks.current.onNoteMenu?.(hit);
      }, 500),
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      opened: false,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const pending = longPress.current;
    if (pending) {
      if (
        Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > 10
      ) {
        clearLongPress();
      }
    }

    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;

    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.dragging) {
      // Solo el arrastre claramente horizontal marca un tramo: el vertical
      // sigue desplazando la página en táctil.
      if (Math.abs(dx) <= 8 || Math.abs(dx) <= Math.abs(dy)) return;
      current.dragging = true;
      clearLongPress();
    }

    const hit = hitTest(event.clientX, event.clientY);
    if (hit) {
      // Un arrastre horizontal mantiene la cuerda de origen: así la frase
      // completa se marca aunque alguna nota salte de cuerda.
      const position =
        Math.abs(event.clientY - current.y) <= 12
          ? { ...hit.position, string: current.string }
          : hit.position;
      callbacks.current.onSelect?.(position, true, hit);
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const dragged = drag.current?.dragging === true;
    const openedByLongPress = longPress.current?.opened === true;
    drag.current = null;
    clearLongPress();
    if (dragged) return;
    if (openedByLongPress) return;
    if (event.pointerType !== "touch" || !onNoteMenu) return;

    const now = Date.now();
    const last = lastTap.current;
    const isDoubleTap =
      last !== null &&
      now - last.time < 320 &&
      Math.hypot(event.clientX - last.x, event.clientY - last.y) < 28;

    if (isDoubleTap) {
      lastTap.current = null;
      const hit = hitTest(event.clientX, event.clientY);
      if (hit) {
        swallowNextClick();
        callbacks.current.onNoteMenu?.(hit);
      }
      return;
    }

    lastTap.current = { time: now, x: event.clientX, y: event.clientY };
  }

  function openMenuAt(event: { clientX: number; clientY: number }) {
    if (!onNoteMenu) return;
    const hit = hitTest(event.clientX, event.clientY);
    if (!hit) return;
    if (interactive && onSelect) onSelect(hit.position, false, hit);
    callbacks.current.onNoteMenu?.(hit);
  }

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    if (!interactive && !onNoteMenu) return;
    event.preventDefault();
    openMenuAt(event);
  }

  function handleDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!onNoteMenu) return;
    event.preventDefault();
    openMenuAt(event);
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
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
            onContextMenu={handleContextMenu}
            onDoubleClick={handleDoubleClick}
            className="absolute inset-0 z-10 cursor-pointer touch-pan-y"
          />
        )}

        {interactive &&
          selection &&
          (selectedNotes.length > 0
            ? selectedNotes.map(({ bar, beat, string }) => {
                if (
                  bar === selection.bar &&
                  beat === selection.beat &&
                  string === selection.string
                ) {
                  return null;
                }
                const barLayout = layout.find((entry) => entry.index === bar);
                const beatLayout = barLayout?.beats.find(
                  (entry) => entry.index === beat,
                );
                const box = beatLayout?.notes.get(string);
                if (!box) return null;
                return (
                  <div
                    key={`${bar}:${beat}:${string}`}
                    aria-hidden="true"
                    className="pointer-events-none absolute z-20 rounded-sm bg-emerald-500/25"
                    style={{
                      left: box.x,
                      top: box.y,
                      width: box.w,
                      height: box.h,
                    }}
                  />
                );
              })
            : selectedBeats.map(({ bar, beat }) => {
                const barLayout = layout.find((entry) => entry.index === bar);
                const beatLayout = barLayout?.beats.find(
                  (entry) => entry.index === beat,
                );
                if (!barLayout || !beatLayout) return null;
                const isFocus =
                  bar === selection.bar && beat === selection.beat;
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
              }))}

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

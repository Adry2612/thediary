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

function toRect(bounds: { x: number; y: number; w: number; h: number }): Rect {
  return {
    x: bounds.x,
    y: bounds.y,
    w: bounds.w,
    h: bounds.h,
  };
}

export type TabScoreRenderStatus = {
  loading: boolean;
  error: string | null;
};

export function TabScoreCanvas({
  alphaTex,
  stringCount,
  label,
  compact = false,
  interactive = false,
  selection,
  selectedBeats = [],
  onSelect,
  onStatus,
  onRender,
  onLayout,
  className = "",
}: {
  alphaTex: string;
  stringCount: number;
  label?: string;
  compact?: boolean;
  interactive?: boolean;
  selection?: TabSelection;
  selectedBeats?: { bar: number; beat: number }[];
  onSelect?: (position: { bar: number; beat: number; string: number }, extend: boolean) => void;
  onStatus?: (status: TabScoreRenderStatus) => void;
  onRender?: () => void;
  onLayout?: (layout: TabScoreLayout) => void;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onStatus, onRender, onSelect, onLayout });
  callbacks.current = { onStatus, onRender, onSelect, onLayout };
  const [layout, setLayout] = useState<TabScoreLayout>([]);
  const [renderCount, setRenderCount] = useState(0);
  const previousSelection = useRef<string>("");

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

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let api: AlphaTabApi | null = null;
    callbacks.current.onStatus?.({ loading: true, error: null });
    host.replaceChildren();

    void (async () => {
      try {
        const alphaTab = await import("@coderline/alphatab");
        if (disposed) return;
        configureAlphaTabEnvironment(alphaTab);
        api = new alphaTab.AlphaTabApi(host, {
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
          player: { enablePlayer: false },
        });

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
          if (disposed || !api) return;
          callbacks.current.onStatus?.({ loading: false, error: null });
          callbacks.current.onRender?.();
          const nextLayout = measure(api);
          callbacks.current.onLayout?.(nextLayout);
          setLayout(nextLayout);
          setRenderCount((count) => count + 1);
        });

        api.tex(alphaTex);
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
      api?.destroy();
      host.replaceChildren();
    };
  }, [alphaTex, compact, measure]);

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

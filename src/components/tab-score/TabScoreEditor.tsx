"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button } from "@/components/ui/Button";
import { HelpIcon, SlidersIcon } from "@/components/ui/icons";
import { TabScoreTutorial } from "@/components/tab-score/TabScoreTutorial";
import {
  TabScoreCanvas,
  type TabScoreHit,
  type TabScoreLayout,
  type TabScorePlaybackState,
  type TabScorePlayerControls,
  type TabScoreRenderStatus,
} from "@/components/tab-score/TabScoreCanvas";
import {
  TabPalette,
  type PaletteAnchor,
} from "@/components/tab-score/TabPalette";
import { useI18nSection } from "@/i18n/I18nProvider";
import { useTabScoreEditor } from "@/hooks/useTabScoreEditor";
import type { TabScore } from "@/types/tab-score";
import {
  TAB_MAX_FRET,
  TAB_MAX_TEMPO,
  TAB_MIN_TEMPO,
  TAB_TUPLETS,
  type TabTuplet,
} from "@/types/tab-score";
import { announceSelection } from "@/utils/tab-score/announce";
import { buildAlphaTex } from "@/utils/tab-score/alphatex";
import { getStringCount } from "@/utils/tab-score/model";
import { divideBeat } from "@/utils/tab-score/operations";
import {
  getPaletteState,
  type TabPaletteOption,
} from "@/utils/tab-score/palette";
import {
  readNotePreview,
  saveNotePreview,
} from "@/services/tab-score-preferences";
import { getScoreBarFill } from "@/utils/tab-score/ticks";
import type {
  TabMoveDirection,
  TabPosition,
} from "@/utils/tab-score/selection";
import { scoreToText } from "@/utils/tab-score/text";

const ARROW_DIRECTIONS: Record<string, TabMoveDirection> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

const TUPLET_LABEL_KEYS: Record<TabTuplet, string> = {
  3: "tuplet3",
  5: "tuplet5",
  6: "tuplet6",
  7: "tuplet7",
  9: "tuplet9",
  10: "tuplet10",
  12: "tuplet12",
};

export function TabScoreEditor({
  initialScore,
  label,
  onChange,
  onLayout,
  className = "",
}: {
  initialScore: TabScore;
  label?: string;
  onChange?: (score: TabScore) => void;
  onLayout?: (layout: TabScoreLayout) => void;
  className?: string;
}) {
  const text = useI18nSection("tabScore");
  const paletteText = useI18nSection("tabPalette");
  const tutorialText = useI18nSection("tabTutorial");
  const playbackText = useI18nSection("tabPlayback");
  const [status, setStatus] = useState<TabScoreRenderStatus>({
    loading: true,
    error: null,
  });
  const editor = useTabScoreEditor({ initialScore, onChange });
  const containerRef = useRef<HTMLDivElement>(null);
  const tupletDialogRef = useRef<HTMLDivElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [anchor, setAnchor] = useState<PaletteAnchor | null>(null);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [form, setForm] = useState<"time" | "tempo" | "tuplet" | null>(null);
  const [playback, setPlayback] = useState<TabScorePlaybackState>({
    ready: false,
    playing: false,
    error: null,
  });
  const [speed, setSpeed] = useState(1);
  const [notePreview, setNotePreview] = useState(false);
  const [anchorVersion, setAnchorVersion] = useState(0);
  const playerRef = useRef<TabScorePlayerControls | null>(null);
  const savedPadding = useRef<string | null>(null);
  const [numerator, setNumerator] = useState("4");
  const [denominator, setDenominator] = useState<"2" | "4" | "8" | "16">("4");
  const [tempoDraft, setTempoDraft] = useState("90");

  const stringCount = useMemo(
    () => getStringCount(editor.score.tuning),
    [editor.score.tuning],
  );
  const alphaTex = useMemo(
    () => buildAlphaTex(editor.score, { standardNotation: false }),
    [editor.score],
  );
  const announcement = useMemo(
    () => announceSelection({
      score: editor.score,
      selection: editor.selectionVisible ? editor.selection : null,
      stringCount,
      labels: text,
    }),
    [editor.score, editor.selection, editor.selectionVisible, stringCount, text],
  );
  const textAlternative = useMemo(
    () => scoreToText(editor.score),
    [editor.score],
  );
  const paletteState = useMemo(
    () =>
      getPaletteState({
        score: editor.score,
        selection: editor.selection,
        selectedBeats: editor.selectedBeats,
      }),
    [editor.score, editor.selection, editor.selectedBeats],
  );
  const barFill = getScoreBarFill(editor.score, editor.selection.bar);

  useEffect(() => {
    setNotePreview(readNotePreview());
  }, []);

  // La hoja táctil necesita sitio debajo para poder subir la nota seleccionada
  // sin que el final de la página lo impida.
  useEffect(() => {
    if (paletteOpen || savedPadding.current === null) return;
    document.body.style.paddingBottom = savedPadding.current;
    savedPadding.current = null;
  }, [paletteOpen]);

  useEffect(
    () => () => {
      if (savedPadding.current !== null) {
        document.body.style.paddingBottom = savedPadding.current;
        savedPadding.current = null;
      }
    },
    [],
  );

  function ensureBottomSpace() {
    if (savedPadding.current !== null) return;
    if (containerRef.current?.closest("dialog")) return;
    savedPadding.current = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "45dvh";
  }

  useEffect(() => {
    playerRef.current?.setSpeed(speed);
  }, [speed]);

  /**
   * En una hoja táctil el pulso debe quedar por encima de la hoja. Si el
   * diálogo está desplazado y la selección queda abajo, se sube primero.
   */
  function liftSelectionAboveSheet() {
    ensureBottomSpace();
    window.requestAnimationFrame(() => {
      const marker = containerRef.current?.querySelector<HTMLElement>(
        '[data-testid="tab-score-canvas"] .z-30',
      );
      if (!marker) return;
      const rect = marker.getBoundingClientRect();
      const target = window.innerHeight * 0.3;
      if (rect.top <= target) return;
      const scroller = marker.closest("dialog");
      if (scroller) {
        scroller.scrollBy({ top: rect.top - target, behavior: "auto" });
      } else {
        window.scrollBy({ top: rect.top - target, behavior: "auto" });
      }
      window.requestAnimationFrame(() => {
        setAnchorVersion((version) => version + 1);
      });
    });
  }

  function togglePalette() {
    setPaletteOpen((open) => {
      const next = !open;
      if (next) {
        setAnchorVersion((version) => version + 1);
        if (coarsePointer) liftSelectionAboveSheet();
      }
      return next;
    });
  }

  // Espera breve tras 1 o 2 por si el traste es 10–24. El resto de cifras
  // avanza al instante desde el reductor.
  useEffect(() => {
    if (paletteOpen) return;
    if (editor.buffer !== "1" && editor.buffer !== "2") return;

    const timer = window.setTimeout(
      () => editor.dispatch({ type: "advance" }),
      500,
    );
    return () => window.clearTimeout(timer);
  }, [editor.buffer, editor.dispatch, paletteOpen]);

  /** Abre el menú de una nota allí donde se ha pulsado, sin ir a «Opciones». */
  function openNoteMenu(hit: TabScoreHit) {
    if (hit.nearNote) {
      editor.dispatch({ type: "select", position: hit.position });
    } else {
      // En táctil el traste se elige desde el propio menú: hay que conservar
      // el punto pulsado para que la nota caiga ahí y no al inicio del pulso.
      editor.dispatch({
        type: "selectAt",
        position: hit.position,
        fraction: hit.fraction,
      });
    }
    setAnchor(hit.box);
    setAnchorVersion((version) => version + 1);
    setPaletteOpen(true);
    containerRef.current?.focus({ preventScroll: true });
    if (coarsePointer) liftSelectionAboveSheet();
  }

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarsePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // El selector de subdivisiones se abre desde la paleta, así que el foco no
  // está dentro del diálogo: Escape se escucha en la ventana y se lleva el foco
  // al editor al cerrar.
  useEffect(() => {
    if (form !== "tuplet") return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setForm(null);
      containerRef.current?.focus({ preventScroll: true });
    }

    window.addEventListener("keydown", handleEscape, true);
    tupletDialogRef.current?.focus({ preventScroll: true });

    return () => window.removeEventListener("keydown", handleEscape, true);
  }, [form]);

  function select(position: TabPosition, extend: boolean, hit?: TabScoreHit) {
    // Si el clic cae en un hueco (lejos de una nota ya dibujada), la primera
    // cifra partirá el pulso en ese punto. Sobre una nota, selecciona para
    // editar o para añadir otra cuerda del acorde.
    if (!extend && hit && !hit.nearNote) {
      editor.dispatch({ type: "selectAt", position, fraction: hit.fraction });
    } else {
      editor.dispatch({ type: "select", position, extend });
    }
    containerRef.current?.focus({ preventScroll: true });
  }

  function handlePaletteOption(option: TabPaletteOption) {
    const action = option.action;
    if (action.type === "bendRelease" || action.type === "bendPrebend") {
      const flag = action.type === "bendRelease" ? "release" : "prebend";
      editor.dispatch({
        type: "setBendFlag",
        flag,
        value: !paletteState[option.id]?.active,
      });
      return;
    }
    if (action.type === "openTimeSignature") {
      const signature = editor.score.bars[editor.selection.bar]?.timeSignature;
      setNumerator(String(signature?.numerator ?? 4));
      setDenominator(String(signature?.denominator ?? 4) as "4");
      setForm("time");
      return;
    }
    if (action.type === "openTempo") {
      setTempoDraft(String(editor.score.tempo));
      setForm("tempo");
      return;
    }
    if (action.type === "openTuplet") {
      setForm("tuplet");
      return;
    }
    if (action.type === "splitBeat") {
      // El pulso nuevo queda seleccionado: se cierra la paleta y se devuelve el
      // foco para poder escribir el traste sin un clic más.
      editor.dispatch(action);
      setPaletteOpen(false);
      window.requestAnimationFrame(() =>
        containerRef.current?.focus({ preventScroll: true }),
      );
      return;
    }
    editor.dispatch(action);
  }

  function submitForm(event: FormEvent) {
    event.preventDefault();
    if (form === "time") {
      editor.dispatch({
        type: "setTimeSignature",
        numerator: Number(numerator),
        denominator: Number(denominator) as 2 | 4 | 8 | 16,
      });
    }
    if (form === "tempo") {
      editor.dispatch({ type: "setTempo", tempo: Number(tempoDraft) });
    }
    setForm(null);
    containerRef.current?.focus({ preventScroll: true });
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    // El diálogo del tutorial se dibuja dentro del editor: sus teclas no son
    // órdenes para la partitura. Un diálogo que envuelve al editor (por
    // ejemplo, el de una canción) no activa este caso.
    const dialog = target.closest("dialog");
    if (
      target.closest("[data-tab-palette]") ||
      target.closest("[data-tab-tutorial]") ||
      (dialog && containerRef.current?.contains(dialog)) ||
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement
    ) {
      return;
    }

    const { key, shiftKey } = event;

    if (event.metaKey || event.ctrlKey) {
      const command = key.toLowerCase();
      if (command === "z") {
        event.preventDefault();
        editor.dispatch({ type: shiftKey ? "redo" : "undo" });
        return;
      }
      if (command === "y") {
        event.preventDefault();
        editor.dispatch({ type: "redo" });
        return;
      }
      if (command === "c") {
        event.preventDefault();
        editor.dispatch({ type: "copyBeats" });
        return;
      }
      if (command === "x") {
        event.preventDefault();
        editor.dispatch({ type: "cutBeats" });
        return;
      }
      if (command === "v") {
        event.preventDefault();
        editor.dispatch({ type: "paste" });
        return;
      }
      return;
    }

    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      editor.dispatch({ type: "digit", digit: key });
      return;
    }

    const direction = ARROW_DIRECTIONS[key];
    if (direction) {
      event.preventDefault();
      editor.dispatch({ type: "move", direction, extend: shiftKey });
      return;
    }

    if (key === "Backspace" || key === "Delete") {
      event.preventDefault();
      editor.dispatch({ type: "deleteNote" });
      return;
    }

    if (key === "Enter") {
      event.preventDefault();
      editor.dispatch({ type: "commitBuffer" });
      setPaletteOpen(true);
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      if (tutorialOpen) setTutorialOpen(false);
      else if (paletteOpen) setPaletteOpen(false);
      else editor.dispatch({ type: "clearSelection" });
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-testid="tab-score-canvas"]')) return;
    containerRef.current?.focus({ preventScroll: true });
  }

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      className={`relative rounded-xl border border-line bg-white text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${className}`}
    >
      <p
        aria-live="polite"
        aria-atomic="true"
        data-testid="tab-score-announcement"
        className="sr-only"
      >
        {announcement}
      </p>

      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-3 py-2">
        <Button
          type="button"
          size="field"
          variant="ghost"
          disabled={!editor.canUndo}
          aria-label={text.undo}
          title={text.undo}
          onClick={() => editor.dispatch({ type: "undo" })}
          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
        >
          ↶
        </Button>
        <Button
          type="button"
          size="field"
          variant="ghost"
          disabled={!editor.canRedo}
          aria-label={text.redo}
          title={text.redo}
          onClick={() => editor.dispatch({ type: "redo" })}
          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
        >
          ↷
        </Button>
        <Button
          type="button"
          size="field"
          variant="ghost"
          title={tutorialText.open}
          onClick={() => setTutorialOpen(true)}
          className="ml-auto border-zinc-300 text-zinc-700 hover:bg-zinc-100"
        >
          <HelpIcon className="size-4" />
          {tutorialText.open}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          data-palette-toggle
          aria-label={paletteText.options}
          aria-expanded={paletteOpen}
          title={paletteText.options}
          disabled={!editor.selectionVisible}
          onClick={togglePalette}
          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
        >
          <SlidersIcon />
        </Button>
      </div>

      <TabScoreTutorial
        open={tutorialOpen}
        score={editor.score}
        selection={editor.selection}
        paletteOpen={paletteOpen}
        onClose={() => {
          setTutorialOpen(false);
          setPaletteOpen(false);
          containerRef.current?.focus({ preventScroll: true });
        }}
      />

      <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-200 px-3 py-2">
        {editor.score.bars.map((bar, index) => {
          const fill = getScoreBarFill(editor.score, index);
          const active = index === editor.selection.bar;
          return (
            <button
              key={bar.id}
              type="button"
              data-testid={`tab-score-bar-${index}`}
              aria-current={active ? "true" : undefined}
              aria-label={`${paletteText.bars} ${index + 1}${
                fill === "under"
                  ? `, ${paletteText.barUnder}`
                  : fill === "over"
                    ? `, ${paletteText.barOver}`
                    : ""
              }`}
              onClick={() => editor.dispatch({ type: "selectBar", bar: index })}
              className={`flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs ${
                active
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {index + 1}
              {fill !== "exact" && (
                <span aria-hidden="true" className="text-amber-600">
                  ⚠
                </span>
              )}
            </button>
          );
        })}
      </div>

      {barFill !== "exact" && (
        <p
          role="status"
          data-testid="tab-score-bar-warning"
          className="border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800"
        >
          ⚠{" "}
          {barFill === "under"
            ? paletteText.barUnder
            : paletteText.barOver}
        </p>
      )}

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-zinc-200 px-3 py-2 text-xs text-zinc-600">
        <span data-testid="tab-score-selection">{announcement}</span>
        <span className="text-[11px] text-zinc-400">
          {text.noteMenuHint}
        </span>
        {status.error && (
          <span role="alert" className="text-red-700">
            {text.error}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-3 py-2">
        <Button
          type="button"
          size="field"
          variant={playback.playing ? "primary" : "ghost"}
          onClick={() => {
            if (playback.playing) playerRef.current?.pause();
            else playerRef.current?.play();
          }}
          className={
            playback.playing
              ? ""
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          }
        >
          {playback.playing ? "■ " + playbackText.pause : "▶ " + playbackText.play}
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
        <Button
          type="button"
          size="field"
          variant="ghost"
          onClick={() =>
            playerRef.current?.playFrom({
              bar: editor.selection.bar,
              beat: editor.selection.beat,
            })
          }
          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
        >
          {playbackText.fromSelection}
        </Button>
        <label className="flex items-center gap-1.5 text-xs text-zinc-600">
          {playbackText.speed}
          <select
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="rounded-md border border-zinc-300 px-1.5 py-1 text-xs"
          >
            <option value={0.5}>0.5×</option>
            <option value={0.75}>0.75×</option>
            <option value={1}>1×</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-zinc-600">
          <input
            type="checkbox"
            checked={notePreview}
            onChange={(event) => {
              setNotePreview(event.target.checked);
              saveNotePreview(event.target.checked);
            }}
          />
          {playbackText.previewNote}
        </label>
        {playback.error && (
          <span role="alert" className="text-xs text-red-700">
            {playbackText.soundUnavailable}
          </span>
        )}
      </div>

      <pre data-testid="tab-score-text" className="sr-only">
        {textAlternative}
      </pre>

      <TabScoreCanvas
        alphaTex={alphaTex}
        stringCount={stringCount}
        label={label}
        interactive
        selection={editor.selectionVisible ? editor.selection : undefined}
        selectedBeats={editor.selectionVisible ? editor.selectedBeats : []}
        onSelect={select}
        onNoteMenu={openNoteMenu}
        onStatus={setStatus}
        onLayout={onLayout}
        onFocusBox={setAnchor}
        focusBoxVersion={anchorVersion}
        playback
        previewRequest={
          notePreview && editor.lastNote
            ? {
                bar: editor.lastNote.bar,
                beat: editor.lastNote.beat,
                string: editor.lastNote.string,
                token: editor.previewSeq,
              }
            : null
        }
        onControls={(controls) => {
          playerRef.current = controls;
        }}
        onPlaybackState={setPlayback}
        className="p-3 sm:p-4"
      />

      <TabPalette
        open={paletteOpen}
        mode={coarsePointer ? "sheet" : "popover"}
        anchor={anchor}
        state={paletteState}
        onAction={handlePaletteOption}
        onFret={(fret) => {
          editor.dispatch({ type: "commitBuffer" });
          for (const digit of String(Math.min(fret, TAB_MAX_FRET))) {
            editor.dispatch({ type: "digit", digit });
          }
        }}
        onClose={() => {
          setPaletteOpen(false);
          containerRef.current?.focus({ preventScroll: true });
        }}
        returnFocus={() => containerRef.current?.focus({ preventScroll: true })}
      />

      {form === "tuplet" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={paletteText.subdivisionTitle}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            ref={tupletDialogRef}
            tabIndex={-1}
            className="w-full max-w-sm rounded-xl bg-white p-4 text-zinc-900 shadow-xl outline-none"
          >
            <h3 className="text-sm font-semibold">
              {paletteText.subdivisionTitle}
            </h3>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              {editor.selectedBeats.length > 1
                ? paletteText.subdivisionGroupHint
                : paletteText.subdivisionHint}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {TAB_TUPLETS.map((tuplet) => {
                const result = divideBeat(
                  editor.score,
                  editor.selection,
                  tuplet,
                );
                const error = "error" in result ? result.error : null;
                const label =
                  paletteText[
                    TUPLET_LABEL_KEYS[tuplet] as keyof typeof paletteText
                  ];
                const reason =
                  error === "cannotSubdivide"
                    ? paletteText.cannotSubdivide
                    : error === "alreadySubdivided"
                      ? paletteText.alreadySubdivided
                      : error === "beatLimit"
                        ? paletteText.beatLimit
                        : error === "tupletNeedsBeats"
                          ? paletteText.tupletNeedsBeats
                          : error === "tupletDifferentValues"
                            ? paletteText.tupletDifferentValues
                            : error === "tupletAcrossBars"
                              ? paletteText.tupletAcrossBars
                              : null;

                return (
                  <button
                    key={tuplet}
                    type="button"
                    disabled={error !== null}
                    onClick={() => {
                      editor.dispatch({ type: "divideBeat", tuplet });
                      setForm(null);
                      setPaletteOpen(false);
                      containerRef.current?.focus({ preventScroll: true });
                    }}
                    className="rounded-md border border-zinc-300 px-2 py-2 text-left text-sm text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {label}
                    {reason && (
                      <span className="mt-0.5 block text-[11px] font-normal text-zinc-500">
                        {reason}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                size="field"
                variant="ghost"
                onClick={() => setForm(null)}
                className="border-zinc-300 text-zinc-700"
              >
                {paletteText.close}
              </Button>
            </div>
          </div>
        </div>
      )}

      {form && form !== "tuplet" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={form === "time" ? paletteText.timeSignature : paletteText.tempo}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <form
            onSubmit={submitForm}
            className="w-full max-w-xs rounded-xl bg-white p-4 text-zinc-900 shadow-xl"
          >
            <h3 className="mb-3 text-sm font-semibold">
              {form === "time" ? paletteText.timeSignature : paletteText.tempo}
            </h3>
            {form === "time" ? (
              <div className="flex gap-2">
                <label className="flex-1 text-xs text-zinc-600">
                  {paletteText.numerator}
                  <input
                    type="number"
                    min={1}
                    max={32}
                    value={numerator}
                    onChange={(event) => setNumerator(event.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="flex-1 text-xs text-zinc-600">
                  {paletteText.denominator}
                  <select
                    value={denominator}
                    onChange={(event) =>
                      setDenominator(event.target.value as "4")
                    }
                    className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                  >
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="8">8</option>
                    <option value="16">16</option>
                  </select>
                </label>
              </div>
            ) : (
              <label className="block text-xs text-zinc-600">
                {paletteText.bpm}
                <input
                  type="number"
                  min={TAB_MIN_TEMPO}
                  max={TAB_MAX_TEMPO}
                  value={tempoDraft}
                  onChange={(event) => setTempoDraft(event.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                />
              </label>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                size="field"
                variant="ghost"
                onClick={() => setForm(null)}
                className="border-zinc-300 text-zinc-700"
              >
                {paletteText.close}
              </Button>
              <Button type="submit" size="field" variant="primary">
                {paletteText.apply}
              </Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

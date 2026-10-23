"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/Button";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { TextField } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { TabPlaybackBar } from "@/components/repertoire/TabPlaybackBar";
import { TabTechniquePicker } from "@/components/repertoire/TabTechniquePicker";
import {
  clearTabNote,
  getAvailableTabColumns,
  getTabCellCenterX,
  getTabCellWidth,
  getTabColumns,
  getTabStringOrder,
  getTabStringRowY,
  getTabTechnique,
  groupTabSystems,
  LABEL_WIDTH,
  MAX_FRET,
  MIN_MEASURES,
  setTabMeasures,
  setTabSubdivision,
  STRING_ROW_HEIGHT,
  TAB_EDITOR_MAX_MEASURES,
  TAB_TECHNIQUES,
  tabSystemTechniques,
  tabTechniqueGlyphs,
} from "@/utils/repertoire-tab";
import { parseTuningNotes, STRING_COUNT } from "@/utils/chords";
import type { RepertoireTab, RepertoireTabNote } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";
import { useTabEditorSelection } from "@/hooks/useTabEditorSelection";

interface TabEditorProps {
  value: RepertoireTab;
  onChange: (value: RepertoireTab) => void;
  title?: string;
  description?: string;
  defaultOpen?: boolean;
  /** Tempo inicial de reproducción; no modifica el BPM objetivo del lick. */
  bpm?: number;
}

export function TabEditor({
  value,
  onChange,
  title,
  description,
  defaultOpen = false,
  bpm,
}: TabEditorProps) {
  const text = useI18nSection("repertoire");
  const measureObserverRef = useRef<ResizeObserver | null>(null);
  const techniquesPanelRef = useRef<HTMLDivElement>(null);
  const wasDraggingRef = useRef(false);
  const [gridWidth, setGridWidth] = useState(0);
  const [playheadColumn, setPlayheadColumn] = useState<number | null>(null);
  const [techniquesOpen, setTechniquesOpen] = useState(false);
  const [techniquesPosition, setTechniquesPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  // La rejilla se mide a sí misma: cuántos compases caben por sistema según el ancho.
  // Se usa un ref de callback porque la rejilla solo existe cuando la sección está abierta.
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    measureObserverRef.current?.disconnect();
    measureObserverRef.current = null;
    if (!node) return;
    setGridWidth(node.clientWidth);
    const observer = new ResizeObserver(() => setGridWidth(node.clientWidth));
    observer.observe(node);
    measureObserverRef.current = observer;
  }, []);

  const columns = getTabColumns(value);
  const {
    gridRef,
    focus,
    buffer,
    dragging,
    selectedCells,
    isCellSelected,
    startSelection,
    extendSelection,
    handleGridKeyDown,
    applyFretInput,
    commitBuffer,
  } = useTabEditorSelection({ value, columns, onChange });

  const tuningNotes = useMemo(
    () => parseTuningNotes(value.tuning),
    [value.tuning],
  );
  // De la cuerda más aguda (arriba) a la más grave (abajo), como en una tab real.
  const stringOrder = useMemo(() => getTabStringOrder(), []);
  const fretByCell = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of value.notes) {
      map.set(`${note.string}:${note.column}`, note.fret);
    }
    return map;
  }, [value.notes]);
  const noteByCell = useMemo(() => {
    const map = new Map<string, RepertoireTabNote>();
    for (const note of value.notes) {
      map.set(`${note.string}:${note.column}`, note);
    }
    return map;
  }, [value.notes]);

  const availableColumns = getAvailableTabColumns(gridWidth, value.subdivision);
  const systems = groupTabSystems(value, availableColumns);
  const fullColumns = systems[0]?.columnCount ?? value.subdivision;
  const cellWidth = getTabCellWidth(gridWidth, fullColumns);

  const currentFret = fretByCell.get(`${focus.string}:${focus.column}`);

  // La capa de anotaciones usa la misma geometría que la rejilla: las celdas
  // tienen ancho fijo y no hay separación entre ellas, así que basta el índice
  // de la columna y el ancho de celda.
  function cellCenterX(indexInSystem: number): number {
    return getTabCellCenterX(indexInSystem, cellWidth);
  }

  function stringRowY(rowIndex: number): number {
    return getTabStringRowY(rowIndex);
  }
  const selectedNote = noteByCell.get(`${focus.string}:${focus.column}`);
  const fretFieldValue =
    buffer !== "" ? buffer : currentFret !== undefined ? String(currentFret) : "";

  const techniquesAnchor = useMemo(() => {
    const focusKey = `${focus.string}:${focus.column}`;
    if (noteByCell.has(focusKey)) return focus;
    return (
      selectedCells.find((cell) =>
        noteByCell.has(`${cell.string}:${cell.column}`),
      ) ?? focus
    );
  }, [focus, selectedCells, noteByCell]);

  function closeTechniques() {
    setTechniquesOpen(false);
    setTechniquesPosition(null);
  }

  // Al teclear un traste el panel estorba: se cierra y deja editar la celda.
  useEffect(() => {
    if (buffer === "") return;
    closeTechniques();
  }, [buffer]);

  // Un clic o un arrastre abren el selector solo al soltar y si hay notas.
  useEffect(() => {
    const wasDragging = wasDraggingRef.current;
    wasDraggingRef.current = dragging;
    if (!wasDragging || dragging) return;

    const hasNotes = selectedCells.some((cell) =>
      noteByCell.has(`${cell.string}:${cell.column}`),
    );
    if (hasNotes) {
      setTechniquesOpen(true);
    } else {
      setTechniquesOpen(false);
    }
  }, [dragging, selectedCells, noteByCell]);

  // Si la selección se queda sin notas (borrar, vaciar, etc.), se cierra.
  useEffect(() => {
    if (!techniquesOpen) return;
    const hasNotes = selectedCells.some((cell) =>
      noteByCell.has(`${cell.string}:${cell.column}`),
    );
    if (!hasNotes) closeTechniques();
  }, [techniquesOpen, selectedCells, noteByCell]);

  // Un clic fuera del selector o de la rejilla lo cierra.
  useEffect(() => {
    if (!techniquesOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (techniquesPanelRef.current?.contains(target)) return;
      if (gridRef.current?.contains(target)) return;
      closeTechniques();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [techniquesOpen, gridRef]);

  // Escape cierra solo el selector, no el diálogo que lo contiene.
  useEffect(() => {
    if (!techniquesOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeTechniques();
      gridRef.current?.focus();
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [techniquesOpen, gridRef]);

  const updateTechniquesPosition = useCallback(() => {
    if (!techniquesOpen) return;
    const grid = gridRef.current;
    if (!grid) return;
    const cell = grid.querySelector<HTMLElement>(
      `[data-tab-cell="${techniquesAnchor.string}:${techniquesAnchor.column}"]`,
    );
    if (!cell) {
      setTechniquesPosition({
        top: 8,
        left: 0,
        width: Math.min(techniquesPanelRef.current?.offsetWidth ?? 320, 320),
      });
      return;
    }

    const gridRect = grid.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const width = Math.min(
      techniquesPanelRef.current?.offsetWidth ?? 320,
      320,
      gridRect.width,
    );
    const center = cellRect.left - gridRect.left + cellRect.width / 2;
    const maxLeft = Math.max(0, gridRect.width - width);
    setTechniquesPosition({
      top: cellRect.bottom - gridRect.top + 8,
      left: Math.min(Math.max(0, center - width / 2), maxLeft),
      width,
    });
  }, [
    techniquesOpen,
    techniquesAnchor.string,
    techniquesAnchor.column,
    gridRef,
  ]);

  useEffect(() => {
    updateTechniquesPosition();
  }, [updateTechniquesPosition, gridWidth, value.notes]);

  return (
    <CollapsibleSection
      title={title ?? text.tabTitle}
      description={description ?? text.tabDescription}
      defaultOpen={defaultOpen}
    >
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="text-xs text-muted">
          {text.tabResolution}
          <SelectField
            className="mt-1 w-44"
            value={String(value.subdivision)}
            ariaLabel={text.tabResolution}
            onChange={(next) => onChange(setTabSubdivision(value, Number(next)))}
            options={[
              { value: "4", label: text.tabResolutionQuarter },
              { value: "8", label: text.tabResolutionEighth },
              { value: "16", label: text.tabResolutionSixteenth },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="field"
            aria-label={text.tabRemoveMeasure}
            disabled={value.measures <= MIN_MEASURES}
            onClick={() => onChange(setTabMeasures(value, value.measures - 1))}
          >
            −
          </Button>
          <span className="font-mono text-sm text-ink">
            {value.measures} {text.tabMeasures}
          </span>
          <Button
            type="button"
            size="field"
            aria-label={text.tabAddMeasure}
            disabled={value.measures >= TAB_EDITOR_MAX_MEASURES}
            onClick={() => onChange(setTabMeasures(value, value.measures + 1))}
          >
            +
          </Button>
        </div>
        <label className="text-xs text-muted">
          {text.tabFret}
          <TextField
            type="number"
            min={0}
            max={MAX_FRET}
            value={fretFieldValue}
            aria-label={text.tabFret}
            onChange={(event) => applyFretInput(event.target.value)}
            className="mt-1 w-20"
          />
        </label>
        <Button
          type="button"
          size="field"
          onClick={() =>
            onChange(clearTabNote(value, focus.string, focus.column))
          }
        >
          {text.tabClearCell}
        </Button>
        <Button
          type="button"
          size="field"
          onClick={() => onChange({ ...value, notes: [] })}
        >
          {text.tabClearAll}
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted">{text.tabHint}</p>

      <TabPlaybackBar
        tab={value}
        initialBpm={bpm}
        onPlayheadChange={setPlayheadColumn}
        className="mt-3"
      />

      <div className="relative mt-3">
        <div
          ref={gridRef}
          tabIndex={0}
          role="grid"
          aria-label={text.tabTitle}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              buffer === "" &&
              selectedCells.some((cell) =>
                noteByCell.has(`${cell.string}:${cell.column}`),
              )
            ) {
              event.preventDefault();
              setTechniquesOpen(true);
              return;
            }
            handleGridKeyDown(event);
          }}
          onBlur={commitBuffer}
          className="rounded-lg border border-line bg-canvas/40 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
        >
        <div ref={measureRef} className="w-full">
          {systems.map((system) => {
            const techniques = tabSystemTechniques(value, system);
            const spanRows = TAB_TECHNIQUES.filter(
              (technique) =>
                technique.render === "span" &&
                techniques.spans.some(
                  (span) => span.techniqueId === technique.id,
                ),
            );
            return (
            <div key={system.startColumn} className="mt-3 first:mt-0">
              <div className="flex items-center">
                <span
                  style={{ width: LABEL_WIDTH }}
                  className="shrink-0 pr-2 text-right font-mono text-[10px] text-transparent"
                >
                  0
                </span>
                {Array.from({ length: system.columnCount }, (_, index) => {
                  const column = system.startColumn + index;
                  const measureStart = column % value.subdivision === 0;
                  return (
                    <span
                      key={column}
                      style={{ width: cellWidth }}
                      className={`shrink-0 text-center font-mono text-[10px] text-muted ${
                        measureStart && column > 0 ? "border-l border-line" : ""
                      }`}
                    >
                      {measureStart ? column / value.subdivision + 1 : ""}
                    </span>
                  );
                })}
              </div>

              {spanRows.map((technique) => (
                <div key={technique.id} className="flex items-center">
                  <span style={{ width: LABEL_WIDTH }} className="shrink-0" />
                  <div className="relative h-3 flex-1">
                    {techniques.spans
                      .filter((span) => span.techniqueId === technique.id)
                      .map((span) => {
                        const startIndex = span.startColumn - system.startColumn;
                        const endIndex = span.endColumn - system.startColumn;
                        const tremolo = technique.id === "tremoloPicking";
                        return (
                          <div
                            key={span.startColumn}
                            className="absolute top-0 flex h-full items-center"
                            style={{
                              left: startIndex * cellWidth + 2,
                              width:
                                (endIndex - startIndex + 1) * cellWidth - 4,
                            }}
                          >
                            {technique.label && (span.opens || startIndex === 0) ?
                              <span className="shrink-0 bg-canvas px-0.5 font-mono text-[9px] leading-none text-accent-green-fg">
                                {technique.label}
                              </span>
                            : null}
                            {tremolo ?
                              <span className="h-full flex-1 overflow-hidden whitespace-nowrap font-mono text-[9px] leading-none tracking-[-0.08em] text-accent-green-fg/70">
                                {"/".repeat(60)}
                              </span>
                            : <span className="h-0 flex-1 border-t border-dashed border-accent-green-fg/60" />}
                            <span className="shrink-0 font-mono text-[9px] leading-none text-accent-green-fg">
                              |
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}

              <div className="relative">
              {stringOrder.map((stringIndex) => (
                <div key={stringIndex} className="flex items-center">
                  <span
                    style={{ width: LABEL_WIDTH }}
                    className="shrink-0 pr-2 text-right font-mono text-xs text-muted"
                  >
                    {tuningNotes[stringIndex]}
                  </span>
                  {Array.from({ length: system.columnCount }, (_, index) => {
                    const column = system.startColumn + index;
                    const isActive =
                      focus.string === stringIndex && focus.column === column;
                    const isSelected = isCellSelected(stringIndex, column);
                    const isPlayhead = playheadColumn === column;
                    const note = noteByCell.get(`${stringIndex}:${column}`);
                    const display =
                      isActive && buffer !== "" ?
                        buffer
                      : note?.dead ?
                        "x"
                      : note !== undefined ?
                        String(note.fret)
                      : "";
                    const glyphs = note ? tabTechniqueGlyphs(note) : [];
                    const measureStart = column % value.subdivision === 0;
                    return (
                      <button
                        key={column}
                        type="button"
                        tabIndex={-1}
                        data-tab-cell={`${stringIndex}:${column}`}
                        data-selected={isSelected ? "true" : undefined}
                        data-playhead={isPlayhead ? "true" : undefined}
                        aria-current={isPlayhead ? "true" : undefined}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          startSelection(
                            stringIndex,
                            column,
                            event.shiftKey,
                          );
                        }}
                        onPointerEnter={() =>
                          extendSelection(stringIndex, column)
                        }
                        style={{ width: cellWidth }}
                        aria-label={`${text.tabFret} ${column + 1}, ${tuningNotes[stringIndex]}${
                          glyphs.length > 0 ? `, ${glyphs.join(" ")}` : ""
                        }`}
                        className={`flex h-9 shrink-0 flex-col items-center justify-center overflow-hidden border-b border-line/60 font-mono text-xs tabular-nums text-ink transition ${
                          measureStart && column > 0 ? "border-l border-line" : ""
                        } ${
                          isActive ?
                            "bg-accent-green-bg/40 ring-1 ring-inset ring-accent-green-fg"
                          : isSelected ?
                            "bg-accent-green-bg/20"
                          : isPlayhead ?
                            "bg-accent-green-bg/15"
                          : "hover:bg-white/5"
                        }`}
                      >
                        <span className="flex w-full flex-wrap items-center justify-center gap-x-0.5 overflow-hidden text-[8px] leading-none text-accent-green-fg">
                          {glyphs.join(" ")}
                        </span>
                        <span className="leading-none">{display}</span>
                      </button>
                    );
                  })}
                </div>
              ))}

                <div className="pointer-events-none absolute inset-0">
                  <svg
                    className="absolute left-0 top-0 overflow-visible text-accent-green-fg/40"
                    width={LABEL_WIDTH + system.columnCount * cellWidth}
                    height={STRING_COUNT * STRING_ROW_HEIGHT}
                  >
                    {techniques.links.map((link) => {
                      const y = stringRowY(stringOrder.indexOf(link.string));
                      return (
                        <line
                          key={`${link.techniqueId}-${link.string}-${link.toColumn}`}
                          x1={cellCenterX(link.fromColumn - system.startColumn)}
                          y1={y}
                          x2={cellCenterX(link.toColumn - system.startColumn)}
                          y2={y}
                          stroke="currentColor"
                          strokeWidth={1}
                        />
                      );
                    })}
                    {techniques.holds.map((hold) => {
                      const y =
                        stringRowY(stringOrder.indexOf(hold.string)) + 10;
                      return (
                        <line
                          key={`${hold.techniqueId}-${hold.string}-${hold.column}`}
                          x1={cellCenterX(hold.column - system.startColumn)}
                          y1={y}
                          x2={
                            cellCenterX(hold.endColumn - system.startColumn) +
                            cellWidth / 2
                          }
                          y2={y}
                          stroke="currentColor"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                        />
                      );
                    })}
                  </svg>

                  {techniques.links.map((link) => (
                    <span
                      key={`${link.techniqueId}-${link.string}-${link.toColumn}`}
                      style={{
                        left:
                          (cellCenterX(link.fromColumn - system.startColumn) +
                            cellCenterX(link.toColumn - system.startColumn)) /
                          2,
                        top: stringRowY(stringOrder.indexOf(link.string)),
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 bg-canvas px-0.5 font-mono text-[9px] leading-none text-accent-green-fg"
                    >
                      {getTabTechnique(link.techniqueId)?.glyph}
                    </span>
                  ))}

                  {techniques.holds.map((hold) => (
                    <span
                      key={`${hold.techniqueId}-${hold.string}-${hold.column}`}
                      style={{
                        left:
                          cellCenterX(hold.column - system.startColumn) -
                          cellWidth / 2,
                        top: stringRowY(stringOrder.indexOf(hold.string)) + 10,
                      }}
                      className="absolute -translate-y-1/2 bg-canvas px-0.5 font-mono text-[9px] leading-none text-accent-green-fg"
                    >
                      {getTabTechnique(hold.techniqueId)?.glyph}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {techniquesOpen ? (
        <div
          ref={techniquesPanelRef}
          className="absolute z-30"
          style={{
            top: techniquesPosition?.top ?? 0,
            left: techniquesPosition?.left ?? 0,
            width: techniquesPosition?.width,
            visibility: techniquesPosition ? "visible" : "hidden",
          }}
        >
          <TabTechniquePicker
            value={value}
            selectedCells={selectedCells}
            selectedNote={selectedNote}
            onChange={onChange}
            onClose={() => {
              closeTechniques();
              gridRef.current?.focus();
            }}
          />
        </div>
      ) : null}
      </div>
    </CollapsibleSection>
  );
}

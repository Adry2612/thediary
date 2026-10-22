"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { TextField } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import {
  BEND_AMOUNT_LABELS,
  canApplyTabTechniqueToSelection,
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
  setTabBendAmounts,
  setTabMeasures,
  setTabSubdivision,
  STRING_ROW_HEIGHT,
  TAB_BEND_AMOUNTS,
  TAB_EDITOR_MAX_MEASURES,
  TAB_TECHNIQUES,
  tabSystemTechniques,
  tabTechniqueGlyphs,
  tabTechniqueSelectionState,
  toggleTabTechniques,
} from "@/lib/repertoire-tab";
import { parseTuningNotes, STRING_COUNT } from "@/lib/chords";
import type { RepertoireTab, RepertoireTabNote } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";
import { useTabEditorSelection } from "@/hooks/useTabEditorSelection";

interface TabEditorProps {
  value: RepertoireTab;
  onChange: (value: RepertoireTab) => void;
  title?: string;
  description?: string;
  defaultOpen?: boolean;
}

export function TabEditor({
  value,
  onChange,
  title,
  description,
  defaultOpen = false,
}: TabEditorProps) {
  const text = useI18nSection("repertoire");
  const measureObserverRef = useRef<ResizeObserver | null>(null);
  const [gridWidth, setGridWidth] = useState(0);
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

  const hasSelectionNotes = selectedCells.some((cell) =>
    noteByCell.has(`${cell.string}:${cell.column}`),
  );

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

      <div className="mt-3 rounded-lg border border-line bg-canvas/40 p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {text.techniquesTitle}
          </h3>
          <span className="text-[11px] text-muted">{text.techniquesHint}</span>
        </div>

        {!hasSelectionNotes ?
          <p className="mt-2 text-xs text-muted">{text.techniquesNoNote}</p>
        : null}

        <div className="mt-2 flex flex-wrap gap-1.5">
          {TAB_TECHNIQUES.map((technique) => {
            const label = text[technique.labelKey] ?? technique.id;
            const state = tabTechniqueSelectionState(
              value,
              selectedCells,
              technique.id,
            );
            const canToggle =
              state !== "none" ||
              canApplyTabTechniqueToSelection(
                value,
                selectedCells,
                technique.id,
              );
            const needsPrevious =
              technique.isTransition && !canToggle;
            return (
              <button
                key={technique.id}
                type="button"
                disabled={!canToggle}
                aria-pressed={state === "all" ? true : state === "some" ? "mixed" : false}
                title={
                  needsPrevious ?
                    text.techniquesNeedsPrevious
                  : `${label} [${technique.shortcut}]`
                }
                onClick={() =>
                  onChange(toggleTabTechniques(value, selectedCells, technique.id))
                }
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  state === "all" ?
                    "border-accent-green-fg bg-accent-green-bg/40 text-ink"
                  : state === "some" ?
                    "border-accent-green-fg/60 bg-accent-green-bg/20 text-ink"
                  : "border-line text-muted hover:bg-white/5 hover:text-ink"
                }`}
              >
                <span className="font-mono text-[10px] font-semibold text-accent-green-fg">
                  {technique.glyph}
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {selectedNote?.bend ?
          <label className="mt-2 block text-[11px] text-muted">
            {text.techniqueBendAmount}
            <SelectField
              className="mt-1 w-28"
              value={String(selectedNote.bend.semitones)}
              ariaLabel={text.techniqueBendAmount}
              onChange={(next) =>
                onChange(setTabBendAmounts(value, selectedCells, Number(next)))
              }
              options={TAB_BEND_AMOUNTS.map((amount) => ({
                value: String(amount),
                label: BEND_AMOUNT_LABELS[String(amount)] ?? String(amount),
              }))}
            />
          </label>
        : null}
      </div>

      <div
        ref={gridRef}
        tabIndex={0}
        role="grid"
        aria-label={text.tabTitle}
        onKeyDown={handleGridKeyDown}
        onBlur={commitBuffer}
        className="mt-3 rounded-lg border border-line bg-canvas/40 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
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
                        data-selected={isSelected ? "true" : undefined}
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
    </CollapsibleSection>
  );
}

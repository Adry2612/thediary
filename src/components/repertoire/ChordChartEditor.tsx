"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { TextArea } from "@/components/ui/Field";
import { ChordPicker } from "@/components/repertoire/ChordPicker";
import { layoutChordChart } from "@/utils/repertoire-chord-layout";
import type { WrappedRow } from "@/utils/repertoire-chord-layout";
import {
  chartToLyrics,
  getChordAtPosition,
  lyricsToChart,
  removeChordFromLine,
  setChordOnLine,
} from "@/utils/repertoire-chord-chart";
import { createId } from "@/utils/create-id";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { RepertoireChordChart } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

const COLUMN_WIDTH = "1.15ch";
const CHORD_ROW_HEIGHT = "1.15rem";
const MIN_COLUMNS = 12;

interface ChordChartEditorProps {
  value: RepertoireChordChart;
  onChange: (value: RepertoireChordChart) => void;
}

interface PositionSelection {
  lineId: string;
  position: number;
}

/**
 * Hueco superior de cada fila: apenas nada si continúa la misma frase, un poco
 * más si empieza una frase nueva.
 */
function rowMarginTop(row: WrappedRow, index: number): string {
  if (index === 0) return "0";
  if (row.isContinuation) return "0.125rem";
  return "0.5rem";
}

export function ChordChartEditor({ value, onChange }: ChordChartEditorProps) {
  const text = useI18nSection("repertoire");
  const [selection, setSelection] = useState<PositionSelection | null>(null);
  const [isEditing, setIsEditing] = useState(value.lines.length === 0);
  const [columns, setColumns] = useState(40);
  const savedChords = usePracticeStore((state) => state.customChords);
  const saveCustomChord = usePracticeStore((state) => state.saveCustomChord);
  const deleteCustomChord = usePracticeStore(
    (state) => state.deleteCustomChord,
  );

  const measureRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLSpanElement>(null);

  const lyrics = chartToLyrics(value);
  const selectedLine =
    selection ?
      value.lines.find((line) => line.id === selection.lineId)
    : undefined;
  const selectedChord =
    selectedLine && selection ?
      getChordAtPosition(selectedLine, selection.position)
    : undefined;

  const chordPositions = new Map<string, Set<number>>();
  for (const line of value.lines) {
    chordPositions.set(
      line.id,
      new Set(line.chords.map((chord) => chord.position)),
    );
  }

  useEffect(() => {
    if (isEditing) return;
    const container = measureRef.current;
    const column = columnRef.current;
    if (!container || !column) return;

    const update = () => {
      const columnWidth = column.offsetWidth || 1;
      const next = Math.max(
        MIN_COLUMNS,
        Math.floor(container.clientWidth / columnWidth) - 1,
      );
      setColumns((current) => (current === next ? current : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(column);
    return () => observer.disconnect();
  }, [isEditing]);

  function handleLyricsChange(next: string) {
    setSelection(null);
    onChange(lyricsToChart(next, createId, value));
  }

  const rows = layoutChordChart(value, columns);

  return (
    <CollapsibleSection
      title={text.chordChartTitle}
      description={text.chordChartDescription}
    >
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          size="field"
          onClick={() => {
            setSelection(null);
            setIsEditing((current) => !current);
          }}
        >
          {isEditing ? text.viewChords : text.editLyrics}
        </Button>
      </div>

      {isEditing ? (
        <TextArea
          className="mt-4 min-h-72 font-mono"
          value={lyrics}
          autoFocus
          spellCheck={false}
          aria-label={text.editLyrics}
          placeholder={text.lyricsPlaceholder}
          onChange={(event) => handleLyricsChange(event.target.value)}
        />
      ) : value.lines.length === 0 ? (
        <p className="mt-5 text-sm text-muted">{text.noLyrics}</p>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-xl border border-line bg-canvas/40 p-4 sm:p-5">
            <div ref={measureRef} className="relative">
              <span
                ref={columnRef}
                aria-hidden="true"
                className="pointer-events-none invisible absolute left-0 top-0 font-mono text-sm"
                style={{ width: COLUMN_WIDTH }}
              >
                0
              </span>

              <div className="flex flex-col">
                {rows.map((row, index) =>
                  row.isBlank ? (
                    <div
                      key={row.key}
                      role="separator"
                      aria-label={text.stanzaBreak}
                      className="h-4"
                    />
                  ) : (
                    <div
                      key={row.key}
                      className="grid w-max font-mono text-sm leading-6"
                      style={{
                        marginTop: rowMarginTop(row, index),
                        gridTemplateColumns: `repeat(${Math.max(
                          columns,
                          row.text.length + 1,
                        )}, ${COLUMN_WIDTH})`,
                        gridTemplateRows: `${CHORD_ROW_HEIGHT} auto`,
                      }}
                    >
                      {row.chords.map((chord) => {
                        const isSelected =
                          selection?.lineId === row.lineId &&
                          selection.position === chord.position;
                        return (
                          <button
                            key={chord.id}
                            type="button"
                            title={text.chordPickerTitle}
                            style={{
                              gridColumn: `${chord.column + 1} / span ${Math.max(
                                chord.name.length,
                                1,
                              )}`,
                              gridRow: 1,
                            }}
                            onClick={() =>
                              setSelection({
                                lineId: row.lineId,
                                position: chord.position,
                              })
                            }
                            className={`self-end truncate p-0 text-left text-[11px] font-semibold text-accent-green-fg transition ${
                              isSelected ?
                                "rounded bg-accent-green-bg/40"
                              : "hover:text-accent-green-fg/80"
                            }`}
                          >
                            {chord.name}
                          </button>
                        );
                      })}

                      {Array.from(
                        { length: row.text.length + 1 },
                        (_, index) => {
                          const position = row.start + index;
                          const hasChord =
                            chordPositions.get(row.lineId)?.has(position) ??
                            false;
                          const isSelected =
                            selection?.lineId === row.lineId &&
                            selection.position === position &&
                            !hasChord;
                          return (
                            <button
                              key={`${row.key}-${index}`}
                              type="button"
                              style={{ gridColumn: index + 1, gridRow: 2 }}
                              aria-label={`${text.positionLabel} ${position + 1}`}
                              onClick={() =>
                                setSelection({ lineId: row.lineId, position })
                              }
                              className={`whitespace-pre p-0 text-center text-ink transition ${
                                isSelected ?
                                  "rounded bg-accent-green-bg/40"
                                : "hover:bg-white/10"
                              }`}
                            >
                              {row.text[index] ?? " "}
                            </button>
                          );
                        },
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-4 lg:self-start">
            {selection && selectedLine ? (
              <ChordPicker
                key={`${selection.lineId}-${selection.position}`}
                initialName={selectedChord?.name}
                initialShape={selectedChord?.shape}
                saved={savedChords}
                onSave={({ id, name, shape }) =>
                  saveCustomChord({ id: id ?? createId(), name, shape })
                }
                onDeleteSaved={(chordId) => deleteCustomChord(chordId)}
                onSubmit={({ name, shape }) =>
                  onChange(
                    setChordOnLine(value, selectedLine.id, {
                      id: selectedChord?.id ?? createId(),
                      name,
                      position: selection.position,
                      shape,
                    }),
                  )
                }
                onClear={
                  selectedChord ?
                    () =>
                      onChange(
                        removeChordFromLine(
                          value,
                          selectedLine.id,
                          selection.position,
                        ),
                      )
                  : undefined
                }
              />
            ) : (
              <div className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">
                {text.pickWordHint}
              </div>
            )}
          </aside>
        </div>
      )}
    </CollapsibleSection>
  );
}

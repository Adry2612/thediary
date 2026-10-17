"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import {
  clearTabNote,
  findTabNote,
  getTabColumns,
  MAX_FRET,
  setTabMeasures,
  setTabNote,
  setTabSubdivision,
} from "@/lib/repertoire-tab";
import { parseTuningNotes, STRING_COUNT } from "@/lib/chords";
import type { RepertoireTab } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

const MIN_MEASURES = 1;
const MAX_MEASURES = 16;
const CELL_WIDTH = 26;

interface TabEditorProps {
  value: RepertoireTab;
  onChange: (value: RepertoireTab) => void;
}

interface Cursor {
  string: number;
  column: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function TabEditor({ value, onChange }: TabEditorProps) {
  const text = useI18nSection("repertoire");
  const [cursor, setCursor] = useState<Cursor>({ string: 0, column: 0 });
  const [buffer, setBuffer] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const columns = getTabColumns(value);
  const tuningNotes = useMemo(
    () => parseTuningNotes(value.tuning),
    [value.tuning],
  );
  // De la cuerda más aguda (arriba) a la más grave (abajo), como en una tab real.
  const stringOrder = useMemo(
    () => Array.from({ length: STRING_COUNT }, (_, index) => STRING_COUNT - 1 - index),
    [],
  );
  const fretByCell = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of value.notes) {
      map.set(`${note.string}:${note.column}`, note.fret);
    }
    return map;
  }, [value.notes]);

  const currentFret = fretByCell.get(`${cursor.string}:${cursor.column}`);
  const fretFieldValue =
    buffer !== "" ? buffer : currentFret !== undefined ? String(currentFret) : "";

  function commitBuffer() {
    if (buffer === "") return;
    const fret = Number(buffer);
    setBuffer("");
    if (Number.isFinite(fret) && fret >= 0 && fret <= MAX_FRET) {
      onChange(setTabNote(value, cursor.string, cursor.column, fret));
    }
  }

  function selectCell(string: number, column: number) {
    if (string === cursor.string && column === cursor.column) return;
    commitBuffer();
    setCursor((current) => ({
      string: clamp(string, 0, STRING_COUNT - 1),
      column: clamp(column, 0, Math.max(0, columns - 1)),
    }));
    gridRef.current?.focus();
  }

  function handleGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const { key } = event;
    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      setBuffer((current) => (current + key).slice(-2));
      return;
    }
    if (key === "Backspace" || key === "Delete") {
      event.preventDefault();
      setBuffer("");
      onChange(clearTabNote(value, cursor.string, cursor.column));
      return;
    }
    if (key === "Enter") {
      event.preventDefault();
      commitBuffer();
      return;
    }
    if (key.startsWith("Arrow")) {
      event.preventDefault();
      commitBuffer();
      const rowStep = key === "ArrowUp" ? 1 : key === "ArrowDown" ? -1 : 0;
      const columnStep = key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0;
      setCursor({
        string: clamp(cursor.string + rowStep, 0, STRING_COUNT - 1),
        column: clamp(cursor.column + columnStep, 0, columns - 1),
      });
    }
  }

  function applyFretInput(raw: string) {
    const clean = raw.replace(/[^0-9]/g, "").slice(0, 2);
    setBuffer(clean);
    if (clean === "") {
      onChange(clearTabNote(value, cursor.string, cursor.column));
      return;
    }
    const fret = Number(clean);
    if (fret >= 0 && fret <= MAX_FRET) {
      onChange(setTabNote(value, cursor.string, cursor.column, fret));
    }
  }

  return (
    <section className="mt-5 rounded-xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="font-sans text-lg font-semibold tracking-tight text-ink sm:text-xl">
        {text.tabTitle}
      </h2>
      <p className="mt-2 text-sm text-muted">{text.tabDescription}</p>

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
            disabled={value.measures >= MAX_MEASURES}
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
            onChange(clearTabNote(value, cursor.string, cursor.column))
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

      <div
        ref={gridRef}
        tabIndex={0}
        role="grid"
        aria-label={text.tabTitle}
        onKeyDown={handleGridKeyDown}
        onBlur={commitBuffer}
        className="mt-3 overflow-x-auto rounded-lg border border-line bg-canvas/40 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
      >
        <div className="inline-block">
          <div className="flex items-center">
            <span className="shrink-0 pr-2 text-right font-mono text-[10px] text-transparent" style={{ width: 34 }}>
              0
            </span>
            {Array.from({ length: columns }, (_, column) => {
              const measureStart = column % value.subdivision === 0;
              return (
                <span
                  key={column}
                  style={{ width: CELL_WIDTH }}
                  className={`shrink-0 text-center font-mono text-[10px] text-muted ${
                    measureStart && column > 0 ? "border-l border-line" : ""
                  }`}
                >
                  {measureStart ? column / value.subdivision + 1 : ""}
                </span>
              );
            })}
          </div>

          {stringOrder.map((stringIndex) => (
            <div key={stringIndex} className="flex items-center">
              <span
                style={{ width: 34 }}
                className="shrink-0 pr-2 text-right font-mono text-xs text-muted"
              >
                {tuningNotes[stringIndex]}
              </span>
              {Array.from({ length: columns }, (_, column) => {
                const isCursor =
                  cursor.string === stringIndex && cursor.column === column;
                const fret = fretByCell.get(`${stringIndex}:${column}`);
                const display =
                  isCursor && buffer !== "" ?
                    buffer
                  : fret !== undefined ?
                    String(fret)
                  : "";
                const measureStart = column % value.subdivision === 0;
                return (
                  <button
                    key={column}
                    type="button"
                    tabIndex={-1}
                    onClick={() => selectCell(stringIndex, column)}
                    style={{ width: CELL_WIDTH }}
                    aria-label={`${text.tabFret} ${column + 1}, ${tuningNotes[stringIndex]}`}
                    className={`h-8 shrink-0 border-b border-line/60 font-mono text-xs tabular-nums text-ink transition ${
                      measureStart && column > 0 ? "border-l border-line" : ""
                    } ${
                      isCursor ?
                        "bg-accent-green-bg/40 ring-1 ring-inset ring-accent-green-fg"
                      : "hover:bg-white/5"
                    }`}
                  >
                    {display}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

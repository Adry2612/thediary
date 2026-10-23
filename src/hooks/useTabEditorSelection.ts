"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  MAX_FRET,
  TAB_TECHNIQUES,
  clampTabCell,
  clearTabNote,
  getTabSelectionBounds,
  isTabCellSelected,
  setTabNote,
  tabCellsBetween,
  toggleTabTechniques,
  type TabCell,
} from "@/utils/repertoire-tab";
import type { RepertoireTab } from "@/types/practice";

interface UseTabEditorSelectionOptions {
  value: RepertoireTab;
  columns: number;
  onChange: (value: RepertoireTab) => void;
}

/**
 * Estado de selección del editor de tablatura: celda activa, ancla del
 * rectángulo, arrastre, buffer de traste y los manejadores de puntero y
 * teclado. La geometría que comparte con la rejilla vive en
 * `lib/repertoire-tab`.
 */
export function useTabEditorSelection({
  value,
  columns,
  onChange,
}: UseTabEditorSelectionOptions) {
  const [anchor, setAnchor] = useState<TabCell>({ string: 0, column: 0 });
  const [focus, setFocus] = useState<TabCell>({ string: 0, column: 0 });
  const [dragging, setDragging] = useState(false);
  const [buffer, setBuffer] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const selectedCells = tabCellsBetween(anchor, focus);
  const selectionBounds = getTabSelectionBounds(anchor, focus);

  function isCellSelected(string: number, column: number): boolean {
    return isTabCellSelected(selectionBounds, string, column);
  }

  function clampCell(cell: TabCell): TabCell {
    return clampTabCell(cell, columns);
  }

  // Al soltar el puntero se termina el arrastre, aunque se suelte fuera de la rejilla.
  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(false);
    window.addEventListener("pointerup", stop);
    return () => window.removeEventListener("pointerup", stop);
  }, [dragging]);

  function commitBuffer() {
    if (buffer === "") return;
    const fret = Number(buffer);
    setBuffer("");
    if (Number.isFinite(fret) && fret >= 0 && fret <= MAX_FRET) {
      onChange(setTabNote(value, focus.string, focus.column, fret));
    }
  }

  function startSelection(string: number, column: number, extend: boolean) {
    commitBuffer();
    const cell = clampCell({ string, column });
    if (extend) {
      setFocus(cell);
    } else {
      setAnchor(cell);
      setFocus(cell);
    }
    setDragging(true);
    gridRef.current?.focus();
  }

  function extendSelection(string: number, column: number) {
    if (!dragging) return;
    setFocus(clampCell({ string, column }));
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
      onChange(clearTabNote(value, focus.string, focus.column));
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
      const nextCell = clampCell({
        string: focus.string + rowStep,
        column: focus.column + columnStep,
      });
      if (event.shiftKey) {
        setFocus(nextCell);
      } else {
        setAnchor(nextCell);
        setFocus(nextCell);
      }
      return;
    }
    const technique = TAB_TECHNIQUES.find(
      (entry) => entry.shortcut === key.toLowerCase(),
    );
    if (technique) {
      event.preventDefault();
      commitBuffer();
      onChange(toggleTabTechniques(value, selectedCells, technique.id));
    }
  }

  function applyFretInput(raw: string) {
    const clean = raw.replace(/[^0-9]/g, "").slice(0, 2);
    setBuffer(clean);
    if (clean === "") {
      onChange(clearTabNote(value, focus.string, focus.column));
      return;
    }
    const fret = Number(clean);
    if (fret >= 0 && fret <= MAX_FRET) {
      onChange(setTabNote(value, focus.string, focus.column, fret));
    }
  }

  return {
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
  };
}

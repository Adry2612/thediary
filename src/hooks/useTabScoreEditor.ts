"use client";

import { useEffect, useReducer, useRef } from "react";
import type { TabScore } from "@/types/tab-score";
import { getClipboard, setClipboard } from "@/utils/tab-score/clipboard";
import {
  canRedo,
  canUndo,
} from "@/utils/tab-score/history";
import {
  createEditorState,
  getSelectedBeats,
  tabScoreEditorReducer,
} from "@/utils/tab-score/editor-state";
import { getSelectedNotes } from "@/utils/tab-score/selection";

/**
 * Estado del editor de partituras: partitura, selección, historial y búfer del
 * traste. Toda la lógica vive en el reductor puro `tabScoreEditorReducer`.
 */
export function useTabScoreEditor({
  initialScore,
  onChange,
}: {
  initialScore: TabScore;
  onChange?: (score: TabScore) => void;
}) {
  const [state, dispatch] = useReducer(
    tabScoreEditorReducer,
    initialScore,
    (score) => createEditorState(score, getClipboard()),
  );
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastScoreRef = useRef(initialScore);

  useEffect(() => {
    if (lastScoreRef.current === state.score) return;
    lastScoreRef.current = state.score;
    onChangeRef.current?.(state.score);
  }, [state.score]);

  useEffect(() => {
    if (state.clipboard) setClipboard(state.clipboard);
  }, [state.clipboard]);

  return {
    score: state.score,
    selection: state.selection,
    buffer: state.buffer,
    lastNote: state.lastNote,
    previewSeq: state.previewSeq ?? 0,
    selectionVisible: state.selectionVisible,
    error: state.error,
    selectedBeats: getSelectedBeats(state),
    selectedNotes: getSelectedNotes(state.score, state.selection),
    canUndo: canUndo(state.history),
    canRedo: canRedo(state.history),
    dispatch,
  };
}

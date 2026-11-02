import type { TabScore } from "../../types/tab-score.ts";
import type { TabSelection } from "./selection.ts";

export type TabHistoryEntry = {
  score: TabScore;
  selection: TabSelection;
};

export type TabHistory = {
  past: TabHistoryEntry[];
  present: TabHistoryEntry;
  future: TabHistoryEntry[];
  coalesceKey?: string;
};

export const TAB_HISTORY_LIMIT = 200;

export function createHistory(
  score: TabScore,
  selection: TabSelection,
): TabHistory {
  return {
    past: [],
    present: { score, selection },
    future: [],
  };
}

export function canUndo(history: TabHistory): boolean {
  return history.past.length > 0;
}

export function canRedo(history: TabHistory): boolean {
  return history.future.length > 0;
}

/**
 * Registra un estado nuevo. Con la misma `coalesceKey` que la última edición se
 * sustituye el estado actual en lugar de crear otro paso (los dos dígitos de un
 * traste cuentan como una sola edición).
 */
export function pushHistory(
  history: TabHistory,
  score: TabScore,
  selection: TabSelection,
  coalesceKey?: string,
): TabHistory {
  const present: TabHistoryEntry = { score, selection };

  if (
    coalesceKey !== undefined &&
    history.coalesceKey === coalesceKey &&
    history.future.length === 0
  ) {
    return { ...history, present, coalesceKey };
  }

  return {
    past: [...history.past, history.present].slice(-TAB_HISTORY_LIMIT),
    present,
    future: [],
    coalesceKey,
  };
}

export function undoHistory(history: TabHistory): TabHistory {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoHistory(history: TabHistory): TabHistory {
  if (history.future.length === 0) return history;
  const [next, ...rest] = history.future;

  return {
    past: [...history.past, history.present].slice(-TAB_HISTORY_LIMIT),
    present: next,
    future: rest,
  };
}

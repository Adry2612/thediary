import type { TabScore } from "../../types/tab-score.ts";
import {
  copyBars,
  copyBeats,
  cutBars,
  cutBeats,
  pasteBars,
  pasteBeats,
  type TabClipboard,
} from "./clipboard.ts";
import {
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
  type TabHistory,
} from "./history.ts";
import {
  addBar,
  applyTechnique,
  deleteBar,
  deleteBeat,
  deleteNote,
  duplicateBar,
  insertBarAfter,
  setDots,
  setDuration,
  setRest,
  setTempo,
  setTimeSignature,
  setTuplet,
  toggleTie,
  writeFret,
  type TabOperationError,
  type TabOperationResult,
  type TabTechniquePatch,
} from "./operations.ts";
import {
  clampSelection,
  getRangeBeats,
  moveSelection,
  type TabMoveDirection,
  type TabPosition,
  type TabSelection,
} from "./selection.ts";

export type TabScoreEditorState = {
  score: TabScore;
  selection: TabSelection;
  history: TabHistory;
  /** Dígitos tecleados del traste en curso. */
  buffer: string;
  clipboard: TabClipboard | null;
  /** La selección se oculta con Escape sin perder la posición interna. */
  selectionVisible: boolean;
  /** Último error de una operación, para avisar en la interfaz. */
  error?: TabOperationError;
};

export type TabScoreEditorAction =
  | { type: "select"; position: TabPosition; extend?: boolean }
  | { type: "move"; direction: TabMoveDirection; extend?: boolean }
  | { type: "digit"; digit: string }
  | { type: "commitBuffer" }
  | { type: "deleteNote" }
  | { type: "deleteBeat" }
  | { type: "setRest" }
  | { type: "setDuration"; duration: number }
  | { type: "setDots"; dots: 0 | 1 }
  | { type: "setTuplet"; tuplet: 0 | 3 }
  | { type: "technique"; patch: TabTechniquePatch }
  | { type: "toggleTie" }
  | { type: "insertBar" }
  | { type: "appendBar" }
  | { type: "duplicateBar" }
  | { type: "deleteBar" }
  | { type: "setTimeSignature"; numerator: number; denominator: 2 | 4 | 8 | 16 }
  | { type: "setTempo"; tempo: number }
  | { type: "copyBeats" }
  | { type: "copyBars" }
  | { type: "cutBeats" }
  | { type: "cutBars" }
  | { type: "paste" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "selectBar"; bar: number }
  | { type: "clearSelection" }
  | { type: "replaceScore"; score: TabScore };

export function createEditorState(
  score: TabScore,
  clipboard: TabClipboard | null = null,
): TabScoreEditorState {
  const selection: TabSelection = { bar: 0, beat: 0, string: 0 };
  return {
    score,
    selection,
    history: createHistory(score, selection),
    buffer: "",
    clipboard,
    selectionVisible: true,
  };
}

function withResult(
  state: TabScoreEditorState,
  result: TabOperationResult,
  coalesceKey?: string,
): TabScoreEditorState {
  if ("error" in result) return { ...state, error: result.error, buffer: "" };

  return {
    ...state,
    score: result.score,
    selection: result.selection,
    history: pushHistory(
      state.history,
      result.score,
      result.selection,
      coalesceKey,
    ),
    buffer: "",
    error: undefined,
  };
}

function clearError(state: TabScoreEditorState): TabScoreEditorState {
  return state.error === undefined ? state : { ...state, error: undefined };
}

/** Aplica un dígito: escribe el traste y deja el búfer para la segunda cifra. */
function applyDigit(state: TabScoreEditorState, digit: string): TabScoreEditorState {
  if (!/^[0-9]$/.test(digit)) return state;

  const candidate = `${state.buffer}${digit}`;
  // Un 25 o mayor no puede ser un traste: se conserva el último válido.
  if (Number(candidate) > 24) return state;
  const fret = Number(candidate);

  const result = writeFret(state.score, state.selection, fret);
  const key = `fret:${state.selection.bar}:${state.selection.beat}:${state.selection.string}`;
  const next = withResult(state, result, key);
  if ("error" in result) return next;
  return { ...next, buffer: candidate, selectionVisible: true };
}

export function tabScoreEditorReducer(
  state: TabScoreEditorState,
  action: TabScoreEditorAction,
): TabScoreEditorState {
  const selection = state.selection;

  switch (action.type) {
    case "select": {
      const position = { ...action.position };
      const next: TabSelection = action.extend
        ? {
            ...position,
            anchor: selection.anchor ?? {
              bar: selection.bar,
              beat: selection.beat,
              string: selection.string,
            },
          }
        : position;
      return {
        ...state,
        selection: clampSelection(state.score, next),
        buffer: "",
        selectionVisible: true,
        error: undefined,
      };
    }

    case "move":
      return {
        ...state,
        selection: moveSelection(
          state.score,
          selection,
          action.direction,
          action.extend === true,
        ),
        buffer: "",
        selectionVisible: true,
        error: undefined,
      };

    case "selectBar": {
      const bar = Math.min(
        Math.max(0, action.bar),
        Math.max(0, state.score.bars.length - 1),
      );
      return {
        ...state,
        selection: clampSelection(state.score, {
          bar,
          beat: 0,
          string: selection.string,
        }),
        buffer: "",
        selectionVisible: true,
        error: undefined,
      };
    }

    case "digit":
      return applyDigit(state, action.digit);

    case "commitBuffer":
      return state.buffer === "" ? clearError(state) : { ...state, buffer: "" };

    case "deleteNote":
      return withResult(state, deleteNote(state.score, selection));

    case "deleteBeat":
      return withResult(state, deleteBeat(state.score, selection));

    case "setRest":
      return withResult(state, setRest(state.score, selection));

    case "setDuration":
      return withResult(state, setDuration(state.score, selection, action.duration));

    case "setDots":
      return withResult(state, setDots(state.score, selection, action.dots));

    case "setTuplet":
      return withResult(state, setTuplet(state.score, selection, action.tuplet));

    case "technique":
      return withResult(state, applyTechnique(state.score, selection, action.patch));

    case "toggleTie":
      return withResult(state, toggleTie(state.score, selection));

    case "insertBar":
      return withResult(state, insertBarAfter(state.score, selection));

    case "appendBar":
      return withResult(state, addBar(state.score, selection));

    case "duplicateBar":
      return withResult(state, duplicateBar(state.score, selection));

    case "deleteBar":
      return withResult(state, deleteBar(state.score, selection));

    case "setTimeSignature":
      return withResult(
        state,
        setTimeSignature(state.score, selection, {
          numerator: action.numerator,
          denominator: action.denominator,
        }),
      );

    case "setTempo":
      return withResult(state, setTempo(state.score, selection, action.tempo));

    case "copyBeats": {
      const clipboard = copyBeats(state.score, selection);
      return clipboard ? { ...state, clipboard, error: undefined } : state;
    }

    case "copyBars": {
      const clipboard = copyBars(state.score, selection);
      return clipboard ? { ...state, clipboard, error: undefined } : state;
    }

    case "cutBeats":
      return withResult(state, cutBeats(state.score, selection));

    case "cutBars":
      return withResult(state, cutBars(state.score, selection));

    case "paste": {
      if (!state.clipboard) return { ...state, error: "noSelection" };
      const result =
        state.clipboard.kind === "beats"
          ? pasteBeats(state.score, selection, state.clipboard)
          : pasteBars(state.score, selection, state.clipboard);
      return withResult(state, result);
    }

    case "undo": {
      const history = undoHistory(state.history);
      return {
        ...state,
        score: history.present.score,
        selection: history.present.selection,
        history,
        buffer: "",
        error: undefined,
      };
    }

    case "redo": {
      const history = redoHistory(state.history);
      return {
        ...state,
        score: history.present.score,
        selection: history.present.selection,
        history,
        buffer: "",
        error: undefined,
      };
    }

    case "clearSelection":
      return state.selectionVisible
        ? { ...state, selectionVisible: false, buffer: "", error: undefined }
        : state;

    case "replaceScore": {
      const nextSelection = clampSelection(action.score, selection);
      return {
        ...state,
        score: action.score,
        selection: nextSelection,
        history: createHistory(action.score, nextSelection),
        buffer: "",
        selectionVisible: true,
        error: undefined,
      };
    }

    default:
      return state;
  }
}

/** Pulsos cubiertos por la selección actual, para resaltarlos. */
export function getSelectedBeats(
  state: Pick<TabScoreEditorState, "score" | "selection">,
): { bar: number; beat: number }[] {
  return getRangeBeats(state.score, state.selection);
}

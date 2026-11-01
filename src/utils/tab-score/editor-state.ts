import type { TabScore, TabTuplet } from "../../types/tab-score.ts";
import { TAB_TICKS_PER_QUARTER } from "../../types/tab-score.ts";
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
  advanceAfterWrite,
  applyTechnique,
  deleteBar,
  deleteBeat,
  deleteNote,
  divideBeat,
  duplicateBar,
  fitRestBeat,
  insertBarAfter,
  moveBeat,
  setBendFlag,
  setDots,
  setDuration,
  setRest,
  setTempo,
  setTimeSignature,
  setTuplet,
  splitBeat,
  splitBeatAt,
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
  /**
   * Punto horizontal del clic cuando cae en un hueco: la primera cifra parte
   * el pulso en esa posición. Se pierde con cualquier otra acción.
   */
  pending?: {
    bar: number;
    beat: number;
    string: number;
    fraction: number;
  };
  /**
   * Posición de la última nota escrita. La vista previa suena esa nota aunque
   * el cursor ya haya avanzado al hueco siguiente.
   */
  lastNote?: {
    bar: number;
    beat: number;
    string: number;
  };
  /** Sube con cada nota escrita para que la vista previa suene una vez. */
  previewSeq?: number;
};

export type TabScoreEditorAction =
  | { type: "select"; position: TabPosition; extend?: boolean }
  | { type: "selectAt"; position: TabPosition; fraction: number }
  | { type: "move"; direction: TabMoveDirection; extend?: boolean }
  | { type: "moveBeat"; direction: "left" | "right" }
  | { type: "digit"; digit: string }
  | { type: "advance" }
  | { type: "commitBuffer" }
  | { type: "deleteNote" }
  | { type: "deleteBeat" }
  | { type: "setRest" }
  | { type: "splitBeat" }
  | { type: "divideBeat"; tuplet: TabTuplet }
  | { type: "setDuration"; duration: number }
  | { type: "setDots"; dots: 0 | 1 }
  | { type: "setTuplet"; tuplet: 0 | 3 }
  | { type: "setBendFlag"; flag: "release" | "prebend"; value: boolean }
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
    pending: undefined,
  };
}

function clearError(state: TabScoreEditorState): TabScoreEditorState {
  return state.error === undefined ? state : { ...state, error: undefined };
}

/**
 * Cierra la nota escrita: prepara el hueco siguiente, guarda un solo paso de
 * historial y deja el cursor en ese hueco o en la propia nota si aún se espera
 * la segunda cifra.
 */
function finishNote(
  state: TabScoreEditorState,
  score: TabScore,
  selection: TabSelection,
  advance: boolean,
  buffer: string,
): TabScoreEditorState {
  const next = advanceAfterWrite(score, selection);
  const finalScore = "error" in next ? score : next.score;
  const finalSelection =
    advance && !("error" in next) ? next.selection : selection;
  const key = `fret:${selection.bar}:${selection.beat}:${selection.string}`;

  return {
    ...state,
    score: finalScore,
    selection: finalSelection,
    history: pushHistory(state.history, finalScore, finalSelection, key),
    buffer,
    lastNote: {
      bar: selection.bar,
      beat: selection.beat,
      string: selection.string,
    },
    previewSeq: (state.previewSeq ?? 0) + 1,
    selectionVisible: true,
    error: undefined,
    pending: undefined,
  };
}

/** Escribe el traste en la posición elegida y prepara el hueco siguiente. */
function writeDigit(
  state: TabScoreEditorState,
  digit: string,
): TabScoreEditorState {
  const fret = Number(digit);
  let score = state.score;
  let selection = state.selection;
  const pending = state.pending;

  if (
    pending &&
    pending.bar === selection.bar &&
    pending.beat === selection.beat &&
    pending.string === selection.string
  ) {
    const placed = splitBeatAt(score, selection, pending.fraction);
    if (!("error" in placed)) {
      score = placed.score;
      selection = placed.selection;
    }
  }

  // En un compás vacío la primera nota es una negra: así no se come el compás
  // y siempre queda un hueco detrás para seguir escribiendo.
  score = fitRestBeat(score, selection.bar, selection.beat, TAB_TICKS_PER_QUARTER);

  const result = writeFret(score, selection, fret);
  if ("error" in result) {
    return { ...state, error: result.error, buffer: "", pending: undefined };
  }

  // Con 1 o 2 se espera por si el traste es 10–24; el resto avanza al momento.
  const wait = digit === "1" || digit === "2";
  return finishNote(state, result.score, result.selection, !wait, wait ? digit : "");
}

/** Aplica un dígito: escribe el traste y avanza al hueco siguiente. */
function applyDigit(state: TabScoreEditorState, digit: string): TabScoreEditorState {
  if (!/^[0-9]$/.test(digit)) return state;

  // Segunda cifra de un traste 10–24: completa la nota ya escrita.
  if (state.buffer === "1" || state.buffer === "2") {
    const candidate = Number(`${state.buffer}${digit}`);

    if (candidate <= 24) {
      const result = writeFret(state.score, state.selection, candidate);
      if ("error" in result) {
        return { ...state, error: result.error, buffer: "", pending: undefined };
      }
      return finishNote(state, result.score, result.selection, true, "");
    }

    // 25 o más no es un traste: la primera cifra se queda como nota y el
    // dígito nuevo empieza la siguiente.
    const advanced = advanceAfterWrite(state.score, state.selection);
    if ("error" in advanced) {
      return { ...state, buffer: "", error: advanced.error, pending: undefined };
    }

    return writeDigit(
      {
        ...state,
        score: advanced.score,
        selection: advanced.selection,
        buffer: "",
      },
      digit,
    );
  }

  return writeDigit(state, digit);
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
        pending: undefined,
      };
    }

    case "selectAt": {
      const position = clampSelection(state.score, action.position);
      return {
        ...state,
        selection: position,
        pending: {
          bar: position.bar,
          beat: position.beat,
          string: position.string,
          fraction: Math.min(0.999, Math.max(0, action.fraction)),
        },
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
        pending: undefined,
      };

    case "moveBeat":
      return withResult(state, moveBeat(state.score, selection, action.direction));

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
        pending: undefined,
      };
    }

    case "digit":
      return applyDigit(state, action.digit);

    case "advance": {
      // Termina la espera de la segunda cifra: solo mueve el cursor, porque el
      // hueco siguiente ya se preparó al escribir la nota.
      if (state.buffer === "") return clearError(state);

      const next = advanceAfterWrite(state.score, state.selection);
      const score = "error" in next ? state.score : next.score;
      const nextSelection = "error" in next ? state.selection : next.selection;

      return {
        ...state,
        score,
        selection: nextSelection,
        history: { ...state.history, present: { score, selection: nextSelection } },
        buffer: "",
        pending: undefined,
        error: undefined,
      };
    }

    case "commitBuffer":
      return state.buffer === "" ? clearError(state) : { ...state, buffer: "" };

    case "deleteNote":
      return withResult(state, deleteNote(state.score, selection));

    case "deleteBeat":
      return withResult(state, deleteBeat(state.score, selection));

    case "setRest":
      return withResult(state, setRest(state.score, selection));

    case "splitBeat":
      return withResult(state, splitBeat(state.score, selection));

    case "divideBeat":
      return withResult(
        state,
        divideBeat(state.score, selection, action.tuplet),
      );

    case "setDuration":
      return withResult(state, setDuration(state.score, selection, action.duration));

    case "setDots":
      return withResult(state, setDots(state.score, selection, action.dots));

    case "setTuplet":
      return withResult(state, setTuplet(state.score, selection, action.tuplet));

    case "setBendFlag":
      return withResult(
        state,
        setBendFlag(state.score, selection, action.flag, action.value),
      );

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
        pending: undefined,
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
        pending: undefined,
      };
    }

    case "clearSelection":
      return state.selectionVisible
        ? {
            ...state,
            selectionVisible: false,
            buffer: "",
            error: undefined,
            pending: undefined,
          }
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
        pending: undefined,
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

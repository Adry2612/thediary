import type { TabBeat, TabNote, TabScore } from "../../types/tab-score.ts";
import {
  TAB_MAX_BARS,
  TAB_MAX_BEATS_PER_BAR,
} from "../../types/tab-score.ts";
import type { TabScoreEditorAction } from "./editor-state.ts";
import {
  getBeatAt,
  getNoteAt,
  type TabSelection,
} from "./selection.ts";

export const TAB_PALETTE_GROUPS = [
  "duration",
  "rhythm",
  "tie",
  "technique",
  "bend",
  "bar",
] as const;

export type TabPaletteGroup =
  | "duration"
  | "rhythm"
  | "tie"
  | "technique"
  | "bend"
  | "bar";

export type TabPaletteOption = {
  id: string;
  group: TabPaletteGroup;
  /** Clave de `tabPalette` en el diccionario. */
  labelKey: string;
  /** Atajo de una tecla, único en todo el catálogo. */
  shortcut?: string;
  action:
    | TabScoreEditorAction
    | { type: "bendRelease" }
    | { type: "bendPrebend" }
    | { type: "openTimeSignature" }
    | { type: "openTempo" };
};

export type TabPaletteReason =
  | "requiresNote"
  | "requiresPreviousNote"
  | "barLimit"
  | "cannotSplit"
  | "beatLimit";

export type TabPaletteOptionState = {
  active: boolean;
  disabled: boolean;
  reason?: TabPaletteReason;
};

export type TabPaletteState = Record<string, TabPaletteOptionState>;

export const TAB_PALETTE: readonly TabPaletteOption[] = [
  {
    id: "duration-1",
    group: "duration",
    labelKey: "durationWhole",
    shortcut: "1",
    action: { type: "setDuration", duration: 1 },
  },
  {
    id: "duration-2",
    group: "duration",
    labelKey: "durationHalf",
    shortcut: "2",
    action: { type: "setDuration", duration: 2 },
  },
  {
    id: "duration-4",
    group: "duration",
    labelKey: "durationQuarter",
    shortcut: "4",
    action: { type: "setDuration", duration: 4 },
  },
  {
    id: "duration-8",
    group: "duration",
    labelKey: "durationEighth",
    shortcut: "8",
    action: { type: "setDuration", duration: 8 },
  },
  {
    id: "duration-16",
    group: "duration",
    labelKey: "durationSixteenth",
    shortcut: "6",
    action: { type: "setDuration", duration: 16 },
  },
  {
    id: "duration-32",
    group: "duration",
    labelKey: "durationThirtySecond",
    shortcut: "3",
    action: { type: "setDuration", duration: 32 },
  },
  {
    id: "duration-64",
    group: "duration",
    labelKey: "durationSixtyFourth",
    shortcut: "7",
    action: { type: "setDuration", duration: 64 },
  },
  {
    id: "dots",
    group: "rhythm",
    labelKey: "dot",
    shortcut: ".",
    action: { type: "setDots", dots: 1 },
  },
  {
    id: "tuplet",
    group: "rhythm",
    labelKey: "triplet",
    shortcut: "u",
    action: { type: "setTuplet", tuplet: 3 },
  },
  {
    id: "rest",
    group: "rhythm",
    labelKey: "rest",
    shortcut: "r",
    action: { type: "setRest" },
  },
  {
    id: "split-beat",
    group: "rhythm",
    labelKey: "splitBeat",
    action: { type: "splitBeat" },
  },
  {
    id: "tie",
    group: "tie",
    labelKey: "tie",
    shortcut: "t",
    action: { type: "toggleTie" },
  },
  {
    id: "legato-hammer",
    group: "technique",
    labelKey: "legatoHammer",
    shortcut: "h",
    action: { type: "technique", patch: { legato: "hammer" } },
  },
  {
    id: "legato-pull",
    group: "technique",
    labelKey: "legatoPull",
    shortcut: "j",
    action: { type: "technique", patch: { legato: "pull" } },
  },
  {
    id: "slide-up",
    group: "technique",
    labelKey: "slideUp",
    shortcut: "k",
    action: { type: "technique", patch: { slide: "up" } },
  },
  {
    id: "slide-down",
    group: "technique",
    labelKey: "slideDown",
    shortcut: "l",
    action: { type: "technique", patch: { slide: "down" } },
  },
  {
    id: "slide-position",
    group: "technique",
    labelKey: "slidePosition",
    action: { type: "technique", patch: { slide: "position" } },
  },
  {
    id: "vibrato-slight",
    group: "technique",
    labelKey: "vibratoSlight",
    action: { type: "technique", patch: { vibrato: "slight" } },
  },
  {
    id: "vibrato-wide",
    group: "technique",
    labelKey: "vibratoWide",
    action: { type: "technique", patch: { vibrato: "wide" } },
  },
  {
    id: "palm-mute",
    group: "technique",
    labelKey: "palmMute",
    shortcut: "m",
    action: { type: "technique", patch: { palmMute: true } },
  },
  {
    id: "let-ring",
    group: "technique",
    labelKey: "letRing",
    shortcut: "n",
    action: { type: "technique", patch: { letRing: true } },
  },
  {
    id: "tapping",
    group: "technique",
    labelKey: "tapping",
    shortcut: "y",
    action: { type: "technique", patch: { tapping: true } },
  },
  {
    id: "harmonic-natural",
    group: "technique",
    labelKey: "harmonicNatural",
    action: { type: "technique", patch: { harmonic: "natural" } },
  },
  {
    id: "harmonic-artificial",
    group: "technique",
    labelKey: "harmonicArtificial",
    action: { type: "technique", patch: { harmonic: "artificial" } },
  },
  {
    id: "harmonic-pinch",
    group: "technique",
    labelKey: "harmonicPinch",
    action: { type: "technique", patch: { harmonic: "pinch" } },
  },
  {
    id: "harmonic-tap",
    group: "technique",
    labelKey: "harmonicTap",
    action: { type: "technique", patch: { harmonic: "tap" } },
  },
  {
    id: "dead",
    group: "technique",
    labelKey: "deadNote",
    shortcut: "x",
    action: { type: "technique", patch: { dead: true } },
  },
  {
    id: "ghost",
    group: "technique",
    labelKey: "ghostNote",
    shortcut: "q",
    action: { type: "technique", patch: { ghost: true } },
  },
  {
    id: "tremolo",
    group: "technique",
    labelKey: "tremoloPicking",
    shortcut: "w",
    action: { type: "technique", patch: { tremoloPicking: true } },
  },
  {
    id: "trill",
    group: "technique",
    labelKey: "trill",
    action: { type: "technique", patch: { trill: true } },
  },
  {
    id: "slap",
    group: "technique",
    labelKey: "slap",
    shortcut: "s",
    action: { type: "technique", patch: { slap: true } },
  },
  {
    id: "pop",
    group: "technique",
    labelKey: "pop",
    shortcut: "o",
    action: { type: "technique", patch: { pop: true } },
  },
  {
    id: "accent-normal",
    group: "technique",
    labelKey: "accentNormal",
    shortcut: "a",
    action: { type: "technique", patch: { accent: "normal" } },
  },
  {
    id: "accent-heavy",
    group: "technique",
    labelKey: "accentHeavy",
    shortcut: "z",
    action: { type: "technique", patch: { accent: "heavy" } },
  },
  {
    id: "bend-0.25",
    group: "bend",
    labelKey: "bendQuarter",
    action: { type: "technique", patch: { bend: { semitones: 0.25 } } },
  },
  {
    id: "bend-0.5",
    group: "bend",
    labelKey: "bendHalf",
    action: { type: "technique", patch: { bend: { semitones: 0.5 } } },
  },
  {
    id: "bend-1",
    group: "bend",
    labelKey: "bendWhole",
    action: { type: "technique", patch: { bend: { semitones: 1 } } },
  },
  {
    id: "bend-1.5",
    group: "bend",
    labelKey: "bendOneAndHalf",
    action: { type: "technique", patch: { bend: { semitones: 1.5 } } },
  },
  {
    id: "bend-2",
    group: "bend",
    labelKey: "bendTwo",
    action: { type: "technique", patch: { bend: { semitones: 2 } } },
  },
  {
    id: "bend-release",
    group: "bend",
    labelKey: "bendRelease",
    action: { type: "bendRelease" },
  },
  {
    id: "bend-prebend",
    group: "bend",
    labelKey: "bendPrebend",
    action: { type: "bendPrebend" },
  },
  {
    id: "bar-insert",
    group: "bar",
    labelKey: "insertBar",
    shortcut: "+",
    action: { type: "insertBar" },
  },
  {
    id: "bar-append",
    group: "bar",
    labelKey: "appendBar",
    action: { type: "appendBar" },
  },
  {
    id: "bar-duplicate",
    group: "bar",
    labelKey: "duplicateBar",
    action: { type: "duplicateBar" },
  },
  {
    id: "bar-delete",
    group: "bar",
    labelKey: "deleteBar",
    action: { type: "deleteBar" },
  },
  {
    id: "bar-time-signature",
    group: "bar",
    labelKey: "timeSignature",
    action: { type: "openTimeSignature" },
  },
  {
    id: "bar-tempo",
    group: "bar",
    labelKey: "tempo",
    action: { type: "openTempo" },
  },
];

/** Atajos del catálogo, sin repetir. */
export function getPaletteShortcuts(): Map<string, TabPaletteOption> {
  const shortcuts = new Map<string, TabPaletteOption>();
  for (const option of TAB_PALETTE) {
    if (option.shortcut) shortcuts.set(option.shortcut, option);
  }
  return shortcuts;
}

function previousBeatPosition(
  score: Pick<TabScore, "bars">,
  bar: number,
  beat: number,
): { bar: number; beat: number } | null {
  if (beat > 0) return { bar, beat: beat - 1 };
  for (let index = bar - 1; index >= 0; index--) {
    if (score.bars[index].beats.length > 0) {
      return { bar: index, beat: score.bars[index].beats.length - 1 };
    }
  }
  return null;
}

const FLAG_IDS: Record<string, keyof TabNote> = {
  dead: "dead",
  ghost: "ghost",
  "palm-mute": "palmMute",
  "let-ring": "letRing",
  tapping: "tapping",
  tremolo: "tremoloPicking",
  trill: "trill",
  slap: "slap",
  pop: "pop",
};

export function getPaletteState({
  score,
  selection,
  selectedBeats,
}: {
  score: TabScore;
  selection: TabSelection;
  selectedBeats: { bar: number; beat: number }[];
}): TabPaletteState {
  const beats = selectedBeats
    .map(({ bar, beat }) => getBeatAt(score, bar, beat))
    .filter((beat): beat is TabBeat => beat !== null);
  const notes = selectedBeats
    .map(({ bar, beat }) =>
      getNoteAt(getBeatAt(score, bar, beat), selection.string),
    )
    .filter((note): note is TabNote => note !== null);
  const everyNote = notes.length === beats.length && beats.length > 0;

  const hasPrevious = (): boolean =>
    selectedBeats.every(({ bar, beat }) => {
      const previous = previousBeatPosition(score, bar, beat);
      return (
        previous !== null &&
        getNoteAt(
          getBeatAt(score, previous.bar, previous.beat),
          selection.string,
        ) !== null
      );
    });

  const barLimit = score.bars.length >= TAB_MAX_BARS;
  const state: TabPaletteState = {};

  for (const option of TAB_PALETTE) {
    const active = (() => {
      switch (option.group) {
        case "duration": {
          const duration = Number(option.id.replace("duration-", ""));
          return beats.length > 0 && beats.every((beat) => beat.duration === duration);
        }
        case "rhythm":
          if (option.id === "dots") {
            return beats.length > 0 && beats.every((beat) => beat.dots === 1);
          }
          if (option.id === "tuplet") {
            return beats.length > 0 && beats.every((beat) => beat.tuplet === 3);
          }
          if (option.id === "rest") {
            return beats.length > 0 && beats.every((beat) => beat.rest === true);
          }
          return false;
        case "tie":
          return everyNote && notes.every((note) => note.tie === true);
        case "technique": {
          if (!everyNote) return false;
          switch (option.id) {
            case "legato-hammer":
              return notes.every((note) => note.legato === "hammer");
            case "legato-pull":
              return notes.every((note) => note.legato === "pull");
            case "slide-up":
              return notes.every((note) => note.slide === "up");
            case "slide-down":
              return notes.every((note) => note.slide === "down");
            case "slide-position":
              return notes.every((note) => note.slide === "position");
            case "vibrato-slight":
              return notes.every((note) => note.vibrato === "slight");
            case "vibrato-wide":
              return notes.every((note) => note.vibrato === "wide");
            case "harmonic-natural":
              return notes.every((note) => note.harmonic === "natural");
            case "harmonic-artificial":
              return notes.every((note) => note.harmonic === "artificial");
            case "harmonic-pinch":
              return notes.every((note) => note.harmonic === "pinch");
            case "harmonic-tap":
              return notes.every((note) => note.harmonic === "tap");
            case "accent-normal":
              return notes.every((note) => note.accent === "normal");
            case "accent-heavy":
              return notes.every((note) => note.accent === "heavy");
            default: {
              const flag = FLAG_IDS[option.id];
              return flag ? notes.every((note) => note[flag] === true) : false;
            }
          }
        }
        case "bend": {
          if (!everyNote) return false;
          if (option.id === "bend-release") {
            return notes.every((note) => note.bend?.release === true);
          }
          if (option.id === "bend-prebend") {
            return notes.every((note) => note.bend?.prebend === true);
          }
          const semitones = Number(option.id.replace("bend-", ""));
          return notes.every((note) => note.bend?.semitones === semitones);
        }
        case "bar":
          return false;
        default:
          return false;
      }
    })();

    const needsPrevious =
      option.id === "tie" ||
      option.group === "tie" ||
      option.id === "legato-hammer" ||
      option.id === "legato-pull" ||
      option.id === "slide-up" ||
      option.id === "slide-down" ||
      option.id === "slide-position";

    let disabled = false;
    let reason: TabPaletteReason | undefined;

    if (option.group === "technique" || option.group === "tie" || option.group === "bend") {
      if (!everyNote) {
        disabled = true;
        reason = "requiresNote";
      } else if (needsPrevious && !hasPrevious()) {
        disabled = true;
        reason = "requiresPreviousNote";
      }
    }

    if (
      (option.id === "bar-insert" ||
        option.id === "bar-append" ||
        option.id === "bar-duplicate") &&
      barLimit
    ) {
      disabled = true;
      reason = "barLimit";
    }

    if (option.id === "split-beat") {
      const bar = score.bars[selection.bar];
      const beat = getBeatAt(score, selection.bar, selection.beat);
      if (!beat) {
        disabled = true;
        reason = "requiresNote";
      } else if (beat.duration >= 64) {
        disabled = true;
        reason = "cannotSplit";
      } else if (bar && bar.beats.length >= TAB_MAX_BEATS_PER_BAR) {
        disabled = true;
        reason = "beatLimit";
      }
    }

    state[option.id] = { active, disabled, reason };
  }

  return state;
}

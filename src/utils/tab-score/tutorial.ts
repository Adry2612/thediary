import type { TabScore } from "../../types/tab-score.ts";
import type { TabSelection } from "./selection.ts";

export const TAB_TUTORIAL_STEPS = [
  "select",
  "write",
  "chord",
  "menu",
  "duration",
  "split",
  "done",
] as const;

export type TabTutorialStep = (typeof TAB_TUTORIAL_STEPS)[number];

export type TabTutorialSnapshot = {
  score: TabScore;
  beatNotes: number;
  duration: string;
  beats: number;
  /** En el paso del menú, si se ha visto cerrado antes de abrirlo. */
  sawClosed: boolean;
};

function beatAt(score: TabScore, selection: TabSelection) {
  return score.bars[selection.bar]?.beats[selection.beat] ?? null;
}

function durationKey(beat: { duration: number; dots?: 1; tuplet?: 3 }): string {
  return `${beat.duration}/${beat.dots ?? 0}/${beat.tuplet ?? 0}`;
}

/** Foto del editor al entrar en un paso, para detectar solo acciones nuevas. */
export function snapshotTutorial(
  score: TabScore,
  selection: TabSelection,
  paletteOpen: boolean,
): TabTutorialSnapshot {
  const beat = beatAt(score, selection);
  return {
    score,
    beatNotes: beat?.notes.length ?? 0,
    duration: beat ? durationKey(beat) : "",
    beats: score.bars[selection.bar]?.beats.length ?? 0,
    sawClosed: !paletteOpen,
  };
}

/**
 * Compara el estado actual con la foto del paso y decide si hay que avanzar.
 * Devuelve también la foto actualizada, porque el paso del menú recuerda si ya
 * se cerró una vez.
 */
export function checkTutorialStep(
  step: TabTutorialStep,
  snapshot: TabTutorialSnapshot,
  current: {
    score: TabScore;
    selection: TabSelection;
    paletteOpen: boolean;
  },
): { snapshot: TabTutorialSnapshot; advance: boolean } {
  if (step === "select" || step === "done") {
    return { snapshot, advance: false };
  }

  if (step === "write") {
    // La identidad del score cambia con cualquier edición, también al
    // reescribir el traste de una nota que ya existía.
    return { snapshot, advance: current.score !== snapshot.score };
  }

  const beat = beatAt(current.score, current.selection);

  if (step === "chord") {
    return {
      snapshot,
      advance: (beat?.notes.length ?? 0) > snapshot.beatNotes,
    };
  }

  if (step === "duration") {
    return {
      snapshot,
      advance: beat !== null && durationKey(beat) !== snapshot.duration,
    };
  }

  if (step === "split") {
    return {
      snapshot,
      advance:
        (current.score.bars[current.selection.bar]?.beats.length ?? 0) >
        snapshot.beats,
    };
  }

  // menu: no basta con que esté abierto al entrar; hay que verlo cerrarse y
  // volver a abrirlo para que la acción sea del usuario.
  const sawClosed = snapshot.sawClosed || !current.paletteOpen;
  return {
    snapshot: { ...snapshot, sawClosed },
    advance: sawClosed && current.paletteOpen,
  };
}

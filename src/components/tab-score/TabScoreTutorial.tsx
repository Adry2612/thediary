"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { TabScore } from "@/types/tab-score";
import type { TabSelection } from "@/utils/tab-score/selection";
import {
  TAB_TUTORIAL_STEPS,
  checkTutorialStep,
  snapshotTutorial,
  type TabTutorialSnapshot,
  type TabTutorialStep,
} from "@/utils/tab-score/tutorial";

const STEPS = TAB_TUTORIAL_STEPS;
const ACTION_STEPS = STEPS.length - 1;

function targetSelector(
  step: TabTutorialStep,
  paletteOpen: boolean,
): string | null {
  switch (step) {
    case "select":
    case "write":
    case "next":
    case "menu":
      return '[data-testid="tab-score-canvas"]';
    case "duration":
    case "move":
      return paletteOpen ? "[data-tab-palette]" : "[data-palette-toggle]";
    case "split":
      return paletteOpen
        ? '[data-option-id="split-beat"]'
        : "[data-palette-toggle]";
    case "done":
      return null;
  }
}

/**
 * Guía por pasos sobre el propio editor. No es modal: se puede seguir
 * escribiendo y cada paso avanza al detectar la acción, comparando con una
 * foto del estado tomada al entrar en el paso (no con valores absolutos).
 */
export function TabScoreTutorial({
  open,
  score,
  selection,
  paletteOpen,
  onClose,
}: {
  open: boolean;
  score: TabScore;
  selection: TabSelection;
  paletteOpen: boolean;
  onClose: () => void;
}) {
  const text = useI18nSection("tabTutorial");
  const [stepIndex, setStepIndex] = useState(0);
  const snapshot = useRef<TabTutorialSnapshot | null>(null);

  const advance = useCallback(() => {
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }, []);

  useEffect(() => {
    if (!open) setStepIndex(0);
  }, [open]);

  const step = STEPS[stepIndex];

  // Foto al entrar en el paso. A propósito no depende de `score`: si cambiara
  // con cada nota, el paso nunca detectaría la acción.
  useEffect(() => {
    if (!open || step === "done") return;
    snapshot.current = snapshotTutorial(score, selection, paletteOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIndex]);

  useEffect(() => {
    if (!open) return;
    const current = snapshot.current;
    if (!current) return;

    const result = checkTutorialStep(step, current, {
      score,
      selection,
      paletteOpen,
    });
    snapshot.current = result.snapshot;
    if (result.advance) advance();
  }, [open, step, score, selection, paletteOpen, advance]);

  useEffect(() => {
    if (!open || step !== "select") return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Element | null;
      if (target?.closest('[data-testid="tab-score-canvas"]')) advance();
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open, step, advance]);

  const selector = targetSelector(step, paletteOpen);

  useEffect(() => {
    if (!open || !selector) return;
    const element = document.querySelector(selector);
    if (!element) return;
    element.classList.add("tour-highlight");
    element.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    return () => element.classList.remove("tour-highlight");
  }, [open, selector]);

  if (!open) return null;

  const isDone = step === "done";
  const copy =
    step === "select"
      ? { title: text.selectTitle, body: text.selectBody }
      : step === "write"
        ? { title: text.writeTitle, body: text.writeBody }
        : step === "next"
          ? { title: text.nextTitle, body: text.nextBody }
          : step === "menu"
            ? { title: text.menuTitle, body: text.menuBody }
            : step === "duration"
              ? { title: text.durationTitle, body: text.durationBody }
              : step === "move"
                ? { title: text.moveTitle, body: text.moveBody }
              : step === "split"
                ? { title: text.splitTitle, body: text.splitBody }
                : { title: text.doneTitle, body: text.doneBody };

  return (
    <section
      data-tab-tutorial
      aria-label={text.title}
      aria-live="polite"
      aria-atomic="true"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      className="fixed left-1/2 top-[calc(var(--app-safe-top)+0.75rem)] z-[60] max-h-[45dvh] w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-y-auto rounded-xl border border-amber-300 bg-amber-50 p-3 text-zinc-900 shadow-xl sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">
            {isDone ? text.title : `${text.step} ${stepIndex + 1}/${ACTION_STEPS}`}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold">{copy.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={text.close}
          className="flex size-7 shrink-0 items-center justify-center rounded border border-amber-300 text-amber-800"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <p className="mt-1 max-w-prose text-sm leading-6 text-zinc-700">
        {copy.body}
      </p>
      <p className="mt-1 text-[11px] text-zinc-500">
        {isDone ? text.doneHint : text.undoHint}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {!isDone && (
          <>
            <Button
              type="button"
              size="field"
              variant="link"
              onClick={onClose}
              className="mr-auto text-amber-800 hover:text-amber-900"
            >
              {text.skip}
            </Button>
            <Button
              type="button"
              size="field"
              variant="ghost"
              onClick={advance}
              className="border-amber-400 text-zinc-800 hover:bg-amber-100"
            >
              {text.skipStep}
            </Button>
            <Button type="button" size="field" variant="primary" onClick={advance}>
              {text.next}
            </Button>
          </>
        )}
        {isDone && (
          <Button
            type="button"
            size="field"
            variant="primary"
            onClick={onClose}
            className="ml-auto"
          >
            {text.close}
          </Button>
        )}
      </div>
    </section>
  );
}

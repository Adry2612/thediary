"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  readTutorialProgress,
  saveTutorialProgress,
  type TutorialProgress,
} from "@/utils/tutorial-progress";
import { TUTORIAL_STEPS, type TutorialStep } from "@/utils/tutorial-steps";
import { errorMessage } from "@/utils/error-message";
import { SPOTLIGHT_PADDING } from "@/utils/tutorial-layout";
import { useTutorialSpotlight } from "@/hooks/useTutorialSpotlight";
import type {
  PendingTutorialTransition,
  TutorialContextValue,
  TutorialText,
} from "@/types/tutorial";
import { useI18nSection } from "@/i18n/I18nProvider";

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const tutorialText = useI18nSection("tutorial")!;
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pendingTransitionRef = useRef<PendingTutorialTransition | null>(null);

  useEffect(() => {
    try {
      if (readTutorialProgress(window.localStorage) === null) {
        setIsOpen(true);
      }
    } catch (error) {
      setStorageError(
        errorMessage(error, "No se pudo guardar el estado del tutorial."),
      );
      setIsOpen(true);
    }
  }, []);

  const openTutorial = useCallback(() => {
    setStepIndex(0);
    setStorageError(null);
    setIsOpen(true);
  }, []);

  const closeTutorial = useCallback((progress: TutorialProgress) => {
    try {
      saveTutorialProgress(window.localStorage, progress);
      setStorageError(null);
    } catch (error) {
      setStorageError(
        errorMessage(error, "No se pudo guardar el estado del tutorial."),
      );
      console.error("No se pudo guardar el progreso del tutorial.", error);
    } finally {
      setIsOpen(false);
    }
  }, []);

  const completePendingTransition = useCallback(() => {
    const pendingTransition = pendingTransitionRef.current;
    if (!pendingTransition) return;

    window.clearTimeout(pendingTransition.timeoutId);
    pendingTransitionRef.current = null;
    pendingTransition.resolve();
  }, []);

  const handleTargetReady = useCallback(
    (readyStepIndex: number) => {
      const pendingTransition = pendingTransitionRef.current;
      if (
        pendingTransition?.pathname !== pathname ||
        pendingTransition.stepIndex !== readyStepIndex
      ) {
        return;
      }
      completePendingTransition();
      if (!pendingTransition.visualTransition) {
        setIsTransitioning(false);
      }
    },
    [completePendingTransition, pathname],
  );

  const moveToStep = useCallback(
    (nextIndex: number) => {
      if (pendingTransitionRef.current || isTransitioning) return;

      const nextStep = TUTORIAL_STEPS[nextIndex];
      const destination = nextStep.href ?? pathname;
      const updateStep = () => {
        setStepIndex(nextIndex);
        if (nextStep.href && pathname !== nextStep.href) {
          router.push(nextStep.href);
        }
      };

      const visualTransition =
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
        typeof document.startViewTransition === "function";

      let resolveUpdate: () => void = () => {};
      const updateCompleted = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });
      const timeoutId = window.setTimeout(() => {
        completePendingTransition();
        setIsTransitioning(false);
      }, 2500);
      pendingTransitionRef.current = {
        pathname: destination,
        stepIndex: nextIndex,
        resolve: resolveUpdate,
        timeoutId,
        visualTransition,
      };
      setIsTransitioning(true);

      if (!visualTransition) {
        startTransition(updateStep);
        return;
      }

      const transition = document.startViewTransition(() => {
        startTransition(updateStep);
        return updateCompleted;
      });
      void transition.ready.catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "InvalidStateError") {
          return;
        }
        console.error("No se pudo iniciar la transición del tutorial.", error);
      });
      void transition.finished.then(
        () => {
          completePendingTransition();
          setIsTransitioning(false);
        },
        () => {
          completePendingTransition();
          setIsTransitioning(false);
        },
      );
    },
    [completePendingTransition, isTransitioning, pathname, router],
  );

  const nextStep = useCallback(() => {
    if (stepIndex === TUTORIAL_STEPS.length - 1) {
      closeTutorial("completed");
      return;
    }
    moveToStep(stepIndex + 1);
  }, [closeTutorial, moveToStep, stepIndex]);

  const previousStep = useCallback(() => {
    moveToStep(Math.max(0, stepIndex - 1));
  }, [moveToStep, stepIndex]);

  const skipTutorial = useCallback(() => {
    if (isTransitioning) return;
    closeTutorial("skipped");
  }, [closeTutorial, isTransitioning]);

  const contextValue = useMemo(
    () => ({ openTutorial, isOpen }),
    [isOpen, openTutorial],
  );

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
      {isOpen && (
           <TutorialDialog
           step={{ ...TUTORIAL_STEPS[stepIndex], ...tutorialText.steps[stepIndex] }}
          stepIndex={stepIndex}
          stepCount={TUTORIAL_STEPS.length}
           storageError={storageError}
           tutorialText={tutorialText}
          isTransitioning={isTransitioning}
          onTargetReady={handleTargetReady}
          onClose={skipTutorial}
          onNext={nextStep}
          onPrevious={previousStep}
        />
      )}
    </TutorialContext.Provider>
  );
}

function TutorialDialog({
  step,
  stepIndex,
  stepCount,
  storageError,
  tutorialText,
  isTransitioning,
  onTargetReady,
  onClose,
  onNext,
  onPrevious,
}: {
  step: TutorialStep;
  stepIndex: number;
  stepCount: number;
  storageError: string | null;
  tutorialText: TutorialText;
  isTransitioning: boolean;
  onTargetReady: (stepIndex: number) => void;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const { dialogRef, targetBounds, viewport, hasSpotlight, hole } =
    useTutorialSpotlight({
      stepIndex,
      target: step.target,
      href: step.href,
      isTransitioning,
      onClose,
      onTargetReady,
      layoutKey: `${step.title}|${step.description}|${storageError ?? ""}`,
    });
  const progress = ((stepIndex + 1) / stepCount) * 100;
  const holeTop = hole?.top ?? 0;
  const holeBottom = hole?.bottom ?? 0;
  const holeLeft = hole?.left ?? 0;
  const holeRight = hole?.right ?? 0;

  return (
    <>
      {hasSpotlight && targetBounds ? (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-x-0 top-0 z-[100] bg-black/80"
            style={{ height: holeTop }}
          />
          <div
            aria-hidden="true"
            className="fixed inset-x-0 bottom-0 z-[100] bg-black/80"
            style={{ top: holeBottom }}
          />
          <div
            aria-hidden="true"
            className="fixed left-0 z-[100] bg-black/80"
            style={{
              top: holeTop,
              width: holeLeft,
              height: holeBottom - holeTop,
            }}
          />
          <div
            aria-hidden="true"
            className="fixed right-0 z-[100] bg-black/80"
            style={{
              top: holeTop,
              width: Math.max(0, viewport.width - holeRight),
              height: holeBottom - holeTop,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-auto fixed z-[101] rounded-lg border-2 border-accent-green-fg"
            style={{
              top: targetBounds.top - SPOTLIGHT_PADDING.top,
              left: targetBounds.left - SPOTLIGHT_PADDING.horizontal,
              width: targetBounds.width + SPOTLIGHT_PADDING.horizontal * 2,
              height:
                targetBounds.height +
                SPOTLIGHT_PADDING.top +
                SPOTLIGHT_PADDING.bottom,
            }}
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[100] bg-black/80"
        />
      )}

      <section
        ref={dialogRef}
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-description"
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        className="fixed z-[102] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-line bg-surface p-5 sm:p-6"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxHeight: "calc(100dvh - 2rem)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">
            Guía de thediary
          </p>
          <p
            className="shrink-0 text-xs text-muted"
            aria-live="polite"
            aria-atomic="true"
          >
            Paso {stepIndex + 1} de {stepCount}
          </p>
        </div>
        <div
          role="progressbar"
           aria-label={tutorialText.progress}
          aria-valuemin={1}
          aria-valuemax={stepCount}
          aria-valuenow={stepIndex + 1}
          className="mt-3 h-1 overflow-hidden rounded-sm bg-white/10"
        >
          <div
            className="h-full origin-left bg-accent-green-fg transition-transform duration-200 motion-reduce:transition-none"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </div>

        <div key={step.title}>
          <h2
            id="tutorial-title"
            className="mt-5 text-xl font-semibold tracking-tight text-ink sm:text-2xl"
          >
            {step.title}
          </h2>
          <p
            id="tutorial-description"
            className="mt-2 text-sm leading-6 text-muted sm:text-base"
          >
            {step.description}
          </p>
        </div>

        {storageError && (
          <p className="mt-4 text-sm text-accent-red-fg" role="alert">
             {tutorialText.saveError}: {storageError}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isTransitioning}
            className="min-h-10 rounded-md px-2 text-xs uppercase tracking-[0.08em] text-muted underline underline-offset-4 transition hover:text-ink"
          >
                 {tutorialText.skip}
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={onPrevious}
                disabled={isTransitioning}
                className="min-h-10 rounded-md border border-line px-3 text-sm text-ink transition hover:bg-white/5"
              >
                 {tutorialText.previous}
              </button>
            )}
            <button
              type="button"
              autoFocus
              onClick={onNext}
              disabled={isTransitioning}
              className="min-h-10 rounded-md bg-ink px-4 text-sm font-medium text-canvas transition hover:opacity-90 active:scale-[0.98]"
            >
               {stepIndex === stepCount - 1 ? tutorialText.finish : tutorialText.next}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export function useTutorial(): TutorialContextValue {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial debe utilizarse dentro de TutorialProvider.");
  }
  return context;
}

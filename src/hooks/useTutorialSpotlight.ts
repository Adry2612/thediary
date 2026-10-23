"use client";

import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import type { TargetBounds, ViewportSize } from "@/types/tutorial";
import {
  getDialogStyle,
  getSpotlightHole,
  hasTargetBoundsChanged,
  toTargetBounds,
} from "@/utils/tutorial-layout";

interface UseTutorialSpotlightOptions {
  stepIndex: number;
  /** `data-tour-target` del paso; sin él no hay hueco que señalar. */
  target?: string;
  /** Ruta del paso: el objetivo solo se busca cuando ya estamos en ella. */
  href?: string;
  isTransitioning: boolean;
  onClose: () => void;
  onTargetReady: (stepIndex: number) => void;
  /** Cambia cuando el diálogo cambia de tamaño (texto, error) y hay que recolocarlo. */
  layoutKey?: unknown;
}

/**
 * Mide el objetivo de un paso, coloca el diálogo a su lado y contiene el foco.
 *
 * Los observadores y los listeners son los mismos que tenía el proveedor; el
 * cálculo vive en `utils/tutorial-layout` y aquí solo se aplica al DOM.
 */
export function useTutorialSpotlight({
  stepIndex,
  target,
  href,
  isTransitioning,
  onClose,
  onTargetReady,
  layoutKey,
}: UseTutorialSpotlightOptions) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLElement>(null);
  const [targetBounds, setTargetBounds] = useState<TargetBounds | null>(null);
  const [readyStepIndex, setReadyStepIndex] = useState<number | null>(null);
  const [viewport, setViewport] = useState<ViewportSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isTransitioning) return;
        event.preventDefault();
        onClose();
        return;
      }

      const dialog = dialogRef.current;
      if (event.key !== "Tab" || !dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const activeIndex = focusableElements.findIndex(
        (element) => element === document.activeElement,
      );
      if (activeIndex === -1) {
        event.preventDefault();
        const boundary = event.shiftKey
          ? focusableElements[focusableElements.length - 1]
          : focusableElements[0];
        boundary.focus();
        return;
      }

      if (event.shiftKey && activeIndex === 0) {
        event.preventDefault();
        focusableElements[focusableElements.length - 1].focus();
      } else if (
        !event.shiftKey &&
        activeIndex === focusableElements.length - 1
      ) {
        event.preventDefault();
        focusableElements[0].focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isTransitioning, onClose]);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (stepIndex === 0 || !target) {
      setTargetBounds(null);
      setReadyStepIndex(stepIndex);
      return;
    }
    if (href && pathname !== href) {
      setTargetBounds(null);
      setReadyStepIndex(null);
      return;
    }

    let currentTarget: HTMLElement | null = null;
    let hasScrolledToTarget = false;
    const resizeObserver = new ResizeObserver(updateTargetBounds);

    function updateTargetBounds() {
      const nextTarget = document.querySelector<HTMLElement>(
        `[data-tour-target="${target}"]`,
      );
      const targetChanged = nextTarget !== currentTarget;
      if (targetChanged) {
        resizeObserver.disconnect();
        currentTarget = nextTarget;
        hasScrolledToTarget = false;
        if (currentTarget) {
          resizeObserver.observe(currentTarget);
        }
      }

      if (!currentTarget) {
        setTargetBounds(null);
        setReadyStepIndex(null);
        return;
      }

      if (!hasScrolledToTarget) {
        hasScrolledToTarget = true;
        currentTarget.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }

      const bounds = toTargetBounds(currentTarget.getBoundingClientRect());
      const updateBounds = () =>
        setTargetBounds((previousBounds) =>
          hasTargetBoundsChanged(previousBounds, bounds)
            ? bounds
            : previousBounds,
        );

      if (targetChanged) {
        startTransition(() => {
          updateBounds();
          setReadyStepIndex(stepIndex);
        });
        return;
      }
      updateBounds();
      setReadyStepIndex(stepIndex);
    }

    const mutationObserver = new MutationObserver(updateTargetBounds);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", updateTargetBounds);
    window.addEventListener("scroll", updateTargetBounds, true);
    updateTargetBounds();

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateTargetBounds);
      window.removeEventListener("scroll", updateTargetBounds, true);
    };
  }, [pathname, href, target, stepIndex]);

  useLayoutEffect(() => {
    if (readyStepIndex === stepIndex) {
      onTargetReady(stepIndex);
    }
  }, [onTargetReady, readyStepIndex, stepIndex]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const dialogBounds = dialog.getBoundingClientRect();
    const style = getDialogStyle(targetBounds, viewport, {
      width: dialogBounds.width,
      height: dialogBounds.height,
    });

    dialog.style.top = style.top;
    dialog.style.left = style.left;
    dialog.style.transform = style.transform;
  }, [layoutKey, stepIndex, targetBounds, viewport]);

  const hasSpotlight = Boolean(
    targetBounds && viewport.width && viewport.height,
  );
  const hole = targetBounds ? getSpotlightHole(targetBounds, viewport) : null;

  return { dialogRef, targetBounds, viewport, hasSpotlight, hole };
}

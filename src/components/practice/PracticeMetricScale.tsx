"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import {
  PRACTICE_METRIC_VALUES,
  getPracticeMetricLabelKey,
} from "@/utils/practice-metrics";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { PracticeMetric, PracticeMetricValue } from "@/types/practice";

interface PracticeMetricScaleProps {
  metric: PracticeMetric;
  value: PracticeMetricValue | null;
  onChange: (value: PracticeMetricValue | null) => void;
  /** Id del texto que hace de pregunta; nombra el grupo. */
  labelledBy: string;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Carrusel de cinco niveles con tarjetas del mismo tamaño. Se puede deslizar,
 * tocar una tarjeta o usar las flechas; la tarjeta centrada es la que se
 * selecciona al terminar el desplazamiento. La pregunta se puede dejar sin
 * responder.
 */
export function PracticeMetricScale({
  metric,
  value,
  onChange,
  labelledBy,
}: PracticeMetricScaleProps) {
  const text = useI18nSection("practice");
  const groupRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const scrollTimeoutRef = useRef<number | null>(null);
  const isUserScrollingRef = useRef(false);
  const selectedIndex =
    value === null ? -1 : PRACTICE_METRIC_VALUES.indexOf(value);
  const focusIndex = selectedIndex === -1 ? 0 : selectedIndex;
  const metricTitle =
    text[metric === "mood" ? "metricMood" : "metricFocus"];

  function centerCard(index: number, behavior: ScrollBehavior = "smooth") {
    cardRefs.current[index]?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : behavior,
      inline: "center",
      block: "nearest",
    });
  }

  useEffect(() => {
    const container = groupRef.current;
    if (!container) return;

    let hasCentered = false;
    const centerWhenReady = () => {
      if (hasCentered || container.clientWidth === 0) return;
      hasCentered = true;
      centerCard(selectedIndex >= 0 ? selectedIndex : 2, "auto");
    };

    centerWhenReady();
    const observer = new ResizeObserver(centerWhenReady);
    observer.observe(container);
    return () => observer.disconnect();
    // Solo se centra al montar o cuando el diálogo pasa de oculto a visible.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    },
    [],
  );

  function handleScroll() {
    if (!isUserScrollingRef.current) return;
    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      scrollTimeoutRef.current = null;
      const container = groupRef.current;
      if (!container) return;

      const center = container.scrollLeft + container.clientWidth / 2;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      isUserScrollingRef.current = false;
      const next = PRACTICE_METRIC_VALUES[nearestIndex];
      if (next !== undefined && next !== value) onChange(next);
    }, 140);
  }

  function selectAt(index: number) {
    const next = PRACTICE_METRIC_VALUES[index];
    if (next === undefined) return;
    isUserScrollingRef.current = false;
    onChange(next);
    centerCard(index);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = PRACTICE_METRIC_VALUES.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex =
          selectedIndex === -1 ? 0 : Math.min(lastIndex, selectedIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex =
          selectedIndex === -1 ? 0 : Math.max(0, selectedIndex - 1);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      case "Backspace":
      case "Delete":
        event.preventDefault();
        onChange(null);
        return;
      default:
        return;
    }

    event.preventDefault();
    selectAt(nextIndex);
    cardRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="mt-3">
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={labelledBy}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        onPointerDown={() => {
          isUserScrollingRef.current = true;
        }}
        onWheel={() => {
          isUserScrollingRef.current = true;
        }}
        className="relative -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <span aria-hidden="true" className="w-[calc(50%-3rem)] shrink-0" />

        {PRACTICE_METRIC_VALUES.map((candidate, index) => {
          const isSelected = candidate === value;
          const label = text[getPracticeMetricLabelKey(metric, candidate)];

          return (
            <button
              key={candidate}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${metricTitle}: ${candidate} · ${label}`}
              tabIndex={index === focusIndex ? 0 : -1}
              onClick={() => selectAt(index)}
              className={`flex h-32 w-24 shrink-0 snap-center flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 transition ${
                isSelected ?
                  "border-accent-green-fg/70 bg-accent-green-bg/40 text-ink ring-1 ring-accent-green-fg/30"
                : "border-line bg-canvas/40 text-muted hover:border-muted/60 hover:text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className="flex h-10 items-center font-mono text-3xl leading-none text-ink"
              >
                {candidate}
              </span>
              <span className="flex min-h-8 max-w-full items-center text-center text-[11px] leading-4">
                <span className="line-clamp-2">{label}</span>
              </span>
            </button>
          );
        })}

        <span aria-hidden="true" className="w-[calc(50%-3rem)] shrink-0" />
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted">{text.metricCarouselHint}</p>
        {value !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] text-muted underline underline-offset-4 hover:text-ink"
          >
            {text.metricClear}
          </button>
        )}
      </div>

      <div
        aria-hidden="true"
        className="mt-2 flex justify-center gap-1.5"
      >
        {PRACTICE_METRIC_VALUES.map((candidate) => (
          <span
            key={candidate}
            className={`size-1.5 rounded-full transition-colors ${
              candidate === value ? "bg-accent-green-fg" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

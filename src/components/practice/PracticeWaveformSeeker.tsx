"use client";

import { useRef } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { PracticeWaveformBars } from "@/components/practice/PracticeWaveformBars";
import { getSeekRatio } from "@/utils/waveform-seek";

interface PracticeWaveformSeekerProps {
  levels: number[];
  currentTime: number;
  duration: number;
  onSeekRatio: (ratio: number) => void;
  onSeekBy: (seconds: number) => void;
  ariaLabel: string;
  ariaValueText: string;
  className?: string;
}

const ARROW_STEP_SECONDS = 1;
const PAGE_STEP_SECONDS = 5;

/**
 * Onda que también es el control de posición de la toma. Se puede tocar,
 * arrastrar o manejar con las flechas, Inicio y Fin, y expone el valor como un
 * slider para lectores de pantalla.
 */
export function PracticeWaveformSeeker({
  levels,
  currentTime,
  duration,
  onSeekRatio,
  onSeekBy,
  ariaLabel,
  ariaValueText,
  className = "",
}: PracticeWaveformSeekerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  function ratioFromPointer(clientX: number) {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return 0;
    return getSeekRatio(clientX, bounds);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    isDraggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    onSeekRatio(ratioFromPointer(event.clientX));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    onSeekRatio(ratioFromPointer(event.clientX));
  }

  function endDragging(event: PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        onSeekBy(-ARROW_STEP_SECONDS);
        break;
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        onSeekBy(ARROW_STEP_SECONDS);
        break;
      case "PageDown":
        event.preventDefault();
        onSeekBy(-PAGE_STEP_SECONDS);
        break;
      case "PageUp":
        event.preventDefault();
        onSeekBy(PAGE_STEP_SECONDS);
        break;
      case "Home":
        event.preventDefault();
        onSeekRatio(0);
        break;
      case "End":
        event.preventDefault();
        onSeekRatio(1);
        break;
    }
  }

  const progress =
    duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const maxValue = duration > 0 ? Math.round(duration * 100) / 100 : 1;
  const currentValue = Math.min(
    Math.round(currentTime * 100) / 100,
    maxValue,
  );

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={maxValue}
      aria-valuenow={currentValue}
      aria-valuetext={ariaValueText}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDragging}
      onPointerCancel={endDragging}
      onLostPointerCapture={() => {
        isDraggingRef.current = false;
      }}
      onKeyDown={handleKeyDown}
      className={`touch-none cursor-pointer rounded-lg border border-line bg-canvas/60 px-3 py-2 outline-none transition-colors focus-visible:border-accent-green-fg/60 focus-visible:ring-2 focus-visible:ring-accent-green-bg ${className}`}
    >
      <PracticeWaveformBars
        levels={levels}
        progress={progress}
        ariaLabel={ariaLabel}
        decorative
        className="pointer-events-none h-10"
      />
    </div>
  );
}

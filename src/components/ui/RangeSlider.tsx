"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  ariaValueText?: string;
  disabled?: boolean;
  className?: string;
};

export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  ariaLabel,
  ariaValueText,
  disabled = false,
  className = "",
}: RangeSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const range = max - min;
  const progress = range > 0 ? ((value - min) / range) * 100 : 0;

  function setValueFromPointer(clientX: number) {
    const bounds = sliderRef.current?.getBoundingClientRect();
    if (!bounds || range <= 0) return;

    const position = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
    const rawValue = min + position * range;
    const snappedValue = min + Math.round((rawValue - min) / step) * step;
    const precision = String(step).split(".")[1]?.length ?? 0;
    onChange(Number(Math.max(min, Math.min(max, snappedValue)).toFixed(precision)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;

    const largerStep = step * 10;
    const values: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + largerStep,
      PageDown: value - largerStep,
      Home: min,
      End: max,
    };
    const nextValue = values[event.key];
    if (nextValue === undefined) return;

    event.preventDefault();
    onChange(Number(Math.max(min, Math.min(max, nextValue)).toFixed(6)));
  }

  return (
    <div
      ref={sliderRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={ariaValueText}
      aria-disabled={disabled || undefined}
      aria-orientation="horizontal"
      onPointerDown={(event) => {
        if (disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setValueFromPointer(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          setValueFromPointer(event.clientX);
        }
      }}
      onKeyDown={handleKeyDown}
      className={`group relative flex h-10 w-full touch-none items-center focus-visible:outline-none ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"} ${className}`}
    >
      <span className="h-1.5 w-full overflow-hidden bg-white/10">
        <span
          className="block h-full bg-accent-green-fg transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
      </span>
      <span
        aria-hidden="true"
        className="absolute size-4 -translate-x-1/2 border-2 border-canvas bg-accent-green-fg ring-1 ring-accent-green-fg transition-transform group-focus-visible:scale-125 group-focus-visible:ring-2"
        style={{ left: `${progress}%` }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -outline-offset-2 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-accent-green-fg"
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { consumeWheelDelta } from "@/lib/wheel-adjustment";

type AdjustableNumberProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  ariaLabel: string;
  className?: string;
  onChange: (value: number) => void;
};

function clampValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function AdjustableNumber({
  value,
  min,
  max,
  step = 1,
  unit,
  ariaLabel,
  className = "",
  onChange,
}: AdjustableNumberProps) {
  const wheelTargetRef = useRef<HTMLDivElement>(null);
  const displayButtonRef = useRef<HTMLButtonElement>(null);
  const wheelDeltaRef = useRef(0);
  const valueRef = useRef(value);
  const draftRef = useRef(String(value));
  const isEditingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;
    if (!isEditingRef.current) {
      draftRef.current = String(value);
      setDraft(draftRef.current);
    }
  }, [value]);

  useEffect(() => {
    const target = wheelTargetRef.current;
    if (!target) return;
    let idleResetTimeout: number | null = null;

    function adjustFromWheel(event: WheelEvent) {
      event.preventDefault();
      if (idleResetTimeout !== null) {
        window.clearTimeout(idleResetTimeout);
      }
      idleResetTimeout = window.setTimeout(() => {
        wheelDeltaRef.current = 0;
        idleResetTimeout = null;
      }, 220);
      const deltaMultiplier =
        event.deltaMode === 1 ? 28 : event.deltaMode === 2 ? 80 : 1;
      const { steps, remainder } = consumeWheelDelta(
        wheelDeltaRef.current,
        event.deltaY * deltaMultiplier,
      );
      wheelDeltaRef.current = remainder;
      if (steps === 0) return;

      const direction = Math.sign(steps) > 0 ? -1 : 1;
      const currentDraft = Number(draftRef.current);
      const currentValue =
        isEditingRef.current && Number.isFinite(currentDraft)
          ? currentDraft
          : valueRef.current;
      const nextValue = clampValue(
        currentValue + direction * step * Math.abs(steps),
        min,
        max,
      );
      valueRef.current = nextValue;
      draftRef.current = String(nextValue);
      if (isEditingRef.current) setDraft(draftRef.current);
      if (nextValue !== currentValue) onChangeRef.current(nextValue);
    }

    target.addEventListener("wheel", adjustFromWheel, { passive: false });
    return () => {
      target.removeEventListener("wheel", adjustFromWheel);
      if (idleResetTimeout !== null) window.clearTimeout(idleResetTimeout);
    };
  }, [max, min, step]);

  function beginEditing() {
    isEditingRef.current = true;
    draftRef.current = String(valueRef.current);
    setDraft(draftRef.current);
    setIsEditing(true);
  }

  function commitEditing() {
    const previousValue = valueRef.current;
    const parsedValue = Number(draftRef.current);
    const nextValue = draftRef.current.trim()
      ? clampValue(Math.round(parsedValue), min, max)
      : previousValue;
    isEditingRef.current = false;
    valueRef.current = nextValue;
    draftRef.current = String(nextValue);
    setDraft(draftRef.current);
    setIsEditing(false);
    if (nextValue !== previousValue) onChangeRef.current(nextValue);
  }

  function cancelEditing() {
    isEditingRef.current = false;
    draftRef.current = String(valueRef.current);
    setDraft(draftRef.current);
    setIsEditing(false);
    requestAnimationFrame(() => displayButtonRef.current?.focus());
  }

  function updateDraft(nextDraft: string) {
    const digitsOnly = nextDraft.replace(/\D/g, "").slice(0, String(max).length);
    draftRef.current = digitsOnly;
    setDraft(digitsOnly);
  }

  return (
    <div
      ref={wheelTargetRef}
      className={`min-w-0 touch-none overscroll-contain ${className}`}
    >
      {isEditing ? (
        <div className="flex items-baseline justify-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={String(max).length}
            autoFocus
            value={draft}
            aria-label={ariaLabel}
            onChange={(event) => updateDraft(event.currentTarget.value)}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={() => {
              if (isEditingRef.current) commitEditing();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                cancelEditing();
              }
            }}
            style={{ width: `${String(max).length + 1}ch` }}
            className="min-w-0 flex-none border-0 border-b border-line bg-transparent p-0 text-center font-mono tabular-nums text-inherit outline-none transition-colors focus:border-accent-green-fg focus:ring-0"
          />
          {unit && (
            <span className="shrink-0 font-mono text-sm text-muted">{unit}</span>
          )}
        </div>
      ) : (
        <button
          ref={displayButtonRef}
          type="button"
          onClick={beginEditing}
          aria-label={`${ariaLabel}: ${value}. Pulsa para editar o desplázate para ajustar`}
          title="Pulsa para editar; desplázate sobre la cifra para ajustar"
          className="flex w-full items-baseline justify-center gap-2 whitespace-nowrap font-mono tabular-nums transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-green-fg"
        >
          <span key={value} className="number-value-change">
            {value}
          </span>
          {unit && (
            <span className="shrink-0 text-sm text-muted">{unit}</span>
          )}
        </button>
      )}
    </div>
  );
}

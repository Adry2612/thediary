"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFieldProps = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
};

export function SelectField({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
  disabled = false,
}: SelectFieldProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [activeIndex, setActiveIndex] = useState(
    Math.max(selectedIndex, 0),
  );
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!isOpen) return;

    const animationFrame = requestAnimationFrame(() =>
      listboxRef.current?.focus(),
    );
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);

    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [isOpen]);

  function openListbox(direction: 1 | -1 = 1) {
    const startingIndex =
      selectedIndex >= 0 && !options[selectedIndex]?.disabled
        ? selectedIndex
        : findEnabledIndex(direction > 0 ? 0 : options.length - 1, direction);
    setActiveIndex(startingIndex);
    setIsOpen(true);
  }

  function findEnabledIndex(start: number, direction: 1 | -1) {
    for (let offset = 0; offset < options.length; offset += 1) {
      const index = (start + offset * direction + options.length) % options.length;
      if (!options[index]?.disabled) return index;
    }
    return -1;
  }

  function moveActiveOption(direction: 1 | -1) {
    const start = activeIndex + direction;
    const next = findEnabledIndex(
      (start + options.length) % options.length,
      direction,
    );
    if (next >= 0) setActiveIndex(next);
  }

  function selectOption(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;

    onChange(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleListboxKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveOption(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const index = findEnabledIndex(
        event.key === "Home" ? 0 : options.length - 1,
        event.key === "Home" ? 1 : -1,
      );
      if (index >= 0) setActiveIndex(index);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(activeIndex);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "Tab") setIsOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openListbox())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openListbox(event.key === "ArrowDown" ? 1 : -1);
          }
        }}
        className="flex h-12 w-full items-center justify-between gap-3 border border-line bg-canvas px-4 text-left font-mono text-sm text-ink transition hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">{selectedOption?.label ?? ""}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className={`size-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="m3.5 6 4.5 4 4.5-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </button>
      {isOpen && (
        <div
          ref={listboxRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={
            activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          tabIndex={0}
          onKeyDown={handleListboxKeyDown}
          className="absolute inset-x-0 top-full z-50 mt-1 max-h-60 overflow-y-auto border border-line bg-surface p-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)] outline-none"
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled || undefined}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectOption(index)}
              className={`flex min-h-10 items-center justify-between gap-3 px-3 py-2 font-mono text-sm transition ${
                option.disabled
                  ? "cursor-not-allowed text-muted/50"
                  : index === activeIndex
                    ? "bg-white/[0.08] text-ink"
                    : "text-muted hover:bg-white/[0.04] hover:text-ink"
              }`}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && (
                <span aria-hidden="true" className="font-mono text-accent-green-fg">
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

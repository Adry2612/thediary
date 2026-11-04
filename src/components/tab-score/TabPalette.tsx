"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { Dict } from "@/i18n/dictionary";
import {
  TAB_PALETTE,
  TAB_PALETTE_GROUPS,
  type TabPaletteGroup,
  type TabPaletteOption,
  type TabPaletteOptionState,
  type TabPaletteState,
} from "@/utils/tab-score/palette";
import { TAB_MAX_FRET } from "@/types/tab-score";
import { TabPaletteIcon } from "@/components/tab-score/TabPaletteIcon";

export type PaletteAnchor = { x: number; y: number; w: number; h: number };

const POPOVER_WIDTH = 340;
const GAP = 12;
const MARGIN = 8;

function groupTitle(
  group: TabPaletteGroup,
  text: Dict["tabPalette"],
): string {
  switch (group) {
    case "duration":
      return text.durations;
    case "rhythm":
      return text.rhythm;
    case "position":
      return text.position;
    case "tie":
      return text.ties;
    case "technique":
      return text.techniques;
    case "bend":
      return text.bends;
    case "dynamic":
      return text.dynamics;
    case "hairpin":
      return text.hairpins;
    case "text":
      return text.texts;
    case "chord":
      return text.chords;
    case "stroke":
      return text.strokes;
    case "grace":
      return text.graces;
    case "fermata":
      return text.fermatas;
    case "repeat":
      return text.repeats;
    case "section":
      return text.sections;
    case "pickup":
      return text.pickup;
    case "bar":
      return text.bars;
  }
}

function reasonText(
  reason: TabPaletteOptionState["reason"],
  text: Dict["tabPalette"],
): string | undefined {
  if (reason === "requiresNote") return text.requiresNote;
  if (reason === "requiresPreviousNote") return text.requiresPreviousNote;
  if (reason === "barLimit") return text.barLimit;
  if (reason === "cannotSplit") return text.cannotSplit;
  if (reason === "beatLimit") return text.beatLimit;
  if (reason === "noAdjacentBeat") return text.noAdjacentBeat;
  if (reason === "alreadySubdivided") return text.alreadySubdivided;
  if (reason === "graceOnRest") return text.graceOnRest;
  if (reason === "strokeNeedsChord") return text.strokeNeedsChord;
  if (reason === "endingOutsideRepeat") return text.endingOutsideRepeat;
  if (reason === "pickupNotFirstBar") return text.pickupNotFirstBar;
  return undefined;
}

export function TabPalette({
  open,
  mode,
  anchor,
  state,
  onAction,
  onFret,
  onClose,
  returnFocus,
}: {
  open: boolean;
  mode: "popover" | "sheet";
  anchor: PaletteAnchor | null;
  state: TabPaletteState;
  onAction: (option: TabPaletteOption) => void;
  onFret: (fret: number) => void;
  onClose: () => void;
  returnFocus?: () => void;
}) {
  const text = useI18nSection("tabPalette");
  const panelRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onClose, returnFocus });
  callbacks.current = { onClose, returnFocus };
  const [position, setPosition] = useState<{ left: number; top: number } | null>(
    null,
  );
  const [described, setDescribed] = useState<string | null>(null);

  const focusFirst = useCallback(() => {
    panelRef.current
      ?.querySelector<HTMLButtonElement>("button[data-palette-option]")
      ?.focus({ preventScroll: true });
  }, []);

  useLayoutEffect(() => {
    if (!open || mode !== "popover") {
      setPosition(null);
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;

    function place() {
      if (!anchor || !panel) return;
      const height = panel.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = anchor.x + anchor.w + GAP;
      if (left + POPOVER_WIDTH > viewportWidth - MARGIN) {
        left = anchor.x - POPOVER_WIDTH - GAP;
      }
      left = Math.max(MARGIN, Math.min(left, viewportWidth - POPOVER_WIDTH - MARGIN));

      let top = anchor.y - 8;
      if (top + height > viewportHeight - MARGIN) {
        top = viewportHeight - height - MARGIN;
      }
      top = Math.max(MARGIN, top);

      setPosition({ left, top });
    }

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, mode, anchor, state]);

  useEffect(() => {
    if (!open) {
      setDescribed(null);
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    focusFirst();

    function handlePointerDown(event: PointerEvent) {
      if (
        panelRef.current &&
        event.target instanceof Node &&
        !panelRef.current.contains(event.target) &&
        !(event.target instanceof Element &&
          event.target.closest("[data-palette-toggle]"))
      ) {
        callbacks.current.onClose();
      }
    }
    function handleWheel(event: WheelEvent) {
      // Desplazar la propia paleta no la cierra; desplazar la partitura sí,
      // porque el ancla dejaría de estar donde se abrió.
      if (panelRef.current?.contains(event.target as Node)) return;
      callbacks.current.onClose();
    }
    function handleTouchMove(event: TouchEvent) {
      if (panelRef.current?.contains(event.target as Node)) return;
      callbacks.current.onClose();
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      if (previous && previous.isConnected) {
        previous.focus({ preventScroll: true });
      } else {
        callbacks.current.returnFocus?.();
      }
    };
  }, [open, focusFirst]);

  if (!open) return null;

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }

    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      const buttons = [
        ...(panelRef.current?.querySelectorAll<HTMLButtonElement>(
          "button[data-palette-option]",
        ) ?? []),
      ];
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (index === -1) return;
      event.preventDefault();
      const delta =
        event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const next = (index + delta + buttons.length) % buttons.length;
      buttons[next].focus();
    }
  }

  const describedOption = described
    ? (TAB_PALETTE.find((option) => option.id === described) ?? null)
    : null;
  const describedLabel = describedOption
    ? ((text as Record<string, string>)[describedOption.labelKey] ??
      describedOption.labelKey)
    : "";
  const describedReason = describedOption
    ? reasonText(state[describedOption.id]?.reason, text)
    : undefined;

  const frets = (
    <div className="mb-3 last:mb-0">
      <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
        {text.frets}
      </p>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: TAB_MAX_FRET + 1 }, (_, fret) => (
          <button
            key={fret}
            type="button"
            data-palette-option
            onClick={() => onFret(fret)}
            className="size-9 rounded-md border border-zinc-300 font-mono text-xs text-zinc-700 active:bg-zinc-200"
          >
            {fret}
          </button>
        ))}
      </div>
    </div>
  );

  const style =
    mode === "popover" && position
      ? {
          left: position.left,
          top: position.top,
          width: POPOVER_WIDTH,
          maxHeight: "70vh",
        }
      : mode === "sheet" && typeof window !== "undefined"
        ? {
            left: 0,
            right: 0,
            bottom: 0,
            // La hoja empieza por debajo de la selección para no taparla.
            top: anchor
              ? Math.min(
                  Math.max(window.innerHeight * 0.28, anchor.y + anchor.h + 12),
                  window.innerHeight - 160,
                )
              : window.innerHeight * 0.3,
          }
        : undefined;

  return (
    <div
      ref={panelRef}
      data-tab-palette
      role="dialog"
      aria-label={text.options}
      onKeyDown={handleKeyDown}
      style={
        mode === "sheet" && style
          ? {
              ...style,
              paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
            }
          : style
      }
      className={
        mode === "popover"
          ? "fixed z-50 overflow-y-auto rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 shadow-xl"
          : "fixed z-50 overflow-y-auto rounded-t-2xl border-t border-zinc-300 bg-white p-3 text-zinc-900 shadow-2xl"
      }
    >
      <div className="sticky top-0 z-10 -mx-3 -mt-3 mb-2 border-b border-zinc-200 bg-white px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {text.options}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={text.close}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600"
          >
            ✕
          </button>
        </div>
        <p
          data-testid="tab-palette-description"
          className="mt-1 min-h-4 text-[11px] leading-4 text-zinc-600"
        >
          {describedOption ? (
            <>
              <span className="font-medium text-zinc-800">
                {describedLabel}
              </span>
              {describedOption.shortcut && (
                <kbd className="ml-1 font-mono text-[10px] text-zinc-500">
                  {describedOption.shortcut}
                </kbd>
              )}
              {describedReason && (
                <span className="ml-1 text-amber-700">· {describedReason}</span>
              )}
            </>
          ) : (
            text.hoverHint
          )}
        </p>
      </div>

      {TAB_PALETTE_GROUPS.map((group) => {
        const options = TAB_PALETTE.filter((option) => option.group === group);
        if (options.length === 0) return null;
        return (
          <Fragment key={group}>
            <div className="mb-3 last:mb-0">
              <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                {groupTitle(group, text)}
              </p>
              <div className="grid grid-cols-[repeat(7,2.5rem)] justify-start gap-1.5">
              {options.map((option) => {
                const optionState = state[option.id] ?? {
                  active: false,
                  disabled: false,
                };
                const reason = reasonText(optionState.reason, text);
                const name =
                  (text as Record<string, string>)[option.labelKey] ??
                  option.labelKey;
                const label = `${name}${
                  option.shortcut ? ` (${option.shortcut})` : ""
                }${reason ? `. ${reason}` : ""}`;
                return (
                  <button
                    key={option.id}
                    type="button"
                    data-palette-option
                    data-option-id={option.id}
                    aria-pressed={optionState.active}
                    aria-disabled={optionState.disabled}
                    aria-label={label}
                    title={reason ? `${name} · ${reason}` : name}
                    onPointerEnter={() => setDescribed(option.id)}
                    onPointerLeave={() => setDescribed(null)}
                    onFocus={() => setDescribed(option.id)}
                    onBlur={() => setDescribed(null)}
                    onClick={() => {
                      if (!optionState.disabled) onAction(option);
                    }}
                    className={`flex size-10 items-center justify-center rounded-md border transition ${
                      optionState.active
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                    } ${
                      optionState.disabled
                        ? "cursor-not-allowed opacity-40"
                        : ""
                    }`}
                  >
                    <TabPaletteIcon id={option.id} group={option.group} />
                  </button>
                );
              })}
              </div>
            </div>
            {group === "duration" ? frets : null}
          </Fragment>
        );
      })}

    </div>
  );
}

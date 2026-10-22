"use client";

import { useId } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  BEND_AMOUNT_LABELS,
  canApplyTabTechniqueToSelection,
  setTabBendAmounts,
  TAB_BEND_AMOUNTS,
  TAB_TECHNIQUES,
  tabTechniqueSelectionState,
  toggleTabTechniques,
  type TabCell,
} from "@/lib/repertoire-tab";
import type { RepertoireTab, RepertoireTabNote } from "@/types/practice";

/**
 * Selector contextual de técnicas. Se abre al pulsar una nota o una selección y
 * sustituye al panel fijo del editor: solo ocupa espacio cuando hace falta.
 */
export function TabTechniquePicker({
  value,
  selectedCells,
  selectedNote,
  onChange,
  onClose,
}: {
  value: RepertoireTab;
  selectedCells: TabCell[];
  selectedNote?: RepertoireTabNote;
  onChange: (value: RepertoireTab) => void;
  onClose: () => void;
}) {
  const text = useI18nSection("repertoire");
  const titleId = useId();
  const hintId = useId();

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={hintId}
      className="w-full rounded-xl border border-line bg-surface p-3 shadow-xl shadow-black/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={titleId}
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-green-fg"
          >
            {text.techniquesTitle}
          </h3>
          <p id={hintId} className="mt-1 text-[11px] leading-4 text-muted">
            {text.techniquesHint}
          </p>
        </div>
        <button
          type="button"
          aria-label={text.close}
          onClick={onClose}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-line text-muted transition hover:bg-white/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="mt-2 grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain pr-1">
        {TAB_TECHNIQUES.map((technique) => {
          const label = text[technique.labelKey] ?? technique.id;
          const state = tabTechniqueSelectionState(
            value,
            selectedCells,
            technique.id,
          );
          const canToggle =
            state !== "none" ||
            canApplyTabTechniqueToSelection(
              value,
              selectedCells,
              technique.id,
            );
          const needsPrevious = technique.isTransition && !canToggle;
          return (
            <button
              key={technique.id}
              type="button"
              disabled={!canToggle}
              onPointerDown={(event) => event.preventDefault()}
              aria-pressed={
                state === "all" ? true : state === "some" ? "mixed" : false
              }
              title={
                needsPrevious
                  ? text.techniquesNeedsPrevious
                  : `${label} [${technique.shortcut}]`
              }
              onClick={() =>
                onChange(
                  toggleTabTechniques(value, selectedCells, technique.id),
                )
              }
              className={`flex min-h-8 w-full min-w-0 items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-[11px] leading-tight transition disabled:cursor-not-allowed disabled:opacity-40 ${
                state === "all"
                  ? "border-accent-green-fg bg-accent-green-bg/40 text-ink"
                  : state === "some"
                    ? "border-accent-green-fg/60 bg-accent-green-bg/20 text-ink"
                    : "border-line text-muted hover:bg-white/5 hover:text-ink"
              }`}
            >
              <span className="shrink-0 font-mono text-[10px] font-semibold text-accent-green-fg">
                {technique.glyph}
              </span>
              <span className="min-w-0">{label}</span>
            </button>
          );
        })}
      </div>

      {selectedNote?.bend ? (
        <label className="mt-2 block text-[11px] text-muted">
          {text.techniqueBendAmount}
          <SelectField
            className="mt-1 w-28"
            value={String(selectedNote.bend.semitones)}
            ariaLabel={text.techniqueBendAmount}
            onChange={(next) =>
              onChange(setTabBendAmounts(value, selectedCells, Number(next)))
            }
            options={TAB_BEND_AMOUNTS.map((amount) => ({
              value: String(amount),
              label: BEND_AMOUNT_LABELS[String(amount)] ?? String(amount),
            }))}
          />
        </label>
      ) : null}
    </div>
  );
}

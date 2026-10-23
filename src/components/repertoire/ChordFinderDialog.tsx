"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CHORD_ROOTS,
  CHORD_TYPES,
  chordIdentity,
  findSavedChord,
  formatChordName,
  parseChordName,
} from "@/utils/chords";
import type { UserChord } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

const ENHARMONIC_LABELS = [
  "C",
  "C#/Db",
  "D",
  "D#/Eb",
  "E",
  "F",
  "F#/Gb",
  "G",
  "G#/Ab",
  "A",
  "A#/Bb",
  "B",
];

interface ChordFinderDialogProps {
  open: boolean;
  selectedName: string;
  saved?: UserChord[];
  onPick: (name: string) => void;
  onClose: () => void;
}

function chipClass(selected: boolean): string {
  const base = "rounded border px-2 py-1 text-xs transition";
  return selected
    ? `${base} border-accent-green-fg/60 bg-accent-green-bg/20 text-ink`
    : `${base} border-line text-muted hover:border-white/20 hover:text-ink`;
}

/**
 * Buscador de acordes en una modal: filtro de texto, los acordes estándar
 * agrupados por nota y los acordes guardados del usuario. Al elegir uno escribe
 * su nombre y se cierra. Se muestra sobre la página, así que no redimensiona la
 * caja del acorde.
 */
export function ChordFinderDialog({
  open,
  selectedName,
  saved = [],
  onPick,
  onClose,
}: ChordFinderDialogProps) {
  const text = useI18nSection("repertoire");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const parsed = parseChordName(selectedName);
  const selectedIdentity = parsed?.identity ?? null;
  const savedMatch = findSavedChord(selectedName, saved);
  const needle = query.trim().toLowerCase();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const groups = useMemo(
    () =>
      CHORD_ROOTS.map(({ root, pitchClass }) => ({
        pitchClass,
        label: ENHARMONIC_LABELS[pitchClass] ?? root,
        chords: CHORD_TYPES.map(({ type }) => ({
          type,
          name: formatChordName(root, type),
        })).filter(
          (chord) => needle === "" || chord.name.toLowerCase().includes(needle),
        ),
      })).filter((group) => group.chords.length > 0),
    [needle],
  );

  const savedChords = useMemo(
    () =>
      saved.filter(
        (chord) => needle === "" || chord.name.toLowerCase().includes(needle),
      ),
    [saved, needle],
  );

  function pick(name: string) {
    onPick(name);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xs uppercase tracking-[0.12em] text-muted">
            {text.chordFinderTitle}
          </h2>
          <button
            type="button"
            aria-label={text.chordFinderClose}
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded border border-line text-muted transition hover:border-white/20 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <input
          ref={inputRef}
          className="mt-3 h-10 w-full rounded-md border border-line bg-canvas px-2 text-sm text-ink placeholder:text-muted/60 focus-visible:border-accent-green-fg/60 focus-visible:outline-none"
          value={query}
          placeholder={text.chordFinderSearch}
          aria-label={text.chordFinderSearch}
          spellCheck={false}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="mt-3 space-y-3">
          {groups.length === 0 && savedChords.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted">
              {text.chordFinderEmpty}
            </p>
          )}

          {groups.length > 0 && (
            <section>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
                {text.chordGroupStandard}
              </p>
              <div className="mt-1 space-y-1">
                {groups.map((group) => (
                  <div key={group.pitchClass} className="flex gap-1">
                    <span className="w-11 shrink-0 pt-1 text-[11px] text-muted">
                      {group.label}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {group.chords.map((chord) => {
                        const selected =
                          selectedIdentity !== null &&
                          selectedIdentity ===
                            chordIdentity(group.pitchClass, chord.type);
                        return (
                          <button
                            key={chord.name}
                            type="button"
                            aria-pressed={selected}
                            className={chipClass(selected)}
                            onClick={() => pick(chord.name)}
                          >
                            {chord.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {savedChords.length > 0 && (
            <section>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
                {text.chordGroupCustom}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {savedChords.map((chord) => {
                  const selected = savedMatch?.id === chord.id;
                  return (
                    <button
                      key={chord.id}
                      type="button"
                      aria-pressed={selected}
                      className={chipClass(selected)}
                      onClick={() => pick(chord.name)}
                    >
                      {chord.name}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </dialog>
  );
}

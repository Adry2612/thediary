"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/icons";
import { ChordFinderDialog } from "@/components/repertoire/ChordFinderDialog";
import { FretboardDiagram } from "@/components/repertoire/FretboardDiagram";
import {
  EDITING_WINDOW_SIZE,
  detectChordName,
  findSavedChord,
  findVoicingIndex,
  getChordVoicings,
  getEditingWindowStart,
  getMaxEditingWindowStart,
  normalizeChordShape,
  setChordString,
  toggleChordFret,
} from "@/utils/chords";
import type { ChordShape, UserChord } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

interface ChordPickerProps {
  initialName?: string;
  initialShape?: ChordShape;
  saved?: UserChord[];
  onSubmit: (value: { name: string; shape: ChordShape }) => void;
  onSave?: (value: { id?: string; name: string; shape: ChordShape }) => void;
  onDeleteSaved?: (chordId: string) => void;
  onClear?: () => void;
}

/**
 * Forma de partida de un acorde nuevo: las seis cuerdas al aire, como una
 * guitarra de verdad. Las que no deban sonar se mutean con un clic.
 */
function openShape(): ChordShape {
  return normalizeChordShape({ frets: [0, 0, 0, 0, 0, 0] });
}

export function ChordPicker({
  initialName = "",
  initialShape,
  saved = [],
  onSubmit,
  onSave,
  onDeleteSaved,
  onClear,
}: ChordPickerProps) {
  const text = useI18nSection("repertoire");
  const [name, setName] = useState(initialName);
  const [manualShape, setManualShape] = useState<ChordShape | null>(
    initialShape ?? null,
  );
  const [voicingIndex, setVoicingIndex] = useState(0);
  const [finderOpen, setFinderOpen] = useState(false);
  const [windowStart, setWindowStart] = useState(() =>
    getEditingWindowStart(
      initialShape ?? getChordVoicings(initialName, saved)[0] ?? openShape(),
    ),
  );

  const savedMatch = findSavedChord(name, saved);
  const voicings = getChordVoicings(name, saved);
  const safeIndex = Math.min(
    voicingIndex,
    Math.max(0, voicings.length - 1),
  );
  const shape =
    manualShape ?? voicings[safeIndex] ?? openShape();
  /**
   * Posición que corresponde a la forma que se está viendo. No puede vivir en
   * el estado: al abrir un acorde guardado el índice empezaría en la primera y
   * el número no cuadraría con el dibujo. Si la forma es propia del usuario y
   * no coincide con ninguna, se conserva la última elegida.
   */
  const shownVoicing = findVoicingIndex(shape, voicings);
  const shownIndex = shownVoicing >= 0 ? shownVoicing : safeIndex;
  const maxWindowStart = getMaxEditingWindowStart();

  function resetVoicing() {
    setManualShape(null);
    setVoicingIndex(0);
  }

  function stepVoicing(delta: number) {
    if (voicings.length === 0) return;
    const base = Math.min(shownIndex, voicings.length - 1);
    const next = (base + delta + voicings.length) % voicings.length;
    setManualShape(null);
    setVoicingIndex(next);
    setWindowStart(getEditingWindowStart(voicings[next]));
  }

  /** Mueve la ventana de trastes sin tocar la forma dibujada. */
  function stepWindow(delta: number) {
    setWindowStart((current) =>
      Math.min(Math.max(1, current + delta), getMaxEditingWindowStart()),
    );
  }

  function handleNameChange(value: string) {
    setName(value);
    resetVoicing();
    setWindowStart(
      getEditingWindowStart(getChordVoicings(value, saved)[0] ?? openShape()),
    );
  }

  /**
   * Guarda la forma dibujada y, si las notas forman un acorde conocido, escribe
   * su nombre sin tocar la forma (a diferencia de escribir el nombre a mano).
   */
  function applyDrawnShape(next: ChordShape) {
    setManualShape(next);
    const detected = detectChordName(next.frets);
    if (detected) {
      setName(detected);
      setVoicingIndex(0);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">
        {text.chordPickerTitle}
      </p>

      <div className="relative mt-3">
        <input
          className="h-14 w-full rounded-md border border-line bg-canvas px-12 text-center font-sans text-2xl font-semibold tracking-tight text-ink transition-colors placeholder:text-muted/60 hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg"
          value={name}
          maxLength={12}
          placeholder={text.chordNamePlaceholder}
          aria-label={text.chordName}
          spellCheck={false}
          onChange={(event) => handleNameChange(event.target.value)}
        />
        <button
          type="button"
          title={text.chordFinderOpen}
          aria-label={text.chordFinderOpen}
          onClick={() => setFinderOpen(true)}
          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md border border-line text-muted transition hover:border-white/20 hover:text-ink"
        >
          <SearchIcon className="size-4" />
        </button>
      </div>
      {savedMatch && (
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.12em] text-accent-green-fg">
            {text.chordCustomTag}
          </span>
          {onDeleteSaved && (
            <button
              type="button"
              onClick={() => onDeleteSaved(savedMatch.id)}
              className="text-[11px] text-muted underline decoration-dotted underline-offset-2 transition hover:text-ink"
            >
              {text.deleteChord}
            </button>
          )}
        </div>
      )}

      <ChordFinderDialog
        open={finderOpen}
        selectedName={name}
        saved={saved}
        onPick={handleNameChange}
        onClose={() => setFinderOpen(false)}
      />

      {voicings.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
          <button
            type="button"
            aria-label={text.voicingPrevious}
            onClick={() => stepVoicing(-1)}
            className="flex size-6 items-center justify-center rounded border border-line transition hover:border-white/20 hover:text-ink"
          >
            ‹
          </button>
          <span>
            {text.voicingLabel} {shownIndex + 1}/{voicings.length}
          </span>
          <button
            type="button"
            aria-label={text.voicingNext}
            onClick={() => stepVoicing(1)}
            className="flex size-6 items-center justify-center rounded border border-line transition hover:border-white/20 hover:text-ink"
          >
            ›
          </button>
        </div>
      )}

      <div className="mt-2 flex items-center justify-center gap-1.5">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            title={text.fretWindowUp}
            aria-label={text.fretWindowUp}
            disabled={windowStart <= 1}
            onClick={() => stepWindow(-1)}
            className="flex size-6 items-center justify-center rounded border border-line text-[10px] text-muted transition hover:border-white/20 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          >
            ▲
          </button>
          <button
            type="button"
            title={text.fretWindowDown}
            aria-label={text.fretWindowDown}
            disabled={windowStart >= maxWindowStart}
            onClick={() => stepWindow(1)}
            className="flex size-6 items-center justify-center rounded border border-line text-[10px] text-muted transition hover:border-white/20 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          >
            ▼
          </button>
        </div>
        <FretboardDiagram
          shape={shape}
          fretWindow={{ start: windowStart, count: EDITING_WINDOW_SIZE }}
          interactive
          onToggleFret={(stringIndex, fret) =>
            applyDrawnShape(
              toggleChordFret(manualShape ?? shape, stringIndex, fret),
            )
          }
          onToggleOpen={(stringIndex) => {
            const current = manualShape ?? shape;
            applyDrawnShape(
              setChordString(
                current,
                stringIndex,
                current.frets[stringIndex] === 0 ? null : 0,
              ),
            );
          }}
        />
        <div aria-hidden className="w-6 shrink-0" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          size="field"
          onClick={() => onSubmit({ name: name.trim() || "?", shape })}
        >
          {text.assignChord}
        </Button>
        {onSave && (
          <Button
            type="button"
            size="field"
            onClick={() =>
              onSave({
                id: savedMatch?.id,
                name: name.trim() || "?",
                shape,
              })
            }
          >
            {text.saveChord}
          </Button>
        )}
        {onClear && (
          <Button type="button" size="field" onClick={onClear}>
            {text.clearChord}
          </Button>
        )}
      </div>
    </div>
  );
}

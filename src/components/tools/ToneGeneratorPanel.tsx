"use client";

import { useState } from "react";
import { AdjustableNumber } from "@/components/ui/AdjustableNumber";
import { Button } from "@/components/ui/Button";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { useToneGenerator } from "@/hooks/useToneGenerator";
import { getNoteFromFrequency } from "@/utils/tuner";
import { useI18nSection } from "@/i18n/I18nProvider";

const MIN_FREQUENCY = 20;
const MAX_FREQUENCY = 20_000;

const STEP_BUTTON =
  "inline-flex min-h-9 min-w-12 items-center justify-center rounded-md border border-line bg-canvas/40 px-2 font-mono text-xs tabular-nums text-ink transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60";

export function ToneGeneratorPanel() {
  const text = useI18nSection("tools");
  const [frequency, setFrequency] = useState(440);
  const [level, setLevel] = useState(0.5);
  const tone = useToneGenerator({ frequency, level });
  const note = getNoteFromFrequency(frequency);
  const errorMessage =
    tone.error === "unsupported" ? text.toneUnsupported
    : tone.error === "failed" ? text.toneFailed
    : null;

  function step(delta: number) {
    setFrequency((current) =>
      Math.min(MAX_FREQUENCY, Math.max(MIN_FREQUENCY, current + delta)),
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">
            {text.toneFrequency}
          </p>
          <AdjustableNumber
            value={frequency}
            min={MIN_FREQUENCY}
            max={MAX_FREQUENCY}
            step={1}
            unit="Hz"
            ariaLabel={text.toneFrequencyAria}
            onChange={setFrequency}
            className="mt-1 text-6xl leading-none sm:text-7xl"
          />
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              tone.isPlaying ?
                "border-accent-green-fg/30 bg-accent-green-bg text-accent-green-fg"
              : "border-line text-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${
                tone.isPlaying ? "animate-pulse bg-accent-green-fg" : "bg-muted"
              }`}
            />
            {tone.isPlaying ? text.tonePlaying : text.toneIdle}
          </span>
          <Button
            type="button"
            variant={tone.isPlaying ? "ghost" : "primary"}
            onClick={() => (tone.isPlaying ? tone.stop() : void tone.start())}
          >
            {tone.isPlaying ? text.toneStop : text.toneStart}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex flex-wrap items-baseline gap-2 text-sm text-muted">
          <span>{text.toneNote}:</span>
          <span className="font-mono text-lg text-ink">
            {note ? `${note.note}${note.octave}` : "—"}
          </span>
          {note && note.cents !== 0 && (
            <span className="font-mono text-xs tabular-nums">
              {note.cents > 0 ? "+" : ""}
              {note.cents} {text.tunerCents}
            </span>
          )}
        </p>

        <div
          role="group"
          aria-label={text.toneFrequencyAria}
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            aria-label={text.decrease10}
            onClick={() => step(-10)}
            className={STEP_BUTTON}
          >
            −10
          </button>
          <button
            type="button"
            aria-label={text.decrease1}
            onClick={() => step(-1)}
            className={STEP_BUTTON}
          >
            −1
          </button>
          <button
            type="button"
            aria-label={text.increase1}
            onClick={() => step(1)}
            className={STEP_BUTTON}
          >
            +1
          </button>
          <button
            type="button"
            aria-label={text.increase10}
            onClick={() => step(10)}
            className={STEP_BUTTON}
          >
            +10
          </button>
        </div>
      </div>

      <div className="text-xs text-muted">
        {text.toneLevel}
        <RangeSlider
          className="mt-3"
          min={0}
          max={1}
          step={0.01}
          value={level}
          ariaLabel={text.toneLevelAria}
          ariaValueText={`${Math.round(level * 100)}%`}
          onChange={setLevel}
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-300" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

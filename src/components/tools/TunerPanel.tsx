"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { TunerGauge } from "@/components/tools/TunerGauge";
import { useTuner } from "@/hooks/useTuner";
import {
  DEFAULT_A4_REFERENCE,
  DEFAULT_TUNING_PRESET_ID,
  MAX_A4_REFERENCE,
  MIN_A4_REFERENCE,
  TUNING_PRESETS,
  getTuningTargets,
} from "@/utils/tuner";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { Dict } from "@/i18n/dictionary";

const IN_TUNE_CENTS = 5;
const MAX_CENTS = 50;

const PRESET_LABEL_KEYS: Record<string, keyof Dict["tools"]> = {
  standard: "tuningStandard",
  "drop-d": "tuningDropD",
  "eb-standard": "tuningEbStandard",
  "open-g": "tuningOpenG",
  dadgad: "tuningDadgad",
};

export function TunerPanel({ active }: { active: boolean }) {
  const text = useI18nSection("tools");
  const [presetId, setPresetId] = useState(DEFAULT_TUNING_PRESET_ID);
  const [a4, setA4] = useState(DEFAULT_A4_REFERENCE);
  const tuner = useTuner(active, a4);
  const targets = getTuningTargets(presetId, a4);
  const note = tuner.note;
  const cents = note?.cents ?? 0;
  const isInTune = Boolean(note) && Math.abs(cents) <= IN_TUNE_CENTS;
  const deviation = Math.max(-MAX_CENTS, Math.min(MAX_CENTS, cents));
  const nearestTarget =
    tuner.detection ?
      targets.reduce<(typeof targets)[number] | null>(
        (nearest, target) =>
          !nearest ||
          Math.abs(target.frequency - (tuner.detection?.frequency ?? 0)) <
            Math.abs(nearest.frequency - (tuner.detection?.frequency ?? 0)) ?
            target
          : nearest,
        null,
      )
    : null;
  const statusLabel =
    note ?
      isInTune ? text.tunerInTune
      : cents < 0 ? text.tunerTooLow
      : text.tunerTooHigh
    : text.tunerNoSignal;
  const gaugeLabel =
    note ?
      `${text.tunerGaugeLabel}: ${note.note}${note.octave}, ${statusLabel}, ${cents > 0 ? "+" : ""}${cents} ${text.tunerCents}`
    : `${text.tunerGaugeLabel}: ${text.tunerNoSignal}`;
  const liveAnnouncement =
    note ? `${note.note}${note.octave}, ${statusLabel}` : text.tunerNoSignal;
  const [announcement, setAnnouncement] = useState(text.tunerNoSignal);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setAnnouncement(liveAnnouncement),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [liveAnnouncement]);
  const errorMessage =
    tuner.error === "permission" ? text.tunerPermission
    : tuner.error === "unsupported" ? text.tunerUnsupported
    : tuner.error === "insecure" ? text.tunerInsecure
    : tuner.error === "audio" ? text.tunerAudio
    : tuner.error === "failed" ? text.tunerFailed
    : null;

  function handleReference(value: string) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    setA4(Math.min(MAX_A4_REFERENCE, Math.max(MIN_A4_REFERENCE, Math.round(parsed))));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end">
        <div className="text-xs text-muted">
          {text.tunerPreset}
          <SelectField
            className="mt-1"
            value={presetId}
            ariaLabel={text.tunerPresetAria}
            onChange={setPresetId}
            options={TUNING_PRESETS.map((preset) => ({
              value: preset.id,
              label: text[PRESET_LABEL_KEYS[preset.id] ?? "tuningStandard"],
            }))}
          />
        </div>
        <label className="block text-xs text-muted">
          {text.tunerReference}
          <TextField
            className="mt-1"
            type="number"
            min={MIN_A4_REFERENCE}
            max={MAX_A4_REFERENCE}
            value={a4}
            aria-label={text.tunerReferenceAria}
            onChange={(event) => handleReference(event.target.value)}
          />
        </label>
        <Button
          type="button"
          variant={tuner.isListening ? "ghost" : "primary"}
          onClick={() => (tuner.isListening ? tuner.stop() : void tuner.start())}
          disabled={tuner.isStarting}
        >
          {tuner.isStarting ?
            text.tunerStarting
          : tuner.isListening ? text.tunerStop
          : text.tunerStart}
        </Button>
      </div>

      <div className="rounded-xl border border-line bg-canvas/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">
            {text.tunerDetected}
          </p>
          <span
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              tuner.isListening ?
                "border-accent-green-fg/30 bg-accent-green-bg text-accent-green-fg"
              : "border-line text-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${
                tuner.isListening ? "animate-pulse bg-accent-green-fg" : "bg-muted"
              }`}
            />
            {tuner.isStarting ?
              text.tunerStarting
            : tuner.isListening ?
              text.tunerListening
            : text.tunerIdle}
          </span>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center">
          <div className="text-center sm:text-left">
            <p
              aria-hidden="true"
              className={`font-mono text-7xl leading-none tabular-nums sm:text-8xl ${
                note ? "text-ink" : "text-muted"
              }`}
            >
              {note ? `${note.note}${note.octave}` : "—"}
            </p>
            <div className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 sm:justify-start">
              <span
                className={`text-sm font-medium ${
                  isInTune ? "text-accent-green-fg" : "text-ink"
                }`}
              >
                {statusLabel}
              </span>
              <span className="font-mono text-sm tabular-nums text-muted">
                {note ? `${cents > 0 ? "+" : ""}${cents} ${text.tunerCents}` : "—"}
              </span>
              {tuner.detection && (
                <span className="font-mono text-xs tabular-nums text-muted">
                  {tuner.detection.frequency.toFixed(2)} Hz
                </span>
              )}
            </div>
          </div>

          <TunerGauge
            cents={note ? deviation : 0}
            label={gaugeLabel}
            tone={!note ? "idle" : isInTune ? "in-tune" : "off"}
          />
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-300" role="alert">
          {errorMessage}
        </p>
      )}

      <section aria-label={text.tunerTargetsAria}>
        <h3 className="text-xs uppercase tracking-[0.08em] text-muted">
          {text.tunerStrings}
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {targets.map((target, index) => {
            const isNearest =
              nearestTarget?.note === target.note &&
              nearestTarget?.octave === target.octave &&
              nearestTarget?.frequency === target.frequency;

            return (
              <li key={`${target.note}${target.octave}-${index}`}>
                <span
                  aria-current={isNearest ? "true" : undefined}
                  className={`inline-flex min-w-20 flex-col items-center rounded-lg border px-3 py-2 ${
                    isNearest ?
                      "border-accent-green-fg/50 bg-accent-green-bg/30 text-accent-green-fg"
                    : "border-line bg-canvas/40 text-muted"
                  }`}
                >
                  <span className="font-mono text-sm text-ink">
                    {target.note}
                    {target.octave}
                  </span>
                  <span className="mt-0.5 font-mono text-[10px] tabular-nums">
                    {target.frequency.toFixed(1)} Hz
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

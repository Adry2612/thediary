"use client";

import { useId, useRef, useState } from "react";
import { AdjustableNumber } from "@/components/ui/AdjustableNumber";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { SelectField } from "@/components/ui/SelectField";
import { SubdivisionNotation } from "@/components/practice/SubdivisionNotation";
import { useDialogModal } from "@/hooks/useDialogModal";
import { MAX_BPM, MIN_BPM } from "@/utils/metronome-tempo";
import {
  getMetronomeMeter,
  getMetronomeSubdivisionOptions,
  isMetronomeMeterSignature,
  METRONOME_METERS,
} from "@/utils/metronome-meter";
import {
  isTempoRampIntervalUnit,
  MAX_TEMPO_RAMP_INTERVAL_BY_UNIT,
} from "@/utils/metronome-tempo-ramp";
import {
  METRONOME_VOICES,
  normalizeMetronomeVoice,
  type MetronomeVoice,
} from "@/utils/metronome-voice";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { MetronomeSettingsProps } from "@/types/metronome";

/** Clave de traducción de cada voz del catálogo. */
const VOICE_LABEL_KEYS: Record<MetronomeVoice, string> = {
  studio: "voiceStudio",
  wood: "voiceWood",
  bell: "voiceBell",
  hihat: "voiceHihat",
  beep: "voiceBeep",
  rimshot: "voiceRimshot",
  shaker: "voiceShaker",
};

export function MetronomeSettings({
  subdivision,
  volume,
  meterSignature,
  tempoRamp,
  voice,
  setSubdivision,
  setVolume,
  setMeterSignature,
  setTempoRamp,
  setVoice,
}: MetronomeSettingsProps) {
  const text = useI18nSection("metronome");
  const [isOpen, setIsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const { dialogRef: settingsDialogRef, handleCancel, isClosing } = useDialogModal(
    isOpen,
    () => setIsOpen(false),
  );
  const subdivisionGroupId = useId();
  const meter = getMetronomeMeter(meterSignature);
  const subdivisionOptions = getMetronomeSubdivisionOptions(meter);
  const voiceOptions = METRONOME_VOICES.map((option) => ({
    value: option,
    label: text[VOICE_LABEL_KEYS[option]],
  }));
  const tempoRampIntervalOptions = [
    { value: "bars", label: text.meter },
    { value: "seconds", label: "Seg." },
    { value: "minutes", label: "Min." },
  ];

  return (
    <>
      <button
        ref={settingsButtonRef}
        type="button"
        onClick={() => setIsOpen(true)}
         aria-label={text.settingsAria}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex size-11 items-center justify-center border border-line text-muted transition hover:bg-white/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/60"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="m19.4 15 .05.05a1.85 1.85 0 1 1-2.62 2.62l-.05-.05a1.83 1.83 0 0 0-3.12 1.3v.15a1.85 1.85 0 1 1-3.7 0v-.08a1.83 1.83 0 0 0-3.12-1.3l-.05.05a1.85 1.85 0 1 1-2.62-2.62l.05-.05a1.83 1.83 0 0 0-1.3-3.12h-.15a1.85 1.85 0 1 1 0-3.7h.08a1.83 1.83 0 0 0 1.3-3.12l-.05-.05a1.85 1.85 0 1 1 2.62-2.62l.05.05a1.83 1.83 0 0 0 3.12-1.3v-.15a1.85 1.85 0 1 1 3.7 0v.08a1.83 1.83 0 0 0 3.12 1.3l.05-.05a1.85 1.85 0 1 1 2.62 2.62l-.05.05a1.83 1.83 0 0 0 1.3 3.12h.15a1.85 1.85 0 1 1 0 3.7h-.08a1.83 1.83 0 0 0-1.3 3.12Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <dialog
        ref={settingsDialogRef}
        aria-labelledby="metronome-settings-title"
        data-closing={isClosing ? "true" : undefined}
        onCancel={handleCancel}
        onClose={() => {
          setIsOpen(false);
          settingsButtonRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === settingsDialogRef.current) {
            setIsOpen(false);
          }
        }}
        className="overlay-motion fixed inset-0 m-auto max-h-[calc(100dvh-1rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-[min(100%-1rem,36rem)] overflow-x-hidden overflow-y-auto overscroll-contain border border-line bg-surface p-0 text-ink backdrop:bg-black/70 sm:max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:w-[min(100%-2rem,36rem)]"
      >
        <div className="p-4 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.05em] text-muted">
                 {text.title}
              </p>
              <h2
                id="metronome-settings-title"
                className="mt-2 break-words font-sans text-3xl font-semibold leading-tight"
              >
                 {text.settings}
              </h2>
            </div>
            <button
              type="button"
              autoFocus
              onClick={() => setIsOpen(false)}
               aria-label={text.closeSettings}
              className="flex size-11 items-center justify-center border border-line text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/60"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="mt-8">
             <div className="text-sm text-muted">{text.meter}</div>
            <SelectField
              className="mt-2"
               ariaLabel={text.meterAria}
              value={meterSignature}
              onChange={(value) => {
                if (isMetronomeMeterSignature(value)) setMeterSignature(value);
              }}
              options={METRONOME_METERS.map(({ signature }) => ({
                value: signature,
                label: signature,
              }))}
            />
          </div>

          <div className="mt-6">
             <div className="text-sm text-muted">{text.voice}</div>
            <SelectField
              className="mt-2"
               ariaLabel={text.voiceAria}
              value={voice}
              onChange={(value) => setVoice(normalizeMetronomeVoice(value))}
              options={voiceOptions}
            />
          </div>

          <div className="mt-6">
            <fieldset>
               <legend className="text-sm text-muted">{text.subdivision}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group">
                {subdivisionOptions.map((option) => (
                  <label key={option.value} className="group min-w-0">
                    <input
                      type="radio"
                      name={`subdivision-${subdivisionGroupId}`}
                      value={option.value}
                      checked={subdivision === option.value}
                      onChange={() => setSubdivision(option.value)}
                      aria-label={option.label}
                      className="peer sr-only"
                    />
                      <span className="flex min-h-24 min-w-0 flex-col items-center justify-center gap-1 border border-line px-2 py-2 text-center text-xs leading-tight text-muted transition-colors hover:bg-white/[0.04] peer-checked:border-accent-green-fg/60 peer-checked:bg-accent-green-bg/30 peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent-green-fg">
                      <SubdivisionNotation
                        subdivision={option.value}
                        isDotted={
                          meter.beatDurationQuarterNotes !== 1 &&
                          option.value === 1
                        }
                        isHalfNote={
                          meter.beatDurationQuarterNotes === 3 &&
                          option.value === 1
                        }
                        isTuplet={option.isTuplet}
                      />
                       <span className="max-w-full whitespace-normal break-words leading-tight">{option.shortLabel}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>


          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
               <span className="text-muted">{text.volume}</span>
              <span className="font-mono text-xs text-muted">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <RangeSlider
              min={0}
              max={1}
              step={0.01}
              value={volume}
               ariaLabel={text.volumeAria}
              ariaValueText={`${Math.round(volume * 100)}%`}
              onChange={setVolume}
              className="mt-2"
            />
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={tempoRamp.enabled}
                onChange={(event) =>
                  setTempoRamp({
                    ...tempoRamp,
                    enabled: event.target.checked,
                  })
                }
                className="size-4 accent-accent-green-fg"
              />
               <span>{text.ramp}</span>
            </label>
            <p className="mt-1 text-xs leading-5 text-muted">
               {text.rampDescription}
            </p>

            {tempoRamp.enabled && (
              <div className="mt-5">
                <div className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] items-end gap-2">
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wide text-muted">
                       {text.each}
                    </span>
                    <AdjustableNumber
                      value={tempoRamp.intervalValue}
                      min={1}
                      max={MAX_TEMPO_RAMP_INTERVAL_BY_UNIT[tempoRamp.intervalUnit]}
                       ariaLabel={text.intervalAria}
                      className="mt-1 text-lg text-ink"
                      onChange={(intervalValue) =>
                        setTempoRamp({ ...tempoRamp, intervalValue })
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wide text-muted">
                       {text.unit}
                    </span>
                    <SelectField
                      className="mt-1"
                       ariaLabel={text.unitAria}
                      value={tempoRamp.intervalUnit}
                      onChange={(value) => {
                        if (!isTempoRampIntervalUnit(value)) return;
                        setTempoRamp({
                          ...tempoRamp,
                          intervalUnit: value,
                        });
                      }}
                       options={tempoRampIntervalOptions}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wide text-muted">
                       {text.increment}
                    </span>
                    <AdjustableNumber
                      value={tempoRamp.incrementBpm}
                      min={1}
                      max={20}
                       ariaLabel={text.incrementAria}
                      className="mt-1 text-lg text-ink"
                      onChange={(incrementBpm) =>
                        setTempoRamp({ ...tempoRamp, incrementBpm })
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wide text-muted">
                       {text.maximum}
                    </span>
                    <AdjustableNumber
                      value={tempoRamp.maximumBpm}
                      min={MIN_BPM}
                      max={MAX_BPM}
                       ariaLabel={text.maximumAria}
                      className="mt-1 text-lg text-ink"
                      onChange={(maximumBpm) =>
                        setTempoRamp({ ...tempoRamp, maximumBpm })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

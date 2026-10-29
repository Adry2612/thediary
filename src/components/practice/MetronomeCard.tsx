"use client";

import { useEffect } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdjustableNumber } from "@/components/ui/AdjustableNumber";
import { MetronomeSettings } from "@/components/practice/MetronomeSettings";
import { MetronomeTempoSlider } from "@/components/practice/MetronomeTempoSlider";
import { MAX_BPM, MIN_BPM, useMetronome } from "@/hooks/useMetronome";
import { getMetronomeMeter } from "@/utils/metronome-meter";
import { getBeatState } from "@/utils/metronome-beat-pattern";
import { useI18nSection } from "@/i18n/I18nProvider";

type MetronomeCardProps = {
  variant?: "default" | "large" | "block";
  onBpmChange?: (bpm: number) => void;
  stopOnUnmount?: boolean;
  compact?: boolean;
};

export function MetronomeCard({
  variant = "default",
  onBpmChange,
  stopOnUnmount = true,
  compact = false,
}: MetronomeCardProps) {
  const isLarge = variant === "large" || variant === "block";
  const isBlock = variant === "block";
  const text = useI18nSection("metronome");
  const {
    audioError,
    activeBeat,
    activeSubdivision,
    bpm,
    isPulsing,
    isRunning,
    isStarting,
    setBpm,
    setMeterSignature,
    setSubdivision,
    setTempoRamp,
    setVolume,
    start,
    stop,
    tapCount,
    tapTempo,
    volume,
    subdivision,
    meterSignature,
    tempoRamp,
    voice,
    setVoice,
    beatPattern,
    cycleBeat,
    toggleBeatMute,
  } = useMetronome();
  const meter = getMetronomeMeter(meterSignature);
  function handleBeatKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    beat: number,
  ) {
    if (event.key === "m" || event.key === "M") {
      event.preventDefault();
      toggleBeatMute(beat);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cycleBeat(beat);
    }
  }

  useEffect(() => {
    onBpmChange?.(bpm);
  }, [bpm, onBpmChange]);

  useEffect(() => {
    if (!stopOnUnmount) return;
    return () => stop();
  }, [stop, stopOnUnmount]);

  return (
    <Card
      bare={isBlock}
      className={`enter ${isBlock ? "" : isLarge ? "mx-auto w-full max-w-3xl p-8 sm:p-12" : compact ? "p-5 sm:p-6" : ""}`}
      style={{ "--index": 1 } as CSSProperties}
    >
      {isBlock ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full bg-accent-green-fg transition duration-100 ${
                isPulsing ? "scale-100 opacity-100" : "scale-75 opacity-35"
              }`}
            />
            <span>
              {isRunning ? `${text.active} · ${meterSignature}` : meterSignature}
            </span>
          </div>
          <MetronomeSettings
            subdivision={subdivision}
            volume={volume}
            meterSignature={meterSignature}
            tempoRamp={tempoRamp}
            voice={voice}
            setSubdivision={setSubdivision}
            setVolume={setVolume}
            setMeterSignature={setMeterSignature}
            setTempoRamp={setTempoRamp}
            setVoice={setVoice}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm uppercase tracking-[0.05em] text-muted">
               {text.title}
            </h2>
            <div className="mt-1 flex items-center gap-2 font-mono text-xs text-muted">
              <span
                aria-hidden="true"
                className={`size-2 rounded-full bg-accent-green-fg transition duration-100 ${
                  isPulsing ? "scale-100 opacity-100" : "scale-75 opacity-35"
                }`}
              />
               <span>{isRunning ? `${text.active} · ${meterSignature}` : meterSignature}</span>
            </div>
          </div>
          <MetronomeSettings
            subdivision={subdivision}
            volume={volume}
            meterSignature={meterSignature}
            tempoRamp={tempoRamp}
            voice={voice}
            setSubdivision={setSubdivision}
            setVolume={setVolume}
            setMeterSignature={setMeterSignature}
            setTempoRamp={setTempoRamp}
            setVoice={setVoice}
          />
        </div>
      )}

      <div
        data-tour-target={isLarge ? "metronome-controls" : undefined}
        className={
          isBlock ? "mt-6" : isLarge ? "mt-10 sm:mt-14" : compact ? "mt-5" : "mt-8"
        }
      >
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={() => setBpm(bpm - 1)}
             aria-label={text.decreaseBpm}
            disabled={bpm <= MIN_BPM}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 8h10" stroke="currentColor" strokeWidth="1.75" />
            </svg>
          </Button>

          <div className="text-center">
            <AdjustableNumber
              value={bpm}
              min={MIN_BPM}
              max={MAX_BPM}
               ariaLabel={text.bpmAria}
              onChange={setBpm}
              className={`w-full text-ink ${
                isLarge
                  ? "text-7xl leading-none sm:text-8xl"
                : compact ? "text-3xl leading-[1.4] sm:text-4xl" : "text-4xl leading-[1.5] sm:text-5xl"
              }`}
            />
            <p className="font-mono text-xs uppercase tracking-[0.05em] text-muted">
              bpm
            </p>
          </div>

          <Button
            onClick={() => setBpm(bpm + 1)}
             aria-label={text.increaseBpm}
            disabled={bpm >= MAX_BPM}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M3 8h10M8 3v10"
                stroke="currentColor"
                strokeWidth="1.75"
              />
            </svg>
          </Button>
        </div>

        <div
          className="mt-6 flex flex-wrap justify-center gap-2"
           aria-label={`${text.beats} ${meterSignature}`}
          role="group"
        >
          <p className="sr-only">{text.beatPatternHint}</p>
          {Array.from({ length: meter.beatsPerMeasure }, (_, beat) => {
            const beatState = getBeatState(beatPattern, beat);
            const stateLabel =
              beatState === "accent" ? text.beatStateAccent
              : beatState === "accentClosed" ? text.beatStateClosed
              : beatState === "muted" ? text.beatStateMuted
              : text.beatStateNormal;
            const isActiveBeat = activeBeat === beat;
            const dotShape =
              beatState === "accent" ? "size-3.5 bg-accent-green-fg"
              : beatState === "accentClosed" ?
                "size-3.5 bg-accent-green-fg/40 ring-1 ring-accent-green-fg"
              : beatState === "muted" ?
                "size-3 border border-white/40 bg-transparent"
              : "size-3 bg-white/15";
            const isHighlighted = isPulsing && isActiveBeat;

            return (
            <div
              key={beat}
              className="flex flex-col items-center gap-2"
              style={{ flex: "0 0 calc((100% - 1.5rem) / 4)" }}
            >
              <button
                type="button"
                aria-label={`${text.beat} ${beat + 1}, ${stateLabel}${isActiveBeat ? `, ${text.activeBeat}` : ""}`}
                title={text.beatPatternHint}
                style={{ touchAction: "manipulation" }}
                onClick={() => cycleBeat(beat)}
                onKeyDown={(event) => handleBeatKeyDown(event, beat)}
                className="flex size-7 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
              >
                <span
                  aria-hidden="true"
                  className={`relative flex items-center justify-center rounded-full transition duration-100 ${dotShape} ${
                    isActiveBeat ? "scale-110 opacity-100" : "opacity-70"
                  } ${isHighlighted ? "ring-4 ring-accent-green-bg" : ""}`}
                >
                  {beatState === "muted" && (
                    <span className="absolute h-px w-4 rotate-45 bg-muted" />
                  )}
                </span>
              </button>
              <span className="flex h-2.5 items-center gap-1" aria-hidden="true">
                {Array.from({ length: subdivision }, (_, subBeat) => (
                  <span
                    key={subBeat}
                    className={`size-1 rounded-full transition-colors ${
                      activeBeat === beat && activeSubdivision === subBeat
                        ? "bg-accent-green-fg"
                        : "bg-white/15"
                    }`}
                  />
                ))}
              </span>
              <span className="font-mono text-[10px] text-muted">
                {beat + 1}
              </span>
            </div>
            );
          })}
        </div>

        <MetronomeTempoSlider value={bpm} onChange={setBpm} />
      </div>

      <Button
        variant={isRunning ? "ghost" : "primary"}
        onClick={() => void (isRunning ? stop() : start())}
        disabled={isStarting}
        className={`mt-7 w-full ${
          isRunning
            ? "border-red-500/50 bg-red-950/50 text-red-300 hover:bg-red-950/80 hover:text-red-200 focus-visible:outline-red-400"
            : ""
        }`}
      >
        {isStarting
           ? text.startAudio
          : isRunning
             ? text.stop
             : text.start}
      </Button>
      {audioError && (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {audioError}
        </p>
      )}

      <Button onClick={tapTempo} className="mt-5 w-full">
         {text.tapTempo}
      </Button>
      <p className="mt-2 text-center text-xs text-muted" aria-live="polite">
        {tapCount === 0
           ? text.tapHint
           : tapCount === 1
             ? text.tapRegistered
             : `${tapCount} ${text.tapsUpdated}`}
      </p>
    </Card>
  );
}

"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdjustableNumber } from "@/components/ui/AdjustableNumber";
import { MetronomeSettings } from "@/components/practice/MetronomeSettings";
import { MetronomeTempoSlider } from "@/components/practice/MetronomeTempoSlider";
import { MAX_BPM, MIN_BPM, useMetronome } from "@/hooks/useMetronome";
import { getMetronomeMeter } from "@/lib/metronome-meter";

type MetronomeCardProps = {
  variant?: "default" | "large";
  onBpmChange?: (bpm: number) => void;
  stopOnUnmount?: boolean;
};

export function MetronomeCard({
  variant = "default",
  onBpmChange,
  stopOnUnmount = true,
}: MetronomeCardProps) {
  const isLarge = variant === "large";
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
  } = useMetronome();
  const meter = getMetronomeMeter(meterSignature);

  useEffect(() => {
    onBpmChange?.(bpm);
  }, [bpm, onBpmChange]);

  useEffect(() => {
    if (!stopOnUnmount) return;
    return () => stop();
  }, [stop, stopOnUnmount]);

  return (
    <Card
      className={`enter ${isLarge ? "mx-auto w-full max-w-3xl p-8 sm:p-12" : ""}`}
      style={{ "--index": 1 } as CSSProperties}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm uppercase tracking-[0.05em] text-muted">
            Metrónomo
          </h3>
          <div className="mt-1 flex items-center gap-2 font-mono text-xs text-muted">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full bg-accent-green-fg transition duration-100 ${
                isPulsing ? "scale-100 opacity-100" : "scale-75 opacity-35"
              }`}
            />
            <span>{isRunning ? `Activo · ${meterSignature}` : meterSignature}</span>
          </div>
        </div>
        <MetronomeSettings
          subdivision={subdivision}
          volume={volume}
          meterSignature={meterSignature}
          tempoRamp={tempoRamp}
          setSubdivision={setSubdivision}
          setVolume={setVolume}
          setMeterSignature={setMeterSignature}
          setTempoRamp={setTempoRamp}
        />
      </div>

      <div
        data-tour-target={isLarge ? "metronome-controls" : undefined}
        className={isLarge ? "mt-10 sm:mt-14" : "mt-8"}
      >
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={() => setBpm(bpm - 1)}
            aria-label="Bajar un BPM"
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
              ariaLabel="Tempo en BPM"
              onChange={setBpm}
              className={`w-full text-ink ${
                isLarge
                  ? "text-7xl leading-none sm:text-8xl"
                  : "text-4xl leading-[1.5] sm:text-5xl"
              }`}
            />
            <p className="font-mono text-xs uppercase tracking-[0.05em] text-muted">
              bpm
            </p>
          </div>

          <Button
            onClick={() => setBpm(bpm + 1)}
            aria-label="Subir un BPM"
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
          className="mt-6 grid grid-cols-4 gap-2"
          aria-label={`Pulsos del compás ${meterSignature}`}
          role="group"
        >
          {Array.from({ length: meter.beatsPerMeasure }, (_, beat) => (
            <div key={beat} className="flex flex-col items-center gap-2">
              <span
                aria-label={`Pulso ${beat + 1}${activeBeat === beat ? ", activo" : ""}`}
                className={`size-3 rounded-full transition duration-100 ${
                  activeBeat === beat
                    ? "scale-110 bg-accent-green-fg opacity-100"
                    : "bg-white/15 opacity-70"
                } ${isPulsing && activeBeat === beat ? "ring-4 ring-accent-green-bg" : ""}`}
              />
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
          ))}
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
          ? "Activando audio…"
          : isRunning
            ? "Detener metrónomo"
            : "Iniciar metrónomo"}
      </Button>
      {audioError && (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {audioError}
        </p>
      )}

      <Button onClick={tapTempo} className="mt-5 w-full">
        Tap tempo
      </Button>
      <p className="mt-2 text-center text-xs text-muted" aria-live="polite">
        {tapCount === 0
          ? "Toca al pulso para ajustar el tempo"
          : tapCount === 1
            ? "Un toque registrado; continúa tocando"
            : `${tapCount} toques · tempo actualizado`}
      </p>
    </Card>
  );
}

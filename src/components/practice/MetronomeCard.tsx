"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MAX_BPM, MIN_BPM, useMetronome } from "@/hooks/useMetronome";

const SUBDIVISIONS = [
  { value: 1, label: "Negras", notation: "1/4" },
  { value: 2, label: "Corcheas", notation: "1/8" },
  { value: 3, label: "Tresillos", notation: "1/8T" },
  { value: 4, label: "Semicorcheas", notation: "1/16" },
];

type MetronomeCardProps = {
  initialBpm?: number;
  onBpmChange?: (bpm: number) => void;
};

export function MetronomeCard({
  initialBpm = 80,
  onBpmChange,
}: MetronomeCardProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsDialogRef = useRef<HTMLDialogElement>(null);
  const {
    audioError,
    activeBeat,
    activeSubdivision,
    bpm,
    isPulsing,
    isRunning,
    isStarting,
    setBpm,
    setSubdivision,
    setVolume,
    start,
    stop,
    tapCount,
    tapTempo,
    volume,
    subdivision,
  } = useMetronome(initialBpm);

  useEffect(() => {
    onBpmChange?.(bpm);
  }, [bpm, onBpmChange]);

  useEffect(() => {
    const dialog = settingsDialogRef.current;
    if (!dialog) return;
    if (isSettingsOpen && !dialog.open) dialog.showModal();
    if (!isSettingsOpen && dialog.open) dialog.close();
  }, [isSettingsOpen]);

  return (
    <Card className="enter" style={{ "--index": 1 } as CSSProperties}>
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
            <span>{isRunning ? "Activo" : "4/4"}</span>
          </div>
        </div>
        <button
          ref={settingsButtonRef}
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Ajustes del metrónomo"
          aria-haspopup="dialog"
          aria-expanded={isSettingsOpen}
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
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
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
          <p className="font-mono text-6xl tabular-nums">{bpm}</p>
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
        aria-label="Pulsos del compás 4/4"
        role="group"
      >
        {Array.from({ length: 4 }, (_, beat) => (
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
            <span className="font-mono text-[10px] text-muted">{beat + 1}</span>
          </div>
        ))}
      </div>

      <input
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        value={bpm}
        onChange={(event) => setBpm(Number(event.target.value))}
        aria-label="Tempo en BPM"
        className="mt-8 w-full accent-ink"
      />

      <Button
        onClick={tapTempo}
        className="mt-7 w-full"
      >
        Tap tempo
      </Button>
      <p className="mt-2 text-center text-xs text-muted" aria-live="polite">
        {tapCount === 0
          ? "Toca al pulso para ajustar el tempo"
          : tapCount === 1
            ? "Un toque registrado; continúa tocando"
            : `${tapCount} toques · tempo actualizado`}
      </p>

      <Button
        variant={isRunning ? "ghost" : "primary"}
        onClick={() => void (isRunning ? stop() : start())}
        disabled={isStarting}
        className="mt-5 w-full"
      >
        {isStarting
          ? "Activando audio…"
          : isRunning
            ? "Detener metrónomo"
            : "Iniciar metrónomo"}
      </Button>
      {audioError && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {audioError}
        </p>
      )}
      <dialog
        ref={settingsDialogRef}
        aria-labelledby="metronome-settings-title"
        onCancel={(event) => {
          event.preventDefault();
          setIsSettingsOpen(false);
        }}
        onClose={() => {
          setIsSettingsOpen(false);
          settingsButtonRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === settingsDialogRef.current) {
            setIsSettingsOpen(false);
          }
        }}
        className="fixed inset-0 m-auto max-h-[90vh] w-[min(100%-2rem,28rem)] overflow-y-auto border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.05em] text-muted">
                Metrónomo
              </p>
              <h2
                id="metronome-settings-title"
                className="mt-2 font-serif text-3xl"
              >
                Ajustes
              </h2>
            </div>
            <button
              type="button"
              autoFocus
              onClick={() => setIsSettingsOpen(false)}
              aria-label="Cerrar ajustes"
              className="flex size-11 items-center justify-center border border-line text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/60"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="mt-8">
            <label htmlFor="metronome-subdivision" className="text-sm text-muted">
              Subdivisión
            </label>
            <select
              id="metronome-subdivision"
              value={subdivision}
              onChange={(event) => setSubdivision(Number(event.target.value))}
              className="mt-2 h-12 w-full border border-line bg-canvas px-4 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
            >
              {SUBDIVISIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label} · {item.notation}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="metronome-volume" className="text-muted">
                Volumen
              </label>
              <span className="font-mono text-xs text-muted">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              id="metronome-volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Volumen del metrónomo"
              className="mt-3 w-full accent-ink"
            />
          </div>
        </div>
      </dialog>
    </Card>
  );
}

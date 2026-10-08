"use client";

import { useEffect, useRef, useState } from "react";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { SelectField } from "@/components/ui/SelectField";

const SUBDIVISIONS = [
  { value: 1, label: "Negras", notation: "1/4" },
  { value: 2, label: "Corcheas", notation: "1/8" },
  { value: 3, label: "Tresillos", notation: "1/8T" },
  { value: 4, label: "Semicorcheas", notation: "1/16" },
];

interface MetronomeSettingsProps {
  subdivision: number;
  volume: number;
  setSubdivision: (subdivision: number) => void;
  setVolume: (volume: number) => void;
}

export function MetronomeSettings({
  subdivision,
  volume,
  setSubdivision,
  setVolume,
}: MetronomeSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = settingsDialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <>
      <button
        ref={settingsButtonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Ajustes del metrónomo"
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
        onCancel={(event) => {
          event.preventDefault();
          setIsOpen(false);
        }}
        onClose={() => {
          setIsOpen(false);
          settingsButtonRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === settingsDialogRef.current) {
            setIsOpen(false);
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
                className="mt-2 font-sans text-3xl font-semibold"
              >
                Ajustes
              </h2>
            </div>
            <button
              type="button"
              autoFocus
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar ajustes"
              className="flex size-11 items-center justify-center border border-line text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/60"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="mt-8">
            <div className="text-sm text-muted">Subdivisión</div>
            <SelectField
              className="mt-2"
              ariaLabel="Subdivisión del metrónomo"
              value={String(subdivision)}
              onChange={(value) => setSubdivision(Number(value))}
              options={SUBDIVISIONS.map((item) => ({
                value: String(item.value),
                label: `${item.label} · ${item.notation}`,
              }))}
            />
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Volumen</span>
              <span className="font-mono text-xs text-muted">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <RangeSlider
              min={0}
              max={1}
              step={0.01}
              value={volume}
              ariaLabel="Volumen del metrónomo"
              ariaValueText={`${Math.round(volume * 100)}%`}
              onChange={setVolume}
              className="mt-2"
            />
          </div>
        </div>
      </dialog>
    </>
  );
}

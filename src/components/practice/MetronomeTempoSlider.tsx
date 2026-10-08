"use client";

import { RangeSlider } from "@/components/ui/RangeSlider";
import {
  getMetronomeScaleZone,
  getTempoMarking,
  METRONOME_SCALE_ZONE_COLORS,
} from "@/lib/metronome-scale";
import { MAX_BPM, MIN_BPM } from "@/hooks/useMetronome";

const TICK_COUNT = 49;

export function MetronomeTempoSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const tempoMarking = getTempoMarking(value);
  const zone = getMetronomeScaleZone(
    (value - MIN_BPM) / (MAX_BPM - MIN_BPM),
  );
  const markingColor = METRONOME_SCALE_ZONE_COLORS[zone];

  return (
    <div className="mt-5">
      <div className="mb-1 text-center" aria-live="polite" aria-atomic="true">
        <span
          key={tempoMarking.name}
          className="number-value-change text-sm font-semibold"
          style={{ color: markingColor }}
        >
          {tempoMarking.name}
        </span>
      </div>
      <RangeSlider
        min={MIN_BPM}
        max={MAX_BPM}
        value={value}
        ariaLabel="Tempo en BPM"
        ariaValueText={`${value} BPM, ${tempoMarking.name}`}
        onChange={onChange}
        renderVisuals={(progress) => (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between"
            >
              {Array.from({ length: TICK_COUNT }, (_, index) => {
                const position = index / (TICK_COUNT - 1);
                const tickZone = getMetronomeScaleZone(position);
                return (
                  <span
                    key={index}
                    className="h-5 w-[2px] rounded-[1px]"
                    style={{
                      backgroundColor: METRONOME_SCALE_ZONE_COLORS[tickZone],
                    }}
                  />
                );
              })}
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 h-8 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-accent-green-fg"
              style={{ left: `${progress}%` }}
            />
          </>
        )}
      />
      <div className="flex justify-between text-xs text-muted">
        <span>Lento</span>
        <span className="text-accent-green-fg">Medio</span>
        <span>Rápido</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  DELAY_BASE_DIVISIONS,
  DELAY_VARIANTS,
  formatDelayMilliseconds,
  getBeatMilliseconds,
  getDelayDivisions,
  MAX_DELAY_BPM,
  MIN_DELAY_BPM,
} from "@/utils/delay-calculator";
import { useI18nSection } from "@/i18n/I18nProvider";

const VARIANT_LABEL_KEYS = {
  plain: "calculatorPlain",
  dotted: "calculatorDotted",
  triplet: "calculatorTriplet",
} as const;

const STEP_BUTTON =
  "inline-flex min-h-9 min-w-12 items-center justify-center rounded-md border border-line bg-canvas/40 px-2 font-mono text-xs tabular-nums text-ink transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60";

export function DelayCalculatorPanel() {
  const text = useI18nSection("tools");
  const [bpmInput, setBpmInput] = useState("120");
  const bpm = Number(bpmInput);
  const beatMilliseconds = getBeatMilliseconds(bpm);
  const divisions = getDelayDivisions(bpm);

  function step(delta: number) {
    const current = bpmInput.trim() === "" ? 120 : Number(bpmInput);
    const base = Number.isFinite(current) ? current : 120;
    setBpmInput(
      String(Math.min(MAX_DELAY_BPM, Math.max(MIN_DELAY_BPM, base + delta))),
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="block text-xs text-muted">
          {text.calculatorBpm}
          <span className="mt-1 flex items-baseline gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={bpmInput}
              aria-label={text.calculatorBpmAria}
              onChange={(event) =>
                setBpmInput(
                  event.currentTarget.value.replace(/\D/g, "").slice(0, 3),
                )
              }
              className="w-[3.2ch] min-w-0 border-0 border-b border-transparent bg-transparent p-0 text-center font-mono text-6xl leading-none tabular-nums text-ink outline-none transition-colors focus:border-accent-green-fg sm:text-7xl"
            />
            <span className="font-mono text-sm uppercase tracking-[0.08em] text-muted">
              bpm
            </span>
          </span>
        </label>

        <div
          role="group"
          aria-label={text.calculatorBpmAria}
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

      {beatMilliseconds !== null && (
        <p className="text-sm text-muted">
          {text.calculatorBeat}:{" "}
          <span className="font-mono text-2xl tabular-nums text-ink">
            {formatDelayMilliseconds(beatMilliseconds)}
          </span>{" "}
          {text.calculatorMilliseconds}
        </p>
      )}

      {divisions === null ? (
        <p className="text-sm text-red-300" role="alert">
          {text.calculatorInvalid}
        </p>
      ) : (
        <section aria-label={text.calculatorResults}>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas/70">
                <tr className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                  <th scope="col" className="px-4 py-3 font-normal">
                    {text.calculatorResults}
                  </th>
                  {DELAY_VARIANTS.map((variant) => (
                    <th
                      key={variant}
                      scope="col"
                      className="px-4 py-3 text-right font-normal"
                    >
                      {text[VARIANT_LABEL_KEYS[variant]]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DELAY_BASE_DIVISIONS.map((base) => (
                  <tr key={base.id} className="border-t border-line">
                    <th
                      scope="row"
                      className="px-4 py-3 font-mono text-sm font-medium text-ink"
                    >
                      {base.fraction}
                    </th>
                    {DELAY_VARIANTS.map((variant) => {
                      const value = divisions.find(
                        (division) =>
                          division.id === base.id &&
                          division.variant === variant,
                      );

                      return (
                        <td
                          key={variant}
                          className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm tabular-nums text-ink"
                        >
                          {formatDelayMilliseconds(value?.milliseconds ?? NaN)}
                          <span className="ml-1 text-[10px] text-muted">ms</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

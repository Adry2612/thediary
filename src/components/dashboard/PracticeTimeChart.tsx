"use client";

import { useMemo, useRef, useState } from "react";
import { formatPracticeDuration } from "@/lib/dashboard-data";
import { getPracticeTimeBuckets } from "@/lib/practice-analytics";
import { getContainedTooltipPosition } from "@/lib/practice-chart-tooltip";
import type { PracticeChartPeriod } from "@/lib/practice-analytics";
import { SelectField } from "@/components/ui/SelectField";
import type { SessionRecord } from "@/types/practice";

const PERIOD_OPTIONS: { value: PracticeChartPeriod; label: string }[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
];

function formatTotal(seconds: number) {
  return formatPracticeDuration(seconds / 60);
}

function formatExactDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes} min ${remainingSeconds} s`;
}

type ChartTooltip = {
  label: string;
  duration: string;
  left: number;
  top: number;
};

export function PracticeTimeChart({
  history,
  today,
}: {
  history: SessionRecord[];
  today: Date;
}) {
  const [period, setPeriod] = useState<PracticeChartPeriod>("week");
  const [tooltip, setTooltip] = useState<ChartTooltip | null>(null);
  const chartContainerRef = useRef<HTMLElement>(null);
  const buckets = useMemo(
    () => getPracticeTimeBuckets(history, period, today),
    [history, period, today],
  );
  const maximumSeconds = Math.max(
    0,
    ...buckets.map((bucket) => bucket.totalSeconds),
  );
  const totalSeconds = buckets.reduce(
    (total, bucket) => total + bucket.totalSeconds,
    0,
  );

  function showTooltip(
    element: HTMLElement,
    label: string,
    totalSeconds: number,
    pointerPosition?: { x: number; y: number },
  ) {
    const containerBounds = chartContainerRef.current?.getBoundingClientRect();
    if (!containerBounds) return;

    const bounds = element.getBoundingClientRect();
    const centerX = pointerPosition?.x ?? bounds.left + bounds.width / 2;
    const anchorY = pointerPosition?.y ?? bounds.top;
    const position = getContainedTooltipPosition(
      centerX - containerBounds.left,
      anchorY - containerBounds.top,
      containerBounds.width,
      containerBounds.height,
    );
    setTooltip({
      label,
      duration: formatExactDuration(totalSeconds),
      ...position,
    });
  }

  return (
    <section
      ref={chartContainerRef}
      className="enter relative isolate flex h-full min-h-[27rem] flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:min-h-[32rem] sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
            Tiempo registrado
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
            Ritmo de práctica
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {period === "week"
              ? "Tiempo por día esta semana"
              : period === "month"
                ? "Tiempo por semana este mes"
                : "Tiempo por mes este año"}
          </p>
        </div>
        <div className="min-w-32 text-xs text-zinc-500">
          Periodo
          <SelectField
            className="mt-1"
            value={period}
            ariaLabel="Periodo del gráfico de práctica"
            onChange={(selectedPeriod) =>
              setPeriod(selectedPeriod as PracticeChartPeriod)
            }
            options={PERIOD_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-mono text-2xl leading-tight font-medium tabular-nums tracking-normal text-zinc-100 sm:text-3xl">
          {formatTotal(totalSeconds)}
        </span>
        <span className="text-xs text-zinc-500">en el periodo</span>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-x-auto">
        <ul
          aria-label="Tiempo practicado por intervalo"
          className="grid h-full min-h-56 min-w-full items-end gap-2 border-b border-zinc-800 pb-2 sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
            minWidth:
              buckets.length > 14 ? `${buckets.length * 1.75}rem` : undefined,
          }}
        >
          {buckets.map((bucket) => {
            const hasPractice = bucket.totalSeconds > 0;
            const barHeight =
              maximumSeconds > 0
                ? Math.max((bucket.totalSeconds / maximumSeconds) * 100, 2)
                : 0;
            const accessibleLabel = `${bucket.label}: ${formatTotal(bucket.totalSeconds)}`;

            return (
              <li
                key={`${bucket.startDate}-${bucket.endDate}`}
                tabIndex={hasPractice ? 0 : undefined}
                title={hasPractice ? accessibleLabel : undefined}
                aria-label={accessibleLabel}
                onPointerEnter={(event) => {
                  if (event.pointerType === "touch" || !hasPractice) return;
                  showTooltip(
                    event.currentTarget,
                    bucket.label,
                    bucket.totalSeconds,
                    { x: event.clientX, y: event.clientY },
                  );
                }}
                onFocus={
                  hasPractice
                    ? (event) =>
                        showTooltip(
                          event.currentTarget,
                          bucket.label,
                          bucket.totalSeconds,
                        )
                    : undefined
                }
                onPointerLeave={(event) => {
                  if (document.activeElement !== event.currentTarget) {
                    setTooltip(null);
                  }
                }}
                onBlur={() => setTooltip(null)}
                className="flex h-full min-w-0 flex-col items-center justify-end gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
              >
                <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                  <span
                    aria-hidden="true"
                    className={`h-full w-full max-w-10 origin-bottom rounded-t-[3px] transition-transform duration-300 ${hasPractice ? "bg-[#6d8c72]" : "bg-zinc-800"}`}
                    style={{
                      transform: `scaleY(${hasPractice ? barHeight / 100 : 0})`,
                    }}
                  />
                </div>
                <span className="max-w-full truncate font-mono text-[10px] text-zinc-500">
                  {bucket.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-50 w-44 border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 shadow-lg"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          <span className="block text-zinc-500">{tooltip.label}</span>
          <span className="mt-1 block font-mono text-sm tabular-nums text-zinc-100">
            {tooltip.duration}
          </span>
        </div>
      )}
      {maximumSeconds === 0 && (
        <p className="mt-4 text-center text-sm text-zinc-500">
          Completa una sesión para ver tu tiempo aquí.
        </p>
      )}
    </section>
  );
}

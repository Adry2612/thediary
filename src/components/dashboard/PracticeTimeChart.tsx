"use client";

import { useMemo, useState } from "react";
import { formatPracticeDuration } from "@/lib/dashboard-data";
import { getPracticeTimeBuckets } from "@/lib/practice-analytics";
import type { PracticeChartPeriod } from "@/lib/practice-analytics";
import type { SessionRecord } from "@/types/practice";

const PERIOD_OPTIONS: { value: PracticeChartPeriod; label: string }[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
];

function formatTotal(seconds: number) {
  return formatPracticeDuration(seconds / 60);
}

export function PracticeTimeChart({
  history,
  today,
}: {
  history: SessionRecord[];
  today: Date;
}) {
  const [period, setPeriod] = useState<PracticeChartPeriod>("week");
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

  return (
    <section className="enter flex h-full min-h-[27rem] flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:min-h-[32rem] sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
            Tiempo registrado
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-zinc-100">
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
        <label className="text-xs text-zinc-500">
          Periodo
          <select
            value={period}
            onChange={(event) => {
              const selected = PERIOD_OPTIONS.find(
                (option) => option.value === event.target.value,
              );
              if (selected) setPeriod(selected.value);
            }}
            aria-label="Periodo del gráfico de práctica"
            className="mt-1 block h-10 min-w-32 border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-300"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-mono text-2xl tabular-nums text-zinc-100">
          {formatTotal(totalSeconds)}
        </span>
        <span className="text-xs text-zinc-500">en el periodo</span>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-x-auto">
        <ul
          aria-label="Tiempo practicado por intervalo"
          className="grid h-56 min-w-full items-end gap-2 border-b border-zinc-800 pb-2 sm:gap-3"
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
                title={accessibleLabel}
                aria-label={accessibleLabel}
                className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
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
      {maximumSeconds === 0 && (
        <p className="mt-4 text-center text-sm text-zinc-500">
          Completa una sesión para ver tu tiempo aquí.
        </p>
      )}
    </section>
  );
}

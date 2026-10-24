"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { formatSignedNumber as formatSigned } from "@/utils/format";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import {
  getTempoTrend,
  type PracticeTempoPeriod,
} from "@/utils/practice-analytics";
import type { RepertoireItem, SessionRecord } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

export function TempoProgress({
  history,
  today,
  repertoireItems,
}: {
  history: SessionRecord[];
  today: Date;
  repertoireItems: RepertoireItem[];
}) {
  const dashboard = useI18nSection("dashboard");
  const [period, setPeriod] = useState<PracticeTempoPeriod>("week");
  const trend = useMemo(
    () => getTempoTrend(history, period, today, repertoireItems),
    [history, period, repertoireItems, today],
  );
  const periodLabel =
    period === "week" ? dashboard.tempoWeek : dashboard.tempoMonth;
  const deltaTone =
    trend.deltaBpm > 0
      ? "text-accent-green-fg"
      : trend.deltaBpm < 0
        ? "text-red-300"
        : "text-zinc-100";

  return (
    <section
      className="enter flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8"
      style={{ "--index": 3 } as CSSProperties}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            {dashboard.tempoDescription}
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
            {dashboard.tempoProgress}
          </h2>
        </div>
        <ToggleGroup aria-label={dashboard.tempoAria} layout="row" className="gap-1.5">
          <ToggleChip
            size="sm"
            selected={period === "week"}
            onClick={() => setPeriod("week")}
          >
            {dashboard.tempoWeek}
          </ToggleChip>
          <ToggleChip
            size="sm"
            selected={period === "month"}
            onClick={() => setPeriod("month")}
          >
            {dashboard.tempoMonth}
          </ToggleChip>
        </ToggleGroup>
      </div>

      {trend.comparedCount > 0 ? (
        <div className="mt-5 flex flex-1 flex-col">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span
              className={`font-mono text-3xl leading-tight tabular-nums ${deltaTone}`}
            >
              {formatSigned(trend.deltaBpm)} {dashboard.tempoBpmUnit}
            </span>
            <span className={`font-mono text-sm tabular-nums ${deltaTone}`}>
              {formatSigned(trend.deltaPercent)} %
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            {periodLabel} · {trend.comparedCount} {dashboard.tempoCompared}
          </p>

          {trend.movers.length > 0 && (
            <div className="mt-5">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {dashboard.tempoMovers}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {trend.movers.map((mover) => (
                  <li
                    key={mover.key}
                    className="flex items-baseline justify-between gap-3 text-xs"
                  >
                    <span className="min-w-0 truncate text-zinc-300">
                      {mover.label}
                    </span>
                    <span
                      className={`shrink-0 font-mono tabular-nums ${
                        mover.deltaBpm > 0
                          ? "text-accent-green-fg"
                          : "text-red-300"
                      }`}
                    >
                      {formatSigned(mover.deltaBpm)} {dashboard.tempoBpmUnit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {trend.isSmallSample && (
            <p className="mt-4 text-xs text-amber-200">
              {dashboard.tempoSmallSample}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-5 flex flex-1 flex-col justify-center">
          <p className="text-sm text-muted">
            {trend.hasMetronomeData
              ? dashboard.tempoEmptyNoMatch
              : dashboard.tempoEmptyNoData}
          </p>
        </div>
      )}

      <p className="mt-5 border-t border-zinc-800 pt-3 text-xs text-muted">
        {dashboard.tempoMetronomeNote}
      </p>
    </section>
  );
}

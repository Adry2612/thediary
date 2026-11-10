import type { CSSProperties } from "react";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { formatPracticeDuration } from "@/utils/dashboard-data";
import {
  getGuitarBalanceShares,
  type GuitarBalance as GuitarBalanceValue,
  type PracticeChartPeriod,
} from "@/utils/practice-analytics";
import { useI18nSection } from "@/i18n/I18nProvider";

const ELECTRIC_COLOR = "#c6ad77";
const ACOUSTIC_COLOR = "#7f9f83";

export function GuitarBalance({
  balance,
  period,
  onPeriodChange,
}: {
  balance: GuitarBalanceValue;
  period: PracticeChartPeriod;
  onPeriodChange: (period: PracticeChartPeriod) => void;
}) {
  const dashboard = useI18nSection("dashboard");
  const classifiedSeconds = balance.electricSeconds + balance.acousticSeconds;
  const shares = getGuitarBalanceShares(balance);
  const hasClassified = classifiedSeconds > 0;
  /** Duración total del barrido; cada tramo ocupa su parte del arco. */
  const ringDrawMs = 400;
  const electricDuration =
    shares.electric > 0
      ? Math.max(1, Math.round((shares.electric / 100) * ringDrawMs))
      : 0;
  const rows = [
    {
      key: "electric" as const,
      label: dashboard.guitarElectric,
      seconds: balance.electricSeconds,
      percentage: shares.electric,
      color: ELECTRIC_COLOR,
    },
    {
      key: "acoustic" as const,
      label: dashboard.guitarAcoustic,
      seconds: balance.acousticSeconds,
      percentage: shares.acoustic,
      color: ACOUSTIC_COLOR,
    },
  ];

  return (
    <section
      className="enter flex h-full min-h-[20rem] flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8"
      style={{ "--index": 2 } as CSSProperties}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            {dashboard.guitarBalanceDescription}
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
            {dashboard.guitarBalance}
          </h2>
        </div>
        <PeriodSelector
          period={period}
          onChange={onPeriodChange}
          ariaLabel={dashboard.guitarBalancePeriodAria}
        />
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center justify-center">
        <div className="relative w-full max-w-[16rem]">
          <svg
            key={period}
            viewBox="0 0 120 68"
            className="w-full"
            role="img"
            aria-label={`${dashboard.guitarBalanceAria}: ${dashboard.guitarElectric} ${shares.electric}%, ${dashboard.guitarAcoustic} ${shares.acoustic}%`}
          >
            <path
              d="M10 60 A50 50 0 0 1 110 60"
              fill="none"
              stroke="#27272a"
              strokeWidth="13"
              pathLength={100}
            />
            {hasClassified && (
              <>
                <path
                  d="M10 60 A50 50 0 0 1 110 60"
                  fill="none"
                  stroke={ELECTRIC_COLOR}
                  strokeWidth="13"
                  pathLength={100}
                  strokeDasharray={`${shares.electric} 100`}
                  className="chart-ring-draw"
                  style={
                    {
                      "--ring-dasharray": `${shares.electric} 100`,
                      "--ring-circumference": 100,
                      "--ring-delay": "0ms",
                      "--ring-duration": `${electricDuration}ms`,
                    } as CSSProperties
                  }
                />
                <path
                  d="M10 60 A50 50 0 0 1 110 60"
                  fill="none"
                  stroke={ACOUSTIC_COLOR}
                  strokeWidth="13"
                  pathLength={100}
                  strokeDasharray={`${shares.acoustic} 100`}
                  strokeDashoffset={-shares.electric}
                  className="chart-ring-draw"
                  style={
                    {
                      "--ring-dasharray": `${shares.acoustic} 100`,
                      "--ring-circumference": 100,
                      "--ring-delay": `${electricDuration}ms`,
                      "--ring-duration": `${
                        shares.acoustic > 0
                          ? Math.max(
                              1,
                              ringDrawMs - electricDuration,
                            )
                          : 0
                      }ms`,
                    } as CSSProperties
                  }
                />
              </>
            )}
          </svg>
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center text-center">
            <span className="font-mono text-lg leading-7 text-zinc-100">
              {hasClassified
                ? formatPracticeDuration(classifiedSeconds / 60)
                : "—"}
            </span>
          </div>
        </div>

        {hasClassified ? (
          <ul className="mt-5 w-full space-y-2">
            {rows.map((row) => (
              <li
                key={row.key}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2.5 text-zinc-300">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-[2px]"
                    style={{ backgroundColor: row.color }}
                  />
                  {row.label}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  {formatPracticeDuration(row.seconds / 60)} ·{" "}
                  {row.percentage}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 text-center">
            <p className="text-sm text-zinc-300">{dashboard.guitarEmpty}</p>
            <p className="mt-1 text-xs text-muted">
              {dashboard.guitarEmptyHint}
            </p>
          </div>
        )}

        <p className="mt-4 w-full border-t border-zinc-800 pt-3 text-xs text-muted">
          {dashboard.guitarUnclassified}:{" "}
          <span className="font-mono text-zinc-400">
            {formatPracticeDuration(balance.unclassifiedSeconds / 60)}
          </span>
        </p>      </div>
    </section>
  );
}

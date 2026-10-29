"use client";

import { useEffect, useMemo, useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { useI18n, useI18nSection } from "@/i18n/I18nProvider";
import {
  getPracticeWellbeingSeries,
  getPracticeWellbeingSummary,
  hasPracticeWellbeingData,
  type PracticeMetricSummary,
  type PracticeWellbeingBucket,
} from "@/utils/practice-metrics";
import type { Dict } from "@/i18n/dictionary";
import type { PracticeChartPeriod } from "@/utils/practice-analytics";
import type { SessionRecord } from "@/types/practice";

const CHART = {
  width: 640,
  height: 240,
  left: 36,
  right: 12,
  top: 16,
  bottom: 36,
};

type MetricKey = "mood" | "focus";

const METRIC_STYLE: Record<MetricKey, { color: string; shape: "circle" | "diamond" }> = {
  mood: { color: "#c6ad77", shape: "circle" },
  focus: { color: "#7f9f83", shape: "diamond" },
};

function formatAverage(average: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  }).format(average);
}

function getTrendArrow(trend: "up" | "down" | "flat") {
  return trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
}

function buildSegments(
  buckets: PracticeWellbeingBucket[],
  metric: MetricKey,
) {
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const segments: Array<Array<{ x: number; y: number }>> = [];
  let current: Array<{ x: number; y: number }> = [];

  buckets.forEach((bucket, index) => {
    const value = bucket[metric];
    if (!value) {
      if (current.length > 0) segments.push(current);
      current = [];
      return;
    }

    current.push({
      x: CHART.left + ((index + 0.5) * plotWidth) / buckets.length,
      y: CHART.top + ((5 - value.average) / 4) * plotHeight,
    });
  });

  if (current.length > 0) segments.push(current);
  return segments;
}

function Marker({
  x,
  y,
  shape,
  color,
}: {
  x: number;
  y: number;
  shape: "circle" | "diamond";
  color: string;
}) {
  if (shape === "circle") {
    return (
      <circle
        cx={x}
        cy={y}
        r={3.6}
        fill={color}
        stroke="#18181b"
        strokeWidth={1.2}
      />
    );
  }

  return (
    <path
      d={`M ${x} ${y - 4.6} L ${x + 4.6} ${y} L ${x} ${y + 4.6} L ${x - 4.6} ${y} Z`}
      fill={color}
      stroke="#18181b"
      strokeWidth={1.2}
    />
  );
}

function MetricSummary({
  data,
  label,
  locale,
  dashboard,
}: {
  data: PracticeMetricSummary | null;
  label: string;
  locale: string;
  dashboard: Dict["dashboard"];
}) {
  const trendLabel =
    data?.trend === "up" ? dashboard.wellbeingTrendUp
    : data?.trend === "down" ? dashboard.wellbeingTrendDown
    : data?.trend === "flat" ? dashboard.wellbeingTrendFlat
    : null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
      {data ? (
        <>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-2xl leading-none tabular-nums text-zinc-100">
              {formatAverage(data.average, locale)}
            </span>
            <span className="text-xs text-muted">{dashboard.wellbeingOfFive}</span>
          </div>
          {trendLabel && data.change !== null ? (
            <p className="mt-2 text-xs text-muted">
              <span aria-hidden="true" className="mr-1">
                {getTrendArrow(data.trend ?? "flat")}
              </span>
              <span className="text-zinc-300">{trendLabel}</span>{" "}
              <span className="tabular-nums">
                {data.change > 0 ? "+" : ""}
                {formatAverage(data.change, locale)}
              </span>{" "}
              {dashboard.wellbeingChange}
            </p>
          ) : (
            data.previousAverage === null && (
              <p className="mt-2 text-xs text-muted">
                {dashboard.wellbeingNoComparison}
              </p>
            )
          )}
          <p className="mt-2 text-xs text-muted">
            {dashboard.wellbeingSample}:{" "}
            <span className="font-mono tabular-nums text-zinc-300">
              {data.count}
            </span>
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">
          {dashboard.wellbeingNoDataPeriod}
        </p>
      )}
    </div>
  );
}

export function PracticeWellbeing({
  history,
  today,
}: {
  history: SessionRecord[];
  today: Date;
}) {
  const dashboard = useI18nSection("dashboard");
  const { locale } = useI18n();
  const [period, setPeriod] = useState<PracticeChartPeriod>("month");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const series = useMemo(
    () => getPracticeWellbeingSeries(history, period, today),
    [history, period, today],
  );
  const summary = useMemo(
    () => getPracticeWellbeingSummary(history, period, today),
    [history, period, today],
  );
  const selected = selectedIndex === null ? null : series[selectedIndex];
  const hasValues = series.some((bucket) => bucket.mood || bucket.focus);
  const metrics: Array<{ key: MetricKey; label: string }> = [
    { key: "mood", label: dashboard.wellbeingMood },
    { key: "focus", label: dashboard.wellbeingFocus },
  ];
  const periodOptions = [
    { value: "week" as const, label: dashboard.periodWeek ?? dashboard.period },
    { value: "month" as const, label: dashboard.periodMonth ?? dashboard.period },
    { value: "year" as const, label: dashboard.periodYear ?? dashboard.period },
  ];

  useEffect(() => {
    setSelectedIndex(null);
  }, [period]);

  if (!hasPracticeWellbeingData(history)) return null;

  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const xFor = (index: number) =>
    CHART.left + ((index + 0.5) * plotWidth) / series.length;
  const yFor = (value: number) =>
    CHART.top + ((5 - value) / 4) * plotHeight;

  function describeBucket(bucket: PracticeWellbeingBucket) {
    const parts = metrics.map((metric) => {
      const data = bucket[metric.key];
      const sessionLabel =
        data?.count === 1 ? dashboard.session : dashboard.sessions;
      return data ?
          `${metric.label}: ${formatAverage(data.average, locale)} ${dashboard.wellbeingOfFive}, ${data.count} ${sessionLabel}`
        : `${metric.label}: ${dashboard.wellbeingNoDataPeriod}`;
    });
    return `${bucket.label}. ${parts.join(". ")}`;
  }

  return (
    <section
      aria-labelledby="wellbeing-title"
      className="enter flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            {dashboard.wellbeingDescription}
          </p>
          <h2
            id="wellbeing-title"
            className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8"
          >
            {dashboard.wellbeingTitle}
          </h2>
        </div>
        <div className="min-w-32 text-xs text-muted">
          {dashboard.period}
          <SelectField
            className="mt-1"
            value={period}
            ariaLabel={dashboard.wellbeingPeriodAria}
            onChange={(selectedPeriod) =>
              setPeriod(selectedPeriod as PracticeChartPeriod)
            }
            options={periodOptions}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {metrics.map((metric) => (
          <MetricSummary
            key={metric.key}
            data={summary[metric.key]}
            label={metric.label}
            locale={locale}
            dashboard={dashboard}
          />
        ))}
      </div>

      {hasValues ? (
        <>
          <div
            className="relative mt-6 w-full"
            onPointerLeave={() => setSelectedIndex(null)}
          >
            <svg
              viewBox={`0 0 ${CHART.width} ${CHART.height}`}
              className="block w-full"
              aria-hidden="true"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <line
                  key={value}
                  x1={CHART.left}
                  x2={CHART.width - CHART.right}
                  y1={yFor(value)}
                  y2={yFor(value)}
                  stroke="currentColor"
                  className="text-zinc-800"
                  strokeWidth={1}
                />
              ))}
              {[1, 2, 3, 4, 5].map((value) => (
                <text
                  key={value}
                  x={CHART.left - 8}
                  y={yFor(value) + 3}
                  textAnchor="end"
                  className="fill-current text-[10px] text-muted"
                >
                  {value}
                </text>
              ))}

              {metrics.map((metric) => {
                const style = METRIC_STYLE[metric.key];
                return (
                  <g key={metric.key}>
                    {buildSegments(series, metric.key).map((segment, index) =>
                      segment.length > 1 ? (
                        <polyline
                          key={`${metric.key}-segment-${index}`}
                          points={segment.map((point) => `${point.x},${point.y}`).join(" ")}
                          fill="none"
                          stroke={style.color}
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : null,
                    )}
                    {series.map((bucket, index) => {
                      const data = bucket[metric.key];
                      if (!data) return null;
                      return (
                        <Marker
                          key={`${metric.key}-${index}`}
                          x={xFor(index)}
                          y={yFor(data.average)}
                          shape={style.shape}
                          color={style.color}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {series.map((bucket, index) => (
                <text
                  key={`${bucket.label}-${index}`}
                  x={xFor(index)}
                  y={CHART.height - 10}
                  textAnchor="middle"
                  className="fill-current text-[9px] text-muted"
                >
                  {bucket.label}
                </text>
              ))}
            </svg>

            <div
              className="absolute"
              style={{
                left: `${(CHART.left / CHART.width) * 100}%`,
                right: `${(CHART.right / CHART.width) * 100}%`,
                top: `${(CHART.top / CHART.height) * 100}%`,
                bottom: `${(CHART.bottom / CHART.height) * 100}%`,
              }}
            >
              <div
                className="grid h-full"
                style={{
                  gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))`,
                }}
              >
                {series.map((bucket, index) => (
                  <button
                    key={`${bucket.startDate}-${index}`}
                    type="button"
                    aria-label={describeBucket(bucket)}
                    onPointerEnter={() => setSelectedIndex(index)}
                    onFocus={() => setSelectedIndex(index)}
                    className={`h-full w-full rounded-sm border border-transparent transition focus-visible:border-ink/60 focus-visible:outline-none ${
                      selectedIndex === index ?
                        "bg-white/[0.05]"
                      : "hover:bg-white/[0.03]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted">
            {metrics.map((metric) => {
              const style = METRIC_STYLE[metric.key];
              return (
                <span key={metric.key} className="inline-flex items-center gap-2">
                  <svg
                    viewBox="0 0 12 12"
                    className="size-3 shrink-0"
                    aria-hidden="true"
                  >
                    {style.shape === "circle" ? (
                      <circle cx="6" cy="6" r="4.5" fill={style.color} />
                    ) : (
                      <path d="M 6 1.2 L 10.8 6 L 6 10.8 L 1.2 6 Z" fill={style.color} />
                    )}
                  </svg>
                  {metric.label}
                </span>
              );
            })}
          </div>

          <div className="mt-3 min-h-10 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs">
            {selected ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-mono text-zinc-300">{selected.label}</span>
                {metrics.map((metric) => {
                  const data = selected[metric.key];
                  return (
                    <span key={metric.key} className="text-muted">
                      {metric.label}:{" "}
                      <span className="font-mono tabular-nums text-zinc-300">
                        {data ? formatAverage(data.average, locale) : "—"}
                      </span>
                      {data ?
                        ` · ${data.count} ${data.count === 1 ? dashboard.session : dashboard.sessions}`
                      : ""}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted">{dashboard.wellbeingChartHint}</p>
            )}
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950/40 p-6 text-center">
          <p className="text-sm text-zinc-300">{dashboard.wellbeingNoDataPeriod}</p>
          <p className="mt-1 text-xs text-muted">
            {dashboard.wellbeingNoDataDescription}
          </p>
        </div>
      )}
    </section>
  );
}

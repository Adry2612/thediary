"use client";

import { useId, type ReactNode } from "react";
import { useI18n, useI18nSection } from "@/i18n/I18nProvider";
import { getLickProgress } from "@/utils/licks/progress";
import {
  formatLickDate,
  formatShortLickDate,
  getLickTitle,
} from "@/utils/licks/presentation";
import type { GuitarLick } from "@/types/lick";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 230;
const PADDING = { top: 20, right: 18, bottom: 34, left: 46 };

export function LickBpmChart({
  lick,
  selector,
  className = "",
}: {
  lick: GuitarLick;
  selector?: ReactNode;
  className?: string;
}) {
  const { locale } = useI18n();
  const text = useI18nSection("licks");
  const titleId = useId();
  const descriptionId = useId();

  const entries = [...lick.bpmHistory].sort(
    (first, second) => Date.parse(first.date) - Date.parse(second.date),
  );
  const progress = getLickProgress(lick);
  const target = progress.targetBpm;
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const values = entries.map((entry) => entry.bpm);
  if (target !== undefined) values.push(target);
  const rawMin = values.length > 0 ? Math.min(...values) : 40;
  const rawMax = values.length > 0 ? Math.max(...values) : 40;
  const yMin = Math.max(0, Math.floor((rawMin - 10) / 10) * 10);
  const yMax = Math.max(yMin + 20, Math.ceil((rawMax + 10) / 10) * 10);

  const times = entries.map((entry) => Date.parse(entry.date));
  const firstTime = times[0] ?? 0;
  const lastTime = times.at(-1) ?? 0;
  const timeSpan = lastTime - firstTime;

  const xFor = (time: number, index: number) => {
    if (entries.length <= 1) {
      return PADDING.left + innerWidth / 2;
    }
    if (timeSpan <= 0) {
      return PADDING.left + (index / (entries.length - 1)) * innerWidth;
    }
    return PADDING.left + ((time - firstTime) / timeSpan) * innerWidth;
  };
  const yFor = (bpm: number) =>
    PADDING.top + innerHeight - ((bpm - yMin) / (yMax - yMin)) * innerHeight;

  const points = entries.map((entry, index) => ({
    entry,
    x: xFor(Date.parse(entry.date), index),
    y: yFor(entry.bpm),
  }));

  const tickValues = Array.from({ length: 4 }, (_, index) =>
    Math.round(yMin + ((yMax - yMin) / 3) * index),
  );

  return (
    <section
      className={`rounded-xl border border-line bg-surface p-5 sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            {text.chartTitle}
          </p>
          <h2 className="mt-1 font-sans text-lg font-semibold tracking-tight text-ink">
            {getLickTitle(text, lick)}
          </h2>
          <p className="mt-1 text-sm text-muted">{text.chartDescription}</p>
        </div>
        <div className="flex flex-wrap items-end gap-6">
          {selector}
          <dl className="grid grid-cols-3 gap-4 text-right">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.1em] text-muted">
              {text.startBpm}
            </dt>
            <dd className="font-mono text-sm tabular-nums text-ink">
              {progress.startBpm ?? "–"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.1em] text-muted">
              {text.currentBpm}
            </dt>
            <dd className="font-mono text-sm tabular-nums text-ink">
              {progress.currentBpm ?? "–"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.1em] text-muted">
              {target !== undefined ? text.targetLine : text.noTarget}
            </dt>
            <dd className="font-mono text-sm tabular-nums text-ink">
              {target ?? "–"}
            </dd>
          </div>
          </dl>
        </div>
      </div>

      {progress.percentage !== undefined ? (
        <p className="mt-3 text-sm text-muted">
          <span className="font-mono tabular-nums text-accent-green-fg">
            {progress.percentage}%
          </span>{" "}
          {text.progressOfTarget}
        </p>
      ) : null}

      {entries.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-line bg-canvas/60 px-4 py-8 text-center text-sm text-muted">
          {text.noData}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
            aria-label={text.chartAria}
            className="h-56 w-full min-w-[32rem]"
          >
            <title id={titleId}>{text.chartTitle}</title>
            <desc id={descriptionId}>{text.chartDescription}</desc>

            {tickValues.map((tick) => (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  x2={CHART_WIDTH - PADDING.right}
                  y1={yFor(tick)}
                  y2={yFor(tick)}
                  stroke="rgba(255,255,255,0.06)"
                />
                <text
                  x={PADDING.left - 8}
                  y={yFor(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="#8a8884"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {tick}
                </text>
              </g>
            ))}

            <line
              x1={PADDING.left}
              x2={CHART_WIDTH - PADDING.right}
              y1={CHART_HEIGHT - PADDING.bottom}
              y2={CHART_HEIGHT - PADDING.bottom}
              stroke="rgba(255,255,255,0.16)"
            />

            {target !== undefined ? (
              <>
                <line
                  x1={PADDING.left}
                  x2={CHART_WIDTH - PADDING.right}
                  y1={yFor(target)}
                  y2={yFor(target)}
                  stroke="#8a8884"
                  strokeDasharray="6 6"
                  strokeWidth="1.5"
                />
                <text
                  x={CHART_WIDTH - PADDING.right}
                  y={yFor(target) - 6}
                  textAnchor="end"
                  fill="#8a8884"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {text.targetLine} {target}
                </text>
              </>
            ) : null}

            <polyline
              points={points.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="none"
              stroke="#8fc194"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {points.map((point) => (
              <g key={point.entry.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#121211"
                  stroke="#8fc194"
                  strokeWidth="2"
                >
                  <title>
                    {`${formatLickDate(point.entry.date, locale)}: ${point.entry.bpm} BPM${point.entry.notes ? ` — ${point.entry.notes}` : ""}`}
                  </title>
                </circle>
              </g>
            ))}

            {entries.length > 0 ? (
              <>
                <text
                  x={PADDING.left}
                  y={CHART_HEIGHT - 12}
                  textAnchor="start"
                  fill="#8a8884"
                  fontSize="10"
                >
                  {formatShortLickDate(entries[0].date, locale)}
                </text>
                {entries.length > 1 ? (
                  <text
                    x={CHART_WIDTH - PADDING.right}
                    y={CHART_HEIGHT - 12}
                    textAnchor="end"
                    fill="#8a8884"
                    fontSize="10"
                  >
                    {formatShortLickDate(entries[entries.length - 1].date, locale)}
                  </text>
                ) : null}
              </>
            ) : null}
          </svg>

          <ul className="sr-only">
            {entries.map((entry) => (
              <li key={entry.id}>
                {`${formatLickDate(entry.date, locale)}: ${entry.bpm} BPM${entry.notes ? ` — ${entry.notes}` : ""}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

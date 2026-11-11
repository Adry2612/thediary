"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { SkillSummaryCard } from "@/components/dashboard/SkillSummaryCard";
import {
  formatPracticeDuration,
  PRACTICE_SKILLS,
  PRACTICE_SKILL_COLORS,
  PRACTICE_SKILL_LABELS,
} from "@/utils/dashboard-data";
import {
  getSkillSummaryPosition,
  type SkillSummaryPosition,
} from "@/utils/skill-summary-tooltip";
import type { PracticeSkill, SkillDistribution } from "@/types/practice";
import type { PracticeChartPeriod } from "@/utils/practice-analytics";
import { useI18nSection } from "@/i18n/I18nProvider";

export function SkillBalance({
  distribution,
  period,
  showPeriodSelector = true,
  onPeriodChange,
}: {
  distribution: SkillDistribution;
  period: PracticeChartPeriod;
  showPeriodSelector?: boolean;
  onPeriodChange: (period: PracticeChartPeriod) => void;
}) {
  const dashboard = useI18nSection("dashboard");
  const [activeSkill, setActiveSkill] = useState<PracticeSkill | null>(null);
  const [position, setPosition] = useState<SkillSummaryPosition | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const activeCategory = activeSkill
    ? distribution.categories[activeSkill]
    : null;
  const circumference = 2 * Math.PI * 45;
  /** Duración total del barrido del anillo; cada tramo ocupa su parte. */
  const ringDrawMs = 400;
  let accumulatedLength = 0;

  const hideSummary = useCallback(() => {
    setActiveSkill(null);
    setPosition(null);
  }, []);

  const showSummary = useCallback(
    (element: Element | null, skill: PracticeSkill) => {
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      setActiveSkill(skill);
      setPosition(
        getSkillSummaryPosition(bounds, {
          width: window.innerWidth,
          height: window.innerHeight,
        }),
      );
    },
    [],
  );

  useEffect(() => {
    if (!activeSkill) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") hideSummary();
    }

    window.addEventListener("scroll", hideSummary, true);
    window.addEventListener("resize", hideSummary);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", hideSummary, true);
      window.removeEventListener("resize", hideSummary);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSkill, hideSummary]);

  return (
    <section
      className="enter flex h-full min-h-[27rem] flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:min-h-[32rem] sm:p-8"
      style={{ "--index": 1 } as CSSProperties}
      onPointerLeave={hideSummary}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            {dashboard.skillDistribution}
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
            {dashboard.skillBalance}
          </h2>
        </div>
        {showPeriodSelector && (
          <PeriodSelector
            period={period}
            onChange={onPeriodChange}
            ariaLabel={dashboard.skillBalancePeriodAria}
          />
        )}
      </div>

      <div className="mt-8 flex flex-1 items-center justify-center">
        <svg
          key={period}
          ref={chartRef}
          viewBox="0 0 120 120"
          className="size-44 -rotate-90"
          role="img"
           aria-label={dashboard.skillAria}
        >
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#27272a"
            strokeWidth="13"
          />
          {PRACTICE_SKILLS.map((skill) => {
            const category = distribution.categories[skill];
            const fraction = distribution.totalMinutes
              ? category.minutes / distribution.totalMinutes
              : 0;
            const length = circumference * fraction;
            const offset = accumulatedLength;
            accumulatedLength += length;
            // Barrido continuo: cada tramo empieza donde acaba el anterior para
            // que no queden huecos entre secciones mientras se dibuja.
            const delay = Math.round((offset / circumference) * ringDrawMs);
            const duration =
              length > 0
                ? Math.max(
                    1,
                    Math.round((length / circumference) * ringDrawMs),
                  )
                : 0;

            return (
              <circle
                key={skill}
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={PRACTICE_SKILL_COLORS[skill]}
                strokeWidth="13"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                className="chart-ring-draw"
                style={
                  {
                    "--ring-dasharray": `${length} ${circumference - length}`,
                    "--ring-circumference": circumference,
                    "--ring-delay": `${delay}ms`,
                    "--ring-duration": `${duration}ms`,
                  } as CSSProperties
                }
                onPointerEnter={() => showSummary(chartRef.current, skill)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none -ml-44 flex size-44 flex-col items-center justify-center text-center">
          <span className="font-mono text-xs leading-6 tracking-normal text-zinc-100 sm:text-sm sm:leading-7">
            {formatPracticeDuration(distribution.totalMinutes)}
          </span>
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {PRACTICE_SKILLS.map((skill, index) => {
          const category = distribution.categories[skill];
          const skillLabel = PRACTICE_SKILL_LABELS[skill];

          return (
            <li key={skill}>
              <button
                type="button"
                onPointerEnter={(event) =>
                  showSummary(event.currentTarget, skill)
                }
                onFocus={(event) => showSummary(event.currentTarget, skill)}
                onBlur={hideSummary}
                aria-describedby={
                  activeSkill === skill ? "skill-summary-tooltip" : undefined
                }
                aria-label={`${skillLabel}: ${category.percentage}%, ${formatPracticeDuration(category.minutes)}, ${category.sessionCount} ${category.sessionCount === 1 ? dashboard.session : dashboard.sessions}`}
                className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-300"
              >
                <span className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2.5 text-zinc-300">
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-[2px]"
                      style={{ backgroundColor: PRACTICE_SKILL_COLORS[skill] }}
                    />
                    {skillLabel}
                  </span>
                  <span className="font-mono text-xs text-zinc-400">
                    {category.percentage}%
                  </span>
                </span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <span
                    className={`block h-full rounded-full ${category.percentage > 0 ? "chart-bar-grow-x" : ""}`}
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: PRACTICE_SKILL_COLORS[skill],
                      "--chart-index": index,
                    } as CSSProperties}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {activeSkill &&
        activeCategory &&
        position &&
        createPortal(
          <SkillSummaryCard
            skill={activeSkill}
            category={activeCategory}
            position={position}
          />,
          document.body,
        )}
    </section>
  );
}

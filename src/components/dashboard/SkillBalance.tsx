import type { CSSProperties } from "react";
import {
  formatPracticeDuration,
  PRACTICE_SKILLS,
  PRACTICE_SKILL_COLORS,
  PRACTICE_SKILL_LABELS,
  getSkillPercentages,
  type SkillTotals,
} from "@/lib/dashboard-data";

export function SkillBalance({ totals }: { totals: SkillTotals }) {
  const totalMinutes = PRACTICE_SKILLS.reduce(
    (total, skill) => total + totals[skill],
    0,
  );
  const percentages = getSkillPercentages(totals);
  const circumference = 2 * Math.PI * 45;
  let accumulatedLength = 0;

  return (
    <section
      className="enter flex h-full min-h-[27rem] flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:min-h-[32rem] sm:p-8"
      style={{ "--index": 1 } as CSSProperties}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
        Reparto del tiempo
      </p>
      <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-zinc-100">
        Balance de habilidades
      </h2>

      <div className="mt-8 flex flex-1 items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          className="size-44 -rotate-90"
          role="img"
          aria-label="Distribución del tiempo de práctica por habilidad"
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
            const fraction = totalMinutes ? totals[skill] / totalMinutes : 0;
            const length = circumference * fraction;
            const offset = accumulatedLength;
            accumulatedLength += length;

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
              />
            );
          })}
        </svg>
        <div className="pointer-events-none -ml-44 flex size-44 flex-col items-center justify-center">
          <span className="font-mono text-2xl text-zinc-100">
            {formatPracticeDuration(totalMinutes)}
          </span>
          <span className="mt-1 text-xs text-zinc-500">este mes</span>
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {PRACTICE_SKILLS.map((skill) => {
          const percentage = percentages[skill];

          return (
            <li key={skill}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2.5 text-zinc-300">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-[2px]"
                    style={{ backgroundColor: PRACTICE_SKILL_COLORS[skill] }}
                  />
                  {PRACTICE_SKILL_LABELS[skill]}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  {percentage}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: PRACTICE_SKILL_COLORS[skill],
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

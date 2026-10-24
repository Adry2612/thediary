import type { RefObject } from "react";
import {
  formatPracticeDuration,
  PRACTICE_SKILL_COLORS,
  PRACTICE_SKILL_LABELS,
} from "@/utils/dashboard-data";
import {
  SKILL_SUMMARY_HEIGHT,
  SKILL_SUMMARY_WIDTH,
  type SkillSummaryPosition,
} from "@/utils/skill-summary-tooltip";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { PracticeSkill, SkillDistribution } from "@/types/practice";

type SkillSummaryCardProps = {
  skill: PracticeSkill;
  category: SkillDistribution["categories"][PracticeSkill];
  position: SkillSummaryPosition;
  cardRef?: RefObject<HTMLDivElement | null>;
};

export function SkillSummaryCard({
  skill,
  category,
  position,
  cardRef,
}: SkillSummaryCardProps) {
  const dashboard = useI18nSection("dashboard");

  return (
    <div
      ref={cardRef}
      id="skill-summary-tooltip"
      role="tooltip"
      className="pointer-events-none fixed z-300 flex flex-col justify-center rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-left text-zinc-200"
      style={{
        left: position.left,
        top: position.top,
        width: SKILL_SUMMARY_WIDTH,
        height: SKILL_SUMMARY_HEIGHT,
      }}
    >
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted">
        <span
          aria-hidden="true"
          className="size-2 rounded-[2px]"
          style={{ backgroundColor: PRACTICE_SKILL_COLORS[skill] }}
        />
        {PRACTICE_SKILL_LABELS[skill]}
      </p>
      <p className="mt-1 font-mono text-sm leading-6 text-zinc-100">
        {formatPracticeDuration(category.minutes)}
      </p>
      <p className="mt-0.5 text-xs text-muted">
        {category.percentage}% · {category.sessionCount}{" "}
        {category.sessionCount === 1 ? dashboard.session : dashboard.sessions}
      </p>
    </div>
  );
}

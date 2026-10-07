import { PRACTICE_SKILLS, type PracticeSkill } from "@/types/practice";

export { PRACTICE_SKILLS };

export const PRACTICE_SKILL_LABELS: Record<PracticeSkill, string> = {
  technique: "Técnica",
  theory: "Teoría",
  repertoire: "Repertorio",
  improvisation: "Improvisación",
};

export const PRACTICE_SKILL_COLORS: Record<PracticeSkill, string> = {
  technique: "#b9c5bd",
  theory: "#aaa9b3",
  repertoire: "#7f9f83",
  improvisation: "#c6ad77",
};

export type PracticeDay = {
  dateKey: string;
  minutes: number;
  averageBpm: number;
  skillMinutes: Record<PracticeSkill, number>;
};

export type SkillTotals = Record<PracticeSkill, number>;

const padDatePart = (part: number) => String(part).padStart(2, "0");

export function makeDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${padDatePart(monthIndex + 1)}-${padDatePart(day)}`;
}

export function getSkillPercentages(totals: SkillTotals): SkillTotals {
  const totalMinutes = PRACTICE_SKILLS.reduce(
    (total, skill) => total + totals[skill],
    0,
  );
  if (totalMinutes === 0) {
    return { technique: 0, theory: 0, repertoire: 0, improvisation: 0 };
  }

  const fractions = PRACTICE_SKILLS.map((skill) => {
    const exactPercentage = (totals[skill] / totalMinutes) * 100;
    return {
      skill,
      percentage: Math.floor(exactPercentage),
      remainder: exactPercentage % 1,
    };
  });
  const unassignedPercentage =
    100 - fractions.reduce((sum, item) => sum + item.percentage, 0);

  fractions
    .slice()
    .sort((left, right) => right.remainder - left.remainder)
    .slice(0, unassignedPercentage)
    .forEach(({ skill }) => {
      const item = fractions.find((fraction) => fraction.skill === skill);
      if (item) item.percentage += 1;
    });

  return fractions.reduce<SkillTotals>(
    (percentages, item) => {
      percentages[item.skill] = item.percentage;
      return percentages;
    },
    { technique: 0, theory: 0, repertoire: 0, improvisation: 0 },
  );
}

export function formatPracticeDuration(totalMinutes: number): string {
  const roundedMinutes = Math.round(totalMinutes);
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

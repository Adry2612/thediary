import { PRACTICE_SKILLS, type PracticeSkill } from "../types/practice.ts";

export { PRACTICE_SKILLS };

/** Ancho de una barra proporcional a su valor, acotado entre 0 y 100. */
export function getBarPercentage(value: number, maximum: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (value / maximum) * 100));
}

export const PRACTICE_SKILL_LABELS: Record<PracticeSkill, string> = {
  technique: "Técnica",
  theory: "Teoría",
  repertoire: "Repertorio",
  lick: "Lick",
  improvisation: "Improvisación",
};

export const PRACTICE_SKILL_COLORS: Record<PracticeSkill, string> = {
  technique: "#b9c5bd",
  theory: "#aaa9b3",
  repertoire: "#7f9f83",
  lick: "#9c8fbf",
  improvisation: "#c6ad77",
};

export type PracticeDay = {
  dateKey: string;
  minutes: number;
  averageBpm: number;
  skillMinutes: Record<PracticeSkill, number>;
};

const padDatePart = (part: number) => String(part).padStart(2, "0");

export function makeDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${padDatePart(monthIndex + 1)}-${padDatePart(day)}`;
}

export { formatPracticeDuration } from "./format.ts";

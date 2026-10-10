export const PRACTICE_SKILLS = [
  "technique",
  "theory",
  "repertoire",
  "improvisation",
] as const;

export type PracticeSkill = (typeof PRACTICE_SKILLS)[number];

export type PracticeResourceKind = "songsterr" | "guitarpro" | "pdf" | "audio" | "youtube" | "spotify" | "tab";

export interface PracticeResource {
  id: string;
  title: string;
  kind: PracticeResourceKind;
  url?: string;
  assetId?: string;
  fileName?: string;
  text?: string;
}

export type RepertoireItemKind = "song" | "lick";

export type GuitarType = "electric" | "acoustic";

export interface RepertoirePart {
  id: string;
  name: string;
  learned: boolean;
  masteredBpm: number | null;
  targetBpm: number | null;
}

export interface RepertoireItem {
  id: string;
  kind: RepertoireItemKind;
  title: string;
  artist?: string;
  parts: RepertoirePart[];
  guitarPro?: PracticeResource;
  resources?: PracticeResource[];
  updatedAt: string;
  /** Afinación de la canción (ej. "E Standard", "Drop D", "DADGAD") */
  tuning?: string;
  /** Traste donde colocar el capotraste (1-12) */
  capo?: number;
  /** Tipo de guitarra para filtrado */
  guitarType?: GuitarType;
  /** Enlace opcional de YouTube */
  youtubeUrl?: string;
  /** Enlace opcional de Spotify */
  spotifyUrl?: string;
  /** Si está en la lista de "aprender en el futuro" */
  isFutureLearn?: boolean;
}

export interface PracticePhase {
  id: number | string;
  name: string;
  durationMinutes: number;
  skill: PracticeSkill;
  exercises?: string[];
  resources?: PracticeResource[];
  repertoireItemId?: string;
  repertoirePartId?: string;
}

export interface PracticeTemplate {
  id: string;
  name: string;
  phases: PracticePhase[];
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  title?: string;
  startedAt: string;
  durationSeconds: number;
  averageBpm: number;
  completed?: boolean;
  skillSeconds: Record<PracticeSkill, number>;
  notes?: string;
  phases?: SessionPhaseRecord[];
}

export interface SessionPhaseRecord {
  id: PracticePhase["id"];
  name: string;
  skill: PracticeSkill;
  elapsedSeconds: number;
  durationMinutes?: number;
  exercises?: string[];
  resources?: PracticeResource[];
  notes?: string;
  repertoireItemId?: string;
  repertoirePartId?: string;
}

export interface PracticeTimerPhaseResult {
  id: PracticePhase["id"];
  name: string;
  skill: PracticeSkill;
  elapsedSeconds: number;
}

export interface DailyStats {
  dateKey: string;
  sessionCount: number;
  totalMinutes: number;
  averageBpm: number;
  skillMinutes: Record<PracticeSkill, number>;
}

export interface SkillDistribution {
  totalMinutes: number;
  categories: Record<PracticeSkill, { minutes: number; percentage: number }>;
}

export interface PracticeTimerResult {
  elapsedSeconds: number;
  startedAt: string;
  completed: boolean;
  skillSeconds: Record<PracticeSkill, number>;
  phases: PracticeTimerPhaseResult[];
}

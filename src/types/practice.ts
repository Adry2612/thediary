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

/** Forma de un acorde: un traste por cuerda, de la 6ª (grave) a la 1ª (aguda). */
export interface ChordShape {
  frets: (number | null)[];
  /** Traste base cuando el acorde no tiene cuerdas al aire. Se calcula si falta. */
  baseFret?: number;
}

/** Acorde colocado sobre una palabra o posición de una línea de la letra. */
export interface RepertoireChord {
  id: string;
  name: string;
  /** Índice de carácter dentro de la línea donde empieza el acorde. */
  position: number;
  shape?: ChordShape;
}

export interface RepertoireLyricLine {
  id: string;
  text: string;
  chords: RepertoireChord[];
}

export interface RepertoireChordChart {
  lines: RepertoireLyricLine[];
}

/** Acorde propio del usuario: un nombre y su forma, reutilizable entre canciones. */
export interface UserChord {
  id: string;
  name: string;
  shape: ChordShape;
}

export interface RepertoireTabNote {
  /** 0 = cuerda más grave, 5 = más aguda. */
  string: number;
  fret: number;
  /** Columna rítmica dentro de la tablatura. */
  column: number;
}

export interface RepertoireTab {
  /** Afinación en notación de cuerdas, p. ej. "EADGBE". */
  tuning: string;
  measures: number;
  /** Columnas por compás (resolución rítmica). */
  subdivision: number;
  notes: RepertoireTabNote[];
}

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
  /** Letra de la canción con los acordes asignados. */
  chordChart?: RepertoireChordChart;
  /** Tablatura creada con el editor visual. */
  tab?: RepertoireTab;
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

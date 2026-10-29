import type { CatalogSource } from "./catalog.ts";

export const PRACTICE_SKILLS = [
  "technique",
  "theory",
  "repertoire",
  "lick",
  "improvisation",
] as const;

export type PracticeSkill = (typeof PRACTICE_SKILLS)[number];

/** Métrica de bienestar declarada en una sesión. */
export type PracticeMetric = "mood" | "focus";

/** Valor de una métrica de bienestar, de 1 (peor) a 5 (mejor). */
export type PracticeMetricValue = 1 | 2 | 3 | 4 | 5;

export const PRACTICE_RESOURCE_KINDS = [
  "songsterr",
  "guitarpro",
  "pdf",
  "audio",
  "image",
  "youtube",
  "spotify",
  "tab",
] as const;

export type PracticeResourceKind = (typeof PRACTICE_RESOURCE_KINDS)[number];

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

/** Dificultad con la que se estudia un elemento del repertorio. */
export type RepertoireDifficulty = "beginner" | "intermediate" | "advanced";

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

/** Tipo de ligado: martillo (hammer-on) o tirón (pull-off). */
export type TabLegato = "hammer" | "pull";

/** Sentido del deslizamiento: ascendente, descendente o de posición. */
export type TabSlide = "up" | "down" | "position";

/** Vibrado: suave o amplio. */
export type TabVibrato = "slight" | "wide";

/** Armónico: natural, artificial, pinch o pulsado (tap). */
export type TabHarmonic = "natural" | "artificial" | "pinch" | "tap";

/** Bend de la nota, en semitonos, con liberación y prebend opcionales. */
export interface TabBend {
  /** Semitonos del bend: 0.25, 0.5, 1, 1.5 o 2. */
  semitones: number;
  /** El bend se libera al final. */
  release?: boolean;
  /** El bend arranca antes de que suene la nota. */
  prebend?: boolean;
}

export interface RepertoireTabNote {
  /** 0 = cuerda más grave, 5 = más aguda. */
  string: number;
  fret: number;
  /** Columna rítmica dentro de la tablatura. */
  column: number;
  /** Ligado desde la nota anterior de la misma cuerda. */
  legato?: TabLegato;
  /** Deslizamiento desde la nota anterior de la misma cuerda. */
  slide?: TabSlide;
  /** Bend aplicado a la nota. */
  bend?: TabBend;
  /** Vibrado aplicado a la nota. */
  vibrato?: TabVibrato;
  /** Apagado con la palma (palm mute). */
  palmMute?: boolean;
  /** Dejar sonar. */
  letRing?: boolean;
  /** Nota pulsada con la mano derecha (tapping). */
  tapping?: boolean;
  /** Armónico. */
  harmonic?: TabHarmonic;
  /** Nota muerta sin altura (la "x"). */
  dead?: boolean;
  /** Trémolo picking. */
  tremoloPicking?: boolean;
  /** Trino. */
  trill?: boolean;
  /** Slap. */
  slap?: boolean;
  /** Pop. */
  pop?: boolean;
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
  /** Dificultad para estudiarla (opcional). */
  difficulty?: RepertoireDifficulty;
  /** Enlace opcional de YouTube */
  youtubeUrl?: string;
  /** Enlace opcional de Spotify */
  spotifyUrl?: string;
  /** Álbum del que procede la canción, si se conoce. */
  album?: string;
  /** Año de lanzamiento del álbum, si se conoce. */
  releaseYear?: number;
  /** URL https de la carátula, si se conoce. */
  coverUrl?: string;
  /** Catálogo del que salieron los metadatos, si se buscaron. */
  catalogSource?: CatalogSource;
  /** Identificador del elemento en ese catálogo. */
  catalogId?: string;
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
  /** Lick de la biblioteca que se practica en este bloque. */
  lickId?: string;
}

export interface PracticeTemplate {
  id: string;
  name: string;
  phases: PracticePhase[];
  /** Guitarra elegida para la rutina; sin valor si no se especificó. */
  guitarType?: GuitarType;
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
  /** Guitarra con la que se practicó. Sin valor si no se eligió. */
  guitarType?: GuitarType;
  /** Guitarra concreta de Mi equipo, si se eligió. */
  guitarId?: string;
  /** Estado de ánimo al empezar la práctica; solo si se registró. */
  mood?: PracticeMetricValue;
  /** Nivel de foco al empezar la práctica; solo si se registró. */
  focus?: PracticeMetricValue;
  phases?: SessionPhaseRecord[];
}

export interface SessionPhaseRecord {
  id: PracticePhase["id"];
  name: string;
  skill: PracticeSkill;
  elapsedSeconds: number;
  /** BPM medio de este bloque, solo si el metrónomo sonó durante él. */
  averageBpm?: number;
  durationMinutes?: number;
  exercises?: string[];
  resources?: PracticeResource[];
  notes?: string;
  repertoireItemId?: string;
  repertoirePartId?: string;
  lickId?: string;
}

export interface PracticeTimerPhaseResult {
  id: PracticePhase["id"];
  name: string;
  skill: PracticeSkill;
  elapsedSeconds: number;
  lickId?: string;
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
  categories: Record<
    PracticeSkill,
    { minutes: number; percentage: number; sessionCount: number }
  >;
}

export interface PracticeTimerResult {
  elapsedSeconds: number;
  startedAt: string;
  completed: boolean;
  skillSeconds: Record<PracticeSkill, number>;
  phases: PracticeTimerPhaseResult[];
}

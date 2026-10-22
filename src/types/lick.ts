/** Técnicas globales con las que se clasifica un lick completo. */
export const TECHNIQUE_IDS = [
  "ALTERNATE_PICKING",
  "SWEEP_PICKING",
  "LEGATO",
  "BENDING",
  "TAPPING",
  "HYBRID_PICKING",
  "ECONOMY_PICKING",
  "FINGERSTYLE",
  "RHYTHM_STRUMMING",
  "SLIDE",
] as const;

export type TechniqueId = (typeof TECHNIQUE_IDS)[number];

/** Tonalidades admitidas: doce raíces, mayor y menor. */
export const MUSICAL_KEYS = [
  "C",
  "Cm",
  "C#",
  "C#m",
  "D",
  "Dm",
  "D#",
  "D#m",
  "E",
  "Em",
  "F",
  "Fm",
  "F#",
  "F#m",
  "G",
  "Gm",
  "G#",
  "G#m",
  "A",
  "Am",
  "A#",
  "A#m",
  "B",
  "Bm",
] as const;

export type MusicalKey = (typeof MUSICAL_KEYS)[number];

/** Un registro de velocidad dentro del historial de un lick. */
export interface BpmLogEntry {
  id: string;
  bpm: number;
  /** Instante ISO en que se registró. */
  date: string;
  /** Observación opcional, por ejemplo "limpio al 80%". */
  notes?: string;
}

export interface GuitarLick {
  id: string;
  title: string;
  /** Tablatura en texto plano, tal y como la escribió el usuario. */
  tabContent: string;
  /** Opcional: una idea rápida o un lick migrado puede no tenerla. */
  key?: MusicalKey;
  techniques: TechniqueId[];
  /** Canción del repertorio a la que pertenece el lick, si tiene una. */
  associatedSongId?: string;
  targetBpm?: number;
  /** Espejo del último registro del historial. */
  currentBpm?: number;
  bpmHistory: BpmLogEntry[];
  createdAt: string;
  /** Ausente cuando el lick nunca se ha practicado. */
  lastPracticedAt?: string;
  practiceCount: number;
}

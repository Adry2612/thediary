import type { PracticeResource } from "./practice";

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
  "PALM_MUTE",
  "HARMONICS",
  "STRING_SKIPPING",
  "TREMOLO_PICKING",
  "DOUBLE_STOPS",
  "ARPEGGIOS",
  "SLAP",
  "POP",
  "CHICKEN_PICKING",
  "WHAMMY_BAR",
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

/** Fragmento de un vídeo de YouTube que sirve de referencia al lick. */
export interface LickReferenceVideo {
  url: string;
  /** Segundo de inicio, entero y mayor o igual que 0. */
  startSeconds: number;
  /** Segundo de fin, entero y mayor que el inicio. */
  endSeconds: number;
}

export interface GuitarLick {
  id: string;
  title: string;
  /** Material de estudio adjunto: tablaturas Guitar Pro, PDF, imagen o enlace. */
  resources?: PracticeResource[];
  /** Vídeo de YouTube con el fragmento que se repite en la ficha. */
  referenceVideo?: LickReferenceVideo;
  /** Opcional: una idea rápida o un lick migrado puede no tenerla. */
  key?: MusicalKey;
  /** Origen de la tonalidad; ausente en los licks antiguos. */
  keySource?: "auto" | "manual";
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

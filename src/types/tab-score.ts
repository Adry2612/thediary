import type {
  TabBend,
  TabHarmonic,
  TabLegato,
  TabSlide,
  TabVibrato,
} from "./practice.ts";

/** Duración de un pulso como fracción de redonda: 1 = redonda, 4 = negra. */
export type TabBeatDuration = 1 | 2 | 4 | 8 | 16 | 32 | 64;

/** Subdivisiones irregulares admitidas: N notas en el tiempo de M. */
export const TAB_TUPLETS = [3, 5, 6, 7, 9, 10, 12] as const;

export type TabTuplet = (typeof TAB_TUPLETS)[number];

/** Notas de la figura base que ocupa cada subdivisión (3:2, 5:4…). */
export const TAB_TUPLET_IN_TIME: Record<TabTuplet, number> = {
  3: 2,
  5: 4,
  6: 4,
  7: 4,
  9: 8,
  10: 8,
  12: 8,
};

export type TabAccent = "normal" | "heavy";

export type TabTimeSignature = {
  numerator: number;
  denominator: 2 | 4 | 8 | 16;
};

export type TabNote = {
  /** 0 = cuerda más grave … 5 = más aguda. */
  string: number;
  fret: number;
  /** Continúa la nota anterior de la misma cuerda. */
  tie?: boolean;
  /** Nota fantasma, dibujada entre paréntesis. */
  ghost?: boolean;
  dead?: boolean;
  accent?: TabAccent;
  legato?: TabLegato;
  slide?: TabSlide;
  bend?: TabBend;
  vibrato?: TabVibrato;
  palmMute?: boolean;
  letRing?: boolean;
  tapping?: boolean;
  harmonic?: TabHarmonic;
  tremoloPicking?: boolean;
  trill?: boolean;
  slap?: boolean;
  pop?: boolean;
};

export type TabBeat = {
  id: string;
  duration: TabBeatDuration;
  dots?: 1;
  tuplet?: TabTuplet;
  rest?: boolean;
  notes: TabNote[];
};

export type TabBar = {
  id: string;
  /** Si falta, hereda el compás del compás anterior. */
  timeSignature?: TabTimeSignature;
  /** Cambio de tempo desde este compás. */
  tempo?: number;
  beats: TabBeat[];
};

export type TabScore = {
  version: 2;
  /** Afinación en notación de cuerdas, p. ej. "EADGBE". */
  tuning: string;
  /** Tempo inicial, 30..300. */
  tempo: number;
  bars: TabBar[];
};

export const TAB_BEAT_DURATIONS: readonly TabBeatDuration[] = [
  1, 2, 4, 8, 16, 32, 64,
];

export const TAB_TIME_SIGNATURE_DENOMINATORS = [2, 4, 8, 16] as const;

export const TAB_MIN_BARS = 1;
export const TAB_MAX_BARS = 64;
/** Tope de pulsos por compás para que dividir no crezca sin freno. */
export const TAB_MAX_BEATS_PER_BAR = 64;
export const TAB_MIN_TEMPO = 30;
export const TAB_MAX_TEMPO = 300;
export const TAB_MIN_FRET = 0;
export const TAB_MAX_FRET = 24;
export const TAB_TICKS_PER_QUARTER = 960;

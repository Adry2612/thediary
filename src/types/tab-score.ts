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

export const TAB_DYNAMICS = ["pp", "p", "mp", "mf", "f", "ff"] as const;

export type TabDynamic = (typeof TAB_DYNAMICS)[number];

export const TAB_HAIRPINS = ["crescendo", "decrescendo"] as const;

export type TabHairpin = (typeof TAB_HAIRPINS)[number];

export const TAB_STROKES = ["down", "up", "rasgueado"] as const;

export type TabStroke = (typeof TAB_STROKES)[number];

export type TabGrace = {
  fret: number;
  timing: "before" | "on";
};

export const TAB_MAX_SECTION_LENGTH = 30;
export const TAB_MAX_TEXT_LENGTH = 40;
export const TAB_MAX_CHORD_LENGTH = 30;
export const TAB_MIN_REPEAT = 2;
export const TAB_MAX_REPEAT = 99;
/** alphaTab solo admite 31 pasadas distintas en un final. */
export const TAB_MAX_ENDING = 31;

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
  /** Pulso que ocupa su tiempo pero no tiene notas ni figura de silencio. */
  empty?: true;
  notes: TabNote[];
  /** Dinámica que rige desde este pulso hasta la siguiente. */
  dynamic?: TabDynamic;
  /** Marca de regulador; cada pulso del tramo lleva la misma. */
  hairpin?: TabHairpin;
  /** Texto libre sobre el pulso, hasta 40 caracteres. */
  text?: string;
  /** Nombre del acorde, hasta 30 caracteres. */
  chord?: string;
  stroke?: TabStroke;
  fermata?: true;
  /** Apoyatura sobre la primera nota del pulso. */
  grace?: TabGrace;
};

export type TabBar = {
  id: string;
  /** Si falta, hereda el compás del compás anterior. */
  timeSignature?: TabTimeSignature;
  /** Cambio de tempo desde este compás. */
  tempo?: number;
  beats: TabBeat[];
  /** Nombre de sección, hasta 30 caracteres. */
  section?: string;
  /** Apertura y cierre de repetición en este compás. */
  repeat?: { start?: true; end?: number };
  /** Pasadas en las que suena este compás, p. ej. [1] o [2, 3]. */
  endings?: number[];
  /** Compás anacrúsico; solo puede ser el primero. */
  pickup?: true;
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

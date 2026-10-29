/** Tipo de entrada del historial de una guitarra. */
export const GUITAR_ENTRY_KINDS = ["strings", "note"] as const;

export type GuitarEntryKind = (typeof GUITAR_ENTRY_KINDS)[number];

/** Familia de cuerdas: decide qué parte del catálogo se muestra. */
export const GUITAR_STRING_KINDS = [
  "electric",
  "acoustic",
  "classical",
] as const;

export type GuitarStringKind = (typeof GUITAR_STRING_KINDS)[number];

export type GuitarStringUnit = "in" | "mm";

/**
 * Copia del juego montado, guardada con la entrada del historial para que no
 * dependa de que el catálogo siga teniendo ese modelo.
 */
export interface GuitarStringSetSnapshot {
  brand: string;
  model: string;
  /** Nombre comercial, si el modelo lo tiene. */
  name?: string;
  kind: GuitarStringKind;
  /** Calibres por cuerda, de grave a aguda. */
  gauges?: number[];
  unit?: GuitarStringUnit;
  /** Calibres escritos a mano cuando no vienen del catálogo. */
  gaugeText?: string;
  /** Ruta pública de la foto del paquete, si la había al montarlo. */
  image?: string;
}

/**
 * Guitarra del usuario. Solo el nombre es obligatorio: el resto se añade si
 * aporta algo, para no convertir el alta en un formulario largo.
 */
export interface Guitar {
  id: string;
  name: string;
  /** Intervalo de cambio de cuerdas en días; sin valor si no hay recordatorio. */
  intervalDays?: number;
  /** Intervalo de cambio en horas de uso; sin valor si no hay recordatorio. */
  intervalHours?: number;
  /** Archivo de la foto en la biblioteca local y en la cuenta. */
  photoAssetId?: string;
  /** Familia de cuerdas; decide qué catálogo se propone al cambiarlas. */
  stringKind?: GuitarStringKind;
  createdAt: string;
  updatedAt: string;
}

/**
 * Una entrada del historial. `strings` reinicia la cuenta del recordatorio;
 * `note` es cualquier otra intervención, escrita a mano.
 */
export interface GuitarEntry {
  id: string;
  guitarId: string;
  /** Fecha en formato YYYY-MM-DD. */
  date: string;
  /** Descripción libre; vacía en un cambio de cuerdas sin marca ni notas. */
  text?: string;
  /** Juego de cuerdas montado, si se eligió uno. */
  stringSet?: GuitarStringSetSnapshot;
  kind: GuitarEntryKind;
  createdAt: string;
  updatedAt: string;
}

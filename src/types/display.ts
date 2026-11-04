/**
 * Idioma con el que se muestran los nombres de los catálogos.
 *
 * `original-es` es el modo original con la interfaz en español: los nombres
 * propios se quedan en su forma original, pero los que solo son una traducción
 * (por ejemplo, «strumming») usan el nombre español.
 */
export type CatalogNameLanguage = "es" | "original" | "original-es";

/** Presentación de las afinaciones: nombre conocido o notas por cuerda. */
export type TuningDisplay = "name" | "notes";

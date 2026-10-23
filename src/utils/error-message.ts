/**
 * Texto de un error para mostrar al usuario.
 *
 * Los errores que lanza la aplicación ya llevan un mensaje escrito para
 * leerse, así que se usa tal cual; cualquier otro valor (una cadena, un objeto
 * suelto, `undefined`) cae en el texto alternativo que da el sitio que lo
 * muestra.
 */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

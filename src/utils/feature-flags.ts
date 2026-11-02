/**
 * Banderas de funcionalidad.
 *
 * Las variables `NEXT_PUBLIC_` se fijan al construir, así que un entorno que no
 * las defina (producción) queda con la funcionalidad cerrada: el código y los
 * datos se conservan, pero los usuarios no llegan a ella.
 */

function isEnabled(value: string | undefined): boolean {
  const flag = value?.trim().toLowerCase();
  return flag === "1" || flag === "true";
}

/**
 * Editor de tablatura por partitura. Se abre con `NEXT_PUBLIC_TAB_EDITOR=1`
 * mientras termina la migración de los datos antiguos.
 */
export const isTabEditorEnabled = isEnabled(
  process.env.NEXT_PUBLIC_TAB_EDITOR,
);

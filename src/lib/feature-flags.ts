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
 * Editor propio de tablatura. Sigue en diseño, así que la sección se oculta
 * salvo que se abra con `NEXT_PUBLIC_TAB_EDITOR=1`.
 */
export const isTabEditorEnabled = isEnabled(
  process.env.NEXT_PUBLIC_TAB_EDITOR,
);

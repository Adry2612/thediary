/**
 * Geometría de la lista de opciones de un select. Se calcula contra el
 * contenedor donde se portaliza: dentro de un diálogo, un `transform` en el
 * panel convierte al diálogo en el bloque contenedor de los `position: fixed`,
 * así que la lista se posiciona en absoluto respecto a su padding box.
 */

export type SelectRect = {
  left: number;
  top: number;
  bottom: number;
  right: number;
  width: number;
};

export type SelectScrollBox = SelectRect & {
  clientLeft: number;
  clientTop: number;
  clientWidth: number;
  clientHeight: number;
  scrollLeft: number;
  scrollTop: number;
};

export type ListboxPlacement = {
  position: "absolute" | "fixed";
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

export const LISTBOX_GAP = 4;
const ESTIMATED_OPTION_HEIGHT = 40;
const ESTIMATED_LIST_PADDING = 8;
const LISTBOX_MAX_HEIGHT = 240;
const MIN_VISIBLE_HEIGHT = 44;

type GetListboxPlacementInput = {
  trigger: SelectRect;
  /** `null` cuando el portal va a `document.body`. */
  container: SelectScrollBox | null;
  viewport: { width: number; height: number };
  optionCount: number;
};

export function getListboxPlacement({
  trigger,
  container,
  viewport,
  optionCount,
}: GetListboxPlacementInput): ListboxPlacement {
  const position = container ? "absolute" : "fixed";

  // Borde superior izquierdo del padding box del contenedor, que es el origen
  // de un hijo `position: absolute`. El scroll desplaza ese contenido.
  const originLeft = container
    ? container.left + container.clientLeft - container.scrollLeft
    : 0;
  const originTop = container
    ? container.top + container.clientTop - container.scrollTop
    : 0;

  const paddingTop = container ? container.top + container.clientTop : 0;
  const paddingBottom = container
    ? container.top + container.clientTop + container.clientHeight
    : viewport.height;

  const visibleTop = Math.max(paddingTop, 0);
  const visibleBottom = Math.min(paddingBottom, viewport.height);

  const availableBelow = visibleBottom - trigger.bottom - LISTBOX_GAP;
  const availableAbove = trigger.top - visibleTop - LISTBOX_GAP;
  const estimatedHeight = Math.min(
    Math.max(optionCount, 1) * ESTIMATED_OPTION_HEIGHT + ESTIMATED_LIST_PADDING,
    LISTBOX_MAX_HEIGHT,
  );

  const opensUpward =
    availableBelow < estimatedHeight && availableAbove > availableBelow;
  const available = Math.max(opensUpward ? availableAbove : availableBelow, 0);
  const maxHeight = Math.max(
    Math.min(estimatedHeight, available),
    Math.min(MIN_VISIBLE_HEIGHT, estimatedHeight),
  );

  const left = trigger.left - originLeft;

  if (opensUpward) {
    return {
      position,
      left,
      width: trigger.width,
      // Distancia desde el borde inferior del padding box hasta el borde
      // inferior de la lista, para no depender del alto real de la lista.
      bottom:
        paddingBottom - (container?.scrollTop ?? 0) - trigger.top + LISTBOX_GAP,
      maxHeight,
    };
  }

  return {
    position,
    left,
    width: trigger.width,
    top: trigger.bottom - originTop + LISTBOX_GAP,
    maxHeight,
  };
}

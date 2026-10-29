# Design

## Context

See `proposal.md` for the motivation. The state that shapes the approach:

- `SelectField` (`src/components/ui/SelectField.tsx`) portaliza la lista al `<dialog>` más cercano y la coloca con `position: fixed` usando coordenadas de viewport (`getBoundingClientRect`).
- Los paneles de diálogo usan la clase `overlay-motion`, cuya animación de entrada (`overlay-panel-in`, `animation-fill-mode: both`) deja un `transform` aplicado. Un ancestro con `transform` pasa a ser el bloque contenedor de los descendientes `position: fixed`.
- El diálogo recorta con `overflow-x: hidden`, así que la lista desplazada pierde su borde derecho y parte de cada opción.
- La lista ya sabe abrirse hacia arriba cuando no cabe abajo, y se cierra al hacer scroll para no quedar flotando lejos del control.
- `src/utils/select-options.ts` ya concentra la lógica pura del selector y tiene pruebas; el cálculo de posición encaja con ese patrón.

## Goals / Non-Goals

**Goals:**

- Que la lista quede alineada con su control y completa dentro del diálogo, con cualquier viewport y en cualquier diálogo.
- Que el cálculo sea una función pura, comprobable sin navegador.
- No cambiar la API de `SelectField` ni el comportamiento de teclado.

**Non-Goals:**

- Reposicionar la lista mientras el diálogo se desplaza: sigue cerrándose al hacer scroll.
- Adoptar la Popover API o mover el portal fuera del diálogo.
- Tocar la animación de entrada de los diálogos.

## Decisions

### 1. La posición se calcula contra el contenedor del portal, no contra el viewport

`src/utils/select-position.ts` expone una función pura:

```ts
type Rect = { left: number; top: number; bottom: number; right: number; width: number };
type ScrollBox = Rect & { clientLeft: number; clientTop: number; scrollLeft: number; scrollTop: number };

getListboxPlacement(input: {
  trigger: Rect;
  container: ScrollBox | null;   // null cuando el portal va a document.body
  viewport: { width: number; height: number };
  optionCount: number;
}): {
  position: "absolute" | "fixed";
  left: number;
  top?: number;
  bottom?: number;
  width: number;
  maxHeight: number;
}
```

Reglas:

- Portal a un diálogo → `position: "absolute"`; origen = borde superior izquierdo del padding box del diálogo (`rect.left + clientLeft`, `rect.top + clientTop`) más su desplazamiento de scroll, porque un hijo absoluto se mueve con el contenido del contenedor.
- Portal a `document.body` → `position: "fixed"` y coordenadas de viewport, como hasta ahora.
- `left` y `width` salen del control: la lista nunca es más ancha que él, así que no puede salirse por la derecha si el control está dentro.
- Se abre hacia arriba cuando el alto estimado (`min(opciones × 40 + 8, 240)`) no cabe abajo y hay más sitio arriba.
- `maxHeight` se recorta al espacio realmente disponible en el lado elegido, con un mínimo de una fila, para que la lista nunca desborde el diálogo cuando ninguno de los dos lados alcanza.
- El hueco de 4 px entre control y lista se mantiene.

Con esto el `transform` del diálogo deja de importar: el mismo cálculo funciona con o sin animación y con cualquier `overflow` del panel.

- Alternativa considerada: quitar el `transform` retenido cambiando el `animation-fill-mode` a `backwards`. Rechazada: durante los 180 ms de entrada el panel sigue transformado, y cualquier otro diálogo con una animación distinta volvería a romperse.
- Alternativa considerada: portalizar a `document.body`. Rechazada: en un diálogo modal el body queda tras el backdrop y la lista dejaría de verse.
- Alternativa considerada: `popover="manual"` para dibujar la lista en la capa superior. Rechazada por ahora: añade una API nueva, cambia el apilado y el manejo de foco, y no hace falta para resolver el recorte.

### 2. La función pura se prueba con geometría fija

`tests/select-position.test.mjs` cubre: diálogo desplazado (el caso del `transform`), apertura hacia arriba, recorte de `maxHeight` cuando ningún lado alcanza, portal a body con posición fija, y viewport estrecho de 375 px.

### 3. `SelectField` solo cambia la fuente de la geometría

`openListbox` reúne el rectángulo del control, el del contenedor del portal (con `clientLeft`, `clientTop`, `scrollLeft`, `scrollTop`) y el viewport, y pasa el resultado a `setListboxStyle`. El resto del componente —teclado, foco, cierre por fuera, `aria-activedescendant`— no cambia.

## Risks / Trade-offs

- **La lista se recorta si el propio control ya sobresale del diálogo** → no se puede arreglar desde la lista; la comprobación de 375 px confirma que los controles actuales caben.
- **`maxHeight` más pequeño que el alto estimado** → la lista se vuelve desplazable antes de lo previsto; el mínimo de una fila evita que quede inutilizable.
- **Diálogos anidados** → `closest("dialog")` sigue eligiendo el más cercano, que es el que recorta; el cálculo se hace contra ese mismo.
- **El scroll del diálogo con la lista abierta** → se mantiene el cierre al hacer scroll, así que no hay que recalcular posición en cada evento.

## Migration Plan

None. No hay datos ni API que migrar; el cambio es de posicionamiento.

## Open Questions

None.

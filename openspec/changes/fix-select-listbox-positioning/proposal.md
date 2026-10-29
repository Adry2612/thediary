# Proposal

## Why

Dentro de un diálogo, la lista de opciones de cualquier `SelectField` se dibuja desplazada y queda cortada por el borde derecho del panel: se ven solo las primeras letras de cada opción y no se puede leer ni pulsar el resto. El fallo aparece en los ajustes del metrónomo (Compás, Sonido, Unidad del tempo incremental) y en el resto de diálogos con selectores, como el registro manual de práctica o el editor de licks.

La causa es que el panel del diálogo conserva un `transform` por su animación de entrada. Un ancestro con `transform` se convierte en el contenedor de los descendientes `position: fixed`, y la lista —que se portaliza dentro del diálogo y se coloca con coordenadas de viewport— acaba sumando el desplazamiento del diálogo y recortándose contra su `overflow-x-hidden`.

## What Changes

- La lista de opciones de un select se coloca respecto al contenedor donde se portaliza, no respecto al viewport, de modo que el `transform` del diálogo deja de desviarla.
- La lista sigue abriéndose hacia abajo y, cuando no cabe, hacia arriba, sin salirse del diálogo ni del viewport.
- El cálculo de la posición se extrae a una función pura, para poder probarlo sin navegador.
- Se revisan los diálogos que ya contienen selectores: ajustes del metrónomo, registro manual de práctica y editor de licks.

Fuera del alcance:

- Rediseñar `SelectField`, su teclado o sus nombres accesibles, que ya funcionan.
- El tamaño, los colores o los bordes del panel.
- Quitar la animación de entrada de los diálogos.
- Cambiar el portal a `document.body`: en un diálogo modal el contenido del body queda detrás del backdrop y la lista dejaría de verse.
- Las voces del metrónomo: su corrección vive en `add-metronome-click-voices`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `app-accessibility`: añade un requisito sobre la lista de opciones de un select, que debe quedar visible y alcanzable dentro del diálogo que contiene el control.

## Impact

- `src/components/ui/SelectField.tsx`: posición del listbox y cálculo de espacio disponible.
- Nuevo `src/utils/select-position.ts` con la geometría pura, y `tests/select-position.test.mjs`.
- Sin cambios de API: `SelectField` mantiene sus props.
- Diálogos afectados (verificación): `MetronomeSettings`, `ManualPracticeEntry`, `LickEditorModal` y cualquier otro que incluya un `SelectField`.
- `refactor-component-separation` dio por verificada la tarea 5.6.2 («la lista se coloca correctamente»), que en realidad nunca se cumplió; este cambio cubre esa comprobación, sin reabrir el refactor.

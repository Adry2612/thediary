# Proposal

## Why

El historial de una guitarra apunta cuándo cambiaste las cuerdas, pero no cuáles. Al cabo de unos meses no hay forma de recordar qué juego llevabas, y comparar dos cambios es imposible. Escribirlo a mano en las notas funciona, pero cada uno lo escribe distinto.

## What Changes

- El cambio de cuerdas pasa a tener un formulario propio: fecha, juego montado y notas.
- Se puede elegir el juego de un **catálogo** de los modelos principales —eléctrica, acústica y española—, con marca, modelo y calibres, o escribirlo a mano.
- El catálogo vive en un **JSON** dentro del proyecto: se añaden modelos sin tocar código y funciona sin conexión.
- El historial guarda una **copia del juego** con cada cambio, así que un modelo retirado del catálogo sigue leyéndose bien.
- La entrada del historial muestra el juego montado, y el cambio se puede seguir apuntando desde el historial con el mismo selector.

Fuera del alcance:

- Calibres editables cuerda a cuerda.
- Recomendaciones de juego según estilo o guitarra.
- Precios, stock o enlaces de compra.
- Sincronizar el catálogo desde fuera de la app.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `guitar-maintenance`: añade un requisito sobre el juego de cuerdas del cambio, sin cambiar los existentes.

## Impact

- Datos: `src/data/guitar-strings.json` (nuevo) y `src/utils/guitar-strings.ts` (nuevo).
- Tipos: `src/types/equipment.ts` gana el juego guardado en la entrada.
- Normalización: `src/utils/equipment.ts` valida la copia guardada.
- Interfaz: `StringSetFields`, `StringChangeDialog`, `StringsPanel` y `GuitarHistoryDialog` en `src/components/tools/`.
- Textos: `src/i18n/es.ts` y `src/i18n/en.ts`.
- Pruebas: `tests/guitar-strings.test.mjs`.

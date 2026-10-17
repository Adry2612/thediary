# Tasks

## 1. Ventana de edición en el modelo

- [x] 1.1 Añadir `EDITING_WINDOW_SIZE`, `MAX_EDITING_FRET`, `getEditingWindowStart(shape)` y `getMaxEditingWindowStart()` en `src/lib/chords.ts` (ventana de cinco trastes, encuadre de la forma con el tope del traste 15) y verificar con pruebas: forma vacía, un acorde de la librería, uno con trastes altos y que todas las formas del vocabulario caben en la ventana.

## 2. Diagrama y selector

- [x] 2.1 Aceptar una ventana opcional (`fretWindow`) en `FretboardDiagram`, usarla en lugar del ajuste automático y no dibujar los puntos de trastes que quedan fuera de ella.
- [x] 2.2 Llevar el estado de la ventana en `ChordPicker`: encuadrar la forma al abrir, al cambiar de nombre (a mano o desde el buscador) y al cambiar de posición; dejar la ventana quieta al marcar trastes; y añadir las flechas ▲▼ junto al diagrama con sus etiquetas de i18n, deshabilitadas en los extremos.
- [x] 2.3 Centrar el diagrama: compensar el sitio que ocupan las flechas y repartir igual el hueco de la etiqueta del traste base, de forma que la cuadrícula quede en el centro de la caja; comprobar en el navegador que el centro de la cuadrícula coincide con el del campo de nombre.
- [x] 2.4 Empezar un acorde nuevo con las seis cuerdas al aire (`openShape` en `ChordPicker`), de forma que marcar solo los trastes baste para los acordes abiertos (Em, Am, C…) y las cuerdas que no deban sonar se muteen con un clic; comprobar en el navegador que Em se dibuja con dos clics y que un acorde con la 6ª muteada se sigue reconociendo.

## 3. Verificación

- [x] 3.1 Ejecutar `npm run typecheck` y `npm test` y confirmar que pasan sin errores.
- [x] 3.2 Ejecutar `npm run build` y confirmar que termina correctamente.
- [x] 3.3 Comprobar en el navegador: dibujar un B (`x24442`) y un Eb (`x68886`) moviendo la ventana con las flechas, ver que el nombre se asocia, que la ventana no se encoge al marcar y que el traste 4 sigue disponible.

## Workflow follow-up

- Archivar el cambio cuando la implementación esté verificada.

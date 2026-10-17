# Tasks

## 1. Disparador compacto

- [x] 1.1 Añadir `SearchIcon` (lupa) a `src/components/ui/icons.tsx` siguiendo el patrón de `StrokeIcon`.
- [x] 1.2 En `ChordPicker`, poner el botón de lupa en la esquina derecha del campo de nombre (solo icono, con `aria-label`) y retirar el botón de texto a lo ancho; verificar que el campo no pisa el texto.

## 2. Buscador en una modal

- [x] 2.1 Pasar `ChordFinder` a `ChordFinderDialog`: un `<dialog>` controlado (`open`, `onClose`, `selectedName`, `saved`, `onPick`) con el patrón de `PracticeCompletionDialog` (`showModal()`, `backdrop:bg-black/70`), que conserva el filtro, los grupos por nota, los Personalizados y el marcado del seleccionado, y se cierra al elegir, con Escape y tocando el fondo.
- [x] 2.2 Comprobar en el navegador que al abrir y cerrar el buscador la caja del acorde conserva su alto y el mástil no se mueve; ajustar si la modal no encaja en pantalla pequeña.
- [x] 2.3 Añadir las etiquetas nuevas (título de la modal y cerrar) en español e inglés; verificar con la prueba de i18n.

## 3. Verificación

- [x] 3.1 Ejecutar `npm run typecheck` y `npm test` y confirmar que pasan sin errores.
- [x] 3.2 Ejecutar `npm run build` y confirmar que termina correctamente.
- [x] 3.3 Comprobar en el navegador el flujo completo: abrir la modal con la lupa, filtrar, elegir un acorde estándar y uno personalizado, ver que el mástil y la posición responden, y que asignar y guardar funcionan.

## Workflow follow-up

- Archivar el cambio cuando la implementación esté verificada.

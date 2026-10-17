# Tasks

## 1. Control de posición encima del dibujo

- [x] 1.1 Mover en `ChordPicker` el control `‹ Posición k/n ›` para que quede entre el nombre y el mástil; comprobar en el navegador que al cambiar de forma (ventana de trastes distinta) el control no se mueve de sitio.

## 2. Buscador de acordes

- [x] 2.1 Añadir en `ChordPicker` el botón que abre el buscador y el panel con campo de filtro, los acordes estándar agrupados por nota (con las etiquetas enarmónicas) y el grupo "Personalizados"; al elegir un acorde escribe el nombre, refresca el dibujo y cierra el panel.
- [x] 2.2 Quitar los `SelectField` de Nota y Tipo y el código que ya no se usa (`handleNoteChange`, `handleTypeChange`, las opciones `type:`/`saved:`), dejando el nombre como única fuente de verdad; comprobar que teclear un acorde reconocido sigue actualizando el mástil y que un nombre no reconocido se conserva.
- [x] 2.3 Añadir las etiquetas nuevas de español e inglés (abrir buscador, buscar acorde, sin resultados, cerrar) y verificar con la prueba de i18n que las dos locales tienen las mismas claves.

## 3. Verificación

- [x] 3.1 Ejecutar `npm run typecheck` y `npm test` y confirmar que pasan sin errores.
- [x] 3.2 Ejecutar `npm run build` y confirmar que termina correctamente.
- [x] 3.3 Comprobar en el navegador el flujo completo: abrir el buscador, elegir un acorde estándar y uno guardado, comprobar que el dibujo y la posición responden, que el control de posición no salta y que asignar y guardar funcionan.

## Workflow follow-up

- Archivar el cambio cuando la implementación esté verificada.

# Tasks

## 1. Base de tiempos de reloj

- [x] 1.1 Crear `src/utils/clock-time.ts` con `parseClockInput` (`83`, `1:23`, `1:02:03`), `formatClockInput` y `formatOvertimeInput`; verificar con `tests/clock-time.test.mjs`: formatos válidos, negativos, decimales, segundos o minutos de 60 o más, más de tres partes y el límite de 24 horas.
- [x] 1.2 Hacer que `src/utils/licks/reference-video.ts` delegue en el parser y el formateador compartidos sin cambiar su validación; verificar con `node --test tests/licks-reference-video.test.mjs`.
- [x] 1.3 Documentar en `docs/licks.md` que el clip y la edición de prácticas comparten los formatos de tiempo; verificar que los ejemplos del documento coinciden con los tests de 1.1.

## 2. Edición de una práctica terminada

- [x] 2.1 Cambiar el borrador editable a segundos (`actualSeconds`, `durationSeconds`), copiar `elapsedSeconds` sin redondear en `toEditableSession` y escribirlo tal cual en `applySessionEdit`; verificar con `tests/practice-session-editing.test.mjs` un bloque de 83 s, una sesión de más de una hora y la conservación de vínculos y BPM.
- [x] 2.2 Extraer el parseo y la validación de los campos de tiempo a un helper puro y usarlo en `SessionEditor` con entradas de texto, `inputMode="numeric"`, `noValidate` y errores junto al campo; verificar con `tests/practice-session-editor.test.mjs` que `1:23` y `83` dan 83 s y que un valor inválido no borra el resto del borrador.
- [x] 2.3 Cambiar la presentación de tiempo real, duración sin bloques y total derivado a `mm:ss` o `h:mm:ss`; verificar en el navegador que una práctica con 83 s muestra `1:23` y que el total no usa decimales.
- [x] 2.4 Añadir las cadenas de los campos y errores de tiempo en `es.ts`, `en.ts` y `dictionary.ts`; verificar con `node --test tests/i18n.test.mjs`.
- [x] 2.5 Crear `docs/practice.md` con la edición de prácticas, los formatos aceptados y la validación; verificar que el documento coincide con 2.1–2.3.
- [x] 2.6 Recorrer en el navegador una práctica terminada con tiempos que no son múltiplos de medio minuto: abrir, editar, guardar y reabrir sin error nativo de `step`; anotar el resultado.

## 3. Temporizador: tiempo extra, total y aviso

- [x] 3.1 Actualizar `TimerCard` para que el reloj grande muestre `formatOvertimeInput(overtimeSeconds)` en verde cuando el bloque siga contando, y añadir la fila dedicada del tiempo total con `formatClockInput(elapsedSeconds)`; verificar con `tests/format.test.mjs` y `npm run typecheck`.
- [x] 3.2 Sustituir el `Toast` flotante de `TimerCard` por un aviso integrado en la parte superior de la tarjeta para objetivo alcanzado y bloque terminado, con `role="status"` y autocierre; verificar con `node --test tests/i18n.test.mjs` y en el navegador que no tapa el reloj ni los botones.
- [x] 3.3 Documentar en `docs/practice.md` el tiempo extra verde, el aviso superior y la fila del total; verificar que coincide con 3.1–3.2.
- [x] 3.4 Recorrer en el navegador el bloque con «seguir contando» activo a 1440 px y 375 px: ver `+mm:ss` en verde, el aviso arriba, el total en su fila y la limpieza al avanzar; anotar el resultado.

## 4. Alcance del tiempo objetivo

- [x] 4.1 Añadir `allowsTarget` a `PracticeLaunchPlan` y `ActivePracticeSession`; activarlo en práctica rápida y rápida de repertorio, desactivarlo en rutinas guardadas, planes construidos y repeticiones de sesión, y descartar el objetivo al restaurar una rutina sin flag; verificar con `tests/practice-launch.test.mjs` y `tests/active-practice-session.test.mjs`.
- [x] 4.2 Pasar `canSetTarget` desde `PracticeSession` a `TimerCard` y ocultar la sección de objetivo cuando no se permita; verificar con `npm run typecheck` y en el navegador que una rutina no muestra el control y una práctica rápida sí.
- [x] 4.3 Documentar en `docs/practice.md` en qué sesiones aparece el tiempo objetivo; verificar que coincide con 4.1–4.2.
- [x] 4.4 Recorrer en el navegador práctica rápida de técnica, práctica rápida de repertorio y rutina guardada: comprobar dónde aparece el objetivo y que el temporizador sigue funcionando; anotar el resultado.

## 5. Buscador de catálogo con vista previa

- [x] 5.1 Añadir `buildCatalogApplyUpdates` en `src/utils/repertoire-catalog.ts` para devolver título, artista, álbum, año, carátula, origen e identificador, conservando los campos opcionales que el candidato no traiga; verificar con `tests/repertoire-catalog.test.mjs` los cambios completos, los huecos y los valores inválidos.
- [x] 5.2 Crear `CatalogPreviewDialog` y conectar `RepertoireItemCard` para guardar el candidato pendiente, mostrar la vista previa y aplicar solo al confirmar; sacar «Buscar datos» de la configuración extra a la zona principal de edición; verificar con `npm run typecheck` y en el navegador.
- [x] 5.3 Añadir las cadenas de la vista previa (actual, nuevo, aplicar, cancelar, sin cambios) en `es.ts`, `en.ts` y `dictionary.ts`; verificar con `node --test tests/i18n.test.mjs`.
- [x] 5.4 Crear `docs/repertoire.md` con el flujo de búsqueda y vista previa, y la garantía de que afinación, capo, partes, cifrado, tablatura y material no se tocan; verificar que coincide con 5.1–5.2.
- [x] 5.5 Recorrer en el navegador una canción con título, artista, álbum, año y carátula ya guardados: buscar, ver la vista previa, confirmar y comprobar que se actualizan esos campos sin tocar la práctica ni la tablatura; cancelar otra búsqueda y comprobar que no cambia nada. Anotar el resultado.

## 6. Preferencias de presentación

- [x] 6.1 Crear `src/services/display-preferences.ts` con normalización, lectura, escritura y valores por defecto para `techniqueNameLanguage` y `tuningDisplay`; verificar con `tests/display-preferences.test.mjs` valores válidos, desconocidos, ausentes y el idioma por defecto.
- [x] 6.2 Crear `useDisplayPreferences` con lectura al montar, escucha de `storage` y del evento `thediary:display-preferences`, setters y resolución del idioma de técnicas según la interfaz; verificar con `npm run typecheck` y con el helper puro de resolución en `tests/display-preferences.test.mjs`.
- [x] 6.3 Añadir a `SettingsView` la sección de presentación con los dos controles y sus textos en `es.ts`, `en.ts` y `dictionary.ts`; verificar con `node --test tests/i18n.test.mjs` y en el navegador que cambiar una opción se aplica sin recargar.
- [x] 6.4 Crear `docs/settings.md` con el alcance por dispositivo, los valores por defecto y los dos ajustes; verificar que coincide con 6.1–6.3.

## 7. Catálogos de técnicas y temas de teoría

- [x] 7.1 Crear `src/utils/catalogs/techniques.ts` con `TECHNIQUE_CATALOG` (id, español, original, glifo) y los resolutores por id o por cualquiera de los dos nombres; adaptar `src/utils/licks/techniques.ts` y `presentation.ts`, retirar las claves `licks.technique*` de i18n y actualizar sus consumidores; verificar con `tests/licks-catalogue.test.mjs`, `tests/licks-distribution.test.mjs` y `tests/i18n.test.mjs`.
- [x] 7.2 Crear `src/utils/catalogs/theory.ts` con `THEORY_CATALOG` (temas iniciales de teoría con nombre español y original) y sus resolutores; verificar con `tests/theory-catalogue.test.mjs` la búsqueda por ambos nombres, el nombre antiguo y la ausencia de coincidencias.
- [x] 7.3 Añadir `TheoryPickerDialog` reutilizando `SearchPickerDialog`, usarlo en `PracticePhaseEditor` para los bloques de teoría y conservar el nombre antiguo como opción; verificar con `tests/practice-block-editor.test.mjs` y en el navegador.
- [x] 7.4 Aplicar la preferencia de nombres a las insignias y editores de licks, a los títulos de bloques de práctica, al detalle de prácticas guardadas y al análisis; canonicalizar la agrupación de técnicas y teorías por su entrada de catálogo; verificar con `tests/practice-session-details.test.mjs`, `tests/practice-analytics.test.mjs` y `tests/licks-distribution.test.mjs`.
- [x] 7.5 Documentar en `docs/licks.md` y `docs/practice.md` los catálogos, los nombres antiguos y la preferencia; verificar que coincide con 7.1–7.4.
- [x] 7.6 Recorrer en el navegador a 1440 px y 375 px: cambiar el idioma de técnicas en Configuración, comprobar licks y títulos de bloques; buscar un tema de teoría en ambos idiomas y comprobar que un nombre antiguo sigue apareciendo. Anotar el resultado.

## 8. Catálogo de afinaciones y su presentación

- [x] 8.1 Crear `src/utils/catalogs/tunings.ts` con las afinaciones conocidas (nombre español, nombre original, notas y valor guardado), derivar `COMMON_TUNINGS`, y añadir `formatTuning` y `formatTuningPreset`; verificar con `tests/tunings.test.mjs` Drop D, estándar, una afinación personalizada y una desconocida.
- [x] 8.2 Aplicar el formateador a los desplegables del formulario y la ficha de repertorio, a la nota de afinación del formulario y a las etiquetas del afinador, sin cambiar el valor guardado; verificar con `npm run typecheck` y en el navegador.
- [x] 8.3 Actualizar `docs/repertoire.md` y `docs/settings.md` con la presentación por nombre o por cuerdas y el fallback de afinaciones personalizadas; verificar que coincide con 8.1–8.2.
- [x] 8.4 Recorrer en el navegador a 1440 px y 375 px: cambiar entre nombre y notas, comprobar los desplegables de repertorio, una ficha guardada y las etiquetas del afinador, y confirmar que el valor guardado de la canción no cambia. Anotar el resultado.

## 9. Verificación de integración

- [x] 9.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build`; verificar que los tres terminan sin fallos nuevos.
- [x] 9.2 Recorrer en el navegador a 1440 px y 375 px los flujos cambiados (editar práctica, tiempo extra y aviso, alcance del objetivo, vista previa del catálogo, nombres de técnicas y teoría, etiquetas de afinación) y comprobar que no hay desbordamiento horizontal ni errores de consola; anotar el resultado.

## Workflow follow-up

- Archivar el cambio después de la revisión.
- Revisar si alguna otra pantalla muestra técnicas o afinaciones y aplicar la misma preferencia si procede.

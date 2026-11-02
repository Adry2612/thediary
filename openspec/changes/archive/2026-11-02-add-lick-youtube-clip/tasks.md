# Tasks

## 1. Modelo y validación

- [x] 1.1 Añadir el tipo `LickReferenceVideo` (`url`, `startSeconds`, `endSeconds`) y el campo opcional `referenceVideo` a `GuitarLick` en `src/types/lick.ts`; verificar con `npm run typecheck`.
- [x] 1.2 Crear `src/utils/licks/reference-video.ts` con el parseo de tiempos (`83`, `1:23`, `1:02:03`), el formato `m:ss`/`h:mm:ss`, la normalización del clip y la validación del borrador. Verificar con `tests/licks-reference-video.test.mjs`: tiempos válidos e inválidos, enlace que no es de YouTube, fin igual o anterior al inicio y formato de salida; ejecutar `node --test tests/licks-reference-video.test.mjs`.
- [x] 1.3 Normalizar el clip en `normalizeLick`: un clip válido se conserva, uno inválido se descarta sin perder el lick y un lick antiguo carga sin clip. Ampliar `tests/licks-normalize.test.mjs` y ejecutarlo.

## 2. Editor del lick

- [x] 2.1 Añadir a `LickEditor` los campos **enlace**, **desde** y **hasta**, con su estado inicial desde el lick, la validación antes de guardar y `referenceVideo` en el objeto que se guarda (ausente al vaciar el enlace). Verificar con los tests de validación de 1.2 y el recorrido de crear, reabrir y editar.
- [x] 2.2 Añadir las cadenas nuevas de `licks` —sección, etiquetas, ayuda y errores— en `src/i18n/dictionary.ts`, `es.ts` y `en.ts`; ejecutar `node --test tests/i18n.test.mjs`.

## 3. Reproductor y ficha

- [x] 3.1 Crear `LickReferenceVideo` con la IFrame Player API de YouTube: carga única del script, `start`/`end`, bucle al terminar, `playsinline`, destrucción al desmontar y respaldo con iframe y enlace si la API no carga. Extraer la URL del iframe y del enlace a un helper cubierto en `tests/licks-reference-video.test.mjs`.
- [x] 3.2 Mostrar la tarjeta **Vídeo de referencia** en `/licks/[id]` entre la cabecera y la tablatura, con la línea “Del 1:23 al 1:35” y el enlace a YouTube en el segundo de inicio. Verificar en el navegador que el vídeo carga, empieza en el segundo marcado, vuelve al inicio al llegar al final y que un lick sin clip no muestra tarjeta.
- [x] 3.3 Documentar en `docs/licks.md` el campo, la validación, el bucle y el respaldo; comprobar que el documento coincide con lo implementado.

## 4. Verificación final

- [x] 4.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build`; verificar que los tres terminan sin fallos nuevos.
- [x] 4.2 Recorrer en el navegador, en escritorio y a 375 px: crear un lick con un clip corto (por ejemplo 0:00–0:05), abrir la ficha, ver el bucle, editar los tiempos, vaciar el enlace y comprobar que la tarjeta desaparece y el lick se guarda sin clip. Anotar el resultado.


- Recorrido en navegador (2 nov 2026): el clip 0:00–0:05 crea el reproductor con `start` y `end`, la ficha muestra «Del 0:00 al 0:05» y el enlace con `t=0s`; un enlace que no es de YouTube bloquea el guardado con su mensaje; al vaciar los tres campos la tarjeta desaparece.

## Workflow follow-up

- Probar la incrustación y el bucle en un iPhone real antes de archivar.
- Archivar el cambio después de la revisión del proyecto.

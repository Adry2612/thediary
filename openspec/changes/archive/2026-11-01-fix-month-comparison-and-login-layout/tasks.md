# Tasks

## 1. Tramo comparable (lógica pura)

- [x] 1.1 Crear el módulo puro de tramos comparables en `src/utils/` con `getComparisonSpans(period, today)` según la tabla del diseño (semana, mes y año; recorte al 28 de febrero y a la duración del mes anterior; claves AAAA-MM-DD inclusivas) y verificar que `npm run typecheck` pasa.
- [x] 1.2 Añadir `tests/period-comparison.test.mjs` con los casos de la spec: 15 de noviembre, 1 de noviembre, 31 de marzo (febrero completo), miércoles de una semana, 10 de marzo, 29 de febrero y el cruce del cambio de horario de octubre; verificar que la suite pasa y que cada caso falla si se rompe el recorte correspondiente.

## 2. Tarjeta de ritmo

- [x] 2.1 Hacer que `getPreviousPeriodBuckets` en `src/utils/practice-analytics.ts` sume `dailySeconds` sobre el tramo anterior y que `changeRatio` use la suma del tramo actual hasta hoy; mantener `totalSeconds` y los *buckets* del gráfico con el periodo completo. Verificar con `node --test tests/practice-analytics.test.mjs`.
- [x] 2.2 Actualizar en `tests/practice-analytics.test.mjs` «summarizes a month against the previous calendar month»: la sesión del 30 de septiembre queda fuera del tramo 1–7 de septiembre, así que `previousTotalSeconds` pasa a 0 y `changeRatio` a `null`. Añadir casos de día 15 con práctica en el tramo, 1 de mes sin práctica y con práctica del primer día del mes anterior (−100 %), lunes con una jornada contra el mismo tramo de la semana anterior y una práctica con fecha futura que no entra en la comparación pero sí en `totalSeconds`. Verificar que la suite pasa.

## 3. Bienestar

- [x] 3.1 Hacer que `getPracticeWellbeingSummary` y `getPreviousWellbeingRange` en `src/utils/practice-metrics.ts` lean de `getComparisonSpans` y borrar la construcción propia del periodo anterior. Verificar con `node --test tests/practice-metrics.test.mjs`.
- [x] 3.2 Revisar y ampliar `tests/practice-metrics.test.mjs`: mantener el caso del 29 de octubre y añadir el de respuestas del mes anterior posteriores al mismo número de día, que no deben contar. Verificar que la suite pasa.

## 4. Textos de la comparación

- [x] 4.1 Añadir `summaryComparisonMonth/Week/Year` y `wellbeingChangeMonth/Week/Year` a `src/i18n/es.ts`, `src/i18n/en.ts` y `src/i18n/dictionary.ts`, y usarlos en `PracticeTimeChart.tsx` y `PracticeWellbeing.tsx` según el periodo elegido. Verificar con `npm run typecheck` y con un test que compruebe que las seis claves existen en ambos idiomas.
- [x] 4.2 Comprobar en el navegador, con `today` simulado en el día 1 y el día 15, que la tarjeta de ritmo y la de bienestar muestran el texto del tramo y la cifra esperada en semana, mes y año, sin desbordes a 375, 768 y 1280 px.

## 5. Cuenta centrada

- [x] 5.1 Añadir la propiedad `align` (`start` por defecto, `center`) a `src/components/ui/PageHeader.tsx` y verificar que ninguna otra pantalla cambia de aspecto (capturas de Inicio y Panel antes y después).
- [x] 5.2 Centrar el contenido de `AccountView.tsx` con `mx-auto max-w-xl` y la cabecera con `align='center'`, corregir la indentación del bloque envuelto y aplicar el mismo contenedor a `AccountSkeleton` en `src/components/ui/Skeletons.tsx`. Verificar con capturas del acceso, de crear cuenta y de sesión iniciada a 375, 768 y 1280 px que el bloque queda centrado y sin scroll horizontal.
- [x] 5.3 Verificar que no hay salto de layout al pasar del esqueleto al contenido: recargar `/account` con y sin sesión y comprobar que el bloque no cambia de posición ni de ancho.

## 6. Verificación e integración

- [x] 6.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build` y verificar que los tres terminan sin fallos nuevos.
- [x] 6.2 Comprobar contra datos reales (una cuenta con práctica en el mes anterior) que el día en curso la tarjeta de ritmo compara con el mismo tramo, y anotar la cifra obtenida frente a la anterior al cambio.

## 7. Ventana mensual de 30 días

- [x] 7.1 Cambiar `getComparisonSpans("month")` a hoy−29 … hoy contra los 30 días anteriores y actualizar `tests/period-comparison.test.mjs` (día 15, día 1, cruce de mes, cambio de horario). Verificar que la suite pasa.
- [x] 7.2 Reescribir `getMonthRanges` para agrupar los 30 días en semanas recortadas al inicio y al final, con etiquetas que incluyan el mes cuando el tramo cruza, y actualizar `tests/practice-analytics.test.mjs` (agrupación y etiquetas). Verificar que la suite pasa.
- [x] 7.3 Pasar `DashboardView` al tramo de 30 días para el tiempo, las sesiones, el BPM medio, el balance de habilidades y el de guitarras, y dejar de usar `getMonthlyHeatmapData` para el tiempo. Verificar con un test de las funciones puras y en el navegador que el día 1 el tiempo incluye octubre.
- [x] 7.4 Cambiar los textos de las tarjetas mensuales y del selector a «últimos 30 días» / «30 días» en español e inglés. Verificar con `npm run typecheck` y con el test de claves entre idiomas.
- [x] 7.5 Actualizar los tests de resumen y bienestar al nuevo mes móvil y comprobar en el navegador, el día 1 y a 375/768/1280 px, que el tiempo, la comparación y las etiquetas muestran la ventana de 30 días sin desbordes.
- [x] 7.6 Ejecutar `npm run typecheck`, `npm test` y `npm run build` y verificar que los tres terminan sin fallos nuevos.

## Workflow follow-up

- Archivar el cambio cuando el repositorio esté verificado y sincronizar `practice-dashboard` y `app-layout` en las specs principales.
- Valorar en un cambio aparte centrar `Configuración` y si las tarjetas «este mes» necesitan un valor de relleno el día 1.

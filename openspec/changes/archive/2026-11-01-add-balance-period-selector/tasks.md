# Tasks

## 1. Estado y datos compartidos

- [x] 1.1 Añadir el estado del periodo de balances a `DashboardView` (`week | month | year`, por defecto `month`), calcular su rango con `getComparisonSpans(period, today).current` y memoizar con él `skillDistribution` y `guitarBalance`. Verificar que `npm run typecheck` pasa.
- [x] 1.2 Pasar `period` y `onPeriodChange` a `SkillBalance` y `GuitarBalance` sin duplicar el cálculo dentro de las tarjetas. Verificar que el Panel sigue renderizando con el periodo de 30 días por defecto.

## 2. Selector en las tarjetas

- [x] 2.1 Envolver la cabecera de `SkillBalance` en una fila flexible y añadir los botones `Semana`, `30 días` y `Año` con `ToggleGroup`/`ToggleChip`. Verificar en el navegador que la distribución cambia al elegir cada periodo.
- [x] 2.2 Hacer lo mismo en `GuitarBalance`. Verificar que cambiar el periodo en guitarras actualiza también el balance de habilidades, y al revés.
- [x] 2.3 Revisar la accesibilidad del control: grupo con nombre, `aria-pressed` en cada botón, foco visible y operable con teclado. Verificar con el inspector de accesibilidad y con Tab, Enter y flechas.

## 3. Textos

- [x] 3.1 Añadir la clave `balancePeriodAria` a `src/i18n/es.ts`, `en.ts` y `dictionary.ts`. Verificar con `npm run typecheck` y con el test de claves entre idiomas.
- [x] 3.2 Comprobar que las etiquetas de los botones son `Semana / 30 días / Año` en español y `Week / 30 days / Year` en inglés, reutilizando las claves del selector del gráfico.

## 4. Pruebas y navegador

- [x] 4.1 Ampliar `tests/practice-analytics.test.mjs` con la distribución de habilidades y el balance de guitarras sobre un rango semanal y uno anual, además del mes ya cubierto. Verificar que la suite pasa.
- [x] 4.2 Comprobar en el navegador a 375, 768 y 1280 px que los tres botones caben en ambas tarjetas sin scroll horizontal, que los balances cambian y siguen sincronizados, y que el estado vacío de un periodo sin datos se lee bien. Guardar capturas.

## 5. Verificación e integración

- [x] 5.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build` y verificar que los tres terminan sin fallos nuevos.
- [x] 5.2 Con datos reales, comparar los dos balances en semana, 30 días y año y confirmar que ambos usan la misma ventana y que las cifras cuadran con el gráfico de ritmo del mismo periodo.

## 6. Botones en el gráfico de ritmo

- [x] 6.1 Generalizar `BalancePeriodSelector` a `PeriodSelector` con `ariaLabel` y usarlo en el gráfico de ritmo en lugar del desplegable, conservando el periodo semanal por defecto. Verificado con `npm run typecheck` y en el navegador.
- [x] 6.2 Comprobar que al cambiar a 30 días y año se actualizan título, total, sesiones, mejor unidad y comparación. Verificado en el navegador.
- [x] 6.3 Revisar accesibilidad (grupo con nombre, `aria-pressed`, foco visible) y que los tres botones caben a 375, 768 y 1280 px sin scroll horizontal. Verificado.
- [x] 6.4 Ejecutar `npm run typecheck`, `npm test` y `npm run build`. Verificado.

## 7. Sin saltos de altura

- [x] 7.1 Reservar la altura de la etiqueta de comparación del gráfico (`min-h-12 sm:min-h-8`) y comprobar que el gráfico mide lo mismo en semana, 30 días y año a 375, 768 y 1280 px. Verificado.
- [x] 7.2 Sacar el aviso de gráfico vacío del flujo y mostrar siempre la fila «Sin tipo registrado» del balance de guitarras. Verificar que un periodo sin datos no cambia la altura del gráfico y que los tres periodos del balance miden igual. Verificado.
- [x] 7.3 Repetir las mediciones con datos y sin datos y ejecutar `npm run typecheck`, `npm test` y `npm run build`. Verificado: alturas constantes por contexto y 841 tests en verde.

## Workflow follow-up

- Aplicar y archivar este cambio **después** de `fix-month-comparison-and-login-layout`, que convierte el mes en 30 días.
- Al archivar, sincronizar `practice-dashboard` y comprobar que las ventanas de los balances coinciden con las del gráfico.

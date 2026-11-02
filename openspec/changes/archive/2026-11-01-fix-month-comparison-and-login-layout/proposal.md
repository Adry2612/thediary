# Proposal

## Why

Los resúmenes del Panel comparan el periodo en curso con el periodo anterior **completo**. El día 1 de un mes nuevo el mes actual tiene un día y el anterior treinta, así que la tarjeta de ritmo marca −100 % (o una cifra sin sentido) y el bienestar parece haberse «reiniciado». El mismo desfase ocurre cada lunes (una jornada contra una semana entera) y cada 1 de enero. La comparación solo es útil si es de igual a igual: el día 15 debe medirse contra los días 1–15 del mes anterior.

Aparte, la pantalla de cuenta limita su contenido con `max-w-3xl` sin centrarlo, de modo que el formulario de acceso queda pegado a la izquierda de la columna en vez de centrado.

## What Changes

- **Comparación de igual a igual.** El periodo anterior se acota al mismo tramo ya transcurrido del periodo en curso:
  - **mes: los últimos 30 días** (hoy−29 … hoy) contra los 30 días anteriores, para que el día 1 no se reinicie nada y se sigan viendo las prácticas de finales del mes pasado;
  - semana: de lunes al día de hoy contra el mismo tramo de la semana anterior;
  - año: del 1 de enero a hoy contra el mismo tramo del año anterior (el 29 de febrero se compara con el 28).
- Se aplica a la **tarjeta de ritmo de práctica** y al **resumen de bienestar** (ánimo y foco), que hoy construyen su periodo anterior por separado.
- **Todo lo mensual usa la misma ventana de 30 días**: el tiempo del mes, el balance de habilidades, el balance de guitarras y el BPM medio, con los textos cambiados a «últimos 30 días» y el periodo del gráfico rotulado «30 días».
- La comparación **dice qué tramo compara** («Frente a los 30 días anteriores», «Frente a los mismos días de la semana anterior», «Frente al mismo tramo del año anterior») en lugar del genérico «Frente al periodo anterior».
- **Pantalla de cuenta centrada.** El bloque de cuenta (cabecera y tarjeta de acceso o de sesión iniciada) se centra horizontalmente dentro de la columna compartida, también mientras carga, para que no salte al llegar los datos.

Fuera del alcance:

- La progresión de tempo, que ya usa ventanas móviles y no se reinicia.
- Hacer móviles también la semana y el año: la semana sigue siendo de lunes a domingo y el año natural. Se pueden cambiar en otro cambio.
- Decidir si ánimo y foco merecen seguir existiendo: se trata aparte; este cambio solo corrige su comparación mientras existan.
- Centrar `Configuración`, que comparte el mismo patrón `max-w-3xl` pero no forma parte de lo pedido.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `practice-dashboard`: la tarjeta de ritmo y el resumen de bienestar comparan el mismo tramo transcurrido del periodo anterior, y la comparación indica el tramo que usa.
- `app-layout`: una pantalla de un solo formulario, como la cuenta, se centra en la columna compartida, también al cargar.

## Impact

- **Código**: `src/utils/practice-analytics.ts` (`getPreviousPeriodBuckets`), `src/utils/practice-metrics.ts` (`getPreviousWellbeingRange`), un módulo puro nuevo con el cálculo del tramo comparable, `src/components/dashboard/PracticeTimeChart.tsx`, `src/components/dashboard/PracticeWellbeing.tsx`, `src/components/account/AccountView.tsx`, `src/components/ui/Skeletons.tsx` (`AccountSkeleton`), `src/components/ui/PageHeader.tsx` y `src/i18n/{es,en,dictionary}.ts`.
- **Tests**: `tests/practice-analytics.test.mjs` fija hoy el comportamiento anterior (la sesión del 30 de septiembre cuenta como «mes anterior» para el 7 de octubre) y debe actualizarse; `tests/practice-metrics.test.mjs` se revisa; se añade un test del tramo comparable.
- **Datos y contrato**: sin cambios. No toca `practice_data` ni el cliente iOS.

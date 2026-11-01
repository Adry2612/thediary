# Design

## Context

Ver `proposal.md` para la motivación. Estado actual relevante:

- `getPracticeTimeSummary` (`src/utils/practice-analytics.ts`) suma los *buckets* del periodo en curso y los del anterior. El anterior sale de `getPreviousPeriodBuckets`, que pide el mes, la semana o el año **completos** anteriores. `changeRatio` es `(total − anterior) / anterior`, o `null` si el anterior es 0.
- `getPracticeWellbeingSummary` (`src/utils/practice-metrics.ts`) construye por su cuenta el periodo anterior en `getPreviousWellbeingRange`, también completo. Las dos funciones no comparten código, así que hoy hay dos definiciones de «periodo anterior».
- El resto de métricas con comparación (`getTempoTrend`) usa ventanas móviles de N días y no tiene este defecto. Las tarjetas «este mes» sin comparación (`DashboardView`) no comparan nada.
- La semana empieza en lunes (`getWeekBuckets`/`getPracticeChartRanges`).
- El modelo no impide registrar una práctica con fecha futura: `createManualPracticeRecord` valida el formato de la fecha, no que sea ≤ hoy.
- La cuenta no tiene página de acceso propia: `/account` renderiza `AccountView`, que envuelve su contenido en `<div className='max-w-3xl'>` sin `mx-auto`. `AccountSkeleton` repite el mismo patrón.

## Goals / Non-Goals

**Goals:**

- Una sola definición del tramo comparable, compartida por la tarjeta de ritmo y el bienestar.
- Lógica pura y comprobable con fechas fijas, incluidos los bordes (día 1, mes corto, 29 de febrero, lunes).
- Que el texto de la comparación diga qué compara.
- Que la cuenta se vea centrada sin saltos entre el estado de carga y el de contenido.

**Non-Goals:**

- Cambiar los periodos mostrados en gráficos (los *buckets* del periodo en curso siguen siendo el periodo completo).
- Comparar las tarjetas «este mes» que hoy no comparan.
- Tocar `Configuración`, aunque comparta el patrón `max-w-3xl`.

## Decisions

### 1. Un módulo puro con el tramo comparable

Un archivo nuevo en `src/utils/` (sin dependencias de React, importable desde los tests) expone:

```ts
type ComparisonSpan = { startDate: string; endDate: string }; // claves AAAA-MM-DD, ambas inclusivas
getComparisonSpans(period, today): { current: ComparisonSpan; previous: ComparisonSpan }
```

Reglas:

| Periodo | Actual | Anterior |
| --- | --- | --- |
| `week` | lunes → hoy | lunes anterior → lunes anterior + (N − 1), con N = días transcurridos |
| `month` | hoy−29 → hoy | hoy−59 → hoy−30 |
| `year` | 1 de enero → hoy | 1 de enero anterior → mismo mes y día, recortado al 28 de febrero si hoy es 29 de febrero |

El mes deja de mirar el calendario: es una ventana de 30 días que termina hoy, así que el día 1 sigue conteniendo las prácticas de finales del mes anterior. Se construye el inicio restando días con `Date#setDate` (no milisegundos) para no desviarse con el cambio de horario.

- Alternativa descartada: arreglar cada función por separado. Es lo que dejó dos definiciones divergentes; la corrección tiene que vivir en un único sitio.
- Alternativa descartada: días 1..N del mes natural. El día 1 deja el mes vacío y es justo lo que el usuario no quiere ver.
- Alternativa descartada: ventanas móviles solo para la comparación y mantener el mes natural en los totales. La tarjeta seguiría mostrando 0 min el día 1 y el usuario lo leería como un reinicio.

### 2. Cómo suma la tarjeta de ritmo

`dailySeconds` ya es un mapa por clave de fecha. El total del tramo anterior pasa a ser la suma de las claves dentro de `previous`, en lugar de la suma de *buckets*. Para que la variación sea de igual a igual:

- `previousTotalSeconds` = suma sobre `previous`.
- El numerador usa la suma sobre `current`, no `totalSeconds`. En semana y año los *buckets* pueden incluir días futuros de la semana o del año en curso; esos días no cuentan en la comparación hasta que llegan, pero sí en el total y el gráfico. En el mes la ventana termina hoy, así que no hay días futuros.
- `changeRatio` sigue siendo `null` cuando `previousTotalSeconds` es 0.

El tipo `PracticeTimeSummary` conserva su forma; no se añade ningún campo.

- Alternativa descartada: acotar también `totalSeconds` a hoy en semana y año. Haría que la cifra de la tarjeta discrepase del gráfico, y el gráfico dibuja el periodo entero.

### 3. Bienestar

`getPracticeWellbeingSummary` usa `getComparisonSpans` para ambos rangos. El rango actual pasa de «periodo completo» a la ventana del periodo; para el mes son los últimos 30 días. `getPracticeMetricSummary` no cambia.

### 3b. El gráfico mensual y las tarjetas mensuales

- `getMonthRanges(today)` deja de construir semanas del mes natural y construye las semanas que cubren hoy−29 … hoy, recortando la primera y la última. La etiqueta sigue siendo `"5–11"` dentro del mismo mes y pasa a `"28 sep–4 oct"` cuando cruza.
- `DashboardView` calcula con el mismo tramo el tiempo total, las sesiones, el BPM medio, el balance de habilidades y el de guitarras. Deja de usar `getMonthlyHeatmapData` para el tiempo.
- Los textos pasan a «tiempo en 30 días», «últimos 30 días» y «30 días» en el selector, en lugar de «este mes» / «Mes».
- El mapa de calor anual sigue siendo el calendario natural: es un calendario, no una métrica del periodo.

### 4. El texto nombra el tramo

Tres claves nuevas en `es.ts`, `en.ts` y `dictionary.ts`, sin tocar las existentes porque otras tarjetas las usan (`tempoDescription` conserva el suyo):

- `summaryComparisonMonth` («Frente a los 30 días anteriores»)
- `summaryComparisonWeek` («Frente a los mismos días de la semana anterior»)
- `summaryComparisonYear` («Frente al mismo tramo del año anterior»)

Además cambian los textos del mes existentes: `monthTime`, `monthTimeChart`, `thisMonth`, `noBpm`, `guitarBalanceDescription`, `guitarEmpty`, `wellbeingNoData` y `periodMonth` («30 días»).

`PracticeTimeChart` sustituye `dashboard.summaryComparison` por la clave del periodo. `PracticeWellbeing` hace lo mismo con `wellbeingChange` (la frase «frente al periodo anterior» junto a la variación) mediante tres claves por periodo, porque su redacción va al final de una frase y no sirve la del resumen. `wellbeingNoComparison` («Sin comparación con el periodo anterior») no promete ningún tramo, así que se mantiene.

### 5. Cuenta centrada

- `AccountView` pasa a `mx-auto max-w-xl` (la tarjeta de acceso es un formulario de dos campos; `max-w-3xl` la dejaba demasiado ancha para centrarse con buen aspecto) y el mismo valor en `AccountSkeleton`, para que no haya salto al cargar.
- Se centra el **bloque completo**, no solo la tarjeta: una tarjeta centrada con el título «Cuenta» pegado al borde izquierdo de una columna de 80 rem se vería desconectada. `PageHeader` recibe una propiedad `align="center"` (por defecto `start`, sin cambios para el resto de pantallas).
- Se centra también el estado con sesión iniciada. Si solo se centrase el acceso, la tarjeta saltaría de sitio al iniciar sesión, y el esqueleto no sabe aún en cuál de los dos estados caerá.
- No se cambian `PageShell` ni sus constantes de columna.

- Alternativa descartada: una página de login separada con su propio layout. Duplica la pantalla de cuenta para corregir una alineación.

## Risks / Trade-offs

- **Los números históricos cambian.** Un usuario que ya vio «−60 %» el día 10 verá otra cifra, que es la correcta. → La tabla de la sección 1 se documenta en la spec y el texto nombra el tramo.
- **«Mes» ya no significa mes natural.** Del 1 al 30 del mes el número incluye días del mes anterior, y a final de mes deja fuera los primeros días. → El selector y las tarjetas dicen «30 días» / «últimos 30 días», de modo que la cifra no promete un calendario.
- **Etiquetas de semana que cruzan de mes** («28 sep–4 oct») son más largas y pueden no caber en el gráfico. → Se abrevian los meses y se comprueba en 375 px; si no caben, la etiqueta del eje se acorta y el detalle completo queda en el tooltip.
- **Dos sitios que tocan `PageHeader`.** Añadir `align` toca un componente compartido. → La opción por defecto mantiene el comportamiento actual; solo `AccountView` la usa.
- **Redondeo de semana en cambio de horario.** Sumar días con `Date#setDate` evita desfases de 23/25 horas; no se suman milisegundos. → Cubierto con un test que cruza el cambio horario de octubre.

## Open Questions

- Las tarjetas «este mes» sin comparación (tiempo del mes, equilibrios, mapa de calor) siguen vacías el día 1. Si más adelante se quiere un valor de relleno (por ejemplo, mostrar el mes anterior hasta que haya datos), sería un cambio aparte y no altera esta spec.

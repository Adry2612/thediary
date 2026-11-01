# Design

## Context

Ver `proposal.md` para la motivación.

- `SkillBalance` y `GuitarBalance` son componentes de presentación: reciben `distribution` y `balance` ya calculados.
- `DashboardView` calcula ambos con un único rango de 30 días (`getComparisonSpans("month", today).current`) y los pasa a las tarjetas.
- `getSkillDistribution(history, range)` y `getGuitarBalance(history, range)` ya aceptan cualquier rango inclusivo; no hace falta tocarlos.
- El Panel ya tiene un patrón de botones de periodo en `TempoProgress` con `ToggleGroup` y `ToggleChip` (`size="sm"`), y las etiquetas `periodWeek`, `periodMonth` («30 días») y `periodYear` ya existen.
- Este cambio depende de `fix-month-comparison-and-login-layout`: allí el mes pasa a ser una ventana de 30 días. Aquí se usa la misma definición.

## Goals / Non-Goals

**Goals:**

- Un único periodo compartido por los dos balances, con estado en `DashboardView`.
- Reutilizar el rango comparable ya probado y los botones existentes.
- No duplicar el cálculo ni el estado dentro de las tarjetas.

**Non-Goals:**

- Un selector de página que afecte a más tarjetas.
- Cambiar el ámbito de «Lo más practicado», el calendario anual o el resumen semanal.
- Cambiar el control del gráfico de bienestar, que mantiene su desplegable.

## Decisions

### 1. El estado vive en `DashboardView`

```ts
type BalancePeriod = "week" | "month" | "year";
const [balancePeriod, setBalancePeriod] = useState<BalancePeriod>("month");
const balanceRange = getComparisonSpans(balancePeriod, today).current;
```

`DashboardView` memoiza `skillDistribution` y `guitarBalance` con `balanceRange` y pasa a cada tarjeta:

```ts
<SkillBalance distribution={skillDistribution} period={balancePeriod} onPeriodChange={setBalancePeriod} />
<GuitarBalance balance={guitarBalance} period={balancePeriod} onPeriodChange={setBalancePeriod} />
```

- Alternativa descartada: estado dentro de cada tarjeta. Las dos selecciones se desincronizarían y el usuario vería dos ventanas distintas sin saberlo.
- Alternativa descartada: un contexto o store para dos tarjetas. Es estado de una sola pantalla y una prop basta.

### 2. Las ventanas son las del resto del Panel

Se reutiliza `getComparisonSpans(period, today).current`:

| Periodo | Ventana |
| --- | --- |
| Semana | lunes … hoy |
| 30 días | hoy−29 … hoy |
| Año | 1 de enero … hoy |

Así los balances y las comparaciones del ritmo hablan del mismo tramo. Para el año no se usa el año completo: contar meses futuros no cambiaría los minutos, pero el rango quedaría desalineado con la comparación.

### 3. Botones reutilizados y cabecera flexible

En cada tarjeta, la cabecera (ceja + título) se envuelve en una fila `flex flex-wrap items-start justify-between gap-4` y a la derecha se añade:

```tsx
<ToggleGroup aria-label={dashboard.balancePeriodAria} layout="wrap" className="gap-1.5">
  <ToggleChip size="sm" selected={period === "week"} onClick={() => onPeriodChange("week")}>{dashboard.periodWeek}</ToggleChip>
  <ToggleChip size="sm" selected={period === "month"} onClick={() => onPeriodChange("month")}>{dashboard.periodMonth}</ToggleChip>
  <ToggleChip size="sm" selected={period === "year"} onClick={() => onPeriodChange("year")}>{dashboard.periodYear}</ToggleChip>
</ToggleGroup>
```

`ToggleChip` ya expone `aria-pressed`; `ToggleGroup` aporta el nombre accesible. Se usa `layout="wrap"` para que en 375 px los tres botones bajen de línea dentro de la tarjeta.

- Alternativa descartada: reutilizar el `SelectField` del gráfico. El usuario pidió botones, y con tres opciones caben sin abrir un desplegable.

### 4. Texto de la ventana

Las tarjetas no repiten el periodo en el centro: el botón seleccionado ya lo dice y el espacio del centro es escaso. Se retira la etiqueta «últimos 30 días» que había bajo las cifras y la ceja de guitarras pasa a «Eléctrica y acústica», sin periodo, para que no mienta al elegir semana o año. El estado vacío de guitarras también deja de nombrar los 30 días. Solo se añade el nombre accesible del grupo (`balancePeriodAria`, nueva clave en español e inglés).

### 5. El gráfico de ritmo usa el mismo componente

`PracticeTimeChart` sustituye su `SelectField` por `PeriodSelector` con `ariaLabel={dashboard.periodAria}` y conserva su estado y su periodo por defecto (semana). El estado es independiente del de los balances: el gráfico y los balances responden preguntas distintas y ya tenían ciclos propios.

- Alternativa descartada: sincronizar el gráfico con los balances. Obligaría a elegir un periodo único para toda la página y a cambiar el comportamiento actual del gráfico, que abre en semana.

### 6. Alturas estables al cambiar de periodo

Tres fuentes de salto, todas resueltas sin trucos de JavaScript:

- **Etiqueta de comparación del gráfico**: los textos de semana y año ocupan dos líneas a partir de 640 px y tres por debajo; el de 30 días, una o dos. El `dt` reserva `min-h-8` desde `sm` y `min-h-12` en móvil, de modo que el resumen mide siempre lo mismo.
- **Aviso de gráfico vacío**: se saca del flujo y se pinta en absoluto dentro del área del gráfico, que ya era relativa. Así un periodo sin datos no añade altura.
- **Fila «Sin tipo registrado»**: se renderiza siempre, con 0 min cuando no hay tiempo sin clasificar, en lugar de aparecer y desaparecer.

Se midieron las alturas de las tres tarjetas en semana, 30 días y año, con datos y sin ellos, a 375, 768 y 1280 px; las tres se mantienen constantes por contexto.

- Alternativa descartada: fijar una altura concreta a toda la tarjeta. Rompería con textos largos o con la tipografía ampliada.

## Risks / Trade-offs

- **Dos selectores idénticos en tarjetas separadas** → Puede parecer redundante; se acepta porque cada tarjeta es autónoma y ambas están sincronizadas. Si molesta, más adelante se puede mover a un solo sitio.
- **El balance de habilidades solo muestra porcentajes** → Con una semana sin datos, todas las categorías quedan a cero; el estado vacío existente debe seguir siendo legible. Se comprueba en navegador.
- **Dependencia con el cambio del mes móvil** → Si se archiva antes, el texto de las ventanas diría «mes natural». Se aplica después.

## Migration Plan

Sin migración de datos ni cambios de contrato. El periodo por defecto reproduce el comportamiento actual (30 días).

## Open Questions

Ninguna que cambie las specs, el enfoque o el desglose de tareas.

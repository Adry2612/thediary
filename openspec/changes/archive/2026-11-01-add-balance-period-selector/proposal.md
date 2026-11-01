# Proposal

## Why

El gráfico de ritmo y el de bienestar ya dejan elegir Semana, 30 días o Año, pero los dos balances que están justo al lado —habilidades y guitarras— siguen clavados a una única ventana. Eso obliga a comparar mentalmente una tarjeta con otra y deja sin explorar preguntas obvias: qué habilidades dominan esta semana o en qué tipo de guitarra se ha tocado este año.

## What Changes

- Las tarjetas **Balance de habilidades** y **Balance de guitarras** ganan los mismos botones de periodo que el gráfico de barras: **Semana**, **30 días** y **Año**.
- Ambas tarjetas **comparten la selección**: cambiar el periodo en una cambia también la otra, así que los dos balances siempre muestran la misma ventana.
- La ventana por defecto sigue siendo **30 días**, para no cambiar lo que se ve hoy al abrir el Panel.
- Cada periodo usa el mismo tramo que el resto del Panel:
  - Semana: del lunes a hoy.
  - 30 días: hoy−29 … hoy.
  - Año: del 1 de enero a hoy.
- Los minutos, porcentajes, número de sesiones del resumen de habilidad y estados vacíos se recalculan para el periodo elegido.
- El control usa los botones segmentados que ya existen (`ToggleGroup`/`ToggleChip`), con nombre accesible y estado seleccionado anunciado, y se envuelve sin romper la tarjeta en móvil.
- El **gráfico de ritmo de práctica** deja el desplegable y usa los mismos botones `Semana / 30 días / Año`, con su propio estado independiente del de los balances.
- Cambiar de periodo **no mueve el layout**: la etiqueta de comparación reserva su altura, el aviso de gráfico vacío no empuja el contenido y la fila «Sin tipo registrado» del balance de guitarras se muestra siempre, con 0 min cuando no hay tiempo sin clasificar.

Fuera del alcance:

- «Lo más practicado», que sigue siendo de todo el historial.
- El calendario anual y el resumen semanal, que tienen su propio ámbito.
- Un selector único de página para todas las tarjetas.
- Cambiar el control del gráfico de bienestar, que mantiene su desplegable.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `practice-dashboard`: el balance de habilidades y el de guitarras dejan de estar fijos y comparten un selector de periodo de semana, 30 días o año; se definen las ventanas y el comportamiento compartido.

## Impact

- **Código:** `src/components/dashboard/DashboardView.tsx` (estado y cálculo compartidos), `SkillBalance.tsx` y `GuitarBalance.tsx` (botones y props de periodo), y textos en `src/i18n/{es,en,dictionary}.ts`.
- **Datos y funciones puras:** sin cambios de modelo; `getSkillDistribution` y `getGuitarBalance` ya aceptan un rango.
- **Specs:** hay que aplicar este cambio **después** de `fix-month-comparison-and-login-layout`, que redefine el periodo mensual como 30 días; al archivar, el texto de las ventanas debe quedar coherente.
- **Tests:** la lógica de rangos ya está cubierta; se añaden comprobaciones de las nuevas ventanas y de las claves de idioma.

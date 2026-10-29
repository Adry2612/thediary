# Proposal

## Why

Cambiar las cuerdas a tiempo es una tarea recurrente que nadie recuerda bien, y el historial de práctica ya permitiría calcular cuánto se ha usado cada guitarra. Pero la primera versión de esta función la convirtió en una sección propia con tarjetas grandes, dos historiales y un formulario largo: demasiada interfaz para una tarea que se hace seis veces al año.

La sección no era el problema; la fricción sí. La guitarra se preguntaba en cada práctica, con "sin guitarra concreta" por defecto, así que las horas de uso quedaban incompletas sin que nadie lo notara, y un número preciso pero sesgado es peor que no tener número.

## What Changes

- Las guitarras viven en **Herramientas**, en un bloque **Cuerdas** con una fila por guitarra. Sin página propia y sin entrada en la navegación.
- Una guitarra es **nombre + intervalo de cambio**, nada más obligatorio.
- **Un solo historial** por guitarra: entradas con fecha y texto. Un cambio de cuerdas es una entrada que reinicia la cuenta; un arreglo es otra entrada escrita.
- Recordatorio por **días** y por **horas de uso**; vence cuando se cumple cualquiera de los dos.
- La práctica **hereda** la guitarra: con una sola guitarra se atribuye sola, con varias se hereda la última usada y el selector solo aparece entonces.
- El uso se calcula con las sesiones que registraron esa guitarra y se declara cuando parte de las sesiones no la registró.
- Cada guitarra puede tener **una foto**, comprimida antes de guardarse y fuera del JSON sincronizado.
- Inicio muestra **una línea**, y solo cuando algo vence o está a punto.
- Se elimina la página `/equipment`, su entrada de navegación y las tarjetas con resumen de tres cifras.

Fuera del alcance:

- Galería de fotos, recorte o varias imágenes por guitarra.
- Compras, presupuestos, inventario de accesorios o valor de reventa.
- Recordatorios push o correos fuera de la app.
- Tipos de arreglo, luthier y coste como campos estructurados.
- Atribuir automáticamente prácticas antiguas a una guitarra concreta.

## Capabilities

### New Capabilities

- `guitar-maintenance`: el bloque Cuerdas de Herramientas, el historial de cada guitarra, su foto y el cálculo del próximo cambio por días y por horas de uso.

### Modified Capabilities

- `practice-session-management`: una práctica puede registrar la guitarra concreta y las prácticas nuevas la heredan en lugar de preguntarla en cada sesión.
- `home-overview`: Inicio avisa en una sola línea, y solo cuando toca cambiar cuerdas.

## Impact

- Modelo y cálculo: `src/types/equipment.ts`, `src/utils/equipment.ts`, `src/utils/image.ts` y sus pruebas.
- Estado y sincronización: `src/types/practice-storage.ts`, `src/stores/usePracticeStore.ts`, `src/stores/normalizePracticeStorageState.ts`, `src/utils/practice-data-state.ts`, `src/services/supabase/practice-data.ts` y `src/components/providers/AppDataProvider.tsx`.
- Archivos: borrado puntual de un asset en `src/services/practice-library.ts` y `src/services/supabase/practice-files.ts`.
- Herramientas: `src/components/tools/StringsPanel.tsx`, `GuitarRow.tsx`, `GuitarDialog.tsx`, `GuitarHistoryDialog.tsx` y `ToolsView.tsx`.
- Sesiones: `src/hooks/useGuitarPreference.ts`, `PracticePlanBuilder.tsx`, `FreePracticeStartDialog.tsx`, `ManualPracticeEntry.tsx` y `SessionEditor.tsx`.
- Inicio y navegación: `src/components/home/StringsReminder.tsx`, `HomeView.tsx` y `SiteNavigation.tsx`.
- Se eliminan: `src/app/(workspace)/equipment/`, `src/components/equipment/*` y `src/components/home/EquipmentWidget.tsx`.
- Textos: `src/i18n/es.ts`, `src/i18n/en.ts` y `src/i18n/dictionary.ts`.

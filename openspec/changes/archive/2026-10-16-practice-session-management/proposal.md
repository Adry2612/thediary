# Proposal

## Why

La pantalla de práctica obliga a diseñar bloques antes de poder empezar, incluso cuando el usuario solo quiere tocar un rato. Las rutinas guardadas quedan escondidas en un desplegable, el historial es de solo lectura y el detalle de un día no siempre muestra las grabaciones asociadas. Eso resta utilidad diaria a las tres piezas que más se usan.

## What Changes

- Mostrar en la pantalla de práctica, en primer lugar, las rutinas guardadas, cada una con acciones para empezar o editar.
- Añadir un botón **Crear nueva práctica** que abre el flujo completo de diseño de rutina.
- Añadir un botón **Práctica rápida** que inicia una sesión libre con cronómetro, sin bloques ni minutos fijos.
- Permitir **editar** una práctica guardada del historial: título, notas, duración y sus bloques (nombre, categoría, tiempo real y planificado), recalculando los totales.
- Permitir **eliminar** una práctica guardada del historial.
- Garantizar que el detalle de un día muestra siempre las grabaciones de ese día: se asocian por sesión y, si no encajan, se muestran en una sección propia en lugar de desaparecer.
- Mostrar estados de carga (skeletons) mientras se cargan las grabaciones y mientras llega el catálogo remoto.

## Capabilities

### New Capabilities

- `practice-session-management`: gestión del ciclo de la práctica en el navegador: elegir o crear una rutina, iniciar una práctica rápida, y editar o eliminar prácticas guardadas del historial.

### Modified Capabilities

- Ninguna. Las grabaciones y el detalle del día se ajustan dentro de la nueva capacidad.

## Impact

- `src/components/practice/PracticeWorkspace.tsx` (selección de rutina, práctica rápida) y nuevo `SavedPracticeRoutines`.
- `src/components/dashboard/PracticeDayDetail.tsx`, `PracticeSessionDetails.tsx` y nuevo `SessionEditor`.
- `src/lib/practice-session-editing.ts`, `src/lib/practice-recording-filtering.ts` y `src/stores/usePracticeStore.ts` (update/delete).
- `src/components/practice/RecordingsLibrary.tsx` (skeleton hasta el catálogo remoto) y `src/i18n/es.ts` / `src/i18n/en.ts`.

## Notes

La edición de una sesión recalcula la duración real y el reparto por categoría a partir de sus bloques para no descuadrar las estadísticas del dashboard. Eliminar una sesión no borra sus grabaciones: pasan a mostrarse como grabaciones sueltas del día.

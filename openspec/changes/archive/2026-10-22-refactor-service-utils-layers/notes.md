# Notas de implementación — refactor-service-utils-layers

## Baseline (tarea 1.1)

- `npm run typecheck`: exit 0.
- `npm test`: 423 tests, 423 pass, 0 fail.
- `npm run build`: exit 0, compilación correcta.

## Inventario (tarea 1.2)

Módulos que se mueven a `src/services/`:

- `supabase/` (cliente Supabase, datos y archivos).
- `cloud-sync/` (integración completa: proveedores, OAuth, sesión y sincronización).
- `practice-library.ts` (IndexedDB).
- `practice-events.ts` (eventos del navegador).
- `metronome-audio.ts` (Web Audio).
- `metronome-audio-context.ts` (Web Audio).

El resto de `src/lib` es lógica pura y se mueve a `src/utils/`, incluido `licks/`.

## Verificación final (tareas 7.1–7.3)

- `npm run typecheck`: exit 0.
- `npm test`: 425 tests, 425 pass, 0 fail (423 previos + 2 del test de arquitectura).
- `npm run build`: exit 0.
- `git diff -- package.json package-lock.json tsconfig.json next.config.ts`: vacío.
- No hay cambios de `aria-*`, `role`, `data-tour-target`, `id` ni textos en los archivos tocados por el split. El árbol de trabajo ya contenía los cambios no confirmados de la fase 1 (`SettingsView`/`AccountView`/i18n); esos archivos quedan fuera de este audit.
- `src/services` contiene únicamente las costuras externas de D2 (Supabase, cloud-sync, IndexedDB, eventos y Web Audio).
- `src/utils` contiene 69 archivos de lógica pura; `src/lib` ya no existe.
- `tests/architecture-layers.test.mjs` pasa y falla con imports sintéticos prohibidos.

# Proposal

## Why

`src/lib` mezcla lógica de dominio pura con adaptadores externos (Supabase, IndexedDB, Web Audio y la integración de cloud-sync). Esa mezcla oculta la frontera entre cálculo testeable y comunicación con el exterior, y permite que componentes y hooks importen I/O directamente. Las reglas de arquitectura del proyecto exigen separar `services/` (comunicación externa) de `utils/` (funciones puras).

## What Changes

- Crear `src/services/` y mover allí los módulos que hablan con el exterior:
  - `supabase/` (cliente, datos y archivos).
  - `cloud-sync/` (proveedores, OAuth, sesión, sincronización y preferencias).
  - `practice-library.ts` (IndexedDB y almacenamiento de archivos).
  - `practice-events.ts` (eventos del navegador).
  - `metronome-audio.ts` y `metronome-audio-context.ts` (Web Audio).
- Crear `src/utils/` y mover allí el resto de módulos puros de `src/lib`, conservando el subdirectorio `licks/`.
- Mover los tipos de dominio que hoy obligan a `utils` a mirar hacia arriba:
  - `cloud-sync/types.ts` → `src/types/cloud-sync.ts`.
  - `PersistedPracticeState` → `src/types/practice-storage.ts`.
  - `PracticeAsset` y `PracticeAudioRecording` → `src/types/practice-library.ts`.
- Actualizar todos los imports de `src/` y `tests/`, y eliminar `src/lib` para que no queden rutas ambiguas.
- **BREAKING (solo interno)**: cambian las rutas de importación. No cambia ninguna API pública, ruta, texto, estilo ni comportamiento de usuario.
- Añadir `tests/architecture-layers.test.mjs` para impedir que vuelvan a aparecer imports a `@/lib`, que `utils` dependa de `services`/`hooks`/`components` o que `services` dependa de capas de React.
- Actualizar `docs/component-conventions.md` con la nueva dirección de dependencias.

## Capabilities

### New Capabilities

Ninguna. Es un refactor estructural que preserva el comportamiento; por eso `.openspec.yaml` declara `skip_specs: true`.

### Modified Capabilities

Ninguna. Los escenarios de `app-accessibility`, `app-navigation`, `audio-recording-cloud-sync`, `practice-session-management` y las demás capacidades deben seguir pasando sin cambios.

## Impact

- **Código**: ~90 archivos entre `src/lib`, `src/hooks`, `src/components`, `src/stores`, `src/app` y `tests`.
- **Rutas internas**: `@/lib/*` desaparece; pasa a `@/utils/*` o `@/services/*`.
- **Tests**: los imports relativos `../src/lib/*` se actualizan. No se debilita ninguna aserción.
- **Dependencias**: ninguna añadida ni eliminada.
- **Comportamiento**: sin cambios.

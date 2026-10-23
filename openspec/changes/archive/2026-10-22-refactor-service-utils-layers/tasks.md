# Tasks

## 1. Baseline e inventario

- [x] 1.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build`; registrar en `notes.md` que los tres salen en verde y el número de tests (423 al inicio). Verificación: los tres comandos terminan con exit 0.
- [x] 1.2 Confirmar el inventario de `src/lib` contra las decisiones D2/D3 del design: listar los módulos que van a `services` y comprobar que todos los demás son puros. Verificación: la lista de `services` coincide exactamente con `supabase/`, `cloud-sync/`, `practice-library.ts`, `practice-events.ts`, `metronome-audio.ts` y `metronome-audio-context.ts`.

## 2. Servicios

- [x] 2.1 Crear `src/services/` y mover `supabase/` y `cloud-sync/` desde `src/lib/`, actualizando todos los imports `@/lib/supabase` y `@/lib/cloud-sync`. Verificación: `npm run typecheck` en verde y `grep -r "@/lib/supabase\\|@/lib/cloud-sync" src` sin resultados.
- [x] 2.2 Mover `practice-library.ts`, `practice-events.ts`, `metronome-audio.ts` y `metronome-audio-context.ts` a `src/services/`, actualizando sus imports y consumidores. Verificación: `npm run typecheck` en verde y `grep -r "@/lib/practice-library\\|@/lib/practice-events\\|@/lib/metronome-audio" src` sin resultados.

## 3. Utilidades

- [x] 3.1 Crear `src/utils/` y mover todos los módulos planos restantes de `src/lib/`, incluidos los que ya estaban en subcarpetas que no son `services`. Verificación: `npm run typecheck` en verde y `find src/lib -maxdepth 1 -type f` vacío salvo los pendientes de la tarea 3.2.
- [x] 3.2 Mover `src/lib/licks/` a `src/utils/licks/` y actualizar imports y tests relativos. Verificación: `npm test` en verde y `grep -r "@/lib/licks" src tests` sin resultados.

## 4. Tipos compartidos

- [x] 4.1 Mover `src/services/cloud-sync/types.ts` a `src/types/cloud-sync.ts` y actualizar todos sus importadores. Verificación: `npm run typecheck` y `npm test` en verde, y `grep -r "cloud-sync/types" src tests` sin resultados.
- [x] 4.2 Mover `PersistedPracticeState` a `src/types/practice-storage.ts`, y `PracticeAsset`/`PracticeAudioRecording` a `src/types/practice-library.ts`, actualizando imports. Verificación: `npm run typecheck` en verde y `grep -r "PersistedPracticeState" src/stores src/utils src/services` solo muestra imports desde `@/types/practice-storage`.

## 5. Retirada de `src/lib`

- [x] 5.1 Eliminar el directorio `src/lib` y comprobar que no queda ninguna referencia. Verificación: `grep -rn "@/lib/\\|src/lib" src tests docs` sin resultados y `npm run typecheck` en verde.
- [x] 5.2 Actualizar las rutas relativas de `tests/*.test.mjs` de `../src/lib/...` a `../src/utils/...` o `../src/services/...` según el mapeo. Verificación: `npm test` en verde con el mismo número de tests que en 1.1.

## 6. Guardas y documentación

- [x] 6.1 Añadir `tests/architecture-layers.test.mjs` que prohíba `@/lib`, imports de `utils` hacia `services`/`hooks`/`components`/`stores`/`app`/`react`/`next`, e imports de `services` hacia `hooks`/`components`/`stores`/`app`/`react`/`next`. Verificación: el test pasa y falla si se introduce un import prohibido de prueba.
- [x] 6.2 Actualizar `docs/component-conventions.md` con la dirección `types ← utils ← services ← hooks ← components/ui ← components/<dominio> ← app` y el inventario de `services`/`utils`. Verificación: la tabla y la dirección del documento coinciden con el design.

## 7. Verificación de integración

- [x] 7.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build`. Verificación: los tres terminan con exit 0 y el número de tests es 423 o superior.
- [x] 7.2 Revisar `git diff` para confirmar que no cambió ningún texto visible, atributo `aria-*`, `role`, `data-tour-target`, `id`, ruta ni configuración (`package.json`, `tsconfig.json`, `next.config.ts`). Verificación: el diff solo contiene movimientos de archivos e imports.
- [x] 7.3 Confirmar el árbol final: `src/services` solo contiene adaptadores externos, `src/utils` solo lógica pura y no existe `src/lib`. Verificación: `find src/services src/utils -type f` y `grep -r "@/lib" src` revisados a mano.

## Workflow follow-up

- Archivar el cambio con `/opsx-archive` cuando la revisión y la verificación manual estén aceptadas.
- Este cambio declara `skip_specs: true`; no se esperan deltas de especificación al archivar.

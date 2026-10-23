# Design

## Context

Ver `proposal.md` — Why. El estado actual que condiciona el enfoque:

- `src/lib` contiene ~35 módulos planos más `cloud-sync/` y `supabase/`. La mayoría son funciones puras, pero seis módulos tocan el exterior: Supabase, IndexedDB, Web Audio, eventos del navegador y la integración OAuth.
- `tests/*.test.mjs` importa `src/lib/*`, `src/i18n/*` y `src/stores/*` con rutas relativas. El split obliga a actualizar esas rutas, no la lógica de los tests.
- `src/lib/practice-data-state.ts` y `src/lib/supabase/practice-data.ts` importan el tipo `PersistedPracticeState` desde `src/stores/practiceStorage.ts`; `src/lib/practice-recording*.ts` importa `PracticeAudioRecording` desde `practice-library.ts`. Esos tipos son la única razón por la que la capa pura mira hacia arriba.
- No hay dependencias nuevas disponibles ni ESLint. La frontera se verifica con un test de imports, no con una herramienta externa.

## Goals / Non-Goals

**Goals:**

- Una regla única y mecánica para decidir si un módulo es `utils` o `services`.
- Que `utils` sea importable por tests y por cualquier capa sin arrastrar navegador, React ni red.
- Que `services` sea el único lugar donde se habla con Supabase, IndexedDB, Web Audio o el DOM.
- Eliminar `src/lib` por completo: sin shims ni re-exports que permitan dos rutas para lo mismo.

**Non-Goals:**

- No se refactorizan componentes ni se extraen hooks nuevos.
- No se cambia ninguna firma pública, comportamiento, texto, estilo ni ruta de la aplicación.
- No se migran los tipos que solo describen argumentos de una función; se quedan junto a su función.
- No se añade una herramienta de lint ni una dependencia.

## Decisions

### D1. Regla de clasificación

Un módulo va a `services/` si cumple al menos una condición:

- Importa un SDK externo (`@supabase/supabase-js`).
- Usa APIs del navegador con efectos: `fetch`, `indexedDB`, `localStorage`, `AudioContext`, `MediaRecorder`, `window.dispatchEvent`, `URL.createObjectURL`.
- Es la costura de una integración externa completa (todo `cloud-sync/`, aunque algunos de sus helpers sean puros).

Todo lo demás va a `utils/`. La prueba de decisión: si el módulo se puede ejecutar con `node --test` sin DOM ni red, es `utils`.

*Alternativa considerada:* dejar `lib` y añadir subcarpetas `lib/utils` y `lib/services`. Se rechaza porque mantiene dos nombres para la misma capa y no deja una frontera importable inequívoca.

### D2. Inventario de `services`

- `src/services/supabase/{client,practice-data,practice-files}.ts`
- `src/services/cloud-sync/*` (incluye `oauth`, `auto-sync-preference`, adaptadores y sincronización)
- `src/services/practice-library.ts` (IndexedDB)
- `src/services/practice-events.ts` (event bus del navegador)
- `src/services/metronome-audio.ts`
- `src/services/metronome-audio-context.ts`

`cloud-sync` se mueve entero aunque `catalog`, `config` o `session` sean puros: son partes de una misma costura de integración y separarlas obligaría a importar `services` desde `utils` o a duplicar tipos.

### D3. Inventario de `utils`

Todo el resto de `src/lib`, conservando `licks/`: cálculos de fechas, formato, analíticas, validaciones, geometría de tablatura, planificación, migraciones y helpers de presentación. `practice-sounds.ts` se queda en `utils` porque son constantes y guards puros.

### D4. Tipos que rompen la dirección

Se mueven a `src/types/` solo los tipos que hoy obligan a `utils` a importar hacia arriba:

- `src/lib/cloud-sync/types.ts` → `src/types/cloud-sync.ts` (incluye `CLOUD_SYNC_PROVIDERS`, siguiendo el precedente de `types/practice-attachment.ts`).
- `PersistedPracticeState` → `src/types/practice-storage.ts`.
- `PracticeAsset` y `PracticeAudioRecording` → `src/types/practice-library.ts`.

Los tipos que solo describen los argumentos de una función (por ejemplo `CreatePracticeAudioRecordingInput`) se quedan en su módulo. Los tipos de `utils` que usa `PersistedPracticeState` (`WeeklyRoutineSchedule`, `PracticeGoals`) se importan con `import type`; no crean acoplamiento en tiempo de ejecución.

### D5. Codemod por prefijo más largo

El movimiento se hace con un script de una sola pasada que mapea primero las rutas de `services` y después el resto a `utils`, para que `metronome-audio-context` no se confunda con `metronome-audio`. Se actualizan imports `@/lib/*` y rutas relativas `../src/lib/*` de los tests. Después se ejecuta `typecheck` y `test`; cualquier ruta olvidada falla ahí.

### D6. Sin compatibilidad hacia atrás

No se dejan archivos puente en `src/lib` ni re-exports. Un shim mantendría la ambigüedad que este cambio elimina y permitiría que nuevo código siguiera importando la ruta vieja. `src/lib` se elimina cuando el grep de `@/lib` y `src/lib` esté vacío.

### D7. Verificación mecánica de capas

`tests/architecture-layers.test.mjs` recorre `src/**/*.ts` y `src/**/*.tsx` y comprueba:

- Ningún archivo importa `@/lib/`.
- `src/utils/**` no importa `@/services`, `@/hooks`, `@/components`, `@/stores`, `@/app`, `react` ni `next`.
- `src/services/**` no importa `@/hooks`, `@/components`, `@/stores`, `@/app`, `react` ni `next`.
- `src/utils/**` puede importar `@/types` y otros `@/utils`.
- `src/services/**` puede importar `@/types`, `@/utils` y otros `@/services`.

Los `import type` se inspeccionan igual que los imports de valor para que la frontera no dependa de que TypeScript borre el import. Las excepciones se documentan en el test, no se silencian con un `eslint-disable`.

## Risks / Trade-offs

- **Rutas olvidadas en tests o en `src/app`** → El codemod cubre `src/` y `tests/`; `npm run typecheck` y `npm test` fallan inmediatamente si falta una.
- **Imports circulares al mover tipos** → Los tipos movidos son `import type` o datos sin funciones; `tsc` detecta cualquier ciclo real.
- **`cloud-sync` arrastra `utils` puros y alguien lo interpreta como servicio** → D2 lo documenta: la costura de integración manda sobre la pureza de un helper aislado.
- **El test de capas se vuelve demasiado rígido y bloquea trabajo legítimo** → Solo prohíbe imports hacia arriba; añadir un servicio nuevo o un util nuevo no requiere tocar el test.
- **Difícil de revisar por el volumen de renames** → El diff es mecánico: mover + actualizar imports. Se revisa el árbol final y el test de arquitectura, no archivo por archivo.
- **Cambios de comportamiento inadvertidos** → No se toca lógica; `typecheck`, los 423 tests y `build` son la red. Cualquier cambio de comportamiento sería un error del codemod, no del diseño.

## Migration Plan

1. Baseline verde (`typecheck`, `test`, `build`).
2. Crear `src/services` y `src/utils`; mover archivos con el mapeo de D2/D3.
3. Mover los tipos de D4 y actualizar sus imports.
4. Ejecutar el codemod de imports en `src/` y `tests/`.
5. Borrar `src/lib` y verificar que no quede ninguna referencia.
6. Añadir el test de arquitectura y actualizar `docs/component-conventions.md`.
7. Pasar `typecheck`, `test` y `build`.

Rollback: revertir el commit completo. Es un cambio solo de código, sin migración de datos ni estado persistido.

## Open Questions

Ninguna que afecte al alcance. La migración de los ~103 tipos restantes de `utils` a `types` se deja para cambios posteriores porque no es necesaria para separar `services` de `utils`.

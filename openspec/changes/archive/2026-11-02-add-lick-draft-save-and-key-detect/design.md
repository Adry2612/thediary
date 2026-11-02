# Design

## Context

`LickEditor` es el único formulario del lick y hoy solo persiste con `onSave`, que guarda y navega a la ficha; la partitura vive en estado local (`score`) y la tonalidad se detecta con `detectTabKey(normalizeTab(lick?.tab))`, es decir, solo de la rejilla antigua ya guardada. `detectTabKey` ya usa Krumhansl-Schmuckler con pesos para la primera y la última nota.

## Goals / Non-Goals

**Goals:**

- Persistir la partitura en cualquier momento sin completar la ficha ni salir del editor.
- Detectar la tonalidad con la partitura visual que se está editando y aplicarla sola mientras el campo esté en automático.

**Non-Goals:**

- Borradores sin lick, versiones de tablatura o historial de cambios.
- Detección por acordes, progresiones o contexto de la canción.
- Cambiar el modelo de datos o la sincronización.

## Decisions

### 1. El borrador es un lick normal con título provisional

No se añade un estado «borrador» al modelo: un guardado de tablatura crea o actualiza un `GuitarLick` con la partitura y los campos válidos. Si el título está vacío se usa la cadena `licks.untitled` («Sin título»), ya existente. Así aparece en la biblioteca, se puede abrir, practicar y renombrar sin tocar la normalización ni el almacén.

- Alternativa descartada: `draft: true` en el modelo. Obliga a tocar normalización, listado, sincronización y práctica para un estado que el usuario puede querer practicar igual.
- Alternativa descartada: guardar solo en `localStorage`. No se sincroniza entre dispositivos y el usuario ya tiene un almacén persistente.

### 2. Un solo constructor del lick, con validación estricta o de borrador

`LickEditor` extrae `buildLick({ strict })`:

- `strict: true` (Guardar lick) mantiene las validaciones actuales: título obligatorio y BPM entre 40 y 240.
- `strict: false` (Guardar tablatura) usa el título provisional si falta, ignora un BPM inválido y conserva el que ya tuviera el lick, y guarda la partitura, tonalidad, técnicas y canción tal como estén.

El id sale de un estado `draftId` inicializado con `lick?.id`; el primer guardado de un lick nuevo lo rellena y los siguientes actualizan el mismo registro. `LickEditorPage` pasa `onSaveDraft` que llama a `saveLick` sin `router.push`.

- Alternativa descartada: dos formularios o dos endpoints. Duplica la construcción del objeto y las reglas de fusión.

### 3. Estado de guardado local y accesible

El botón vive en la cabecera de la sección Tablatura y solo aparece con la partitura visual. Tras guardar muestra «Tablatura guardada» en un `role="status"`; el estado vuelve a reposo al cambiar cualquier campo. El foco no sale del editor.

### 4. Detección desde la partitura con el mismo estimador

Se extrae `estimateKey(pitches: number[])` de `detectTabKey` (histograma, pesos de primera/última nota, correlación con los perfiles mayor/menor y umbral 0,1). `detectTabKey` sigue existiendo para la rejilla; `detectScoreKey(score)` aplana las notas de todos los compases, ignora las notas muertas y usa la afinación de la partitura.

Para la afinación se exporta `tuningToMidi(tuning, stringCount)` desde `alphatex.ts`, que ya resuelve letras, bemoles y octavas contra las afinaciones estándar de 4 a 8 cuerdas; se reutiliza en vez de duplicar la tabla.

### 5. El automático es un estado de la interfaz

`keyIsAuto` empieza activo si el lick no tiene tonalidad guardada. Mientras esté activo, un `useEffect` copia `detectedKey` al campo. Elegir una tonalidad a mano (incluida «Sin tonalidad») lo desactiva; «Usar esta tonalidad» lo reactiva. La detección no escribe nada en el lick hasta que se guarda.

- Alternativa descartada: aplicar siempre la detección. Pisaría una tonalidad elegida a propósito y una tonalidad guardada de un lick existente.

## Risks / Trade-offs

- **[La biblioteca se llena de «Sin título»]** → Es un lick real que el usuario puede renombrar; el estado de guardado lo deja claro y el listado ya usa el título provisional para mostrarlo.
- **[La tonalidad cambia mientras se escribe y distrae]** → Solo ocurre con el campo en automático y con al menos tres notas y tres clases; el usuario puede fijarla a mano en cualquier momento.
- **[Afinaciones de 7 y 8 cuerdas]** → `tuningToMidi` reutiliza las referencias estándar ya usadas por el dibujo; si la afinación no encaja, la detección devuelve `null` en vez de adivinar.
- **[Doble guardado por el re-render del almacén]** → El id del borrador vive en el componente y se reutiliza; guardar dos veces actualiza el mismo lick.

## Migration Plan

No hay migración: no cambia el modelo. Los licks existentes conservan su tonalidad y se comportan como antes; la detección solo rellena el campo cuando está en automático.

## Open Questions

Ninguna.

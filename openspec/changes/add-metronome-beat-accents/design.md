# Design

## Context

- `useMetronome` guarda `bpm`, `volume`, `subdivision`, `meterSignature`, `voice` y `tempoRamp`; el patrón de pulsos es lo único que se persiste.
- `getScheduledMetronomeBeats` (`src/utils/metronome-scheduler.ts`) emite `{ scheduledAt, beat, subdivision, click }`, con `click` de tipo `"accent" | "accentClosed" | "normal" | "none"`.
- `scheduleMetronomeClick` (`src/services/metronome-audio.ts`) recibe ese `click` y una voz, y programa la receta correspondiente con `voice-synth.ts`.
- `getVoiceRecipe(voice, kind)` (`src/utils/metronome-voice.ts`) devuelve la variante normal, la acentuada o la acentuada ahogada.
- `MetronomeCard` dibuja un botón por pulso con su forma y su nombre accesible, y pulsa desde `activeBeat`/`activeSubdivision`.

## Goals / Non-Goals

**Goals:**

- Que un pulso pueda ser normal, resalte abierto, resalte cerrado o silencio, con un solo gesto.
- Que los dos resaltes se distingan por cómo suenan, no por otra voz.
- Persistir solo el patrón.

**Non-Goals:**

- Persistir volumen, compás, subdivisión o rampa.
- Un editor de patrón más allá de los puntos.
- Cambiar el motor de síntesis de las voces.

## Decisions

### 1. Cuatro estados y un ciclo único

`src/utils/metronome-beat-pattern.ts` define `MetronomeBeatState = "normal" | "accent" | "accentClosed" | "muted"` y un patrón como un estado por pulso. Los ayudantes puros son:

- `createDefaultBeatPattern(beatsPerMeasure)` — primer pulso con resalte abierto, el resto normal.
- `normalizeBeatPattern(value, beatsPerMeasure)` — descarta estados inválidos, recorta o rellena y nunca lanza.
- `cycleBeatState(pattern, beat)` — normal → abierto → cerrado → silencio → normal.
- `toggleBeatAccent(pattern, beat)` — abierto ↔ normal.
- `toggleBeatMute(pattern, beat)` — silencio ↔ normal.

`accent` significa «resalte abierto» y `accentClosed`, «resalte cerrado». Se mantienen esos nombres para no invalidar los patrones ya guardados.

- Alternativa considerada: dos arrays de booleanos (acento y silencio). Rechazada: permiten combinaciones imposibles.
- Alternativa considerada: `open`/`closed` como nombres nuevos. Rechazada: obligaría a migrar los patrones guardados sin ganar nada.

### 2. El patrón vive en el hook y persiste por compás

`useMetronome` mantiene `beatPattern` en estado y en un ref, porque el planificador lo lee desde un intervalo.

`src/services/metronome-beat-pattern-storage.ts` guarda un mapa de compás a estados bajo `thediary.metronome-beat-patterns`:

- `readMetronomeBeatPatterns()` devuelve un mapa normalizado y `{}` ante cualquier fallo.
- `saveMetronomeBeatPattern(meter, pattern)` escribe una entrada e ignora los errores.

El patrón se carga al montar y en cada cambio de compás, así que el primer render usa el valor por defecto y el guardado llega enseguida.

- Alternativa considerada: una clave por compás. Rechazada: multiplica lecturas y deja claves huérfanas.

### 3. El planificador emite el tipo de clic

`getScheduledMetronomeBeats` recibe el patrón y asigna a cada pulso programado un `click`:

- primer pulso de un compás: el estado del pulso, mapeado a `"accent"`, `"accentClosed"`, `"normal"` o `"none"`;
- subdivisiones posteriores: `"none"` si el pulso está silenciado y `"normal"` en el resto.

`useMetronome` omite el clic cuando es `"none"` y pasa el tipo tal cual a `scheduleMetronomeClick`.

- Alternativa considerada: dos booleanos (`accent`, `closed`). Rechazada: vuelven a permitir combinaciones inválidas.

### 4. El resalte cerrado es el abierto ahogado y algo más agudo

`getVoiceRecipe(voice, "accentClosed")` parte de la receta acentuada, sube todas sus frecuencias un 10 % —también la del filtro de ruido— y recorta cada caída a 40 ms.

| Estado | Altura | Caída |
| --- | --- | --- |
| Normal | La de la voz | La de la voz |
| Resalte abierto | La del acento | La del acento |
| Resalte cerrado | ×1,10 | 40 ms |

El 1,10 sale de medir la referencia del usuario: el resalte cerrado sonaba a 1520 Hz y el abierto a 1378 Hz, con 6 ms de cola frente a 44 ms.

- Alternativa considerada: misma altura, solo cola corta. Rechazada por el usuario: no se distinguía lo suficiente.
- Alternativa considerada: una receta propia por voz. Rechazada: siete timbres nuevos para un gesto que sube el tono y recorta la cola.

### 5. El punto muestra su estado en forma, no solo en color

- `normal`: punto pequeño y tenue.
- `accent` (abierto): punto lleno y brillante.
- `accentClosed` (cerrado): punto lleno, más apagado y con un anillo.
- `muted`: punto hueco con una barra diagonal.

El nombre accesible es «Pulso N, normal», «Pulso N, resalte abierto», «Pulso N, resalte cerrado» o «Pulso N, silenciado». El grupo lleva una frase oculta que explica el ciclo y la tecla `M`. No se usa `aria-pressed` porque el estado tiene cuatro valores.

Teclado: Enter y Espacio activan el botón y recorren el ciclo; `M` silencia o restaura desde `onKeyDown`.

- Alternativa considerada: un menú por punto. Rechazada: más lento y esconde la acción.

### 6. El patrón se restaura por compás, nunca se mezcla

Cambiar de compás carga el patrón guardado de ese compás o el de por defecto. No se copia nada del anterior, así que un patrón de 9/8 no se filtra a 4/4.

## Risks / Trade-offs

- **Llegar al silencio exige tres toques** → el ciclo siempre avanza en el mismo sentido y `M` salta directo al silencio.
- **El resalte cerrado comparte altura con el abierto** → es la definición elegida; si en una voz concreta no se distingue, el problema es la cola, no el tono.
- **Precisión táctil** → un solo gesto por toque y `touch-action: manipulation` en los puntos; la prueba en dispositivo real sigue en las tareas.
- **Un patrón guardado de un compás distinto** → `normalizeBeatPattern` recorta o rellena.
- **Fallos de almacenamiento** → las lecturas caen a los valores por defecto y las escrituras se ignoran.

## Migration Plan

Ninguno. La clave de almacenamiento es nueva. Un patrón guardado con los tres estados anteriores sigue siendo válido: `accent` conserva su significado de resalte abierto.

## Open Questions

Ninguna.

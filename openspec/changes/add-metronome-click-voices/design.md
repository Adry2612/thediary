# Design

## Context

See `proposal.md` for the motivation. The state that shapes the approach:

- `scheduleMetronomeClick` (`src/services/metronome-audio.ts`) builds exactly one sine oscillator per click: 1000 Hz when accented, 760 Hz otherwise, with a 75 ms exponential decay straight to `context.destination`.
- `useMetronome` calls it per scheduled beat only when the beat is not muted, and keeps every live oscillator in a `Set<OscillatorNode>` so `stop()` can silence them.
- The project ships no audio files: the whole metronome is synthesized.
- The beat pattern (accent/mute per beat) is already persisted per meter, and the settings dialog holds subdivision, volume, meter and tempo ramp.

## Goals / Non-Goals

**Goals:**

- Seven voices that are distinguishable from each other at a glance of the ear, each with a normal and an accent variant.
- No assets, no network, no decoding: everything fits in the existing scheduling loop.
- The same timing precision as today, including when the metronome starts and stops.

**Non-Goals:**

- Importing or recording samples.
- A voice per beat, or per subdivision.
- Per-voice volume, filters or effects beyond the recipe.
- Reusing the voices for the practice start/end sounds.

## Decisions

### 1. A voice is a declarative recipe

`src/utils/metronome-voice.ts` defines the catalogue and a pure function:

```ts
type VoicePartial = { type: OscillatorType; frequency: number; gain: number; decaySeconds: number; delaySeconds?: number };
type VoiceNoise = { filterType: BiquadFilterType; frequency: number; q: number; gain: number; attackSeconds: number; decaySeconds: number };
type VoiceRecipe = { durationSeconds: number; partials: VoicePartial[]; noise?: VoiceNoise };

getVoiceRecipe(voice, accent): VoiceRecipe
isMetronomeVoice(value): value is MetronomeVoice
normalizeMetronomeVoice(value): MetronomeVoice  // desconocida → "studio"
```

The recipes, with the gain relative to the metronome volume:

| Voz | Receta normal (ganancia de pico) | Acento |
| --- | --- | --- |
| `studio` | Seno 760 Hz, caída 75 ms (0,66) | Seno 1000 Hz (1,00) |
| `wood` | Senos 880, 1320 y 2050 Hz, caídas 45/35/22 ms (0,26/0,15/0,09) + ruido paso-alto 5 kHz Q0.7, 12 ms (0,10) | Frecuencias ×1,28 y ganancias ×1,6; ruido a 6,4 kHz |
| `bell` | Senos 350, 700, 840, 1050, 1400, 1750 y 2100 Hz, caídas 900/800/620/550/450/350/280 ms (0,06/0,16/0,07/0,05/0,09/0,04/0,02) | Frecuencias ×1,18 y ganancias ×1,65 |
| `hihat` | Ruido paso-alto 9 kHz Q0.9, 50 ms (0,20) + cuadradas inarmónicas 7,4/8,2/9,6/11/12,7 kHz, 40 ms (0,05 cada una) | Ruido (0,33) y cuadradas a 8,3/9,2/10,7/12,3/14,2 kHz (0,084 cada una) |
| `beep` | Cuadrada 880 Hz, 60 ms (0,30) | Cuadrada 1046 Hz (0,50) |
| `rimshot` | Ruido paso-banda 1,8 kHz Q3, 50 ms (0,27) + seno 420 Hz, 90 ms (0,28) | Ruido a 2,2 kHz (0,46) + seno 520 Hz (0,46) |
| `shaker` | Ruido paso-banda 5,2 kHz Q1.2, ataque 6 ms y caída 110 ms (0,45) | Ruido a 6,2 kHz (0,75) |

The accent variant is always the same voice, brighter and louder; it never becomes a different instrument.

- Alternative considered: one `AudioBuffer` per voice rendered offline. Rejected: it multiplies assets in memory and loses the "no files" property without a real gain in quality.
- Alternative considered: a single generic `playTone(frequency)` with presets of two numbers. Rejected: a bell or a shaker cannot be told apart with one oscillator.

### 1b. Madera, campana y hi-hat se sintetizan como su instrumento

Las tres primeras recetas sonaban a tono, no a instrumento, porque una sola seno con caída corta no describe ninguno de los tres timbres. Las nuevas parten de cómo suena cada uno:

- **Madera:** tres modos inarmónicos cortos (880/1320/2050 Hz, entre 22 y 45 ms) más un chasquido de ruido paso-alto de 12 ms. El ataque seco y la ausencia de cola son lo que la distingue de un beep.
- **Campana:** siete parciales con ratios 0,5 / 1 / 1,2 / 1,5 / 2 / 2,5 / 3 sobre 700 Hz y colas de 280 a 900 ms. La fundamental grave, el hum de 350 Hz y los ratios inarmónicos son los que producen el "ding" de campana; la versión anterior, aguda y casi armónica, sonaba a timbre de teléfono. El acento sube un 18 % las frecuencias.
- **Hi-hat:** ruido paso-alto muy corto más cinco cuadradas inarmónicas entre 7,4 y 12,7 kHz de 40 ms. El ruido solo da un soplido; las cuadradas aportan el brillo metálico del charles.

- Alternative considered: filtrar un banco de cuadradas graves por un paso-alto compartido (truco clásico de caja de ritmos). Rechazada: exigiría añadir un filtro de bus al modelo de receta; las cuadradas ya agudas consiguen el mismo timbre con el modelo actual.
- Alternative considered: muestras grabadas. Rechazada por el usuario: se mantiene la síntesis, sin archivos ni licencias.

### 1c. Un acento se nota o no cuenta

El acento anterior subía entre 1 y 2 dB y cambiaba poco el espectro, así que varios sonaban iguales. La regla pasa a ser medible: **la ganancia total del acento es al menos 1,5 veces la de su variante normal (≈ +3,5 dB) y su frecuencia máxima es mayor**. Las recetas quedan entre +3,6 dB (Estudio, que ya se distinguía) y +4,5 dB, y ninguna suma más de 1,0 de ganancia de pico, para no recortar a volumen máximo.

- Alternative considered: subir solo el volumen del acento sin tocar el timbre. Rechazada: un acento tiene que abrirse paso en la mezcla también por brillo, no solo por nivel.
- Consecuencia: a volumen alto los acentos son más presentes; el límite de 1,0 evita la distorsión por recorte.

### 2. Noise is one shared buffer per context

`src/services/metronome-audio.ts` creates a 0,5 s mono white-noise buffer the first time a voice needs it and caches it in a `WeakMap<AudioContext, AudioBuffer>`. Each hit creates a buffer source, a biquad filter and a gain, scheduled at `scheduledAt`.

- Alternative considered: a noise oscillator with a random frequency. Rejected: it reads as a tone, not as a shaker or a hi-hat.
- Alternative considered: shipping a noise WAV. Rejected: an asset and a decode for something generated in microseconds.

### 3. Live nodes are tracked as `AudioScheduledSourceNode`

`activeOscillators` becomes `activeSources: Set<AudioScheduledSourceNode>`, because a hi-hat or a shaker is a buffer source, not an oscillator. Both kinds register before `start` and unregister on `ended`, where they also disconnect. `useMetronome.stop()` keeps stopping every node in the set.

### 4. The voice is persisted and read through a ref

`useMetronome` keeps `voice` in state and in a ref, loads it on mount from `thediary.metronome-voice`, saves it on change and passes it to `scheduleMetronomeClick`. The scheduler does not change: it already emits `click: "accent" | "normal" | "none"`, and the voice only decides the timbre.

The settings dialog writes the voice through the same hook, so a change while running affects the next scheduled beat without restarting.

### 5. The settings dialog gets one more select

`MetronomeSettings` adds a "Sonido" `SelectField` with the seven localized names, next to subdivision, volume and meter. There is no preview button: the metronome is usually running, and a preview would need its own audio context or a fake beat.

- Alternative considered: a horizontal list of chips. Rejected: seven names do not fit without wrapping, and the dialog already uses selects.

## Risks / Trade-offs

- **Voices do not sound equally loud** → gains are set by ear around the current click, and the verification task compares all seven at the same volume.
- **Noise costs more than an oscillator** → one buffer per context, one source per hit, disconnected on `ended`; a 12/8 with subdivisions still stays in the dozens of nodes.
- **Mobile browsers create the context only after a gesture** → unchanged from today; the voices use the same context the metronome already starts on first play.
- **An unknown stored voice** → `normalizeMetronomeVoice` falls back to `studio` without breaking the metronome.
- **Naming and legal** → "Estudio" is a generic word, the recipes are original and nothing is sampled, so no brand is referenced in copy or code.

## Migration Plan

None. The storage key is new; an absent value reads as `studio`, which is the current sound. Rolling back leaves an unused key that older builds ignore.

## Open Questions

None.

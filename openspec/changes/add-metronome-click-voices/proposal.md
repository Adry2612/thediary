# Proposal

## Why

El metrónomo suena hoy con un único clic sintético, el mismo para todos los estilos y volúmenes. En la práctica eso obliga a subir el volumen hasta tapar la guitarra para oírlo, o a bajar el del metrónomo hasta perderlo, porque un tono puro se pierde entre cuerdas y ambiente pero un timbre con más cuerpo no.

## What Changes

- El metrónomo pasa a ofrecer **siete voces**: Estudio (el clic limpio actual), Madera, Campana, Hi-hat, Beep, Rimshot y Shaker.
- Cada voz tiene su **variante normal y su variante de acento**, de modo que un pulso acentuado suena con el mismo timbre pero más fuerte y brillante.
- La voz se elige en los ajustes del metrónomo, se aplica a todos los pulsos y se recuerda en el dispositivo.
- Las siete voces se **sintetizan con Web Audio** —osciladores, ruido filtrado y envolventes—, sin archivos de audio ni material de terceros.
- "Estudio" es el clic actual renombrado: el nombre es neutro a propósito y no hace referencia a ninguna app comercial.

Fuera del alcance:

- Samples grabados o la posibilidad de importarlos.
- Una voz distinta por pulso: la voz es del metrónomo, el patrón de acentos y silencios sigue siendo por pulso.
- Cambiar el volumen por voz, aplicar efectos o ecualizar la mezcla.
- Sonidos del temporizador de práctica, del inicio o del final de sesión.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `practice-tools`: añade un requisito sobre las voces del clic y su variante de acento, sin cambiar los cuatro requisitos existentes de la sección.

## Impact

- Catálogo y recetas: nuevo `src/utils/metronome-voice.ts`.
- Síntesis: `src/services/metronome-audio.ts` deja de crear un único oscilador y pasa a renderizar la receta de la voz elegida, con ruido filtrado cuando la voz lo pide.
- Estado y persistencia: `src/hooks/useMetronome.ts` y nuevo `src/services/metronome-voice-storage.ts`.
- Interfaz: `src/components/practice/MetronomeSettings.tsx`.
- Textos: `src/i18n/es.ts`, `src/i18n/en.ts` y `src/i18n/dictionary.ts`.
- Pruebas: nuevo `tests/metronome-voice.test.mjs` y actualización de `tests/metronome-audio.test.mjs`.
- Depende de `add-metronome-beat-accents`, que sigue en curso: de ahí vienen el patrón por pulso y el contrato `click: "accent" | "normal" | "none"`.

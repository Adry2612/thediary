# Design

## Context

- Cuatro rondas con grabaciones reales (campana, cuenco, marimba de VSCO y silbato) no convencieron. La madera y la marimba sintetizadas de la primera iteración sí.
- `src/utils/voice-recipe.ts` y `src/services/voice-synth.ts` siguen en el proyecto y los usa el metrónomo: recetas declarativas de parciales, ruido filtrado y envolventes. No hay que inventar motor.
- La madera del metrónomo conserva la receta exacta que se diseñó entonces; la marimba de los avisos se perdió al sustituir el catálogo por grabaciones y se reconstruye con el mismo criterio: modos de barra inarmónicos.
- `TimerCard` pinta las dos filas desde `PRACTICE_SOUNDS`, así que el catálogo manda en la interfaz.
- `usePracticeTimer` llama a `playPracticeSound(sound, moment)` al iniciar, avanzar y terminar.

## Goals / Non-Goals

**Goals:**

- Recuperar el timbre que gustó sin archivos ni licencias.
- Mantener el gesto: dos golpes al empezar, tres al terminar.
- Que las dos filas ofrezcan los dos sonidos.

**Non-Goals:**

- Igualar una grabación real.
- Importar sonidos propios.
- Cambiar el motor del metrónomo.

## Decisions

### 1. Dos instrumentos, una receta por golpe

`src/utils/practice-sounds.ts` describe cada aviso como una receta de golpe y una lista de notas. Los parciales se declaran con su **ratio** respecto a la nota, de modo que el mismo golpe sirve para cualquier altura.

| Aviso | Parciales (ratio) | Ruido | Golpes inicio | Golpes fin |
| --- | --- | --- | --- | --- |
| Madera | 1 · 1,5 · 2,33 con caídas de 75/50/30 ms | Paso alto 5 kHz, 12 ms | 880 · 1320 Hz | 880 · 1046,5 · 1320 Hz |
| Marimba | 1 · 3,93 · 9,24 · 16,7 con caídas de 900/220/90/50 ms | Banda 2,4 kHz, 12 ms | 440 · 659,25 Hz | 440 · 554,37 · 659,25 Hz |

La madera conserva los tres modos inarmónicos del metrónomo; se le da algo más de caída (75 ms en vez de 45) para que se lea como madera y no como clic. La marimba usa los modos de barra reales (1 / 3,93 / 9,24 / 16,7) y una nota base de 440 Hz.

- Alternativa considerada: una receta distinta por nota. Rechazada: duplica el catálogo sin cambiar el timbre.
- Alternativa considerada: seguir con grabaciones. Rechazada por el usuario tras cuatro intentos.

### 2. El inicio se recorta, el final se deja sonar

El último golpe del inicio lleva un tope de cola (`startTailSeconds`): 120 ms en madera y 400 ms en marimba. Así el aviso completo cabe por debajo de un segundo aunque la nota tenga una cola de 900 ms.

El final no lleva tope: los dos primeros golpes suenan completos y el tercero se apaga solo. La madera termina en unos 0,68 s y la marimba en unos 1,70 s.

- Alternativa considerada: mantener la regla de «el final dura al menos dos segundos». Rechazada: obligaría a inventar una cola que la madera no tiene.
- Alternativa considerada: acortar la marimba en el final también. Rechazada: el final debe notarse más que el inicio.

### 3. Un solo motor de síntesis

`src/services/practice-sound.ts` programa cada golpe con `scheduleVoiceRecipe`, el mismo que usa el metrónomo, pasándole la receta ya escalada a la nota y un `volume` con la ganancia del aviso. No hay `OscillatorNode` suelto en el servicio: si el motor cambia, cambian los dos.

Desaparecen la caché de `AudioBuffer`, la precarga y el `fetch`. El contexto de audio sigue siendo compartido y se reanuda al primer gesto.

- Alternativa considerada: un renderizador propio para los avisos. Rechazada: dos formas de sintetizar lo mismo.

### 4. Estado e interfaz

Sin cambios de clave: `thediary.practice-start-sound` y `thediary.practice-end-sound`. Los valores por defecto pasan a `wood` y `marimba`. Los valores guardados de la etapa anterior (`bell`, `bowl`, `whistle`) no son válidos y caen en los nuevos por defecto.

Las dos filas de `TimerCard` se generan desde el catálogo, así que ofrecen madera y marimba sin tocar el componente. La previsualización al elegir se mantiene.

## Risks / Trade-offs

- **La madera dura poco** → 0,68 s de final. Es lo que dura una madera; si molesta, el usuario puede elegir marimba para terminar.
- **Sigue sonando a sintetizador** → es el compromiso aceptado a cambio de no arrastrar licencias; el timbre es el que gustó.
- **Valores guardados de la etapa anterior** → caen en los valores por defecto sin romper nada.
- **El ratio 16,7 de la marimba** → un parcial a 7,3 kHz puede resultar áspero; su ganancia es 0,02 y su caída, 50 ms.

## Migration Plan

Ninguno. Se retiran los cuatro MP3; quien tuviera elegido un sonido retirado vuelve a madera y marimba.

## Open Questions

Ninguna.

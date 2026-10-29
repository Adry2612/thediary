# Proposal

## Why

Los cuatro intentos con grabaciones reales no convencieron: campana, cuenco, marimba y silbato de bibliotecas libres sonaban a instrumento, sí, pero no a los avisos que el usuario quería. La madera y la marimba sintetizadas de la primera iteración sí le gustaron, y son las únicas que puede llevar la app sin arrastrar licencias.

Este cambio vuelve a esas dos y retira las grabaciones.

## What Changes

- El catálogo de avisos queda en **dos sonidos sintetizados**: **Madera** y **Marimba**, renderizados con Web Audio, sin archivos ni material de terceros.
- Cada aviso conserva la estructura de siempre: **dos golpes al iniciar** (menos de un segundo) y **tres al terminar**, con el último dejándose sonar.
- Los dos sonidos aparecen en las dos filas: se puede empezar con marimba y terminar con madera.
- Los valores por defecto pasan a ser **madera al empezar** y **marimba al terminar**.
- Se eliminan `public/sounds/` (cuatro MP3 y su `LICENSE.md`) y todo el código de carga, decodificación y caché de muestras.
- Se retira la regla de «el final dura al menos dos segundos»: una madera sintetizada no tiene cola para sostener dos segundos, y fingirla sería mentir en la especificación.

Fuera del alcance:

- Volver a grabaciones o a importar sonidos propios.
- Cambiar los momentos en que suenan.
- Tocar el metrónomo, que mantiene sus siete voces.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `practice-session-management`: el catálogo pasa a dos sonidos sintetizados y la regla de duración se ajusta a lo que cada instrumento puede sonar de verdad.

## Impact

- `src/utils/practice-sounds.ts`: catálogo de dos instrumentos, recetas por nota y duraciones.
- `src/services/practice-sound.ts`: programación de los golpes con el motor de síntesis compartido; desaparece la carga de archivos.
- `src/i18n/`: las etiquetas pasan a `soundWood` y `soundMarimba`; se retiran campana, cuenco y silbato.
- `public/sounds/`: se elimina.
- Pruebas: `tests/practice-sounds.test.mjs` y `tests/practice-sound.test.mjs`.
- `src/utils/voice-recipe.ts` y `src/services/voice-synth.ts` ya existían y se reutilizan tal cual.

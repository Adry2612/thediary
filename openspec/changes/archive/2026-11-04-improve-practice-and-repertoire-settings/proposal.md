# Proposal

## Why

La biblioteca de repertorio y la práctica ya funcionan, pero quedan roces que obligan a corregir datos a mano o a adivinar qué hace el temporizador: el buscador de catálogo de una canción existente solo rellena huecos, la edición de una práctica terminada muestra minutos con decimales y el navegador bloquea el guardado con valores que no encajan en el `step`, el tiempo extra no se ve en el reloj grande y el tiempo objetivo aparece también en rutinas donde no tiene sentido. Además, los nombres de técnicas y teorías viven en varios sitios y las afinaciones se muestran siempre como una mezcla de nombre y notas, sin una preferencia común.

## What Changes

- **Buscar datos en una canción ya creada.** El buscador de catálogo de una canción existente deja de limitarse a rellenar campos vacíos: al elegir un resultado se muestra una **vista previa** con lo que cambiará (título, artista, álbum, año y carátula) y, al confirmar, se actualiza la ficha. Afinación, capo, partes, cifrado, tablatura y material siguen intactos; los campos que el candidato no traiga no se vacían.
- **Editar una práctica en minutos y segundos.** La edición de una práctica guardada muestra los tiempos como `mm:ss` o `h:mm:ss` en lugar de minutos decimales, acepta esos mismos formatos al escribir y guarda sin la validación nativa del `input[type=number]`. Un tiempo inválido se explica en el propio campo y no bloquea el resto del formulario.
- **Tiempo extra visible y aviso de fin de bloque rediseñado.** Cuando el bloque termina y la opción de seguir contando está activa, el reloj grande sigue contando el tiempo extra en verde, con un aviso «Tiempo cumplido» en la parte superior de la tarjeta. El tiempo total y el aviso de fin de bloque dejan el toast flotante y pasan a una presentación integrada en la tarjeta, sin tapar el temporizador.
- **Tiempo objetivo solo en práctica rápida y de repertorio.** El control para fijar el objetivo desaparece de las rutinas guardadas y de los planes construidos como rutina. Se mantiene en la práctica rápida de técnica, en la práctica rápida de repertorio y en la confirmación de práctica libre desde el repertorio.
- **Un solo catálogo de técnicas y temas de teoría.** Las técnicas de lick y de bloque, y los temas de teoría, salen de catálogos únicos con nombre en español y nombre original. Los bloques de teoría dejan el texto libre y usan un buscador como el de técnicas; los nombres antiguos guardados siguen siendo seleccionables y visibles.
- **Preferencias de presentación.** Configuración gana dos ajustes por dispositivo: mostrar las técnicas en español o con su nombre original, y mostrar las afinaciones por nombre (`Drop D`, `Estándar`) o por notación de cuerdas (`DADGBE`, `EADGBE`). Los ajustes se aplican al instante en licks, bloques, análisis, repertorio y afinador.
- **Fuera de alcance:** traer letra, tablatura o audio desde el catálogo; sincronizar las preferencias de presentación entre dispositivos; detectar afinaciones personalizadas que no estén en el catálogo; cambiar el modelo de datos de prácticas o licks.

## Capabilities

### New Capabilities

- `display-preferences`: preferencias de presentación guardadas en el dispositivo y su aplicación a los nombres de técnicas y a las etiquetas de afinación.

### Modified Capabilities

- `repertoire-library`: el buscador de una canción existente pasa de rellenar huecos a previsualizar y aplicar la ficha completa del candidato.
- `practice-session-management`: edición de prácticas en formato de reloj, presentación del tiempo extra y del fin de bloque, alcance del tiempo objetivo, catálogo de temas de teoría y nombres de técnica configurables.
- `licks-library`: el catálogo global de técnicas comparte nombres en español y originales, y su presentación sigue la preferencia.
- `practice-tools`: las etiquetas de las afinaciones del afinador siguen la preferencia de presentación.

## Impact

- **Código:** `src/components/dashboard/SessionEditor.tsx`, `src/utils/practice-session-editing.ts`, `src/utils/format.ts`, `src/components/practice/TimerCard.tsx`, `src/utils/practice-launch.ts`, `src/stores/useActivePracticeSessionStore.ts`, `src/components/repertoire/RepertoireItemCard.tsx`, `src/utils/repertoire-catalog.ts`, `src/components/repertoire/RepertoireSongForm.tsx`, `src/components/practice/PracticePhaseEditor.tsx`, `src/utils/licks/techniques.ts`, `src/utils/licks/presentation.ts`, `src/utils/practice-session-details.ts`, `src/components/tools/TunerPanel.tsx`, `src/components/account/SettingsView.tsx`, nuevos catálogos y preferencias en `src/utils` y `src/services`, y textos en `src/i18n/`.
- **Datos:** no cambia el modelo de `PracticePhase`, `SessionRecord` o `GuitarLick`; los nombres antiguos siguen siendo válidos. Las preferencias se guardan en `localStorage` y no se sincronizan.
- **Tests:** edición de sesiones con segundos, formato y parseo de tiempos, alcance del objetivo, catálogos y resolución de nombres, preferencias de presentación, previsualización del catálogo y etiquetas de afinación.
- **Documentación:** `docs/practice.md`, `docs/repertoire.md` y `docs/settings.md` (o los documentos equivalentes que existan) con el nuevo comportamiento.

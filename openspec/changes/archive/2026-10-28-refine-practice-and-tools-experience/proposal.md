# Proposal

## Why

La pantalla de práctica mezcla en una sola columna la elección de rutina, el constructor, la edición y el arranque, así que no hay una acción principal clara y cuesta saber en qué punto estás. Al terminar, el diálogo de guardado acumula resumen, notas de sesión, notas por bloque y la casilla de rutina sin jerarquía; la grabadora parece un formulario más y no una grabadora; la pantalla del metrónomo solo hace una cosa aunque el resto de herramientas de estudio viven dispersas; guardar una rutina no confirma nada; las modales aparecen de golpe; y en un monitor ultrawide la columna se queda en 1280 px y el contenido parece pequeño.

Además no existe forma de registrar cómo entrabas a practicar: el estado de ánimo y el foco son la parte del entrenamiento que hoy se pierde por completo.

## What Changes

- La pantalla de práctica pasa a un flujo de tres estados —elegir, revisar y practicar— con una sola acción principal por estado. El constructor de rutinas se conserva como camino secundario de edición y no compite con el arranque.
- El cierre de la práctica se convierte en una hoja compacta: resumen primero, notas plegadas y acciones claras al final.
- Se añaden **mood** y **focus** como métricas opcionales: escala de cinco emojis, se preguntan al terminar sobre el estado con el que empezaste la práctica, se guardan por sesión y se muestran en el detalle del día y en el dashboard (media y tendencia). Dos interruptores en Configuración deciden si se preguntan; por defecto quedan apagados.
- La grabadora imita el panel de una Sony M-450: un marco con la onda dentro, que avanza de derecha a izquierda mientras grabas y queda completa al detener, y una fila de mandos físicos (grabar, detener, reproducir, pausa, retroceder y avanzar) que sustituyen a los botones actuales.
- La pantalla del metrónomo pasa a ser **Herramientas** (`/tools`): metrónomo, afinador con selector de afinación y referencia A4, generador de tonos y calculadora de tempo a milisegundos para delays y reverbs. `/metronome` redirige a la nueva ruta.
- En pantallas ultrawide la columna crece una vez hasta 96 rem y se detiene, para no dejar el contenido diminuto ni estirar las líneas sin límite.
- Guardar una rutina confirma el resultado de forma visible y accesible, sin dejar la duda de si se guardó.
- Las modales aparecen y desaparecen con una transición breve (fundido y un desplazamiento mínimo), respetando `prefers-reduced-motion`.

Out of scope:

- Círculo de quintas interactivo; queda para otra tanda.
- Cambiar el motor de audio del metrónomo, la grabación en sí, el almacenamiento o la sincronización en la nube.
- Histórico de mood/focus con rangos de fecha nuevos o exportación; se usan los periodos que ya ofrece el dashboard.
- Rediseñar el resto de pantallas o el tema visual de la aplicación.
- Sustituir la grabadora por una grabación multipista o con edición de audio.

## Capabilities

### New Capabilities

- `practice-tools`: la sección Herramientas, con el metrónomo, el afinador, el generador de tonos y la calculadora de tempo a milisegundos, y su entrada en la navegación.
- `app-motion`: el movimiento compartido de las capas superpuestas al abrirse y cerrarse, con su comportamiento con movimiento reducido.

### Modified Capabilities

- `practice-session-management`: flujo por pasos de la pantalla de práctica, hoja de cierre con notas y métricas, grabadora tipo pletina, preferencias de mood/focus y confirmación al guardar rutinas.
- `practice-dashboard`: media y tendencia de mood y focus, y su lectura en el detalle del día.
- `app-layout`: el ancho de la columna en pantallas ultrawide.

## Impact

- `src/components/practice/PracticeWorkspace.tsx`, `PracticePlanBuilder.tsx`, `PracticeSession.tsx`, `SavedPracticeRoutines.tsx` y un nuevo indicador de pasos para el flujo de práctica.
- `src/components/practice/PracticeCompletionDialog.tsx` y nuevos componentes de escala de emojis y notas plegables.
- `src/types/practice.ts`, `src/utils/practice-*.ts` y un servicio de preferencias para mood/focus; `src/components/account/SettingsView.tsx` y sus dos interruptores.
- `src/components/dashboard/*` y `src/utils/practice-analytics.ts` para la media y tendencia; `PracticeSessionDetails.tsx` para el detalle del día.
- `src/components/practice/PracticeAudioRecorder.tsx`, `PracticeRecordingWaveform.tsx`, `PracticeAudioPlayer.tsx`, `src/hooks/usePracticeAudioRecorder.ts` y `src/utils/recording-waveform.ts` para la pletina y la onda desplazándose.
- Nueva ruta `src/app/(workspace)/tools/` con sus componentes, reutilizando `MetronomeCard`, y redirección desde `/metronome`; `src/components/layout/SiteNavigation.tsx` y la copia de navegación.
- `src/components/ui/PageShell.tsx` para el ancho ultrawide.
- `src/components/ui/ModalDialog.tsx`, `PortalModal.tsx`, `ConfirmDialog.tsx` y los `<dialog>` propios para el movimiento; `src/app/globals.css` para las transiciones.
- `src/i18n/es.ts`, `src/i18n/en.ts` y `src/i18n/dictionary.ts` para todo el texto nuevo.
- Tests de Node para la escala de emojis, las preferencias, la media de métricas, la calculadora de tempo y el enrutado de Herramientas.

# Proposal

## Why

En pantallas ultrawide la barra de navegación se queda dentro de una columna de 96 rem y el resto del ancho queda vacío, así que la cabecera parece pequeña y desligada de la pantalla. En el dashboard, el ánimo y el foco se resumen con emojis y una media del mes: rompen la estética del resto de la aplicación y no dejan ver cómo evolucionan en el tiempo. Además, una práctica libre lanzada desde el repertorio se guarda como «finalizada antes de completar la rutina» aunque no tenía duración que completar, el tipo de guitarra se hereda en silencio y no hay forma de fijar un tiempo objetivo al que el temporizador avise y se detenga. En Herramientas, los cuatro bloques deben leerse como filas a ancho completo y no como una rejilla de dos columnas, y el afinador no llega a arrancar en algunos navegadores porque el contexto de audio se queda suspendido.

## What Changes

- La barra de navegación crece en pantallas ultrawide más allá de la columna de contenido y se detiene antes de tocar los bordes. La columna de las pantallas no cambia, para no estirar líneas de lectura.
- El bloque de bienestar del dashboard deja de usar emojis y pasa a un gráfico temporal de ánimo y foco, con selector de periodo (semana, mes y año), media del periodo, comparación con el periodo anterior y número de prácticas que respondieron.
- El detalle de una práctica guardada muestra ánimo y foco con su etiqueta textual y su valor, sin emojis; el selector de respuesta de la sesión también deja de usar emojis y pasa a una escala numérica con etiquetas.
- Una práctica libre (cronómetro ascendente, sin duración planificada) se guarda como una sesión completa cuando el usuario decide terminar, y deja de anunciarse como interrumpida antes de tiempo.
- Antes de arrancar una práctica libre desde el repertorio se muestra una confirmación breve con el tipo de guitarra —preseleccionado desde el elemento o el último usado— y un tiempo objetivo opcional. El usuario elige eléctrica o acústica antes de empezar.
- Los ajustes de práctica incorporan un tiempo objetivo opcional, también en sesiones libres. Al alcanzarlo, suena el aviso, el temporizador se pausa y aparece un mensaje; el usuario decide si termina o continúa. Sin objetivo, el comportamiento no cambia.
- La página de Herramientas muestra los cuatro bloques como filas a ancho completo, apiladas en una sola columna, sin selector de pestañas ni rejilla de dos columnas.
- El afinador arranca de forma fiable: reanuda el contexto de audio que el navegador crea suspendido y admite la implementación con prefijo, y muestra un error visible en vez de quedarse en «sin señal» cuando el micrófono o el audio no están disponibles.

Fuera del alcance:

- Rediseñar el resto del dashboard ni sustituir sus gráficos actuales.
- Cambiar el modelo de datos de las sesiones guardadas o su sincronización en la nube.
- Añadir objetivos persistentes entre sesiones o recordatorios fuera de la pestaña abierta.
- Cambiar el comportamiento del temporizador por bloques de las rutinas planificadas.
- Cambiar el flujo de práctica rápida que se lanza desde la pantalla de práctica.
- Añadir herramientas, presets de afinación o cambiar el algoritmo de detección de tono; solo se garantiza que el afinador arranque y reciba audio.

## Capabilities

### New Capabilities

Ninguna: los cambios se reparten entre capacidades existentes.

### Modified Capabilities

- `app-layout`: la cabecera y su navegación usan una columna más ancha que el contenido en pantallas ultrawide, sin alterar la columna de las pantallas.
- `practice-dashboard`: el bienestar pasa de medias mensuales con emoji a un gráfico temporal de ánimo y foco con resumen numérico; el detalle de la práctica muestra sus valores sin emoji.
- `practice-session-management`: la práctica libre se guarda como completa al terminarla, la práctica libre desde el repertorio confirma el tipo de guitarra antes de arrancar y los ajustes de práctica ofrecen un tiempo objetivo que avisa y pausa.
- `practice-tools`: los cuatro bloques de Herramientas se muestran como filas a ancho completo, sin rejilla de dos columnas, y el afinador arranca de forma fiable en navegadores móviles.

## Impact

- Layout: `src/components/layout/SiteNavigation.tsx` y la constante de columna de `src/components/ui/PageShell.tsx` (o una columna propia de la cabecera).
- Dashboard: `src/components/dashboard/DashboardView.tsx`, `PracticeWellbeing.tsx` (reescrito como gráfico), nuevos componentes y utilidades de series temporales, `src/utils/practice-metrics.ts`, `src/types/dashboard.ts` y los textos de `src/i18n/es.ts`, `en.ts`, `dictionary.ts`.
- Detalle y cierre de práctica: `src/components/dashboard/PracticeSessionDetails.tsx`, `src/components/practice/PracticeCompletionDialog.tsx` y los componentes de la escala de respuesta.
- Práctica libre y temporizador: `src/components/practice/PracticeSession.tsx`, `PracticeWorkspace.tsx`, `TimerCard.tsx`, `src/hooks/usePracticeTimer.ts`, `src/hooks/useRequestedLaunch.ts`, `src/utils/practice-launch.ts`, `src/utils/practice-session-record.ts`, `src/stores/useActivePracticeSessionStore.ts` y `src/types/practice.ts`.
- Herramientas y afinador: `src/components/tools/ToolsView.tsx`, `ToolSection.tsx`, `TunerPanel.tsx`, `src/hooks/useTuner.ts` y los textos de `src/i18n/*`.
- Textos y pruebas: `src/i18n/*` y tests de Node para las series de bienestar, el estado de la práctica libre, el aviso del tiempo objetivo y la detección del afinador.

Nota de coordinación: los cambios `refine-practice-and-tools-experience` y `redesign-tools-and-recording-ui` (aún sin archivar) tocan el bienestar con emoji y la estructura de Herramientas. Este cambio sustituye esas presentaciones; si se archivan, este debe aplicarse después para que la especificación final describa el gráfico sin emojis y las filas.

# Proposal

## Why

La sección Herramientas funciona, pero se organiza en pestañas: cada herramienta esconde a las demás y ninguna se siente parte del mismo panel. El afinador muestra la nota como texto suelto, el generador de tonos y la calculadora reparten el número importante entre campos pequeños, y la grabadora separa el nombre de sus mandos. En las grabaciones guardadas, además, la posición se cambia con una barra aparte en lugar de tocar la onda que el usuario ya está viendo. El resultado es correcto pero no se siente como una herramienta de estudio.

La preferencia de mood y foco existe, pero se lee al montar la sesión: si el usuario la activa en Configuración y luego abre el cierre de una práctica ya iniciada, la pregunta puede no aparecer. Hay que hacer explícito que la preferencia se consulta en el momento de cerrar la práctica.

## What Changes

- **Herramientas deja de tener pestañas.** `/tools` pasa a ser una sola página con bloques apilados y diferenciados —metrónomo, afinador, generador de tonos y calculadora—, cada uno con su tarjeta y su propio estado, sin ocultar los demás. En escritorio los bloques se separan con el mismo ritmo y las mismas tarjetas del dashboard.
- **El afinador se rediseña al estilo de un afinador de referencia**: nota detectada enorme, aguja/arco de desviación en cents, estado “afinada/baja/alta” muy visible y las cuerdas del preset como objetivos tocables. Mantiene la detección, los presets y la referencia A4 actuales.
- **El generador de tonos pone el número en primer plano**: frecuencia en grande, nota equivalente y nivel debajo, con los controles de arranque y parada en el mismo bloque.
- **La calculadora pone el tempo en grande y los resultados debajo**: el BPM manda en el bloque y las divisiones se muestran como una tabla compacta bajo el número, no como un formulario lateral.
- **La grabadora coloca el transporte a la derecha del nombre de la grabación**, en la misma fila, manteniendo la pantalla de la pletina y sus estados.
- **Las grabaciones guardadas se navegan sobre la onda**: tocar o arrastrar la forma de onda mueve la reproducción y sustituye la barra de progreso separada. Los botones de reproducción se quedan en la tarjeta, con la UI renovada.
- **La preferencia de mood y foco se lee al abrir el cierre de la práctica**, de modo que activarla o desactivarla en Configuración se refleje en la siguiente práctica sin recargar la aplicación.

Out of scope:

- **Notificaciones push**: se planifican en un cambio aparte, con su service worker, permisos, suscripción y envío.
- Cambiar el motor de audio del metrónomo, la grabación en sí, el almacenamiento o la sincronización en la nube.
- Rediseñar la biblioteca de grabaciones más allá de la tarjeta y el reproductor.
- Nuevos presets de afinación, nuevas divisiones de delay o cambios en el flujo de práctica.
- Cambiar el dashboard o las métricas de bienestar ya existentes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `practice-tools`: la sección Herramientas pasa de un selector con una herramienta visible a una página única con todos los bloques apilados; se mantiene el resto del comportamiento de cada herramienta.
- `practice-session-management`: una toma guardada se reproduce y se navega sobre su onda, sin barra de progreso separada; la preferencia de mood y foco se consulta al abrir el cierre de la práctica.

## Impact

- `src/components/tools/ToolsView.tsx`, `TunerPanel.tsx`, `ToneGeneratorPanel.tsx` y `DelayCalculatorPanel.tsx`, más un contenedor de bloque compartido para las tarjetas.
- `src/components/practice/PracticeAudioRecorder.tsx`, `PracticeAudioPlayer.tsx`, `PracticeRecordingItem.tsx`, `PracticeWaveformBars.tsx` y `PracticeRecorderDisplay.tsx`.
- `src/hooks/usePracticeAudioPlayer.ts` para buscar por posición sobre la onda; `src/hooks/usePracticeFeedbackPreference.ts` y `PracticeCompletionDialog.tsx` para leer la preferencia al abrir.
- `src/i18n/es.ts`, `src/i18n/en.ts` y `src/i18n/dictionary.ts` para el texto nuevo.
- Tests de Node para la conversión posición→segundos, el estado del afinador y la lectura de la preferencia; verificación de teclado y de movimiento reducido.

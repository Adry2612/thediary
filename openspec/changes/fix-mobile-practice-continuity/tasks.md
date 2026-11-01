# Tasks

## 1. Persistencia y restauración del cronómetro

- [x] 1.1 Crear `src/utils/practice-timer-storage.ts` con `serializeTimer`, `parseStoredTimer`, `shouldRestoreTimer` y `clearStoredTimer`, sobre la clave `thediary.active-practice-timer`. Verificar con `tests/practice-timer-storage.test.mjs` que acepta una instantánea válida y descarta versión distinta, `sessionId` distinto, `planKey` distinto, `countUp` distinto, `phaseIndex` fuera del plan, números no finitos, negativos y arrays de totales descuadrados.
- [x] 1.2 Restaurar la instantánea dentro del efecto de reinicio de `usePracticeTimer` (dependencias `countUp`, `phasePlanKey`), adoptándola solo cuando `shouldRestoreTimer` la acepta y arrancando desde cero en caso contrario. Verificar recargando la app en mitad de una práctica: el reloj vuelve con el tiempo transcurrido y el bloque actual, y una práctica nueva sigue empezando en cero.
- [x] 1.3 Escribir la instantánea con throttle de un segundo mientras corre el reloj y volcarla siempre en pausa, salto de bloque, fin y `pagehide`, borrando la clave al terminar o descartar la práctica. Verificar que tras recargar la pérdida de tiempo es menor de un segundo y que después de guardar la práctica la clave ya no existe.
- [x] 1.4 Restaurar el estado de objetivo alcanzado cuando el tiempo practicado ya superó el objetivo mientras la app estaba fuera, y descartar la instantánea cuando el plan cambió. Verificar con pruebas del módulo puro para ambos casos y en el simulador con una práctica con objetivo corto que se completa estando en segundo plano.

## 2. Bloqueo de pantalla durante la práctica

- [x] 2.1 Crear `src/hooks/useScreenWakeLock.ts` con una función pura de decisión (`shouldHoldWakeLock`) y el efecto que pide, reactiva en `visibilitychange` y libera el bloqueo. Verificar con `tests/screen-wake-lock.test.mjs` que decide correctamente entre correr, pausa, página oculta y navegador sin soporte.
- [ ] 2.2 Conectar el hook a la pantalla de práctica con la condición "cronómetro en marcha". Verificar en el simulador que la pantalla no se apaga tras varios minutos sin tocar el dispositivo, que al pausar vuelve a apagarse y que al terminar se libera sin errores en consola.

## 3. Reanudación del audio al volver

- [x] 3.1 Extraer `src/hooks/useAudioResume.ts` con una función pura (`shouldResumeAudio`) que decida si hay que reanudar al pasar a visible, y conectarlo al metrónomo, al generador de tonos y al afinador. Verificar con `tests/audio-resume.test.mjs` que reanuda solo cuando la herramienta estaba activa y la página vuelve a visible.
- [x] 3.2 Añadir a `src/utils/metronome-scheduler.ts` el reanclaje de la planificación (`reanchorSchedule`) y usarlo al reanudar: `nextBeatTime` pasa a `currentTime + 0.1` y se limpian los pulsos y las fuentes pendientes. Verificar con `tests/metronome-scheduler.test.mjs` que ningún pulso queda programado en el pasado y que el primero suena un décimo después de reanudar.
- [x] 3.3 Mostrar una acción "Reactivar sonido" en el metrónomo, el generador de tonos y el afinador cuando el contexto siga suspendido después de intentar reanudarlo. Verificar en el simulador bloqueando el dispositivo con cada herramienta activa y comprobando que el sonido vuelve sola o mediante la acción, sin quedarse en silencio.

## 4. Integración

- [x] 4.1 Ejecutar `npm test` y `npm run typecheck` y comprobar que pasan sin fallos nuevos ni casos existentes modificados.
- [ ] 4.2 Probar el recorrido completo en un iPhone real con la app instalada: empezar una práctica, no tocar el dispositivo, bloquearlo a mano, volver, recargar y comprobar que se conservan tiempo y bloque, que el metrónomo suena al volver y que la pantalla no se apaga sola mientras corre.
- [x] 4.3 Comprobar en escritorio que no hay regresiones: empezar una práctica nueva la reinicia en cero, pausar y reanudar conserva el tiempo, y guardar la práctica registra la duración y el reparto por destreza de siempre.

## Workflow follow-up

- Revisar el cambio con el usuario y archivarlo cuando las pruebas de integración estén verificadas.
- Sincronizar las capacidades modificadas (`practice-session-management`, `practice-tools`) al archivar.

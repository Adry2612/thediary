# Tasks

## 1. Placeholder del campo de nombre

- [x] 1.1 Añadir la etiqueta `chordNamePlaceholder` ("Acorde") en español e inglés, usarla como placeholder del campo en `ChordPicker` y dejar `chordName` ("Nombre del acorde") como nombre accesible; verificar con la prueba de i18n y comprobar en el navegador que el texto se lee entero.

## 2. Detección del acorde dibujado

- [x] 2.1 Añadir `detectChordName(frets)` en `src/lib/chords.ts` (afinación estándar, intervalos de las 7 calidades, coincidencia exacta de clases de altura y desempate por la nota más grave) y verificar con pruebas: un mayor del mástil, un m7, el empate sus4/sus2 resuelto por la nota grave, notas repetidas a la octava y una forma desconocida que devuelve `null`.
- [x] 2.2 Enlazar la detección con los manejadores del mástil en `ChordPicker` (marcar traste y marcar cuerda al aire) de forma que escriba el nombre sin resetear la forma dibujada, y que si no hay coincidencia el nombre no cambie.

## 3. Verificación

- [x] 3.1 Ejecutar `npm run typecheck` y `npm test` y confirmar que pasan sin errores.
- [x] 3.2 Ejecutar `npm run build` y confirmar que termina correctamente.
- [x] 3.3 Comprobar en el navegador: dibujar una forma conocida y ver que aparece su nombre, dibujar notas sueltas y ver que el nombre no cambia, y que el placeholder se lee entero.

## Workflow follow-up

- Archivar el cambio cuando la implementación esté verificada.

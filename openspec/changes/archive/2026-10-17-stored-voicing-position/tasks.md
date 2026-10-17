# Tasks

## 1. Localizar la posición de una forma

- [x] 1.1 Añadir en `src/lib/chords.ts` una función que devuelva el índice del voicing que dibuja la misma forma (comparando los seis trastes) o `-1` si no coincide con ninguno, y cubrirla con pruebas: la forma de la librería de cada acorde da su índice, una forma propia da `-1` y el traste base no influye.

## 2. Mostrar la posición de la forma que se ve

- [x] 2.1 En `src/components/repertoire/ChordPicker.tsx`, calcular la posición que se muestra a partir de la forma dibujada y usarla tanto en el contador como en el paso a la posición anterior o siguiente; si la forma es propia del usuario, conservar el último índice.

## 3. Verificación

- [x] 3.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build` y confirmar que pasan.
- [x] 3.2 Comprobar en el navegador que al reabrir un acorde asignado en su segunda posición el contador marca «Posición 2/N» y que «›» pasa a la tercera y la dibuja; y que un acorde nuevo sigue empezando en la primera.

## Workflow follow-up

- Archivar el cambio cuando la implementación esté verificada.

# Tasks

## 1. Corregir la forma

- [x] 1.1 Cambiar `Csus2` en `CHORD_SHAPES` a `[null, 3, 0, 0, 3, 3]` y quitar la excepción del `Csus2` en la prueba que comprueba que cada forma de la librería se nombra a sí misma; confirmar que la detección devuelve `Csus2` y que la forma cabe en la ventana de edición.

## 2. Verificación

- [x] 2.1 Ejecutar `npm run typecheck` y `npm test` y confirmar que pasan sin errores.
- [x] 2.2 Ejecutar `npm run build` y confirmar que termina correctamente.
- [x] 2.3 Comprobar en el navegador que el buscador dibuja el `Csus2` con Re y Sol repetidos (`x30033`) y que, dibujándolo, el nombre sale `Csus2`.

## Workflow follow-up

- Archivar el cambio cuando la implementación esté verificada.

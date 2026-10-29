# Design

## Context

`Guitar` guarda hoy nombre, intervalos y foto. `StringSetDraft` ya lleva `kind`, pero vive solo dentro del diálogo de cambio: al cerrarlo se pierde. `StringSetFields` pinta el selector de tres botones y filtra el catálogo con `getStringSetsByKind`. `StringsPanel` tiene `saveGuitar` y `saveGuitarEntry` del store, así que puede actualizar la guitarra sin tocar la persistencia.

Ver `proposal.md` para el motivo.

## Goals / Non-Goals

**Goals:**
- Que el tipo viaje con la guitarra y sobreviva a recargas y sincronización sin código extra.
- Que el formulario de cambio se quede en fecha, juego y guardar.
- Que una guitarra antigua siga funcionando y aprenda el tipo la primera vez.

**Non-Goals:**
- Reescribir el tipo de las entradas ya guardadas.
- Mostrar el tipo en la fila de la guitarra.
- Cambiar el catálogo de juegos.

## Decisions

### 1. Campo opcional en la guitarra, no obligatorio

`Guitar.stringKind?: GuitarStringKind`. Al ser opcional no hay migración: las guitarras guardadas siguen siendo válidas y el campo aparece cuando se elige. `normalizeGuitar` lo lee con `isGuitarStringKind` y descarta cualquier otro valor, igual que hace con los intervalos.

- Alternativa considerada: hacerlo obligatorio y pedirlo en el alta. Rechazada: bloquearía a quien solo quiere registrar cambios sin clasificar, y obligaría a inventar un valor para las guitarras que ya existen.
- Alternativa considerada: deducirlo del último juego montado. Rechazada: una guitarra puede cambiar de tipo de cuerdas y el dato se volvería un efecto secundario.

### 2. Un selector compartido

El grupo de tres botones sale de `StringSetFields` a `StringKindPicker`, con la misma API (`value`, `onChange`, `label`). Lo usan el formulario de guitarra y el de cuerdas cuando hace falta. Así no hay dos estilos del mismo control.

### 3. `StringSetFields` acepta un tipo fijo

Nueva prop `fixedKind?: GuitarStringKind`. Si viene, no se pinta el selector y el catálogo se filtra por ese tipo. El padre ya inicializa el borrador con la misma clave, así que no hay dos fuentes de verdad.

- Alternativa considerada: ocultar el selector desde el padre con CSS. Rechazada: el control seguiría en el DOM y sería alcanzable con el teclado.

### 4. El tipo se guarda al guardar el cambio, no al abrir

`StringChangeDialog` recibe `onRememberKind`. Solo se llama al enviar el formulario y solo si la guitarra no tenía tipo. `StringsPanel` hace `saveGuitar({ ...guitar, stringKind })` y actualiza su estado local para que el diálogo abierto no vuelva a preguntar.

- Alternativa considerada: que el store deduzca el tipo de la entrada. Rechazada: esconde una escritura de la guitarra dentro de un guardado de historial y sorprende al leer el código.
- Alternativa considerada: guardarlo en cuanto se pulsa un botón. Rechazada: cancelar el diálogo dejaría la guitarra modificada.

### 5. Sin tipo, el selector arranca en eléctrica

Es el valor por defecto que ya tiene el borrador hoy. El selector está visible, así que el usuario puede corregirlo antes de guardar; si no lo toca, se recuerda eléctrica. Se acepta ese riesgo a cambio de no bloquear el guardado.

### 6. Se elimina el campo de detalles

El `TextArea` de `StringChangeDialog` desaparece con su estado y su `useId`. La clave `text.details` se queda porque el historial la usa para editar la nota de una entrada. No hay cambio de datos: las entradas antiguas conservan su `text`.

## Risks / Trade-offs

- **Guitarras antiguas dan un paso extra la primera vez** → solo una vez; a partir de ahí el tipo queda guardado.
- **Quien ignore el selector en una acústica guardará eléctrica** → el selector se ve y se puede cambiar; corregirlo después es editar la guitarra.
- **Cambiar el tipo de la guitarra no reescribe el historial** → es lo deseable: cada entrada conserva el juego y el tipo que se montó.
- **Un tipo inválido guardado a mano** → `normalizeGuitar` lo descarta y el formulario vuelve a preguntar, sin romper la carga.
- **El diálogo de cambio ya no permite escribir una nota al vuelo** → queda a un clic en el historial, y el formulario gana claridad.

## Migration Plan

Ninguna. El campo es opcional y las entradas guardadas no cambian. Revertir consiste en dejar de leer `stringKind` y volver a mostrar el selector siempre.

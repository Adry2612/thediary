# Design

## Context

Ver `proposal.md` para la motivación. El estado que condiciona el enfoque:

- `ChordPicker` pinta, de arriba abajo: título, campo de nombre (grande, centrado), etiqueta "personalizado" y borrar, el mástil, el control `‹ Posición k/n ›`, los `SelectField` de **Nota** y **Tipo**, y los botones Asignar/Guardar/Quitar.
- El mástil cambia de alto según la ventana de trastes (`getFretWindow`), así que el control de posición —que va debajo— se desplaza cada vez que cambia la forma.
- El selector de **Tipo** mezcla los tipos estándar con los acordes guardados por el usuario (prefijos `type:` y `saved:`), así que los "Personalizados" viven dentro de un desplegable de tipos.
- El campo de nombre ya es la fuente de verdad y admite cualquier texto (incluso nombres que no se descomponen).
- El kit de UI tiene `Button`, `SelectField`, `Field`, `Card`, `Block`… pero **no** hay primitiva de popover/diálogo reutilizable.

## Goals / Non-Goals

**Goals:**

- Que el control de posición no se mueva nunca al cambiar de forma.
- Sustituir los dos selectores inferiores por un buscador de acordes que enseñe los acordes por su nombre y agrupe los guardados.

**Non-Goals:**

- No cambia la lógica de acordes, ni el modelo de datos, ni el guardado.
- No se toca el editor de letra, la tablatura ni el control de posiciones del mástil.
- No se añade una primitiva nueva al kit salvo que haga falta.

## Decisions

### Control de posición encima del mástil

El `‹ Posición k/n ›` se mueve entre el nombre y el mástil. Como el alto del diagrama depende de la forma, todo lo que va debajo se desplaza; ponerlo arriba lo deja fijo. *Alternativa descartada:* reservar una altura fija al mástil para que el control no salte, que desperdicia espacio y no arregla el salto del resto de la caja.

### Un buscador en vez de los selectores de Nota y Tipo

Se retiran los dos `SelectField` y en su lugar va un control que abre un panel con:

- un campo de texto para filtrar,
- los acordes estándar **agrupados por nota** (las 12 notas, y bajo cada una sus tipos, con las etiquetas enarmónicas actuales),
- un grupo **Personalizados** con los acordes guardados.

Al elegir un acorde se escribe el nombre y se cierra el panel. Así los acordes se ven por su nombre completo (no como "tipo" abstracto) y los guardados dejan de estar escondidos.

*Alternativas descartadas:*
- **Autocompletado sobre el propio campo de nombre:** mantiene un solo control, pero el nombre debe seguir siendo texto libre y las sugerencias estorban al escribir nombres raros.
- **Ventana emergente (popover/diálogo) anclada:** no hay primitiva en el kit y añade z-index y colocación fina sin ganar nada.
- **Mantener los selectores y reordenarlos:** es justo lo que al usuario le resulta incómodo.

### Panel dentro de la caja, cerrado por defecto

El buscador se despliega dentro de la propia caja (no flota), se cierra al elegir y no abre por defecto, para no alargar el lateral. *Alternativa descartada:* dejarlo siempre abierto, que llena el panel de acordes y compite con el mástil.

### El nombre sigue mandando

El buscador solo escribe el nombre; toda la derivación actual (resolver forma, voicings, marcar "personalizado") sigue igual. *Alternativa descartada:* guardar la nota y el tipo como estado aparte, que rompería la regla de que el nombre es la fuente de verdad.

## Risks / Trade-offs

- [84 acordes estándar son muchos] → se agrupan por nota y hay filtro de texto; el panel se cierra al elegir.
- [El panel alarga el lateral] → aparece solo al abrirlo y se cierra al elegir.
- [Quitar los selectores es un cambio de comportamiento] → los escenarios del spec cubren teclear, elegir en el buscador y nombre no reconocido.
- [Etiquetas nuevas] → español e inglés; prueba de i18n.

## Migration Plan

1. Reordenar la caja: control de posición arriba del mástil.
2. Construir el buscador (botón + panel con filtro, grupos por nota y Personalizados) y retirar los dos selectores.
3. Etiquetas de i18n.
4. Verificación: typecheck, pruebas, build y comprobación en el navegador (elegir acorde y comprobar que el control de posición no se mueve).

Sin migración: no cambia ningún dato guardado.

## Resolved Questions

- Formato del buscador: **panel desplegable dentro de la propia caja**, cerrado por defecto y con altura máxima con scroll. Descartadas la ventana emergente anclada y el autocompletado sobre el nombre.

## Further Notes

La lógica pura de `src/lib/chords.ts` no se toca; este cambio es de componentes, etiquetas y spec.

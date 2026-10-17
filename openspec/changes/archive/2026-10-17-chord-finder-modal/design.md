# Design

## Context

Ver `proposal.md` para la motivación. El estado que condiciona el enfoque:

- `ChordFinder` renderiza hoy un `Button` a lo ancho y, debajo, un panel en línea dentro de la caja.
- `ChordPicker` monta el buscador entre el nombre y el control de posición, así que al abrirse el panel el control y el mástil bajan.
- La app ya tiene un patrón de diálogo nativo: `PracticeCompletionDialog` usa `<dialog>` con `showModal()`, `onCancel` y `backdrop:bg-black/70`.
- `src/components/ui/icons.tsx` expone iconos de trazo (`EditIcon`, `TrashIcon`, `PlusIcon`…) pero no hay lupa.

## Goals / Non-Goals

**Goals:**

- Quitar peso visual al disparador del buscador.
- Que abrir y cerrar el buscador no cambie el tamaño de la caja ni mueva el mástil.

**Non-Goals:**

- No cambia el contenido del buscador (filtro, grupos por nota, Personalizados, marcado del seleccionado).
- No cambia la lógica de acordes, el modelo de datos ni el guardado.
- No se toca el control de posición ni el editor de letra.

## Decisions

### Disparador compacto en la esquina del campo de nombre

Un botón de solo icono (lupa) dentro del campo de nombre, alineado a la derecha, con `aria-label` para lectores de pantalla; el campo reserva un poco de aire a la derecha para no pisar el texto. *Alternativa descartada:* un icono junto al título "ACORDE", que queda lejos del campo sobre el que actúa.

### Modal reutilizando el diálogo nativo

El buscador se muestra en un `<dialog>` centrado con `showModal()` y fondo oscurecido, siguiendo `PracticeCompletionDialog`. El `<dialog>` vive en la capa superior del navegador, así que no lo recorta ningún contenedor y no puede empujar la caja. *Alternativas descartadas:* el panel en línea, que es el que redimensiona la caja; y el panel flotante anclado, que exige calcular posición y z-index sin ninguna primitiva en el kit.

### El diálogo es controlado por la caja

`ChordFinderDialog` recibe `open`, `onClose`, `selectedName`, `saved` y `onPick`. La caja guarda si el buscador está abierto y coloca el disparador; el diálogo solo se ocupa de mostrarse. Así el botón puede estar en el campo de nombre aunque el diálogo se monte aparte.

### Se cierra al elegir, con Escape y tocando el fondo

Al elegir un acorde se escribe el nombre y se cierra. Escape lo cierra (evento `cancel` del `<dialog>`) y un clic en el fondo también, para que no se quede atrapado. El filtro se limpia al abrir.

### Icono nuevo de lupa

Se añade `SearchIcon` a `icons.tsx` con el mismo `StrokeIcon` que el resto. *Alternativa descartada:* un carácter textual, que rompe el estilo de iconos de trazo del proyecto.

## Risks / Trade-offs

- [Modal en pantalla pequeña] → ancho `w-[calc(100%-2rem)]`, `max-w-lg`, alto `max-h-[90dvh]` con scroll, como el diálogo que ya existe.
- [El diálogo se cierra al cerrar la caja] → el estado vive en la caja y el efecto sincroniza `showModal()`/`close()`.
- [Botón de solo icono poco descubrible] → `aria-label` claro y `title`; el icono de lupa es un patrón conocido.
- [Doble cierre (Escape y estado)] → `onClose` es idempotente.

## Migration Plan

1. `SearchIcon` en `icons.tsx`.
2. `ChordFinder` → `ChordFinderDialog` controlado, con el contenido actual.
3. `ChordPicker`: botón de lupa en el campo y render del diálogo; fuera el botón ancho.
4. Etiquetas de i18n.
5. Verificación: typecheck, pruebas, build y comprobación en el navegador (la caja no cambia de alto al abrir/cerrar).

Sin migración: no cambia ningún dato guardado.

## Further Notes

El marcado del chip seleccionado (`aria-pressed`) y las etiquetas de grupo se conservan tal cual; solo cambia dónde se pintan.

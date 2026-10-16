# Design

## Context

La práctica se guarda en el store local `usePracticeStore` (zustand + `localStorage`), las grabaciones en IndexedDB y el detalle del día cruza ambos. El historial solo admitía altas, la asociación de grabaciones dependía de un `sessionId` exacto y la pantalla de práctica renderizaba el constructor de rutinas de forma incondicional.

## Goals / Non-Goals

**Goals:**

- Empezar a practicar con un clic, con o sin rutina previa.
- Que las rutinas guardadas sean el punto de entrada de la pantalla de práctica.
- Poder corregir o borrar una práctica ya registrada sin tocar la base de datos.
- No perder ninguna grabación del día en el detalle.

**Non-Goals:**

- No se añade sincronización de la edición con Supabase más allá del guardado habitual del store.
- No se edita el audio de las grabaciones ni se reasignan a otra práctica desde la interfaz.
- No se cambia el temporizador, el metrónomo ni el flujo de grabación.

## Decisions

### Práctica rápida como sesión con un bloque oculto

El temporizador exige al menos un bloque para poder arrancar (`resume` no actúa si el índice alcanza el final del plan). La práctica rápida crea una sesión en modo cronómetro ascendente (`isCountUp`) con un único bloque "Práctica libre"; el modo ascendente ignora la duración planificada y nunca completa sola, así que el usuario termina cuando quiere. El bloque se deja visible en el historial y es editable, en lugar de inventar un modo especial sin bloques.

### La edición deriva los agregados de los bloques

Editar una sesión reconstruye `durationSeconds` y `skillSeconds` sumando los bloques (tiempo real por categoría). Así las métricas del dashboard siguen cuadrando. Si el usuario borra todos los bloques, se conserva el reparto anterior y la duración pasa a editarse de forma directa. Toda la lógica vive en `applySessionEdit`, una función pura con pruebas.

### Nunca se descarta una grabación del día

`associateDayRecordings` mantiene el emparejamiento exacto por `sessionId` y el heredado por título y fecha, y añade una red de seguridad: las grabaciones del día que no encajan se asignan a la única sesión del día si solo hay una, y si no se muestran en una sección "Otras grabaciones de este día". Una grabación huérfana (sesión descartada, id cambiado o datos previos) deja de ser invisible.

### Estados de carga explícitos

La biblioteca de grabaciones no se considera lista hasta que termina el intento de catálogo remoto, no solo la lectura local; así el skeleton cubre la parte lenta. El detalle del día distingue "cargando" de "sin grabaciones" para no mostrar un vacío falso.

## Risks / Trade-offs

- [Redondear tiempos al editar] → Se edita en minutos con decimales y se convierte a segundos; el error es menor a un segundo por bloque.
- [Borrar una sesión deja grabaciones sueltas] → Se muestran en el detalle del día como grabaciones no asociadas y siguen accesibles en `/recordings`.
- [El modo ascendente no completa solo] → Es intencional; el usuario finaliza con el botón de terminar.

## Migration Plan

1. Añadir las acciones `updateSession`/`deleteSession` al store sin cambiar el formato persistido.
2. Introducir los componentes de selección y edición.
3. Rollback: revertir los componentes devuelve el comportamiento anterior; no hay migración de datos ni cambio de esquema.

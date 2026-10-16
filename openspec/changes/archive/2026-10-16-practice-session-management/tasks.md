# Tasks

## 1. Asociación de grabaciones del día

- [x] 1.1 Añadir `associateDayRecordings` para emparejar grabaciones por sesión con red de seguridad para huérfanas; verificar con pruebas unitarias el caso exacto, el huérfano con una sola sesión y el huérfano con varias.
- [x] 1.2 Usarla en `PracticeDayDetail` y mostrar las grabaciones no asociadas en su propia sección; diferenciar "cargando" de "sin grabaciones".

## 2. Edición y borrado del historial

- [x] 2.1 Añadir `updateSession` y `deleteSession` al store de práctica.
- [x] 2.2 Implementar `toEditableSession` y `applySessionEdit` derivando duración real y reparto por categoría; verificar con pruebas unitarias la edición de bloques, el borrado de todos los bloques y el respaldo del título.
- [x] 2.3 Crear `SessionEditor` con título, notas, estado y bloques (nombre, categoría, tiempo real y planificado, añadir y quitar) y enlazarlo desde el detalle del día.
- [x] 2.4 Añadir las acciones de editar y eliminar con confirmación en el detalle de cada práctica.

## 3. Pantalla de práctica

- [x] 3.1 Crear `SavedPracticeRoutines` con acciones de empezar y editar cada rutina.
- [x] 3.2 Mostrar primero las rutinas guardadas y añadir los botones "Crear nueva práctica" y "Práctica rápida" en `PracticeWorkspace`.
- [x] 3.3 Implementar la práctica rápida como sesión ascendente con un bloque libre y pasar `initialTemplateId` al constructor para editar una rutina existente.

## 4. Estados de carga, idiomas y verificación

- [x] 4.1 Mantener el skeleton de `/recordings` hasta que termine el intento de catálogo remoto.
- [x] 4.2 Añadir todas las etiquetas nuevas en español e inglés.
- [x] 4.3 Ejecutar `npm run typecheck`, `npm test` y `npm run build`.

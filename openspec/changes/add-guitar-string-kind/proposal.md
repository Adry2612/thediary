# Proposal

## Why

Cada cambio de cuerdas vuelve a preguntar el tipo, aunque la guitarra no cambia nunca de familia. Es un paso de más en la acción que más se repite, y encima el tipo elegido no se guarda en ningún sitio: si el usuario se equivoca, el error se repite en cada cambio.

La nota libre del formulario tampoco aporta: la mayoría de cambios no lleva nota y, cuando la lleva, el historial ya permite añadirla después. Ocupa el sitio más visible del diálogo para algo opcional.

## What Changes

- Cada guitarra guarda su **tipo de cuerdas** (eléctrica, acústica o española), opcional.
- El alta y la edición de la guitarra incluyen ese selector.
- El cambio de cuerdas **hereda el tipo de la guitarra**: filtra el catálogo y ya no muestra el selector.
- Una guitarra que aún no tiene tipo lo pide **una vez**: el selector aparece, y al guardar el cambio se recuerda en la guitarra.
- Se **elimina el campo de detalles** del formulario de cambio de cuerdas. La nota sigue disponible desde el historial.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `guitar-maintenance`: la guitarra pasa a recordar su tipo de cuerdas, y el formulario de cambio deja de preguntar lo que ya sabe.

## Impact

- `src/types/equipment.ts`: `stringKind` opcional en `Guitar`.
- `src/utils/equipment.ts`: lectura y validación del campo.
- `src/components/tools/GuitarDialog.tsx`: selector de tipo en alta y edición.
- `src/components/tools/StringSetFields.tsx`: admite un tipo fijo y oculta el selector.
- `src/components/tools/StringChangeDialog.tsx`: arranca con el tipo de la guitarra y pierde el campo de detalles.
- `src/components/tools/StringKindPicker.tsx`: selector compartido por los dos diálogos (nuevo).
- `src/components/tools/StringsPanel.tsx`: recuerda el tipo la primera vez.
- `src/i18n/es.ts` y `src/i18n/en.ts`: textos del tipo en la guitarra.
- Pruebas de normalización y de la elección del tipo.
- Depende de `refine-metronome-spacing-and-string-images` y `simplify-string-set-thumbnails` en lo que respecta a la miniatura, pero no los modifica.

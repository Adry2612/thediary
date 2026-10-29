# Proposal

## Why

La tarjeta generada no identifica nada que el texto no diga ya. Lo que hace reconocible un paquete es su color y su forma, y eso es exactamente lo que no podemos copiar: ni la foto de terceros sin permiso, ni una réplica fiel del envase. Queda un dibujo genérico que ocupa sitio y no aporta.

Tampoco sirve un marcador vacío. Si no hay foto, la marca, el modelo y el calibre ya están escritos al lado; un cuadrado con una inicial solo añade ruido.

## What Changes

- Se **retira la tarjeta generada** y todo lo que la sostenía: la utilidad, sus pruebas, la ruta temporal de muestra y la variante del componente.
- Un juego muestra miniatura **solo si tiene una foto propia**; si no, no muestra nada y no deja hueco.
- Se eliminan el marcador con la inicial, el texto de "sin imagen" y la pista de la carpeta.
- Se **borran del repositorio las 20 fotos de paquete** descargadas y sus campos `image`.
- Se elimina el cambio `add-generated-string-set-cards`, que queda superado.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `guitar-maintenance`: la miniatura de un juego deja de tener sustituto cuando no hay foto; el hueco desaparece y el texto queda como único identificador.

## Impact

- `src/components/tools/StringSetThumb.tsx`: sin tarjeta, sin marcador; devuelve nada cuando no hay foto.
- `src/components/ui/SelectField.tsx` y `src/utils/select-options.ts`: fuera la miniatura de reserva y `imageFallback`.
- `src/components/tools/StringSetFields.tsx`: la previsualización solo pinta miniatura si hay foto.
- `src/components/tools/GuitarHistoryDialog.tsx`: la entrada solo pinta miniatura si hay foto.
- `src/components/tools/GuitarRow.tsx`: sin cambios, ya condiciona la miniatura a que exista.
- `src/i18n/es.ts` y `src/i18n/en.ts`: se retiran `stringImagePlaceholder` y `stringImageHint`.
- `src/utils/string-set-card.ts`, `tests/string-set-card.test.mjs` y `src/app/dev/string-set-card/page.tsx`: se borran.
- `public/string-sets/`: se borran los 20 WebP; queda el `README.md` para fotos propias.
- `src/data/guitar-strings.json`: se quitan los 20 campos `image`.
- `openspec/changes/add-generated-string-set-cards/`: se borra.
- Depende de `refine-metronome-spacing-and-string-images`, que introdujo la miniatura y sigue sin archivar: su delta describe el hueco y las fotos, así que este cambio lo modifica y retira la parte de envío.

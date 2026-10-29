# Proposal

## Why

No se podía subir la foto de una guitarra desde el móvil. El selector aceptaba JPG, PNG, WebP, AVIF y GIF, pero no **HEIC**, que es el formato con el que el iPhone guarda las fotos por defecto. El archivo se rechazaba con un mensaje que decía justo lo contrario: «Elige una imagen JPG, PNG, WebP, AVIF o GIF».

Además, cuando un formato sí pasaba la validación pero el navegador no sabía decodificarlo, el fallo aparecía al guardar: la guitarra se guardaba sin foto y el aviso llegaba tarde.

## What Changes

- Se aceptan **HEIC y HEIF**, por MIME y por extensión.
- Antes de aceptar la imagen se comprueba que el navegador sabe **decodificarla**; si no, se avisa en el momento y no se guarda la ficha a medias.
- El texto de ayuda y el de error nombran los formatos reales.

Fuera del alcance:

- Convertir HEIC a JPG en el servidor o con una librería.
- Cambiar los límites de tamaño o de lado máximo.
- Tocar la subida de materiales de práctica, que usa otro camino.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `guitar-maintenance`: el requisito de la foto de la guitarra pasa a nombrar los formatos aceptados y a exigir que un archivo ilegible se rechace al elegirlo.

## Impact

- `src/utils/image.ts`: tipos aceptados y comprobación de decodificación.
- `src/components/tools/GuitarDialog.tsx`: validación asíncrona al elegir.
- `src/i18n/es.ts` y `src/i18n/en.ts`: textos de formato y del nuevo aviso.
- Pruebas: `tests/image.test.mjs`.
